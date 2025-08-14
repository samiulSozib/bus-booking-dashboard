import { useState, useEffect } from "react";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export default function VendorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  isEditingVendor,
  userDataOnly = false,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    role: "vendor",
    password: "",
    status: "",
    short_name: "",
    long_name: "",
    registration_number: "",
    license_number: "",
    rating: 0,
    admin_comission_amount: 0,
    admin_comission_type: "",
    agent_comission_amount: 0,
    agent_comission_type: "",
    logo: "",
    description: "",
    representative_name: "",
    representative_phone: "",
    representative_email: "",
    representative_nid: "",
    representative_position: "",
    settlement_period: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.logo || null);
    } else {
      // Reset form when opening for new vendor
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        role: "vendor",
        password: "",
        status: "",
        short_name: "",
        long_name: "",
        registration_number: "",
        license_number: "",
        rating: 0,
        admin_comission_amount: 0,
        admin_comission_type: "",
        agent_comission_amount: 0,
        agent_comission_type: "",
        logo: "",
        description: "",
        representative_name: "",
        representative_phone: "",
        representative_email: "",
        representative_nid: "",
        representative_position: "",
        settlement_period: "",
      });
      setImagePreview(null);
    }
  }, [initialData, isOpen]);

  const getValidationSchema = (t, isEditingVendor) =>
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
      password:
        isEditing || isEditingVendor
          ? Yup.string()
          : Yup.string()
              .required(t("user.passwordRequired"))
              .min(6, t("user.passwordMin")),
      status: Yup.string().required(t("user.statusRequired")),

      // Vendor organization info
      short_name: Yup.string().required(t("user.shortNameRequired")),
      long_name: Yup.string().required(t("user.longNameRequired")),
      registration_number: Yup.string().required(
        t("user.registrationNumberRequired")
      ),
      license_number: Yup.string().required(t("user.licenseNumberRequired")),
      rating: Yup.number().required(t("user.ratingRequired")),
      settlement_period: Yup.string().required(
        t("user.settlementPeriodRequired")
      ),

      // Vendor representative info
      representative_name: Yup.string().required(
        t("user.representativeNameRequired")
      ),
      representative_phone: Yup.string()
        .matches(/^[0-9]{10}$/, t("user.representativePhoneInvalid"))
        .required(t("user.representativePhoneRequired")),
      representative_email: Yup.string()
        .email(t("user.representativeEmailInvalid"))
        .required(t("user.representativeEmailRequired")),
      representative_nid: Yup.string().required(
        t("user.representativeNidRequired")
      ),
      representative_position: Yup.string().required(
        t("user.representativePositionRequired")
      ),

      // Commission info
      admin_comission_amount: Yup.number().required(
        t("user.adminCommissionAmountRequired")
      ),
      admin_comission_type: Yup.string().required(
        t("user.adminCommissionTypeRequired")
      ),
      agent_comission_amount: Yup.number().required(
        t("user.agentCommissionAmountRequired")
      ),
      agent_comission_type: Yup.string().required(
        t("user.agentCommissionTypeRequired")
      ),
    });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormErrors({});
      await getValidationSchema(t, isEditingVendor).validate(formData, {
        abortEarly: false,
      });

      // Prepare form data (especially for file upload)
      // const formDataToSend = new FormData();
      // for (const key in formData) {
      //   if (formData[key] !== null && formData[key] !== undefined) {
      //     formDataToSend.append(key, formData[key]);
      //   }
      // }

      const dataToSend = { ...formData };
      if (dataToSend.logo && !(dataToSend.logo instanceof File)) {
        delete dataToSend.logo; // Remove logo if it's not a file
      }

      const result = await onSubmit(dataToSend);

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
      } else {
        Swal.fire({
          icon: "success",
          title: t("success"),
          text:
            isEditing || isEditingVendor
              ? t("userUpdateSuccessfully")
              : t("userAddedSuccessfully"),
        });
      }

      onClose();
    } catch (err) {
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
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: err.message || t("failedToProcessRequest"),
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing
            ? t("edit_user")
            : isEditingVendor
            ? t("edit_vendor")
            : t("add_vendor")}
        </h2>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit}>
            {/* User Information Section */}
            {!isEditingVendor && (
              <div className="mb-4 p-2 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("USER_INFORMATION")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* First Name */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("FIRST_NAME")} *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {formErrors.first_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("LAST_NAME")} *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {formErrors.last_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.last_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("EMAIL")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("MOBILE")}
                    </label>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {formErrors.mobile && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Role - Only show when adding new vendor */}
                  {!isEditing && !isEditingVendor && (
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("ROLE")} *
                      </label>
                      <select
                        disabled
                        value={formData.role || "vendor"}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-gray-100"
                      >
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>
                  )}

                  {/* Password - Only show when adding new vendor */}
                  {!isEditing && !isEditingVendor && (
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("PASSWORD")} *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("STATUS")} *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                      <option value="">{t("SELECT_STATUS")}</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="banned">Banned</option>
                    </select>
                    {formErrors.status && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Information Section - Only show when not editing user only */}
            {!userDataOnly && (
              <>
                <div className="mb-4 p-2 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("VENDOR_INFORMATION")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Short Name */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("SHORT_NAME")} *
                      </label>
                      <input
                        type="text"
                        value={formData.short_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            short_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.short_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.short_name}
                        </p>
                      )}
                    </div>

                    {/* Long Name */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LONG_NAME")} *
                      </label>
                      <input
                        type="text"
                        value={formData.long_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            long_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.long_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.long_name}
                        </p>
                      )}
                    </div>

                    {/* Registration Number */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REGISTRATION_NUMBER")} *
                      </label>
                      <input
                        type="text"
                        value={formData.registration_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registration_number: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.registration_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.registration_number}
                        </p>
                      )}
                    </div>

                    {/* License Number */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LICENSE_NUMBER")} *
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            license_number: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.license_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.license_number}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("RATING")} *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.rating && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.rating}
                        </p>
                      )}
                    </div>

                    {/* Logo */}
                    <div className="mb-2 col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("LOGO")}
                      </label>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Vendor Logo Preview"
                          className="mt-2 h-16 w-16 object-contain"
                        />
                      )}
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-2 col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("DESCRIPTION")} *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Representative Information Section */}
                <div className="mb-4 p-2 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("REPRESENTATIVE_INFORMATION")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Representative Name */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_NAME")} *
                      </label>
                      <input
                        type="text"
                        value={formData.representative_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.representative_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.representative_name}
                        </p>
                      )}
                    </div>

                    {/* Representative Phone */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_PHONE")} *
                      </label>
                      <input
                        type="text"
                        value={formData.representative_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_phone: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.representative_phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.representative_phone}
                        </p>
                      )}
                    </div>

                    {/* Representative Email */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_EMAIL")} *
                      </label>
                      <input
                        type="email"
                        value={formData.representative_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_email: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.representative_email && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.representative_email}
                        </p>
                      )}
                    </div>

                    {/* Representative NID */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_NID")} *
                      </label>
                      <input
                        type="text"
                        value={formData.representative_nid}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_nid: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.representative_nid && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.representative_nid}
                        </p>
                      )}
                    </div>

                    {/* Representative Position */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("REPRESENTATIVE_POSITION")} *
                      </label>
                      <input
                        type="text"
                        value={formData.representative_position}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative_position: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.representative_position && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.representative_position}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commission and Settlement Section */}
                <div className="mb-4 p-2 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("COMMISSION_SETTLEMENT")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Admin Commission Amount */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("ADMIN_COMMISSION_AMOUNT")} *
                      </label>
                      <input
                        type="number"
                        value={formData.admin_comission_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            admin_comission_amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.admin_comission_amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.admin_comission_amount}
                        </p>
                      )}
                    </div>

                    {/* Admin Commission Type */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("ADMIN_COMMISSION_TYPE")} *
                      </label>
                      <select
                        value={formData.admin_comission_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            admin_comission_type: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      >
                        <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      {formErrors.admin_comission_type && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.admin_comission_type}
                        </p>
                      )}
                    </div>

                    {/* Agent Commission Amount */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("AGENT_COMMISSION_AMOUNT")} *
                      </label>
                      <input
                        type="number"
                        value={formData.agent_comission_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agent_comission_amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                      {formErrors.agent_comission_amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.agent_comission_amount}
                        </p>
                      )}
                    </div>

                    {/* Agent Commission Type */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("AGENT_COMMISSION_TYPE")} *
                      </label>
                      <select
                        value={formData.agent_comission_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agent_comission_type: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      >
                        <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      {formErrors.agent_comission_type && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.agent_comission_type}
                        </p>
                      )}
                    </div>

                    {/* Settlement Period */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("SETTLEMENT_PERIOD")} *
                      </label>
                      <select
                        value={formData.settlement_period}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settlement_period: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      >
                        <option value="">
                          {t("SELECT_SETTLEMENT_PERIOD")}
                        </option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      {formErrors.settlement_period && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.settlement_period}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setFormErrors({});
                  onClose();
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t("CANCEL")}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isEditing || isEditingVendor ? t("UPDATE") : t("ADD")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
