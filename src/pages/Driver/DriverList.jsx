import { useState, useEffect } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  addDriver,
  editDriver,
  fetchDrivers,
  showDriver,
} from "../../store/slices/driverSlice";
import { Edit, SearchIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import {
  checkPermission,
  useHasPermission,
  userType,
  useUserPermissions,
} from "../../utils/utils";
import { fetchBranches } from "../../store/slices/branchSlice";

const driverSchema = (t, role) =>
  Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string().required("Mobile number is required"),
    password: Yup.string().required("Password is required"),
    vendor_branch_id: role === "branch" 
      ? Yup.number().notRequired()  // Skip validation if role is "branch"
      : Yup.number()
          .typeError(t("bus.vendorBranchRequired"))
          .required(t("bus.vendorBranchRequired"))
          .positive(t("bus.vendorBranchRequired"))
          .integer(t("bus.vendorBranchRequired")),
    status: Yup.string()
      .oneOf(["pending", "active", "inactive", "banned"], "Invalid status")
      .required("Status is required"),
  });

export default function DriverList() {
  const dispatch = useDispatch();
  const { drivers, selectedDriver, loading, pagination } = useSelector(
    (state) => state.drivers
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("pending");
  const [vendor_branch_id, setVendor_branch_id] = useState("");
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const { branches } = useSelector((state) => state.branch);

  const [vendorBranchSearch, setVendorBranchSearch] = useState("");
  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const isBranch=userType().role==="branch"

  useEffect(() => {
    dispatch(fetchDrivers({ searchTag, page: currentPage }));
  }, [dispatch, currentPage, searchTag]);

  useEffect(() => {
    dispatch(fetchBranches({ searchTag: vendorBranchSearch }));
  }, [dispatch, vendorBranchSearch]);

  useEffect(() => {
    if (selectedDriver && isEditing) {
      
      setFirstName(selectedDriver.first_name);
      setLastName(selectedDriver.last_name);
      setEmail(selectedDriver.email);
      setMobile(selectedDriver.mobile);
      setPassword(selectedDriver.password);
      setStatus(selectedDriver.status);
      setVendorBranchSearch(selectedDriver?.branch?.name)
      setVendor_branch_id(selectedDriver?.branch?.id)
    }
  }, [selectedDriver]);

  const handleVendorBranchSelect = (branch) => {
    setSelectedVendorBranch(branch);
    //setFormData({ ...formData, vendor_branch_id: branch.id });
    setVendor_branch_id(branch.id);
    setShowVendorBranchDropdown(false);
    // setErrors((prevErrors) => {
    //   const newErrors = { ...prevErrors };
    //   delete newErrors.vendor_branch_id;
    //   return newErrors;
    // });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const driverData = {
      first_name,
      last_name,
      email,
      mobile,
      password,
      status,
    };

    if(vendor_branch_id){
      driverData.vendor_branch_id=vendor_branch_id
    }

    try {
      // Validate form data using Yup
      await driverSchema(t,userType().role).validate(driverData, { abortEarly: false });

      if (isEditing) {
        const resultAction = await dispatch(
          editDriver({ driverId: currentDriverId, updatedData: driverData })
        );

        if (editDriver.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            timer:2000,
            text: t("driverUpdateSuccess"),
          });
        } else if (editDriver.rejected.match(resultAction)) {
          if (resultAction.payload?.errors) {
            const apiErrors = {};
            Object.entries(resultAction.payload.errors).forEach(
              ([key, value]) => {
                apiErrors[key] = Array.isArray(value) ? value[0] : value;
              }
            );
            setErrors(apiErrors);
            return;
          }
          throw new Error(resultAction.payload || "An unknown error occurred");
        }
      } else {
        console.log(driverData)
        const resultAction = await dispatch(addDriver(driverData));

        if (addDriver.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            timer:2000,
            text: t("driverAddSuccess"),
          });
        } else if (addDriver.rejected.match(resultAction)) {
          if (resultAction.payload?.errors) {
            const apiErrors = {};
            Object.entries(resultAction.payload.errors).forEach(
              ([key, value]) => {
                apiErrors[key] = Array.isArray(value) ? value[0] : value;
              }
            );
            setErrors(apiErrors);
            return;
          }
          throw new Error(resultAction.payload || "An unknown error occurred");
        }
      }

      // Reset form and close modal
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setStatus("pending");
      setVendor_branch_id("");
      setVendorBranchSearch("")
      setCurrentDriverId(null);
      setIsModalOpen(false);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: error.message || t("failedToAddUpdateDriver"),
        });
      }
    }
  };

  const handleEdit = (driverId) => {
    dispatch(showDriver(driverId));
    setIsEditing(true);
    setCurrentDriverId(driverId);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_DRIVER") : t("ADD_DRIVER")}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("FIRST_NAME")} *
                </label>
                <input
                  type="text"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("LAST_NAME")} *
                </label>
                <input
                  type="text"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("EMAIL")} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("MOBILE")} *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("PASSWORD")} *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("STATUS")} *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              {/* branch id */}

              {!isBranch && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("BRANCH")}
                </label>
                <input
                  type="text"
                  placeholder={t("SEARCH_BRANCH")}
                  value={vendorBranchSearch} // Always use driverSearch for the value
                  onChange={(e) => {
                    setVendorBranchSearch(e.target.value);
                    setShowVendorBranchDropdown(true);
                    if (
                      selectedVendorBranch &&
                      e.target.value !== `${selectedVendorBranch?.name}`
                    ) {
                      setSelectedVendorBranch(null);
                      //setFormData({ ...formData, vendor_branch_id: "" });
                      setVendor_branch_id("");
                    }
                  }}
                  onFocus={() => setShowVendorBranchDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowVendorBranchDropdown(false), 200)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {showVendorBranchDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                    {branches
                      .filter((branch) =>
                        `${branch?.branch?.name} || ""}`
                          .toLowerCase()
                          .includes(vendorBranchSearch.toLowerCase())
                      )
                      .map((branch) => (
                        <div
                          key={branch?.branch?.id}
                          onClick={() => {
                            handleVendorBranchSelect(branch?.branch);
                            setVendorBranchSearch(`${branch?.branch?.name}`);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                        >
                          {branch?.branch?.name}
                        </div>
                      ))}
                    {branches.filter((branch) =>
                      `${branch?.branch?.name} || ""}`
                        .toLowerCase()
                        .includes(vendorBranchSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        {t("NO_BRANCH_FOUND")}
                      </div>
                    )}
                  </div>
                )}
                {errors.vendor_branch_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vendor_branch_id}
                  </p>
                )}
              </div>
              )}
              {/* branch id */}

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setMobile("");
                    setPassword("");
                    setStatus("pending");
                    setVendor_branch_id("");
                    setVendorBranchSearch("");
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setCurrentDriverId(null);
                    setErrors({}); // Clear errors
                  }}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t("CANCEL")}
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isEditing ? t("UPDATE") : t("ADD")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("DRIVER_LIST")}
          </h3>
        </div>
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
          {useHasPermission("v1.driver.vendor.create") && (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {t("ADD_DRIVER")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FIRST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LAST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("EMAIL")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MOBILE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="py-3 px-2 w-[150px] truncate">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {driver.first_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.last_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.mobile}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.status}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.driver.vendor.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEdit(driver.id)}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                      )}
                      {/* <div
      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
      onClick={() => handleDelete(bus.id)}
    >
      <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
    </div> */}
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
    </div>
  );
}
