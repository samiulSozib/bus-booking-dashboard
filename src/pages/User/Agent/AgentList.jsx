import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { ValidationError } from "yup";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Delete, Edit, SearchIcon, View } from "../../../icons";
import {
  addUser,
  editAgent,
  editUser,
  fetchUsers,
  showUser,
} from "../../../store/slices/userSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/pagination/pagination";
import useOutsideClick from "../../../hooks/useOutSideClick";
import StatusBadge from "../../../components/ui/badge/StatusBadge";

export default function AgentList() {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    setShowModalVendorDropdown(false);
  });

  const dispatch = useDispatch();
  const { users, vendorList, selectedUser, loading, pagination } = useSelector(
    (state) => state.users
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("agent");
  const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
  const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);

  const handleModalVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendor_id: vendor.id,
    });
    setModalVendorSearchTag(vendor.name);
    setShowModalVendorDropdown(false);
  };

  // State for user form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    role: "agent",
    password: "",
    status: "",
    name: "",
    phone: "",
    code: "",
    comission_amount: 0,
    comission_type: "",
    registration_number: "",
    license_number: "",
    rating: 0,
    admin_comission_amount: 0,
    admin_comission_type: "",
    agent_comission_amount: 0,
    agent_comission_type: "",
    logo: "",
    description: "",
    vendor_id: 0,
  });

  useEffect(() => {
    dispatch(fetchUsers({ searchTag, page: currentPage, role: "agent" }));
  }, [dispatch, searchTag, currentPage]);

  useEffect(() => {
    if (selectedUser) {
      const baseData = {
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        email: selectedUser.email || "",
        mobile: selectedUser.mobile || "",
        role: selectedUser.role || "agent",
        password: selectedUser.password || "",
        status: selectedUser.status || "",
      };

      // Role-specific fields
      const roleSpecificData = {
        // Agent-specific fields
        ...(selectedUser.role === "agent" && {
          name: selectedUser.agent?.name || "",
          phone: selectedUser.agent?.phone || "",
          code: selectedUser.agent?.code || "",
          comission_amount: selectedUser.agent?.comission_amount || 0,
          comission_type: selectedUser.agent?.comission_type || "",
        }),

        // Vendor-specific fields
        ...(selectedUser.role === "vendor" && {
          name: selectedUser.vendor?.name || "",
          phone: selectedUser.vendor?.phone || "",
          registration_number: selectedUser.vendor?.registration_number || "",
          license_number: selectedUser.vendor?.license_number || "",
          rating: selectedUser.vendor?.rating || 0,
          admin_comission_amount:
            selectedUser.vendor?.admin_comission_amount || 0,
          admin_comission_type: selectedUser.vendor?.admin_comission_type || "",
          agent_comission_amount:
            selectedUser.vendor?.agent_comission_amount || 0,
          agent_comission_type: selectedUser.vendor?.agent_comission_type || "",
          logo: selectedUser.vendor?.logo || "",
          description: selectedUser.vendor?.description || "",
        }),

        // Driver-specific field
        ...(selectedUser.role === "driver" && {
          vendor_id: selectedUser.driver?.vendor_id || 0,
        }),
      };

      setFormData({
        ...baseData,
        ...roleSpecificData,
      });
    }
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clear previous errors
      setFormErrors({});

      // Validate form data
      await getValidationSchema(t,isEditingAgent).validate(formData, { abortEarly: false });

      const userData = { ...formData };
      let result;

      if (isEditing) {
        result = await dispatch(
          editUser({ userId: currentUserId, updatedData: userData })
        );
      }else if(isEditingAgent){
        result = await dispatch(
          editAgent({ agentId: currentAgentId, updatedData: userData })
        );
      } else {
        result = await dispatch(addUser(userData));
      }

      // Check if the action was successful
      if (result.error) {
        // Handle API validation errors
        if (result.payload?.errors) {
          const apiErrors = {};
          Object.entries(result.payload.errors).forEach(([field, messages]) => {
            apiErrors[field] = Array.isArray(messages)
              ? messages.join(" ")
              : messages;
          });
          setFormErrors(apiErrors);
          return;
        }
        throw new Error(result.payload?.message || t("failedToProcessRequest"));
      }

      // Success case
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: isEditing
          ? t("userUpdateSuccessfully")
          : t("userAddedSuccessfully"),
      });

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        role: "agent",
        password: "",
        status: "",
        name: "",
        phone: "",
        code: "",
        comission_amount: 0,
        comission_type: "",
        registration_number: "",
        license_number: "",
        rating: 0,
        admin_comission_amount: 0,
        admin_comission_type: "",
        agent_comission_amount: 0,
        agent_comission_type: "",
        logo: "",
        description: "",
        vendor_id: 0,
      });
      setIsModalOpen(false);
      setIsEditing(false);
      setIsEditingAgent(false)
      setCurrentUserId(null);
      setCurrentAgentId(null)
    } catch (err) {
      console.error("Submission error:", err);

      if (err.name === "ValidationError") {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          if (!validationErrors[error.path]) {
            validationErrors[error.path] = error.message;
          }
        });
        setFormErrors(validationErrors);
      } else {
        // Other errors
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: err.message || t("failedToProcessRequest"),
        });
      }
    }
  };

  const handleEdit = (user) => {
    dispatch(showUser(user.id));
    setIsEditing(true);
    setCurrentUserId(user.id);
    setCurrentAgentId(user.agent?.id);
    setIsModalOpen(true);
  };

  const handleEditAgent = (user) => {
    dispatch(showUser(user.id));
    setIsEditingAgent(true);
    setCurrentUserId(user.id);
    setCurrentAgentId(user.agent?.id);
    setIsModalOpen(true);
  };

  const getValidationSchema = (t,isEditingAgent) =>
    Yup.object().shape({
      // Basic user info (required for all users)
      first_name: Yup.string().required(t("user.firstNameRequired")),
      last_name: Yup.string().required(t("user.lastNameRequired")),
      email: Yup.string()
        .email(t("user.invalidEmail"))
        .required(t("user.emailRequired")),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, t("user.mobileInvalid"))
        .required(t("user.mobileRequired")),
      password:isEditingAgent?Yup.string(): Yup.string()
        .required(t("user.passwordRequired"))
        .min(6, t("user.passwordMin")),
      status: Yup.string().required(t("user.statusRequired")),

      // Agent-specific fields (all required)
      name: Yup.string().required(t("user.nameRequired")),
      phone: Yup.string().required(t("user.phoneRequired")),
      code: Yup.string().required(t("user.codeRequired")),
      comission_amount: Yup.number().required(
        t("user.commissionAmountRequired")
      ),
      comission_type: Yup.string().required(t("user.commissionTypeRequired")),
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing
                ? t("edit_user")
                : isEditingAgent
                ? t("edit_agent")
                : t("add_agent")}
            </h2>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {!isEditingAgent && (
                    <>
                      {/* First Name */}

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("FIRST_NAME")} *
                        </label>
                        <input
                          type="text"
                          value={formData ? formData.first_name : ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.first_name && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.first_name}
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
                          value={formData ? formData.last_name : ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.last_name && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.last_name}
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
                          value={formData ? formData.email : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.email && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.email}
                          </p>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("MOBILE")}
                        </label>
                        <input
                          type="text"
                          value={formData ? formData.mobile : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.mobile && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.mobile}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("ROLE")} *
                        </label>
                        <select
                          value={formData ? formData.role : "agent"}
                          disabled
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">{t("SELECT_ROLE")}</option>
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                          <option value="agent">Agent</option>
                          <option value="driver">Driver</option>
                        </select>
                        {formErrors?.role && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.role}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("PASSWORD")} *
                        </label>
                        <input
                          type="password"
                          value={formData ? formData.password : ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.password && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.password}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("STATUS")} *
                        </label>
                        <select
                          value={formData ? formData.status : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">{t("SELECT_STATUS")}</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="banned">Banned</option>
                        </select>
                        {formErrors?.status && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.status}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("NAME")}
                        </label>
                        <input
                          type="text"
                          value={formData ? formData.name : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.name && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.name}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("PHONE")}
                        </label>
                        <input
                          type="text"
                          value={formData ? formData.phone : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.phone && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.phone}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("CODE")}
                        </label>
                        <input
                          type="text"
                          value={formData ? formData.code : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.code && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.code}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("COMMISSION_AMOUNT")}
                        </label>
                        <input
                          type="number"
                          value={formData ? formData.comission_amount : 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comission_amount: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {formErrors?.comission_amount && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.comission_amount}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("COMMISSION_TYPE")}
                        </label>
                        <select
                          value={formData ? formData.comission_type : ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comission_type: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">
                            {t("SELECT_COMMISSION_TYPE")}
                          </option>
                          <option value="fixed">Fixed</option>
                          <option value="percentage">Percentage</option>
                        </select>
                        {formErrors?.comission_type && (
                          <p className="text-red-500 text-sm">
                            {formErrors?.comission_type}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors(null);
                      setIsModalOpen(false);
                      setIsEditing(false);
                      setCurrentUserId({});
                      setCurrentAgentId(null)
                      setIsEditingAgent(false)
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t("CANCEL")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {isEditing || isEditingAgent ? t("UPDATE") : t("ADD")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("agent_list")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
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

          {/* Add User Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setIsEditingAgent(false)
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                mobile: "",
                role: "agent",
                password: "",
                status: "",
                name: "",
                phone: "",
                code: "",
                comission_amount: 0,
                comission_type: "",
                registration_number: "",
                license_number: "",
                rating: 0,
                admin_comission_amount: 0,
                admin_comission_type: "",
                agent_comission_amount: 0,
                agent_comission_type: "",
                logo: "",
                description: "",
                vendor_id: 0,
              });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("add_agent")}
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                {/* <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FIRST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LAST_NAME")}
                </TableCell> */}
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AGENT_NAME")}
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
                  {t("COMMISSION_AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION_TYPE")}
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE")}
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
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(selectedRole === "vendor" ? vendorList : users).map(
                (user, index) => (
                  <TableRow key={index} className="hover:bg-yellow-50">
                    {/* <TableCell className="py-3 text-black-500 text-theme-sm dark:text-gray-400">
                      {user?.first_name}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.last_name}
                    </TableCell> */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.agent?.name}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.email}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.agent?.phone}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.agent?.comission_amount}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.agent?.comission_type}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div>
                        {user?.role}
                        {user?.role === "vendor" && user?.vendor && (
                          <div>
                            (<strong>{user.vendor.name}</strong>)
                            <div className="text-[14px] text-gray-400">
                              {user.vendor.email}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <StatusBadge status={user?.status} />
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex flex-row items-center justify-start gap-2">
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEdit(user)}
                          title={t("edit_user")}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEditAgent(user)}
                          title={t("edit_agent")}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
