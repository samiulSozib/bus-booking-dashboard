import { useState, useEffect, useRef } from "react";
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
  fetchBranches,
  showBranch,
} from "../../store/slices/branchSlice";
import { Edit, SearchIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import { useHasPermission, userType } from "../../utils/utils";
import useOutsideClick from "../../hooks/useOutSideClick";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchProvinces } from "../../store/slices/provinceSlice";

// Validation schema based on API
const branchSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").nullable(),
  mobile: Yup.string().required("Mobile is required"),
  name: Yup.string().required("Branch name is required"),
  province_id: Yup.number().required("Province is required"),
  address: Yup.string().required("Address is required"),
  representative_name: Yup.string().required("Representative name is required"),
  representative_phone: Yup.string().required(
    "Representative phone is required"
  ),
  representative_email: Yup.string().email("Invalid email").nullable(),
  representative_nid: Yup.string().required("Representative NID is required"),
  representative_position: Yup.string().required(
    "Representative position is required"
  ),
  vendor_commission_amount: Yup.number().nullable(),
  vendor_commission_type: Yup.string()
    .oneOf(["fixed", "percentage"])
    .nullable(),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Status is required"),
});

export default function BranchList() {
  const vendorDropdownRef = useRef(null);

  useOutsideClick(vendorDropdownRef, () => {
    if (showModalVendorDropdown) {
      setShowModalVendorDropdown(false);
    }
  });
  const dispatch = useDispatch();
  const { branches, selectedBranch, loading, pagination } = useSelector(
    (state) => state.branch
  );

  const { vendorList } = useSelector((state) => state.users);
  const { provinces } = useSelector((state) => state.provinces);

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState(null);

  const [provinceSearch, setProvinceSearch] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    name: "",
    province_id: "",
    address: "",
    representative_name: "",
    representative_phone: "",
    representative_email: "",
    representative_nid: "",
    representative_position: "",
    vendor_commission_amount: null,
    vendor_commission_type: null,
    status: "active",
    password: "", // Only for new branches
    vendor_id: null,
  });

  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
  const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);
  const isAdmin = userType().role === "admin";

  useEffect(() => {
    dispatch(fetchBranches({ search: searchTag, page: currentPage }));
  }, [dispatch, currentPage, searchTag]);

  useEffect(() => {
    dispatch(fetchProvinces({ searchTag: provinceSearch }));
  }, [dispatch, provinceSearch]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers({ searchTag: modalVendorSearchTag, role: "vendor" }));
    }
  }, [dispatch, modalVendorSearchTag]);

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setFormData((prev) => ({
      ...prev,
      province_id: province.id,
    }));
    setShowProvinceDropdown(false);
  };

  useEffect(() => {
    if (selectedBranch) {
      setFormData({
        first_name: selectedBranch.first_name || "",
        last_name: selectedBranch.last_name || "",
        email: selectedBranch.email || "",
        mobile: selectedBranch.mobile || "",
        name: selectedBranch?.branch?.name || "",
        province_id: selectedBranch?.branch?.province?.id || "",
        address: selectedBranch?.branch?.address || "",
        representative_name: selectedBranch?.branch?.representative_name || "",
        representative_phone:
          selectedBranch?.branch?.representative_phone || "",
        representative_email:
          selectedBranch?.branch?.representative_email || "",
        representative_nid: selectedBranch?.branch?.representative_nid || "",
        representative_position:
          selectedBranch?.branch?.representative_position || "",
        vendor_commission_amount:
          selectedBranch?.branch?.vendor_commission_amount || null,
        vendor_commission_type:
          selectedBranch?.branch?.vendor_commission_type || null,
        status: selectedBranch.status || "active",
        password: "",
        vendor_id: selectedBranch?.branch?.vendor?.id,
      });
      setModalVendorSearchTag(selectedBranch?.branch?.vendor?.short_name);
      setProvinceSearch(selectedBranch?.branch?.province?.name)
    }
  }, [selectedBranch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleModalVendorSelect = (vendor) => {
    setFormData({ ...formData, vendor_id: vendor.id });
    setModalVendorSearchTag(vendor.short_name);
    setShowModalVendorDropdown(false);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.vendor_id;
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      await branchSchema.validate(formData, { abortEarly: false });

      if (isEditing) {
        const resultAction = await dispatch(
          updateBranch({ id: currentBranchId, branchData: formData })
        );

        if (updateBranch.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("branchUpdateSuccess"),
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
          throw new Error(resultAction.payload || "An unknown error occurred");
        }
      } else {
        const resultAction = await dispatch(addBranch(formData));
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
          throw new Error(resultAction.payload || "An unknown error occurred");
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
    setIsEditing(false);
    setCurrentBranchId(null);
    setModalVendorSearchTag("");
    setProvinceSearch("")
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      name: "",
      province_id: "",
      address: "",
      representative_name: "",
      representative_phone: "",
      representative_email: "",
      representative_nid: "",
      representative_position: "",
      vendor_commission_amount: null,
      vendor_commission_type: null,
      status: "active",
      password: "",
      vendor_id: null,
      
    });
    setErrors({});
  };

  const handleEditBranch = (branchId) => {
    dispatch(showBranch(branchId));
    setIsEditing(true);
    setCurrentBranchId(branchId);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_BRANCH") : t("ADD_BRANCH")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div>
                  {/* Branch Information */}

                  {isAdmin && (
                    <div className="mb-4" ref={vendorDropdownRef}>
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
                              .filter((vendor) => {
                                const name =
                                  vendor?.vendor?.short_name?.toLowerCase() ?? "";
                                const search =
                                  modalVendorSearchTag?.toLowerCase() ?? "";
                                return name && name.includes(search);
                              })

                              .map((vendor) => (
                                <div
                                  key={vendor?.vendor?.id}
                                  onClick={() =>
                                    handleModalVendorSelect(vendor?.vendor)
                                  }
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {vendor?.vendor?.short_name}
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("NAME")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("ADDRESS")} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* province */}

                  {/* <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("PROVINCE")} *
                    </label>
                    <input
                      type="number"
                      name="province_id"
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.province_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province_id}
                      </p>
                    )}
                  </div> */}

                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("PROVINCE")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("SEARCH_PROVINCE")}
                      value={provinceSearch}
                      onChange={(e) => {
                        setProvinceSearch(e.target.value);
                        setShowProvinceDropdown(true);
                        if (
                          selectedProvince &&
                          e.target.value !== `${selectedProvince?.name}`
                        ) {
                          setSelectedProvince(null);
                          setFormData((prev) => ({ ...prev, province_id: "" }));
                        }
                      }}
                      onFocus={() => setShowProvinceDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowProvinceDropdown(false), 200)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {showProvinceDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {provinces
                          .filter((province) =>
                            province.name
                              .toLowerCase()
                              .includes(provinceSearch.toLowerCase())
                          )
                          .map((province) => (
                            <div
                              key={province.id}
                              onClick={() => {
                                handleProvinceSelect(province);
                                setProvinceSearch(province.name);
                              }}
                              className="px-3 py-2 text-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                            >
                              {province.name}
                            </div>
                          ))}
                        {provinces.filter((province) =>
                          province.name
                            .toLowerCase()
                            .includes(provinceSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("NO_PROVINCE_FOUND")}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.province_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province_id}
                      </p>
                    )}
                  </div>

                  {/* province */}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("REPRESENTATIVE_PHONE")} *
                    </label>
                    <input
                      type="text"
                      name="representative_phone"
                      value={formData.representative_phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.representative_phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.representative_phone}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("REPRESENTATIVE_EMAIL")}
                    </label>
                    <input
                      type="email"
                      name="representative_email"
                      value={formData.representative_email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.representative_email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.representative_email}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("REPRESENTATIVE_NID")} *
                    </label>
                    <input
                      type="text"
                      name="representative_nid"
                      value={formData.representative_nid}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.representative_nid && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.representative_nid}
                      </p>
                    )}
                  </div>

                  {/* Representative Information */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("REPRESENTATIVE_NAME")} *
                    </label>
                    <input
                      type="text"
                      name="representative_name"
                      value={formData.representative_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.representative_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.representative_name}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("REPRESENTATIVE_POSITION")} *
                    </label>
                    <input
                      type="text"
                      name="representative_position"
                      value={formData.representative_position}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.representative_position && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.representative_position}
                      </p>
                    )}
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  {/* User Information */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("FIRST_NAME")} *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("LAST_NAME")} *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.last_name}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("MOBILE")} *
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("EMAIL")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t("COMMISSION_AMOUNT")}
                      </label>
                      <input
                        type="number"
                        name="vendor_commission_amount"
                        value={formData.vendor_commission_amount || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t("COMMISSION_TYPE")}
                      </label>
                      <select
                        name="vendor_commission_type"
                        value={formData.vendor_commission_type || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("STATUS")} *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("PASSWORD")} *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
            {t("BRANCHES")}
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
                  {t("USER_NAME")}
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
                  {t("REPRESENTATIVE_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REPRESENTATIVE_PHONE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("PROVINCE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION")}
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
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  {/* Branch Name */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {branch?.branch?.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* User Name */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch.first_name} {branch.last_name}
                  </TableCell>

                  {/* Email */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch.email}
                  </TableCell>

                  {/* Mobile */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch.mobile}
                  </TableCell>

                  {/* Representative */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.branch?.representative_name}
                  </TableCell>

                  {/* Representative Phone */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.branch?.representative_phone}
                  </TableCell>

                  {/* Province */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.branch?.province?.name}
                  </TableCell>

                  {/* Commission */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {branch?.branch?.vendor_commission_amount || "N/A"}{" "}
                    {branch?.branch?.vendor_commission_type &&
                      `(${branch.branch.vendor_commission_type})`}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        branch?.branch?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {branch?.branch?.status}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.branches.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 cursor-pointer"
                          onClick={() => handleEditBranch(branch?.branch?.id)}
                          title="Edit Branch"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-300" />
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
