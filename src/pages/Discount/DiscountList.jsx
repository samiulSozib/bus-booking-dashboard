import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, FunnelIcon, SearchIcon } from "../../icons";
import {
  fetchDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  showDiscount,
} from "../../store/slices/discountSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchRoutes } from "../../store/slices/routeSlice";
import { fetchBuses } from "../../store/slices/busSlice";
import { fetchTrips } from "../../store/slices/tripSlice";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  formatForDisplayDiscount,
  formatForInput,
  formatForInputDiscount,
} from "../../utils/utils";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import DiscountFilter from "./DiscountFilter";
import useOutsideClick from "../../hooks/useOutSideClick";

// Yup validation schema
// Corrected Yup validation schema
const getDiscountSchema = (t) =>
  Yup.object()
    .shape({
      scope: Yup.string()
        .oneOf(["global", "vendor", "route", "trip", "bus"])
        .required(t("discount.scopeRequired")),
      discount_amount: Yup.number()
        .positive(t("discount.positiveAmount"))
        .required(t("discount.amountRequired")),
      discount_type: Yup.string()
        .oneOf(["fixed", "percentage"])
        .required(t("discount.typeRequired")),
      start_date: Yup.string().required(t("discount.startDateRequired")),
      end_date: Yup.string().required(t("discount.endDateRequired")),
      status: Yup.string()
        .oneOf(["active", "inactive", "expired"])
        .required(t("discount.statusRequired")),
    })
    .test(
      "scope-requirements",
      t("discount.invalidScopeConfig"),
      function (value) {
        const { scope } = value || {};

        if (scope === "vendor" && !value.vendor_id) {
          return this.createError({
            path: "vendor_id",
            message: t("discount.vendorRequired"),
          });
        }
        if (scope === "route" && !value.route_id) {
          return this.createError({
            path: "route_id",
            message: t("discount.routeRequired"),
          });
        }
        if (scope === "bus" && !value.bus_id) {
          return this.createError({
            path: "bus_id",
            message: t("discount.busRequired"),
          });
        }
        if (scope === "trip" && !value.trip_id) {
          return this.createError({
            path: "trip_id",
            message: t("discount.tripRequired"),
          });
        }

        return true;
      }
    );

