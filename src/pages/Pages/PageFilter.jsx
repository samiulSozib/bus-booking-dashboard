import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons";
import Select from 'react-select';

const PageFilter = ({ isOpen, onClose, onApplyFilters, onResetFilters, filters, locales, statuses, t }) => {
  const dispatch = useDispatch();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: selectedOption?.value || ""
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {};
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  // Format options for react-select
  const localeOptions = [
    { value: "", label: t("ALL_LOCALES") },
    ...locales.map(locale => ({
      value: locale.value,
      label: locale.label
    }))
  ];

  const statusOptions = [
    { value: "", label: t("ALL_STATUSES") },
    ...statuses.map(status => ({
      value: status.value,
      label: status.label
    }))
  ];

  const perPageOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t("FILTER_PAGES")}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Search Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("SEARCH")}
            </label>
            <input
              type="text"
              name="searchTag"
              value={localFilters.searchTag || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder={t("SEARCH")}
            />
          </div>

          {/* Locale Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("LOCALE")}
            </label>
            <Select
              options={localeOptions}
              value={localeOptions.find(option => option.value === (localFilters.locale || ""))}
              onChange={(selectedOption) => handleSelectChange("locale", selectedOption)}
              className="basic-select"
              classNamePrefix="select"
              isSearchable
            />
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("STATUS")}
            </label>
            <Select
              options={statusOptions}
              value={statusOptions.find(option => option.value === (localFilters.status || ""))}
              onChange={(selectedOption) => handleSelectChange("status", selectedOption)}
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

          {/* Items Per Page Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ITEMS_PER_PAGE")}
            </label>
            <Select
              options={perPageOptions}
              value={perPageOptions.find(option => option.value === (localFilters.per_page || 10))}
              onChange={(selectedOption) => handleSelectChange("per_page", selectedOption)}
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("RESET")}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t("APPLY_FILTERS")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageFilter;