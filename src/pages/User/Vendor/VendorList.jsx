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
  editVendor,
  fetchUsers,
  showUser,
} from "../../../store/slices/userSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/pagination/pagination";
import useOutsideClick from "../../../hooks/useOutSideClick";
import StatusBadge from "../../../components/ui/badge/StatusBadge";

export default function VendorList() {
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
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("vendor");
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
    role: "vendor",
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
    short_name: "",
    long_name: "",
    representative_name: "",
    representative_phone: "",
    representative_email: "",
    representative_nid: "",
    representative_position: "",
    settlement_period: "",
  });

  useEffect(() => {
    dispatch(fetchUsers({ searchTag, page: currentPage, role: "vendor" }));
  }, [dispatch, searchTag, currentPage, selectedRole]);

  useEffect(() => {
    if (selectedUser) {
      const baseData = {
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        email: selectedUser.email || "",
        mobile: selectedUser.mobile || "",
        role: selectedUser.role || "vendor",
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
          short_name: selectedUser.vendor?.short_name || "",
          long_name: selectedUser.vendor?.long_name || "",
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
          representative_name:selectedUser.vendor?.representative_name||"",
          representative_phone:selectedUser.vendor?.representative_phone||"",
          representative_email:selectedUser.vendor?.representative_email||"",
          representative_nid:selectedUser.vendor?.representative_nid||"",
          representative_position:selectedUser.vendor?.representative_position||"",
          settlement_period:selectedUser.vendor?.settlement_period||""
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


 const getValidationSchema = (t) =>
  Yup.object().shape({
    // Basic user info
    first_name: Yup.string().required(t("user.firstNameRequired")),
    last_name: Yup.string().required(t("user.lastNameRequired")),
    email: Yup.string()
      .email(t("user.invalidEmail"))
      .required(t("user.emailRequired")),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, t("user.mobileInvalid"))
      .required(t("user.mobileRequired")),
    password: Yup.string()
      .required(t("user.passwordRequired"))
      .min(6, t("user.passwordMin")),
    status: Yup.string().required(t("user.statusRequired")),

    // Vendor organization info
    short_name: Yup.string().required(t("user.shortNameRequired")),
    long_name: Yup.string().required(t("user.longNameRequired")),
    registration_number: Yup.string().required(t("user.registrationNumberRequired")),
    license_number: Yup.string().required(t("user.licenseNumberRequired")),
    rating: Yup.number().required(t("user.ratingRequired")),
    description: Yup.string().required(t("user.descriptionRequired")),
    logo: Yup.mixed().required(t("user.logoRequired")),
    settlement_period: Yup.string().required(t("user.settlementPeriodRequired")),

    // Vendor representative info
    representative_name: Yup.string().required(t("user.representativeNameRequired")),
    representative_phone: Yup.string()
      .matches(/^[0-9]{10}$/, t("user.representativePhoneInvalid"))
      .required(t("user.representativePhoneRequired")),
    representative_email: Yup.string()
      .email(t("user.representativeEmailInvalid"))
      .required(t("user.representativeEmailRequired")),
    representative_nid: Yup.string().required(t("user.representativeNidRequired")),
    representative_position: Yup.string().required(t("user.representativePositionRequired")),

    // Commission info
    admin_comission_amount: Yup.number().required(t("user.adminCommissionAmountRequired")),
    admin_comission_type: Yup.string().required(t("user.adminCommissionTypeRequired")),
    agent_comission_amount: Yup.number().required(t("user.agentCommissionAmountRequired")),
    agent_comission_type: Yup.string().required(t("user.agentCommissionTypeRequired"))
  });

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
          editVendor({ vendorId: currentVendorId, updatedData: userData })
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
        role: "vendor",
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
        short_name: "",
        long_name: "",
        representative_name: "",
        representative_phone: "",
        representative_email: "",
        representative_nid: "",
        representative_position: "",
        settlement_period: "",
      });
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentUserId(null);
      setCurrentVendorId(null)
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
    setCurrentVendorId(user?.vendor?.id)
    setIsModalOpen(true);
  };



  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("edit_vendor") : t("add_vendor")}
            </h2>

            <div className="overflow-y-auto flex-1">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-2"
              >
                {/* First Name */}
                <div className="mb-2">
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
                <div className="mb-2">
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
                <div className="mb-2">
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
                <div className="mb-2">
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
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("ROLE")} *
                  </label>
                  <select
                    disabled
                    value={formData ? formData.role : "vendor"}
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
                <div className="mb-2">
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
                <div className="mb-2">
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

                {formData.role === "vendor" && (
                  <>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("SHORT_NAME")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.short_name : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            short_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.short_name && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.short_name}
                        </p>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LONG_NAME")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.long_name : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            long_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.long_name && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.long_name}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_NAME")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.representative_name : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.representative_name && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.representative_name}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_PHONE")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.representative_phone : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_phone: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.representative_phone && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.representative_phone}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_EMAIL")}
                      </label>
                      <input
                        type="email"
                        value={formData ? formData.representative_email : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_email: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.representative_email && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.representative_email}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_NID")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.representative_nid : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_nid: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.representative_nid && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.representative_nid}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_POSITION")}
                      </label>
                      <input
                        type="text"
                        value={formData ? formData.representative_position : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_position: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {formErrors?.representative_position && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.representative_position}
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
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

                    <div className="mb-2">
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

                    <div className="mb-2">
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

                    <div className="mb-2">
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

                    <div className="mb-2">
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

                    <div className="mb-2">
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

                    <div className="mb-2">
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
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("SETTLEMENT_PERIOD")}
                      </label>
                      <select
                        value={formData ? formData.settlement_period : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settlement_period: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">
                          {t("SELECT_SETTLEMENT_PERIOD")}
                        </option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      {formErrors?.settlement_period && (
                        <p className="text-red-500 text-sm">
                          {formErrors?.settlement_period}
                        </p>
                      )}
                    </div>

                    <div className="mb-2">
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

                    <div className="mb-2">
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
                  </>
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
                        setCurrentVendorId({})
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
            {t("vendor_list")}
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
                role: "vendor",
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
                short_name: "",
                long_name: "",
                representative_name: "",
                representative_phone: "",
                representative_email: "",
                representative_nid: "",
                representative_position: "",
                settlement_period: "",
              });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("add_vendor")}
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
                  {t("SHORT_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REP_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REP_PHONE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REP_EMAIL")}
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
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(selectedRole === "vendor" ? vendorList : users).map(
                (user, index) => (
                  <TableRow key={index} className="hover:bg-yellow-50">
                    
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.short_name||"n/a"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.representative_name||"n/a"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.representative_phone||"n/a"}
                    </TableCell>
                     <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.representative_email||"n/a"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.registration_number||"n/a"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.license_number||"n/a"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user?.vendor?.settlement_period||"n/a"}
                    </TableCell>
                    

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <StatusBadge status={user?.status} />
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex flex-row items-center justify-start gap-2">
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEdit(user)}
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