export default function DiscountList() {
  // Create refs for each dropdown
  const vendorDropdownRef = useRef(null);
  const routeDropdownRef = useRef(null);
  const busDropdownRef = useRef(null);
  const tripDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useOutsideClick(vendorDropdownRef, () => {
    if (showModalVendorDropdown) {
      setShowModalVendorDropdown(false);
    }
  });

  useOutsideClick(routeDropdownRef, () => {
    if (showModalRouteDropdown) {
      setShowModalRouteDropdown(false);
    }
  });

  useOutsideClick(busDropdownRef, () => {
    if (showModalBusDropdown) {
      setShowModalBusDropdown(false);
    }
  });

  useOutsideClick(tripDropdownRef, () => {
    if (showModalTripDropdown) {
      setShowModalTripDropdown(false);
    }
  });

  const dispatch = useDispatch();
  const { discounts, selectedDiscount, loading, error, pagination } =
    useSelector((state) => state.discounts);
  const { vendorList } = useSelector((state) => state.users);
  const { routes } = useSelector((state) => state.routes);
  const { buses } = useSelector((state) => state.buses);
  const { trips } = useSelector((state) => state.trips);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // State for table filtering
  const [searchTag, setSearchTag] = useState("");
  const [selectedScope, setSelectedScope] = useState("");

  // State for Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);

  const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
  const [modalRouteSearchTag, setModalRouteSearchTag] = useState("");
  const [modalBusSearchTag, setModalBusSearchTag] = useState("");
  const [modalTripSearchTag, setModalTripSearchTag] = useState("");
  const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);
  const [showModalRouteDropdown, setShowModalRouteDropdown] = useState(false);
  const [showModalBusDropdown, setShowModalBusDropdown] = useState(false);
  const [showModalTripDropdown, setShowModalTripDropdown] = useState(false);

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
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // Fetch initial data
  useEffect(() => {
    dispatch(
      fetchDiscounts({ page: currentPage, filters: activeFilters, searchTag })
    );
  }, [dispatch, currentPage, activeFilters, searchTag]);

  useEffect(() => {
    dispatch(fetchUsers({ searchTag: modalVendorSearchTag, role: "vendor" }));
    dispatch(fetchBuses({ searchTag: modalBusSearchTag }));
    dispatch(fetchRoutes({ searchTag: modalRouteSearchTag }));
    dispatch(fetchTrips({ searchTag: modalTripSearchTag }));
  }, [
    dispatch,
    modalVendorSearchTag,
    modalBusSearchTag,
    modalRouteSearchTag,
    modalTripSearchTag,
  ]);

  useEffect(() => {
    console.log(buses);
    console.log(vendorList);
    console.log(routes);
    console.log(trips);
  }, [dispatch]);

  useEffect(() => {
    if (selectedDiscount) {
      setFormData({
        scope: selectedDiscount?.scope,
        vendor_id: selectedDiscount?.vendor?.id || null,
        route_id: selectedDiscount?.route?.id || null,
        bus_id: selectedDiscount?.bus?.id || null,
        trip_id: selectedDiscount?.trip_id || null,
        discount_amount: selectedDiscount?.discount_amount,
        discount_type: selectedDiscount?.discount_type,
        start_date: formatForDisplayDiscount(selectedDiscount?.start_date),
        end_date: formatForDisplayDiscount(selectedDiscount?.end_date),
        status: selectedDiscount?.status,
      });
    }
    if (selectedDiscount?.vendor) {
      setModalVendorSearchTag(selectedDiscount?.vendor?.name);
    }
    if (selectedDiscount?.route) {
      setModalRouteSearchTag(selectedDiscount?.route?.name);
    }
    if (selectedDiscount?.bus) {
      setModalBusSearchTag(selectedDiscount?.bus?.name);
    }
    if (selectedDiscount?.trip) {
      setModalTripSearchTag(
        `${selectedDiscount?.trip?.route?.name}--${selectedDiscount?.trip?.bus?.name}`
      );
    }
  }, [selectedDiscount]);

  // Handle scope change - reset related IDs when scope changes
  const handleScopeChange = (scope) => {
    setFormData({
      ...formData,
      scope,
      vendor_id: null,
      route_id: null,
      bus_id: null,
      trip_id: null,
    });
  };

  // Handle vendor selection in modal
  const handleModalVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendor_id: vendor.id,
    });
    setModalVendorSearchTag(vendor.name);
    setShowModalVendorDropdown(false);
  };

  // Handle route selection in modal
  const handleModalRouteSelect = (route) => {
    setFormData({
      ...formData,
      route_id: route.id,
    });
    setModalRouteSearchTag(route.name);
    setShowModalRouteDropdown(false);
  };

  // Handle bus selection in modal
  const handleModalBusSelect = (bus) => {
    setFormData({
      ...formData,
      bus_id: bus.id,
    });
    setModalBusSearchTag(bus.name);
    setShowModalBusDropdown(false);
  };

  // Handle trip selection in modal
  const handleModalTripSelect = (trip) => {
    setFormData({
      ...formData,
      trip_id: trip.id,
    });
    setModalTripSearchTag(trip?.route.name);
    setShowModalTripDropdown(false);
  };

  // Open modal for editing
  const handleEditDiscount = (discountId) => {
    // setFormData({
    //   scope: discount?.scope,
    //   vendor_id: discount?.vendor_id || null,
    //   route_id: discount?.route_id || null,
    //   bus_id: discount?.bus_id || null,
    //   trip_id: discount?.trip_id || null,
    //   discount_amount: discount?.discount_amount,
    //   discount_type: discount?.discount_type,
    //   start_date: discount?.start_date,
    //   end_date: discount?.end_date,
    //   status: discount?.status,
    // });
    dispatch(showDiscount(discountId));
    setCurrentDiscountId(discountId);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await getDiscountSchema(t).validate(formData, { abortEarly: false });

      const payload = {
        ...formData,
        // Only include ID fields if they're relevant to the scope
        ...(formData.scope !== "vendor" && { vendor_id: undefined }),
        ...(formData.scope !== "route" && { route_id: undefined }),
        ...(formData.scope !== "bus" && { bus_id: undefined }),
        ...(formData.scope !== "trip" && { trip_id: undefined }),
      };
      // console.log(payload)
      //return

      if (isEditMode) {
        const resultAction = await dispatch(
          updateDiscount({ id: currentDiscountId, discountData: payload })
        );
        if (updateDiscount.fulfilled.match(resultAction)) {
          Swal.fire(t("success"), t("discountUpdateSuccess"), "success");
        }
      } else {
        const resultAction = await dispatch(createDiscount(payload));
        if (createDiscount.fulfilled.match(resultAction)) {
          Swal.fire(t("success"), t("discountAddSuccess"), "success");
        }
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
        //console.log(error)
        Swal.fire(t("error"), error.message || t("failed"), "error");
      }
    }
  };

  // Handle delete discount
  const handleDelete = (discountId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(deleteDiscount(discountId));
          if (deleteDiscount.fulfilled.match(deleteAction)) {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          }
          // Refresh the countries list
          dispatch(fetchDiscounts({ searchTag: searchTag, page: currentPage }));
        } catch (error) {
          console.log(error);
          Swal.fire(
            t("ERROR"),
            error.message || t("FAILED_TO_DELETE_ITEM"),
            "error"
          );
        }
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
      status: "active",
    });
    setModalBusSearchTag("");
    setModalRouteSearchTag("");
    setModalTripSearchTag("");
    setModalVendorSearchTag("");
    setErrors({});
    setCurrentDiscountId(null);
    setIsEditMode(false);
  };

  // Filter discounts based on search and scope
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.id.toString().includes(searchTag.toLowerCase()) ||
      discount.discount_amount.toString().includes(searchTag.toLowerCase());
    const matchesScope = selectedScope
      ? discount.scope === selectedScope
      : true;
    return matchesSearch && matchesScope;
  });

  // Get entity name by ID and type
  const getEntityName = (id, type) => {
    if (!id) return "N/A";

    switch (type) {
      case "vendor":
        const vendor = vendors.find((v) => v.id === id);
        return vendor
          ? `${vendor.first_name} ${vendor.last_name}`
          : "Unknown Vendor";
      case "route":
        const route = routes.find((r) => r.id === id);
        return route ? route.name : "Unknown Route";
      case "bus":
        const bus = buses.find((b) => b.id === id);
        return bus ? bus.name : "Unknown Bus";
      case "trip":
        const trip = trips.find((t) => t.id === id);
        return trip ? `Trip #${trip.id}` : "Unknown Trip";
      default:
        return "Global";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header and Search */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("DISCOUNT_LIST")}
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t("SEARCH")}
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
          />
          </div>
          <select
            className="rounded-md"
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
          >
            <option value="">{t("ALL_SCOPES")}</option>
            <option value="global">{t("GLOBAL")}</option>
            <option value="vendor">{t("VENDOR")}</option>
            <option value="route">{t("ROUTE")}</option>
            <option value="bus">{t("BUS")}</option>
            <option value="trip">{t("TRIP")}</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_DISCOUNT")}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <p></p>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <FunnelIcon className="w-5 h-5" />
          {t("FILTER")}
        </button>
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
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ID")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("SCOPE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TYPE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("START_DATE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("END_DATE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>#{discount.id}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {discount.scope}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {discount.discount_amount}
                    {discount.discount_type === "percentage" ? "%" : "$"}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        discount.status === "active"
                          ? "bg-green-100 text-green-800"
                          : discount.status === "expired"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {discount.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEditDiscount(discount.id)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                        onClick={() => handleDelete(discount.id)}
                      >
                        <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />

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
                  {t("SCOPE")} *
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => handleScopeChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="global">{t("GLOBAL")}</option>
                  <option value="vendor">{t("VENDOR")}</option>
                  <option value="route">{t("ROUTE")}</option>
                  <option value="bus">{t("BUS")}</option>
                  <option value="trip">{t("TRIP")}</option>
                </select>
                {errors.scope && (
                  <p className="text-red-500 text-sm mt-1">{errors.scope}</p>
                )}
              </div>

              {/* Conditional Entity Selection */}
              {formData.scope === "vendor" && (
                <div className="mb-4" ref={vendorDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("VENDOR")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_VENDOR")}
                      value={modalVendorSearchTag}
                      onChange={(e) => {
                        setModalVendorSearchTag(e.target.value);
                        setShowModalVendorDropdown(true);
                      }}
                      onFocus={() => setShowModalVendorDropdown(true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showModalVendorDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {vendorList
                          .filter((vendor) =>
                            vendor.vendor.name
                              .toLowerCase()
                              .includes(modalVendorSearchTag.toLowerCase())
                          )
                          .map((vendor) => (
                            <div
                              key={vendor.vendor.id}
                              onClick={() =>
                                handleModalVendorSelect(vendor.vendor)
                              }
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {vendor.vendor.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {errors.vendor_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.vendor_id}
                    </p>
                  )}
                </div>
              )}

              {formData.scope === "route" && (
                <div className="mb-4" ref={routeDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("ROUTES")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_ROUTE")}
                      value={modalRouteSearchTag}
                      onChange={(e) => {
                        setModalRouteSearchTag(e.target.value);
                        setShowModalRouteDropdown(true);
                      }}
                      onFocus={() => setShowModalRouteDropdown(true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showModalRouteDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {routes
                          .filter((route) =>
                            route.name
                              .toLowerCase()
                              .includes(modalRouteSearchTag.toLowerCase())
                          )
                          .map((route) => (
                            <div
                              key={route.id}
                              onClick={() => handleModalRouteSelect(route)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {route.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors.route_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.route_id}
                    </p>
                  )}
                </div>
              )}

              {formData.scope === "bus" && (
                <div className="mb-4" ref={busDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("BUS")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_BUS")}
                      value={modalBusSearchTag}
                      onChange={(e) => {
                        setModalBusSearchTag(e.target.value);
                        setShowModalBusDropdown(true);
                      }}
                      onFocus={() => setShowModalBusDropdown(true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showModalBusDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {buses.map((bus) => (
                          <div
                            key={bus.id}
                            onClick={() => handleModalBusSelect(bus)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {bus.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.bus_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.bus_id}</p>
                  )}
                </div>
              )}

              {formData.scope === "trip" && (
                <div className="mb-4" ref={tripDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("TRIPS")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_TRIP")}
                      value={modalTripSearchTag}
                      onChange={(e) => {
                        setModalTripSearchTag(e.target.value);
                        setShowModalTripDropdown(true);
                      }}
                      onFocus={() => setShowModalTripDropdown(true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showModalTripDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {trips.map((trip) => (
                          <div
                            key={trip.id}
                            onClick={() => handleModalTripSelect(trip)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {trip?.route.name}--{trip?.bus.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.trip_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.trip_id}
                    </p>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_amount: e.target.value,
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  step={formData.discount_type === "percentage" ? "0.1" : "1"}
                />
                {errors.discount_amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_amount}
                  </p>
                )}
              </div>

              {/* Discount Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("TYPE")} *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_type: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="fixed">{t("FIXED_AMOUNT")}</option>
                  <option value="percentage">{t("PERCENTAGE")}</option>
                </select>
                {errors.discount_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_type}
                  </p>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_date: formatForInputDiscount(e.target.value),
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date}
                  </p>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      end_date: formatForInputDiscount(e.target.value),
                    })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="active">{t("ACTIVE")}</option>
                  <option value="inactive">{t("INACTIVE")}</option>
                  <option value="expired">{t("EXPIRED")}</option>
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

      <DiscountFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
