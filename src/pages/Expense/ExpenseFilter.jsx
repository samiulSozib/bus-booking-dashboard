import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons";
import { formatToYMD } from "../../utils/utils";
import { fetchExpenseCategories } from "../../store/slices/expenseCategorySlice";
import { fetchTrips } from "../../store/slices/tripSlice";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExpenseFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { trips, loading: tripsLoading } = useSelector((state) => state.trips);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.expenseCategory
  );

  // Filter states
  const [filters, setFilters] = useState({
    trip_id: null,
    category_id: null,
    from_date: null,
    to_date: null,
    search: "",
  });

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [tripSearchTerm, setTripSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchTrips({}));
    dispatch(fetchExpenseCategories({}));
  }, [dispatch]);

  // Fetch trips when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchTrips({ searchTag: tripSearchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, tripSearchTerm]);

  // Fetch categories when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchExpenseCategories({ search: categorySearchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, categorySearchTerm]);

  // Handle trip selection
  const handleTripSelect = (selectedOption) => {
    setSelectedTripId(selectedOption?.value || null);
    setFilters((prevFilters) => ({
      ...prevFilters,
      trip_id: selectedOption?.value || null,
    }));
  };

  // Handle category selection
  const handleCategorySelect = (selectedOption) => {
    setSelectedCategoryId(selectedOption?.value || null);
    setFilters((prevFilters) => ({
      ...prevFilters,
      category_id: selectedOption?.value || null,
    }));
  };

  // Handle date changes
  const handleFromDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      from_date: date,
    }));
  };

  const handleToDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      to_date: date,
    }));
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: e.target.value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    const appliedFilters = {
      "trip-id": filters.trip_id,
      "category-id": filters.category_id,
      "from-date": filters.from_date ? formatToYMD(filters.from_date) : "",
      "to-date": filters.to_date ? formatToYMD(filters.to_date) : "",
      search: filters.search,
    };
    onApplyFilters(appliedFilters);
    onClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      trip_id: null,
      category_id: null,
      from_date: null,
      to_date: null,
      search: "",
    });
    setSelectedTripId(null);
    setSelectedCategoryId(null);
    setTripSearchTerm("");
    setCategorySearchTerm("");
    onApplyFilters({});
    onClose();
  };

  // Format trips for react-select
  const tripOptions = trips.map((trip) => ({
    value: trip.id,
    label: `${trip?.route?.origin_station?.name} → ${
      trip?.route?.destination_station?.name
    } - ${new Date(trip.departure_time).toLocaleString()} (${trip.bus?.name})`,
  }));

  // Format categories for react-select
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t("FILTERS")}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Search Term Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("SEARCH")}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder={t("expense.searchPlaceholder")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("CATEGORY")}
            </label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(
                (option) => option.value === selectedCategoryId
              )}
              onChange={handleCategorySelect}
              onInputChange={setCategorySearchTerm}
              placeholder={t("expense.searchCategory")}
              className="basic-multi-select"
              classNamePrefix="select"
              isSearchable
              isLoading={categoriesLoading}
              noOptionsMessage={() => t("expense.noCategoriesFound")}
            />
          </div>

          {/* Trip Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("TRIP")}
            </label>
            <Select
              options={tripOptions}
              value={tripOptions.find(
                (option) => option.value === selectedTripId
              )}
              onChange={handleTripSelect}
              onInputChange={setTripSearchTerm}
              placeholder={t("expense.searchTrip")}
              className="basic-multi-select"
              classNamePrefix="select"
              isSearchable
              isLoading={tripsLoading}
              noOptionsMessage={() => t("expense.noTripsFound")}
            />
          </div>

          <div className="flex flex-row gap-2">
            {/* From Date Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("FROM_DATE")}
              </label>
              <DatePicker
                selected={filters.from_date}
                onChange={handleFromDateChange}
                selectsStart
                startDate={filters.from_date}
                endDate={filters.to_date}
                className="w-full p-2 border rounded"
                dateFormat="yyyy-MM-dd"
                placeholderText={t("SELECT_DATE")}
              />
            </div>

            {/* To Date Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("TO_DATE")}
              </label>
              <DatePicker
                selected={filters.to_date}
                onChange={handleToDateChange}
                selectsEnd
                startDate={filters.from_date}
                endDate={filters.to_date}
                minDate={filters.from_date}
                className="w-full p-2 border rounded"
                dateFormat="yyyy-MM-dd"
                placeholderText={t("SELECT_DATE")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("RESET")}
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
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

export default ExpenseFilter;
