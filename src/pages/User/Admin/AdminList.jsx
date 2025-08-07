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
  editUser,
  fetchUsers,
  showUser,
} from "../../../store/slices/userSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/pagination/pagination";
import useOutsideClick from "../../../hooks/useOutSideClick";
import StatusBadge from "../../../components/ui/badge/StatusBadge";

export default function AdminList() {
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
  const [formErrors, setFormErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("admin");
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
    role: "admin",
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
    dispatch(fetchUsers({ searchTag, page: currentPage, role: "admin" }));
  }, [dispatch, searchTag, currentPage]);



  useEffect(() => {
    if (selectedUser) {
      const baseData = {
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        email: selectedUser.email || "",
        mobile: selectedUser.mobile || "",
        role: selectedUser.role || "admin",
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // Validate form data
  //     await getValidationSchema(t).validate(formData, { abortEarly: false });

  //     const userData = { ...formData };
  //     //console.log(userData)
  //     //return
  //     if (isEditing) {
  //       // Dispatch the edit action
  //       const editAction = await dispatch(
  //         editUser({ userId: currentUserId, updatedData: userData })
  //       );
  //       if (editUser.fulfilled.match(editAction)) {
  //         Swal.fire({
  //           icon: "success",
  //           title: t('success'),
  //           text: t('userUpdateSuccessfully'),
  //         });
  //       } else {
  //         throw new Error(editAction.payload || t('failedToUpdateUser'));
  //       }
  //     } else {
  //       // Dispatch the add action
  //       const addAction = await dispatch(addUser(userData));
  //       if (addUser.fulfilled.match(addAction)) {
  //         Swal.fire({
  //           icon: "success",
  //           title: t('success'),
  //           text: t('userAddedSuccessfully'),
  //         });
  //       } else {
  //         throw new Error(addAction.payload || t('failedToAddUser'));
  //       }
  //     }

  //     // Reset form data and close modal
  //     setFormData({
  //       first_name: "",
  //       last_name: "",
  //       email: "",
  //       mobile: "",
  //       role: "",
  //       password: "",
  //       status: "",
  //       name: "",
  //       phone: "",
  //       code: "",
  //       comission_amount: 0,
  //       comission_type: "",
  //       registration_number: "",
  //       license_number: "",
  //       rating: 0,
  //       admin_comission_amount: 0,
  //       admin_comission_type: "",
  //       agent_comission_amount: 0,
  //       agent_comission_type: "",
  //       logo: "",
  //       description: "",
  //       vendor_id: 0,
  //     });

  //     setIsModalOpen(false);
  //     setIsEditing(false);
  //     setCurrentUserId(null);
  //     setFormErrors({}); // Clear any previous errors
  //   } catch (err) {
  //     if (err instanceof ValidationError) {
  //       const errors = {};
  //       err.inner.forEach((error) => {
  //         if (!errors[error.path]) {
  //           errors[error.path] = error.message;
  //         }
  //       });
  //       setFormErrors(errors);
  //       return; // Prevent further error handling
  //     } else if (err.type === "api") {
  //       const newErrors = {};
  //       Object.entries(err.errors).forEach(([field, messages]) => {
  //         newErrors[field] = Array.isArray(messages)
  //           ? messages.join(" ")
  //           : messages;
  //       });
  //       setFormErrors(newErrors);
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: t('error'),
  //         text: err.message || t('failedToAddUpdateUser'),
  //       });
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clear previous errors
      setFormErrors({});

      // Validate form data
      await getValidationSchema(t).validate(formData, { abortEarly: false });

      const userData = { ...formData };
      let result;

      if (isEditing) {
        result = await dispatch(
          editUser({ userId: currentUserId, updatedData: userData })
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
        role: "admin",
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
      setCurrentUserId(null);
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
  const handleEdit = (userId) => {
    dispatch(showUser(userId));
    setIsEditing(true);
    setCurrentUserId(userId);
    setIsModalOpen(true);
  };

  const getValidationSchema = (t) =>
    Yup.object().shape({
      first_name: Yup.string().required(t("user.firstNameRequired")),
      last_name: Yup.string().required(t("user.lastNameRequired")),
      email: Yup.string()
        .email(t("user.invalidEmail"))
        .required(t("user.emailRequired")),
      mobile: Yup.string().matches(/^[0-9]{10}$/, t("user.mobileInvalid")),
      role: Yup.string().required(t("user.roleRequired")),
      password: Yup.string()
        .required(t("user.passwordRequired"))
        .min(6, t("user.passwordMin")),
      status: Yup.string().required(t("user.statusRequired")),

      // Conditional fields based on role
      name: Yup.string().when("role", (role, schema) =>
        role === "agent" || role === "vendor"
          ? schema.required(t("user.nameRequired"))
          : schema
      ),
      phone: Yup.string().when("role", (role, schema) =>
        role === "agent" || role === "vendor"
          ? schema.required(t("user.phoneRequired"))
          : schema
      ),
      code: Yup.string().when("role", (role, schema) =>
        role === "agent" ? schema.required(t("user.codeRequired")) : schema
      ),
      comission_amount: Yup.number().when("role", (role, schema) =>
        role === "agent"
          ? schema.required(t("user.commissionAmountRequired"))
          : schema
      ),
      comission_type: Yup.string().when("role", (role, schema) =>
        role === "agent"
          ? schema.required(t("user.commissionTypeRequired"))
          : schema
      ),
      registration_number: Yup.string().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.registrationNumberRequired"))
          : schema
      ),
      license_number: Yup.string().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.licenseNumberRequired"))
          : schema
      ),
      rating: Yup.number().when("role", (role, schema) =>
        role === "vendor" ? schema.required(t("user.ratingRequired")) : schema
      ),
      admin_comission_amount: Yup.number().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.adminCommissionAmountRequired"))
          : schema
      ),
      admin_comission_type: Yup.string().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.adminCommissionTypeRequired"))
          : schema
      ),
      agent_comission_amount: Yup.number().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.agentCommissionAmountRequired"))
          : schema
      ),
      agent_comission_type: Yup.string().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.agentCommissionTypeRequired"))
          : schema
      ),
      logo: Yup.mixed().when("role", (role, schema) =>
        role === "vendor" ? schema.required(t("user.logoRequired")) : schema
      ),
      description: Yup.string().when("role", (role, schema) =>
        role === "vendor"
          ? schema.required(t("user.descriptionRequired"))
          : schema
      ),
      vendor_id: Yup.number().when("role", (role, schema) =>
        role === "driver" ? schema.required(t("user.vendorIdRequired")) : schema
      ),
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("edit_admin") : t("add_admin")}
            </h2>

            <div className="overflow-y-auto flex-1">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {/* First Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("FIRST_NAME")} *
                  </label>
                  <input
                    type="text"
                    value={formData ? formData.first_name : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
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
                      setFormData({ ...formData, last_name: e.target.value })
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
                    <p className="text-red-500 text-sm">{formErrors?.email}</p>
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
                    <p className="text-red-500 text-sm">{formErrors?.mobile}</p>
                  )}
                </div>

                {/* Role */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("ROLE")} *
                  </label>
                  <select
                    value={formData ? formData.role : "admin"}
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
                    <p className="text-red-500 text-sm">{formErrors?.role}</p>
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
                      setFormData({ ...formData, password: e.target.value })
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
                    <p className="text-red-500 text-sm">{formErrors?.status}</p>
                  )}
                </div>

                {/* Conditional Fields Based on Role */}
                {(formData.role === "agent" || formData.role === "vendor") && (
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
                  </>
                )}

                {formData.role === "agent" && (
                  <>
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
                        <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
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

                {formData.role === "vendor" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REGISTRATION_NUMBER")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.registration_number : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registration_number: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.registration_number && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.registration_number}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LICENSE_NUMBER")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.license_number : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            license_number: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.license_number && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.license_number}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("RATING")}
                      </label>
                      <input
                        type="number"
                        value={formData ? formData.rating : 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.rating && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.rating}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("ADMIN_COMMISSION_AMOUNT")}
                      </label>
                      <input
                        type="number"
                        value={formData ? formData.admin_comission_amount : 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            admin_comission_amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.admin_comission_amount && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.admin_comission_amount}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("ADMIN_COMMISSION_TYPE")}
                      </label>
                      <select
                        value={formData ? formData.admin_comission_type : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            admin_comission_type: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      {formErrors?.admin_comission_type && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.admin_comission_type}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("AGENT_COMMISSION_AMOUNT")}
                      </label>
                      <input
                        type="number"
                        value={formData ? formData.agent_comission_amount : 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agent_comission_amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.agent_comission_amount && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.agent_comission_amount}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("AGENT_COMMISSION_TYPE")}
                      </label>
                      <select
                        value={formData ? formData.agent_comission_type : 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agent_comission_type: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      {formErrors?.agent_comission_type && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.agent_comission_type}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LOGO")}
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setFormData({ ...formData, logo: e.target.files[0] })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.logo && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.logo}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("DESCRIPTION")}
                      </label>
                      <textarea
                        value={formData ? formData.description : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.description && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.description}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {formData.role === "driver" && (
                  <div className="mb-4">
                    {/*  */}
                    <div className="mb-4" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-gray-700">
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
                                vendor?.vendor.name.includes(
                                  modalVendorSearchTag
                                )
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
                    </div>
                    {/*  */}
                    {formErrors?.vendor_id && (
                      <p className="text-red-500 text-sm">
                        {formErrors?.vendor_id}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormErrors(null);
                        setIsModalOpen(false);
                        setIsEditing(false);
                        setCurrentUserId({});
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("admin_list")}
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
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                mobile: "",
                role: "admin",
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
            {t("add_admin")}
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
                <TableCell
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
                    <TableCell className="py-3 text-black-500 text-theme-sm dark:text-gray-400">
                      {user?.first_name}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.last_name}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.email}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.mobile}
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
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                        {/* <div
      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
      onClick={() => handleDelete(bus.id)}
    >
      <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
    </div> */}
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
