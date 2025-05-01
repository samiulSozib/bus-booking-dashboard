{openDialog && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col dark:bg-gray-800 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 dark:text-white/90">
          {formData.berth_type === 'lower' ? t("CONFIGURE_LOWER_BERTH") : t("CONFIGURE_UPPER_BERTH")}
        </h3>
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("BERTH_TYPE")} <span className="text-red-500">*</span>
            </label>
            <select
              name="berth_type"
              value={formData.berth_type}
              onChange={handleBerthChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                errors.berth_type ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">{t("SELECT_BERTH_TYPE")}</option>
              <option value="lower">Lower Berth</option>
              <option value="upper">Upper Berth</option>
            </select>
            {errors.berth_type && (
              <p className="text-red-500 text-xs mt-1">{errors.berth_type}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("ROWS")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rows"
              value={formData.rows}
              onChange={handleBerthChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                errors.rows ? 'border-red-500' : ''
              }`}
              min="1"
              required
            />
            {errors.rows && (
              <p className="text-red-500 text-xs mt-1">{errors.rows}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("COLUMNS")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="columns"
              value={formData.columns}
              onChange={handleBerthChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                errors.columns ? 'border-red-500' : ''
              }`}
              min="1"
              required
            />
            {errors.columns && (
              <p className="text-red-500 text-xs mt-1">{errors.columns}</p>
            )}
          </div>
        </div>
        {/* ... rest of the dialog ... */}
      </div>
    </div>
  )}