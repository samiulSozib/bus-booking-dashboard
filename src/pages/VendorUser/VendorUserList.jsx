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
  addVendorUser,
  fetchPermissions,
  fetchUserPermissions,
  fetchVendorUsers,
  showVendorUser,
  updateUserPermissions,
  updateVendorUser,
} from "../../store/slices/vendorUserSlice";
import { PermissionDialog } from "./PermissionDialog";
import { ValidationError } from "yup";
import {
  checkPermission,
  useHasPermission,
  userType,
  useUserPermissions,
} from "../../utils/utils";
import { fetchRoles } from "../../store/slices/vendorRolesSlice";
import { fetchBranches } from "../../store/slices/branchSlice";

// Validation schema

export default function VendorUserList() {
  const dispatch = useDispatch();
  const {
    users,
    loading,
    pagination,
    selectedUser,
    permissions,
    userPermissions,
  } = useSelector((state) => state.vendorUser);

  const { roles } = useSelector((state) => state.vendorRoles);

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [vendor_branch_id, setVendor_branch_id] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("pending");
  const [role, setRole] = useState();
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const { branches } = useSelector((state) => state.branch);

  const [vendorBranchSearch, setVendorBranchSearch] = useState("");
  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const isBranch=userType().role==="branch"



  const vendorUserSchema = Yup.object().shape({
    firstName: Yup.string().required(
      t("vendor.user.validation.firstNameRequired")
    ),
    lastName: Yup.string().required(
      t("vendor.user.validation.lastNameRequired")
    ),
    email: Yup.string()
      .email(t("vendor.user.validation.invalidEmail"))
      .nullable(),
    mobile: Yup.string().required(t("vendor.user.validation.mobileRequired")),
    password: Yup.string().required(
      t("vendor.user.validation.passwordRequired")
    ),
    status: Yup.string()
      .oneOf(
        ["pending", "active", "inactive", "banned"],
        t("vendor.user.validation.invalidStatus")
      )
      .required(t("vendor.user.validation.statusRequired")),
    role: Yup.string()
      .required(t("vendor.user.validation.roleRequired"))
      
  });

  useEffect(() => {
    dispatch(fetchVendorUsers({ searchTag, page: currentPage }));
  }, [dispatch, currentPage, searchTag]);

  useEffect(() => {
    dispatch(fetchPermissions({branch_permissions:vendor_branch_id}));
    dispatch(fetchRoles());
  }, [dispatch,vendor_branch_id]);

      useEffect(() => {
      dispatch(fetchBranches({ searchTag: vendorBranchSearch }));
    }, [dispatch, vendorBranchSearch]);

  useEffect(() => {
    if (selectedUser && isEditing) {
      setFirstName(selectedUser.first_name);
      setLastName(selectedUser.last_name);
      setEmail(selectedUser.email || "");
      setMobile(selectedUser.mobile);
      setPassword(selectedUser.password || "");
      setStatus(selectedUser.status);
      setRole(selectedUser?.user_role?.id)
      setVendorBranchSearch(selectedUser?.branch?.name)
      setVendor_branch_id(selectedUser?.branch?.id)
    }
  }, [selectedUser, isEditing]);

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
    setErrors({}); // Clear previous errors

    const userData = {
      vendor_branch_id,
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      mobile,
      password,
      status,
      role,
    };
    //console.log(userData)
    //return
    try {
      // Validate with Yup first
      await vendorUserSchema.validate(
        {
          firstName,
          lastName,
          email,
          mobile,
          password,
          status,
          role,
        },
        { abortEarly: false }
      );

      const result = await (isEditing
        ? dispatch(
            updateVendorUser({ userId: currentUserId, updatedData: userData })
          )
        : dispatch(addVendorUser(userData)));

      //const result = await dispatch(action);

      if (result.error) {
        // Handle API validation errors
        if (result.payload?.errors) {
          const apiErrors = {};
          Object.entries(result.payload.errors).forEach(([key, value]) => {
            apiErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(apiErrors);
          return;
        }
        throw new Error(result.payload || "An unknown error occurred");
      }
      // Success case
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: isEditing
          ? t("vendorUserUpdateSuccess")
          : t("vendorUserAddSuccess"),
      });
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      if (error.name === "ValidationError") {
        // Handle Yup validation errors
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // Handle other errors
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: error.message || t("failedToAddUpdateVendorUser"),
        });
      }
    }
  };

  const resetForm = () => {
    setVendor_branch_id("")
    setFirstName("");
    setLastName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setStatus("pending");
    setVendorBranchSearch("")
    setRole();
    setIsEditing(false);
    setCurrentUserId(null);
    setErrors({});
  };

  const handleEdit = (userId) => {
    dispatch(showVendorUser(userId));
    setIsEditing(true);
    setCurrentUserId(userId);
    setIsModalOpen(true);
  };

  const handleSavePermissions = async (userId, permissionIds) => {
    try {
      const permissions = permissionIds
        .filter((p) => p.has_permission)
        .map((p) => p.title);

      const resultAction = await dispatch(
        updateUserPermissions({ userId, permissions })
      );

      if (updateUserPermissions.fulfilled.match(resultAction)) {
        Swal.fire({
          icon: "success",
          title: t("success"),
          text: t("permissionsUpdateSuccess"),
        });
      } else {
        throw new Error(resultAction.payload || t("failedToUpdatePermissions"));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("failedToUpdatePermissions"),
      });
    }
  };

  const handleManagePermissions = (userId) => {
    setCurrentUserId(userId);
    setIsPermissionModalOpen(true);
    dispatch(fetchUserPermissions(userId));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_VENDOR_USER") : t("ADD_VENDOR_USER")}
            </h2>
            <form onSubmit={handleSubmit}>

              {/* branch id */}

              {!isBranch && (
              <div className="relative mb-4">
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

              {/* First Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("FIRST_NAME")} *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
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
                  <option value="pending">{t("pending")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                  <option value="banned">{t("banned")}</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              {/* role */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("ROLES")} *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.role ? "border-red-500" : ""
                  }`}
                >
                  <option value="">{t("SELECT")}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setMobile("");
                    setPassword("");
                    setStatus("pending");
                    setRole();
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setErrors({}); // Clear errors
                    setVendorBranchSearch("")
                    setVendor_branch_id(null)
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

      {/* Permission Modal */}
      <PermissionDialog
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        permissions={permissions}
        userPermissions={userPermissions}
        userId={currentUserId}
        onSave={handleSavePermissions}
      />

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("VENDOR_USER_LIST")}
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
        {useHasPermission("v1.vendor.user.create")&&(
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_VENDOR_USER")}
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
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FIRST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LAST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("EMAIL")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MOBILE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.first_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.last_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.mobile}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.status}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {user?.user_role?.name}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.user.update")&&(
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(user.id)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      )}
                      {/* {useHasPermission("v1.vendor.user.permissions")&&(
                      <button
                        onClick={() => handleManagePermissions(user.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer text-sm"
                      >
                        🔒
                      </button>
                      )} */}
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
