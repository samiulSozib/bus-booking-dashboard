import { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import Checkbox from "../../components/form/input/Checkbox";
import { fetchBranches } from "../../store/slices/branchSlice";
import { useDispatch, useSelector } from "react-redux";
import { userType } from "../../utils/utils";

// Validation schema

export const RoleFormModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  errors,
  permissions,
  selectedPermissions,
  isEditing,
  onInputChange,
  onPermissionChange,
  onSubmit,
  vendorBranchSearch,
  setVendorBranchSearch
}) => {
  const { t } = useTranslation();
    const dispatch = useDispatch();
  
  const [selectAll, setSelectAll] = useState(false);
  const { branches } = useSelector((state) => state.branch);

  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const isBranch = userType().role === "branch";
  // Effect to update selectAll state based on selectedPermissions
  useEffect(() => {
    if (permissions?.length > 0) {
      const allSelected = permissions.every((permission) =>
        selectedPermissions.includes(permission.title)
      );
      setSelectAll(allSelected);
    }
  }, [selectedPermissions, permissions]);

  useEffect(() => {
    dispatch(fetchBranches({ searchTag: vendorBranchSearch }));
  }, [dispatch, vendorBranchSearch]);

  // Handle select all/deselect all
  const handleSelectAllChange = () => {
    if (selectAll) {
      // Deselect all
      permissions.forEach((permission) => {
        if (selectedPermissions.includes(permission.title)) {
          onPermissionChange(permission.title);
        }
      });
    } else {
      // Select all
      permissions.forEach((permission) => {
        if (!selectedPermissions.includes(permission.title)) {
          onPermissionChange(permission.title);
        }
      });
    }
    setSelectAll(!selectAll);
  };

  const handleVendorBranchSelect = (branch) => {
    setSelectedVendorBranch(branch);
    //setFormData({ ...formData, vendor_branch_id: branch.id });
    setFormData({...formData,vendor_branch_id:branch.id})
    setShowVendorBranchDropdown(false);
    // setErrors((prevErrors) => {
    //   const newErrors = { ...prevErrors };
    //   delete newErrors.vendor_branch_id;
    //   return newErrors;
    // });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? t("EDIT_ROLE") : t("ADD_ROLE")}
        </h2>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
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

            {/* Title */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("ROLE_TITLE")} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("ROLE_NAME")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("ROLE_DESCRIPTION")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={1}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <hr className="mb-4" />

          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("MANAGE_PERMISSIONS")}</h2>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all" className="text-sm text-gray-600">
                {t("SELECT_ALL")}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {permissions?.map((permission) => (
              <div key={permission.title} className="flex items-center">
                <input
                  type="checkbox"
                  id={`perm-${permission.title}`}
                  checked={selectedPermissions.includes(permission.title)}
                  onChange={() => onPermissionChange(permission.title)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`perm-${permission.title}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {t(permission.name)}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t("CANCEL")}
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? t("UPDATE") : t("SAVE")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
