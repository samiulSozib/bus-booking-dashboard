import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showUser, editVendor } from "../../../store/slices/userSlice";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../components/ui/badge/StatusBadge";
import { Edit } from "../../../icons";
import * as Yup from "yup";
import Swal from "sweetalert2";
import VendorModal from "./VendorModal";

export default function VendorView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { selectedUser, loading } = useSelector((state) => state.users);
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
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
    dispatch(showUser(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedUser) {
      const vendor = selectedUser.vendor || {};
      setFormData({
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        email: selectedUser.email || "",
        mobile: selectedUser.mobile || "",
        status: selectedUser.status || "",
        short_name: vendor.short_name || "",
        long_name: vendor.long_name || "",
        registration_number: vendor.registration_number || "",
        license_number: vendor.license_number || "",
        rating: vendor.rating || 0,
        admin_comission_amount: vendor.admin_comission_amount || 0,
        admin_comission_type: vendor.admin_comission_type || "",
        agent_comission_amount: vendor.agent_comission_amount || 0,
        agent_comission_type: vendor.agent_comission_type || "",
        logo: vendor.logo || "",
        description: vendor.description || "",
        representative_name: vendor.representative_name || "",
        representative_phone: vendor.representative_phone || "",
        representative_email: vendor.representative_email || "",
        representative_nid: vendor.representative_nid || "",
        representative_position: vendor.representative_position || "",
        settlement_period: vendor.settlement_period || "",
      });
      setImagePreview(vendor.logo || null);
    }
  }, [selectedUser]);



  const handleEditSubmit = async (formData) => {
    try {
      const result = await dispatch(
        editVendor({ vendorId: selectedUser.vendor.id, updatedData: formData })
      );

      // Return the result to the modal
      return result;
    } catch (err) {
      throw err;
    }
  };

 
  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        {t("vendor_not_found")}
      </div>
    );
  }

  const vendor = selectedUser.vendor || {};

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Page Header */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("VENDOR_DETAILS")}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {vendor.short_name} - {vendor.registration_number}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("BACK_TO_LIST")}
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <Edit className="w-4 h-4" />
            {t("edit_vendor")}
          </button>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vendor Information Card */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              {t("VENDOR_INFORMATION")}
            </h4>
            <StatusBadge status={selectedUser.status} />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("SHORT_NAME")}
              </p>
              <p className="mt-1 text-sm text-gray-900">{vendor.short_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("LONG_NAME")}
              </p>
              <p className="mt-1 text-sm text-gray-900">{vendor.long_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("MOBILE")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.registration_number}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("LICENSE_NUMBER")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.license_number}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("SETTLEMENT_PERIOD")}
              </p>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {vendor.settlement_period}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">{t("RATING")}</p>
              <div className="mt-1 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < vendor.rating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-500"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-500">
                  ({vendor.rating})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Representative Information Card */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              {t("REPRESENTATIVE_INFORMATION")}
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("REPRESENTATIVE_NAME")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.representative_name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("REPRESENTATIVE_POSITION")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.representative_position}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("REPRESENTATIVE_PHONE")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.representative_phone}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("REPRESENTATIVE_EMAIL")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.representative_email}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("REPRESENTATIVE_NID")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.representative_nid}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Information Card */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              {t("COMMISSION_INFORMATION")}
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("ADMIN_COMMISSION")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.admin_comission_amount}{" "}
                {vendor.admin_comission_type === "percentage" ? "%" : "fixed"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("AGENT_COMMISSION")}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {vendor.agent_comission_amount}{" "}
                {vendor.agent_comission_type === "percentage" ? "%" : "fixed"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("DESCRIPTION")}
              </p>
              <p className="mt-1 text-sm text-gray-900">{vendor.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">{t("LOGO")}</p>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vendor Logo"
                  className="rounded-md mt-2 h-32 w-48 object-contain"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-500">{t("no_logo")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Account Information */}
      <div className="mt-6 bg-white rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            {t("USER_INFORMATION")}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("FIRST_NAME")}
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {selectedUser.first_name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("LAST_NAME")}
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {selectedUser.last_name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">{t("EMAIL")}</p>
            <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">{t("MOBILE")}</p>
            <p className="mt-1 text-sm text-gray-900">{selectedUser.mobile}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">{t("ROLE")}</p>
            <p className="mt-1 text-sm text-gray-900 capitalize">
              {selectedUser.role}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">{t("STATUS")}</p>
            <div className="mt-1">
              <StatusBadge status={selectedUser.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vendor Modal */}
      <VendorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={formData}
        isEditingVendor={true}
      />
    </div>
  );
}
