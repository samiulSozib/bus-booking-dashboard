import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit } from "../../icons";
import { 
  fetchDiscounts, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount 
} from "../../store/slices/discountSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchRoutes } from "../../store/slices/routeSlice";
import { fetchBuses } from "../../store/slices/busSlice";
import { fetchTrips } from "../../store/slices/tripSlice";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { formatForDisplayDiscount, formatForInput, formatForInputDiscount } from "../../utils/utils";
import { useTranslation } from "react-i18next";

// Yup validation schema
// Corrected Yup validation schema
const discountSchema = Yup.object().shape({
    scope: Yup.string()
      .oneOf(["global", "vendor", "route", "trip", "bus"])
      .required("Scope is required"),
    discount_amount: Yup.number()
      .positive()
      .required("Discount amount is required"),
    discount_type: Yup.string()
      .oneOf(["fixed", "percentage"])
      .required("Type is required"),
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
    status: Yup.string()
      .oneOf(["active", "inactive", "expired"])
      .required("Status is required"),
  }).test(
    'scope-requirements',
    'Invalid scope configuration',
    function(value) {
      const { scope } = value;
      
      if (scope === 'vendor' && !value.vendor_id) {
        return this.createError({
          path: 'vendor_id',
          message: 'Vendor is required for vendor scope'
        });
      }
      
      if (scope === 'route' && !value.route_id) {
        return this.createError({
          path: 'route_id',
          message: 'Route is required for route scope'
        });
      }
      
      if (scope === 'bus' && !value.bus_id) {
        return this.createError({
          path: 'bus_id',
          message: 'Bus is required for bus scope'
        });
      }
      
      if (scope === 'trip' && !value.trip_id) {
        return this.createError({
          path: 'trip_id',
          message: 'Trip is required for trip scope'
        });
      }
      
      return true;
    }
  );

