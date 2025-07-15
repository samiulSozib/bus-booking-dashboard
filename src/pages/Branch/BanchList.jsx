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
  addBranch,
  updateBranch,
  updateBranchUser,
  fetchBranches,
  showBranch,
} from "../../store/slices/branchSlice";
import { Edit, SearchIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import { useHasPermission, userType } from "../../utils/utils";

// Validation schemas
const userSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile: Yup.string().required("Mobile number is required"),
  status: Yup.string()
    .oneOf(["pending", "active", "inactive", "banned"], "Invalid status")
    .required("Status is required"),
});

const branchSchema = Yup.object().shape({
  name: Yup.string(),
  phone: Yup.string(),
  registrationNumber: Yup.string().nullable(),
  licenseNumber: Yup.string().nullable(),
  rating: Yup.number().nullable(),
  agentComissionAmount: Yup.number().nullable(),
  agentComissionType: Yup.string().oneOf(["fixed", "percentage"]).nullable(),
  settlementPeriod: Yup.string()
    .oneOf(["daily", "weekly", "monthly"])
    .required("Settlement period is required"),
});

export default function BranchList() {
  const dispatch = useDispatch();
  const { branches, selectedBranch, loading, pagination } = useSelector(
    (state) => state.branch
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'user' or 'branch'
  const [currentBranchId, setCurrentBranchId] = useState(null);

  // User fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("pending");

  // Branch fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [agentComissionAmount, setAgentComissionAmount] = useState(0);
  const [agentComissionType, setAgentComissionType] = useState("fixed");
  const [settlementPeriod, setSettlementPeriod] = useState("daily");
  const [logoFile, setLogoFile] = useState(null);
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBranches({ search: searchTag, page: currentPage }));
  }, [dispatch, currentPage, searchTag]);

  useEffect(() => {
    if (selectedBranch) {
      setFirstName(selectedBranch.first_name || "");
      setLastName(selectedBranch.last_name || "");
      setEmail(selectedBranch.email || "");
      setMobile(selectedBranch.mobile || "");
      setStatus(selectedBranch.status || "pending");
      setName(selectedBranch?.vendor?.name);
      setPhone(selectedBranch?.vendor?.phone);
      setRegistrationNumber(selectedBranch?.vendor?.registration_number || "");
      setLicenseNumber(selectedBranch?.vendor?.license_number || "");
      setRating(selectedBranch?.vendor?.rating || 0);
      setAgentComissionAmount(
        selectedBranch?.vendor?.agent_comission_amount || 0
      );
      setAgentComissionType(
        selectedBranch?.vendor?.agent_comission_type || "fixed"
      );
      setSettlementPeriod(selectedBranch?.vendor?.settlement_period || "daily");
      setDescription(selectedBranch?.vendor?.description);
    }
  }, [selectedBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode === "user") {
        await userSchema.validate(
          {
            firstName,
            lastName,
            email,
            mobile,
            status,
          },
          { abortEarly: false }
        );

        const userData = {
          first_name: firstName,
          last_name: lastName,
          email,
          mobile,
          status,
        };

        const resultAction = await dispatch(
          updateBranchUser({ id: currentBranchId, userData })
        );

        if (updateBranchUser.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("branchUserUpdateSuccess"),
          });
        }
      } else if (editMode === "branch") {
        await branchSchema.validate(
          {
            name,
            phone,
            registrationNumber,
            licenseNumber,
            rating,
            agentComissionAmount,
            agentComissionType,
            settlementPeriod,
          },
          { abortEarly: false }
        );

        const branchData = {
          name,
          phone,
          registration_number: registrationNumber,
          license_number: licenseNumber,
          rating,
          agent_comission_amount: agentComissionAmount,
          agent_comission_type: agentComissionType,
          settlement_period: settlementPeriod,
          logo: logoFile,
          description,
        };

        const resultAction = await dispatch(
          updateBranch({ id: selectedBranch?.vendor?.id, branchData })
        );

        if (updateBranch.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("branchDetailsUpdateSuccess"),
          });
        } else if (updateBranch.rejected.match(resultAction)) {
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
          throw new Error(result.payload || "An unknown error occurred");
        }
      } else {
        // Add new branch
        await userSchema.validate(
          {
            firstName,
            lastName,
            email,
            mobile,
            status,
            password,
          },
          { abortEarly: false }
        );

        const branchData = {
          first_name: firstName,
          last_name: lastName,
          email,
          mobile,
          password,
          status,
          registration_number: registrationNumber,
          license_number: licenseNumber,
          rating,
          agent_comission_amount: agentComissionAmount,
          agent_comission_type: agentComissionType,
          settlement_period: settlementPeriod,
          logo: logoFile,
          description,
        };

        const resultAction = await dispatch(addBranch(branchData));
        if (addBranch.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("branchAddSuccess"),
          });
        } else if (addBranch.rejected.match(resultAction)) {
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
          throw new Error(result.payload || "An unknown error occurred");
        }
      }

      resetForm();
      setIsModalOpen(false);
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
          text: error.message || t("operationFailed"),
        });
      }
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setStatus("pending");
    setName("");
    setPhone("");
    setRegistrationNumber("");
    setLicenseNumber("");
    setRating(0);
    setAgentComissionAmount(0);
    setAgentComissionType("fixed");
    setSettlementPeriod("daily");
    setLogoFile(null);
    setErrors({});
    setIsEditing(false);
    setEditMode(null);
    setCurrentBranchId(null);
  };

  const handleEditUser = (branchId) => {
    dispatch(showBranch(branchId));
    setIsEditing(true);
    setEditMode("user");
    setCurrentBranchId(branchId);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branchId) => {
    dispatch(showBranch(branchId));
    setIsEditing(true);
    setEditMode("branch");
    setCurrentBranchId(branchId);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
              !isEditing ? "lg:max-w-6xl" : "max-w-md"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">
              {isEditing
                ? editMode === "user"
                  ? t("EDIT_BRANCH_USER")
                  : t("EDIT_BRANCH_DETAILS")
                : t("ADD_BRANCH")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div
                className={`${
                  !isEditing ? "lg:grid lg:grid-cols-2 lg:gap-6" : ""
                }`}
              >
                {/* User Information Section - Show for add or user edit */}
                {(editMode === "user" || !isEditing) && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-3">
                      {t("USER_INFORMATION")}
                    </h3>

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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("EMAIL")}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Password - Only for new branches */}
                    {!isEditing && (
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
                          <p className="text-red-500 text-sm mt-1">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    )}

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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.status}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Branch Information Section - Show for add or branch edit */}
                {(editMode === "branch" || !isEditing) && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-3">
                      {t("BRANCH_INFORMATION")}
                    </h3>

                    {editMode === "branch" && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            {t("NAME")}
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* New Phone Field */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            {t("PHONE")}
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Registration Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REGISTRATION_NUMBER")}
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.registrationNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.registrationNumber}
                        </p>
                      )}
                    </div>

                    {/* License Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LICENSE_NUMBER")}
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.licenseNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.licenseNumber}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("RATING")}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.rating && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.rating}
                        </p>
                      )}
                    </div>

                    {/* Agent Commission */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("AGENT_COMMISSION_AMOUNT")}
                        </label>
                        <input
                          type="number"
                          value={agentComissionAmount}
                          onChange={(e) =>
                            setAgentComissionAmount(parseFloat(e.target.value))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.agentComissionAmount && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.agentComissionAmount}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("AGENT_COMMISSION_TYPE")}
                        </label>
                        <select
                          value={agentComissionType}
                          onChange={(e) =>
                            setAgentComissionType(e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="fixed">{t("FIXED_AMOUNT")}</option>
                          <option value="percentage">{t("PERCENTAGE")}</option>
                        </select>
                        {errors.agentComissionType && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.agentComissionType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Settlement Period */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("SETTLEMENT_PERIOD")} *
                      </label>
                      <select
                        value={settlementPeriod}
                        onChange={(e) => setSettlementPeriod(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="daily">{t("daily")}</option>
                        <option value="weekly">{t("weekly")}</option>
                        <option value="monthly">{t("monthly")}</option>
                      </select>
                      {errors.settlementPeriod && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.settlementPeriod}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("DESCRIPTION")}
                      </label>
                      <textarea
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Logo - Only for add or branch edit */}
                    {editMode !== "user" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("LOGO")}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons - Always full width */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
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
            {t("BRANCH_LIST")}
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
          {useHasPermission("v1.vendor.branches.create") && (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setEditMode(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {t("ADD_BRANCH")}
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
          <Table className="">
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("EMAIL")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MOBILE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REGISTRATION_NUMBER")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LICENSE_NUMBER")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("RATING")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AGENT_COMMISSION_AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AGENT_COMMISSION_TYPE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("SETTLEMENT_PERIOD")}
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

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {branch.first_name} {branch.last_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch.email}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch.mobile}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.registration_number}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.license_number}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.rating}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.agent_comission_amount}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.agent_comission_type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.vendor?.settlement_period}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        branch.status === "active"
                          ? "bg-green-100 text-green-800"
                          : branch.status === "inactive"
                          ? "bg-red-100 text-red-800"
                          : branch.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1..vendor.branches.update_user") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 cursor-pointer"
                          onClick={() => handleEditUser(branch.id)}
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                      )}
                      {useHasPermission("v1..vendor.branches.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 cursor-pointer"
                          onClick={() => handleEditBranch(branch.id)}
                          title="Edit Branch Details"
                        >
                          <Edit className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                        </div>
                      )}
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