export default function DiscountList() {
  const dispatch = useDispatch();
  const { discounts, loading, error } = useSelector((state) => state.discounts);
  const { users: vendors } = useSelector((state) => state.users);
  const { routes } = useSelector((state) => state.routes);
  const { buses } = useSelector((state) => state.buses);
  const { trips } = useSelector((state) => state.trips);
  const {t}=useTranslation()

  // State for table filtering
  const [searchTag, setSearchTag] = useState("");
  const [selectedScope, setSelectedScope] = useState("");
  
  // State for Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);
  const [formData, setFormData] = useState({
    scope: "global",
    vendor_id: null,
    route_id: null,
    bus_id: null,
    trip_id: null,
    discount_amount: "",
    discount_type: "fixed",
    start_date: "",
    end_date: "",
    status: "active"
  });
  const [errors, setErrors] = useState({});

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDiscounts());
    dispatch(fetchUsers({ role: "vendor" }));
    dispatch(fetchRoutes());
    dispatch(fetchBuses({}));
    dispatch(fetchTrips());
  }, [dispatch]);

  

  // Handle scope change - reset related IDs when scope changes
  const handleScopeChange = (scope) => {
    setFormData({
      ...formData,
      scope,
      vendor_id: null,
      route_id: null,
      bus_id: null,
      trip_id: null
    });
  };

  // Open modal for editing
  const handleEditDiscount = (discount) => {
    setFormData({
      scope: discount?.scope,
      vendor_id: discount?.vendor_id || null,
      route_id: discount?.route_id || null,
      bus_id: discount?.bus_id || null,
      trip_id: discount?.trip_id || null,
      discount_amount: discount?.discount_amount,
      discount_type: discount?.discount_type,
      start_date: discount?.start_date,
      end_date: discount?.end_date,
      status: discount?.status
    });
    setCurrentDiscountId(discount.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await discountSchema.validate(formData, { abortEarly: false });
      
      const payload = {
        ...formData,
        // Only include ID fields if they're relevant to the scope
        ...(formData.scope !== 'vendor' && { vendor_id: undefined }),
        ...(formData.scope !== 'route' && { route_id: undefined }),
        ...(formData.scope !== 'bus' && { bus_id: undefined }),
        ...(formData.scope !== 'trip' && { trip_id: undefined })
      };
      console.log(payload)
      //return

      if (isEditMode) {
        await dispatch(updateDiscount({ id: currentDiscountId, discountData: payload })).unwrap();
        Swal.fire("Success!", "Discount updated successfully.", "success");
      } else {
        await dispatch(createDiscount(payload)).unwrap();
        Swal.fire("Success!", "Discount created successfully.", "success");
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.log(error)
        Swal.fire("Error", error.message || "An error occurred", "error");
      }
    }
  };

  // Handle delete discount
  const handleDeleteDiscount = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteDiscount(id))
          .unwrap()
          .then(() => {
            Swal.fire("Deleted!", "Discount has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire("Error", error.message || "Failed to delete", "error");
          });
      }
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      scope: "global",
      vendor_id: null,
      route_id: null,
      bus_id: null,
      trip_id: null,
      discount_amount: "",
      discount_type: "fixed",
      start_date: "",
      end_date: "",
      status: "active"
    });
    setErrors({});
    setCurrentDiscountId(null);
    setIsEditMode(false);
  };

  // Filter discounts based on search and scope
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.id.toString().includes(searchTag.toLowerCase()) || 
                         discount.discount_amount.toString().includes(searchTag.toLowerCase());
    const matchesScope = selectedScope ? discount.scope === selectedScope : true;
    return matchesSearch && matchesScope;
  });

  // Get entity name by ID and type
  const getEntityName = (id, type) => {
    if (!id) return "N/A";
    
    switch(type) {
      case 'vendor':
        const vendor = vendors.find(v => v.id === id);
        return vendor ? `${vendor.first_name} ${vendor.last_name}` : "Unknown Vendor";
      case 'route':
        const route = routes.find(r => r.id === id);
        return route ? route.name : "Unknown Route";
      case 'bus':
        const bus = buses.find(b => b.id === id);
        return bus ? bus.name : "Unknown Bus";
      case 'trip':
        const trip = trips.find(t => t.id === id);
        return trip ? `Trip #${trip.id}` : "Unknown Trip";
      default:
        return "Global";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header and Search */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("DISCOUNT_LIST")}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="rounded-md"
            placeholder={t("SEARCH")}
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
          />
          <select
            className="rounded-md"
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
          >
            <option value="">All Scopes</option>
            <option value="global">Global</option>
            <option value="vendor">Vendor</option>
            <option value="route">Route</option>
            <option value="bus">Bus</option>
            <option value="trip">Trip</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_DISCOUNT")}
          </button>
        </div>
      </div>

      {/* Discount Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("ID")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("SCOPE")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("AMOUNT")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("TYPE")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("START_DATE")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("END_DATE")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("STATUS")}</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("ACTION")}</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>#{discount.id}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{discount.scope}</TableCell>
                  
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {discount.discount_amount}
                    {discount.discount_type === 'percentage' ? '%' : '$'}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {discount.discount_type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(discount.start_date).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(discount.end_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      discount.status === 'active' ? 'bg-green-100 text-green-800' :
                      discount.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {discount.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Edit 
                        className="w-5 h-5 cursor-pointer text-blue-500" 
                        onClick={() => handleEditDiscount(discount)}
                      />
                      
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? t("EDIT_DISCOUNT") : t("ADD_DISCOUNT")}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Scope */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("SCOPE")}  *
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => handleScopeChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="global">Global</option>
                  <option value="vendor">Vendor</option>
                  <option value="route">Route</option>
                  <option value="bus">Bus</option>
                  <option value="trip">Trip</option>
                </select>
                {errors.scope && (
                  <p className="text-red-500 text-sm mt-1">{errors.scope}</p>
                )}
              </div>

              {/* Conditional Entity Selection */}
              {formData.scope === 'vendor' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("VENDOR")} *
                  </label>
                  <select
                    value={formData.vendor_id || ''}
                    onChange={(e) => setFormData({...formData, vendor_id: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.vendor.id} value={vendor.vendor.id}>
                        {vendor.first_name} {vendor.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.vendor_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
                  )}
                </div>
              )}

              {formData.scope === 'route' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("ROUTES")} *
                  </label>
                  <select
                    value={formData.route_id || ''}
                    onChange={(e) => setFormData({...formData, route_id: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                  {errors.route_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.route_id}</p>
                  )}
                </div>
              )}

              {formData.scope === 'bus' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("BUS")} *
                  </label>
                  <select
                    value={formData.bus_id || ''}
                    onChange={(e) => setFormData({...formData, bus_id: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Bus</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.name} ({bus.plate_number})
                      </option>
                    ))}
                  </select>
                  {errors.bus_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.bus_id}</p>
                  )}
                </div>
              )}

              {formData.scope === 'trip' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("TRIPS")} *
                  </label>
                  <select
                    value={formData.trip_id || ''}
                    onChange={(e) => setFormData({...formData, trip_id: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Trip</option>
                    {trips.map(trip => (
                      <option key={trip.id} value={trip.id}>
                        Trip #{trip.id} - {trip.route?.name}
                      </option>
                    ))}
                  </select>
                  {errors.trip_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.trip_id}</p>
                  )}
                </div>
              )}

              {/* Discount Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("AMOUNT")} *
                </label>
                <input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({...formData, discount_amount: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  step={formData.discount_type === 'percentage' ? '0.1' : '1'}
                />
                {errors.discount_amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_amount}</p>
                )}
              </div>

              {/* Discount Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("TYPE")} *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
                {errors.discount_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_type}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("START_DATE")} *
                </label>
                <input
                  type="datetime-local"
                  value={formatForDisplayDiscount(formData.start_date)}
                  onChange={(e) => setFormData({...formData, start_date:formatForInputDiscount(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("END_DATE")} *
                </label>
                <input
                  type="datetime-local"
                  value={formatForDisplayDiscount(formData.end_date)}
                  onChange={(e) => setFormData({...formData, end_date: formatForInputDiscount(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("STATUS")} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t("CANCEL")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditMode ? t("UPDATE") : t("ADD")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}