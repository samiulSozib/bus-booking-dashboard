import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoutes } from "../../store/slices/routeSlice";
import { fetchBuses } from "../../store/slices/busSlice";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons";
import { fetchUsers } from "../../store/slices/userSlice";
import {
  formatForDisplayDiscount,
  formatForInputDiscount,
  userType,
} from "../../utils/utils";

const DiscountFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { vendorList } = useSelector((state) => state.users);
  const { routes } = useSelector((state) => state.routes);
  const { buses } = useSelector((state) => state.buses);

  const type = userType();

  // Filter states
  const [filters, setFilters] = useState({
    vendorId: null,
    routeId: null,
    busId: null,
    departureTime: "",
  });

  // Search tags for dropdowns
  const [searchTags, setSearchTags] = useState({
    vendor: "",
    route: "",
    bus: "",
  });

  // Dropdown visibility
  const [dropdowns, setDropdowns] = useState({
    showVendor: false,
    showRoute: false,
    showBus: false,
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchUsers({ role: "vendor" }));
    dispatch(fetchRoutes({}));
    dispatch(fetchBuses({}));
  }, [dispatch]);

  // Handle search tag changes
  useEffect(() => {
    if (searchTags.vendor !== "" || dropdowns.showVendor) {
      dispatch(fetchUsers({ searchTag: searchTags.vendor, role: "vendor" }));
    }
  }, [dispatch, searchTags.vendor, dropdowns.showVendor]);

  useEffect(() => {
    if (searchTags.route !== "" || dropdowns.showRoute) {
      dispatch(fetchRoutes({ searchTag: searchTags.route }));
    }
  }, [dispatch, searchTags.route, dropdowns.showRoute]);

  useEffect(() => {
    if (searchTags.bus !== "" || dropdowns.showBus) {
      dispatch(fetchBuses({ searchTag: searchTags.bus }));
    }
  }, [dispatch, searchTags.bus, dropdowns.showBus]);

  // Toggle dropdown
  const toggleDropdown = (dropdownKey, isOpen) => {
    setDropdowns((prevDropdowns) => ({
      ...prevDropdowns,
      [dropdownKey]: isOpen,
    }));
  };

  // Handle search tag change
  const handleSearchTagChange = (searchTagKey, value) => {
    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      [searchTagKey]: value,
    }));
  };

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      vendorId: vendor.id,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      vendor: vendor.name,
    }));

    toggleDropdown("showVendor", false);
  };

  // Handle route selection
  const handleRouteSelect = (route) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      routeId: route.id,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      route: route.name,
    }));

    toggleDropdown("showRoute", false);
  };

  // Handle bus selection
  const handleBusSelect = (bus) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      busId: bus.id,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      bus: bus.name,
    }));

    toggleDropdown("showBus", false);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      departureTime: formatForInputDiscount(e.target.value),
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    const appliedFilters = {
      "vendor-id": filters.vendorId,
      "route-id": filters.routeId,
      "bus-id": filters.busId,
      "departure-time": filters.departureTime,
    };
    onApplyFilters(appliedFilters);
    onClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      vendorId: null,
      routeId: null,
      busId: null,
      departureTime: "",
    });
    setSearchTags({
      vendor: "",
      route: "",
      bus: "",
    });
    onApplyFilters({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold"></h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* vendor filter */}
          {type?.role === "admin" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("VENDOR")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("SEARCH_VENDOR")}
                  value={searchTags.vendor}
                  onChange={(e) => {
                    handleSearchTagChange("vendor", e.target.value);
                    toggleDropdown("showVendor", true);
                  }}
                  onFocus={() => toggleDropdown("showVendor", true)}
                  onBlur={() =>
                    setTimeout(() => toggleDropdown("showVendor", false), 200)
                  }
                  className="w-full p-2 border rounded"
                />
                {dropdowns.showVendor && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {vendorList

                      // .filter((vendor) =>
                      //     vendor?.vendor?.name.includes(searchTags.vendor)
                      // )
                      .filter((vendor) => {
                        const name = vendor?.vendor?.name?.toLowerCase() ?? "";
                        const search = searchTags.vendor?.toLowerCase() ?? "";

                        return name.includes(search);
                      })

                      .map((vendor) => (
                        <div
                          key={vendor?.vendor?.id}
                          onClick={() => handleVendorSelect(vendor?.vendor)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {vendor?.vendor?.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Route Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ROUTE")}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("SEARCH_ROUTE")}
                value={searchTags.route}
                onChange={(e) => {
                  handleSearchTagChange("route", e.target.value);
                  toggleDropdown("showRoute", true);
                }}
                onFocus={() => toggleDropdown("showRoute", true)}
                onBlur={() =>
                  setTimeout(() => toggleDropdown("showRoute", false), 200)
                }
                className="w-full p-2 border rounded"
              />
              {dropdowns.showRoute && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  {routes
                    .filter((route) =>
                      route.name
                        .toLowerCase()
                        .includes(searchTags.route.toLowerCase())
                    )
                    .map((route) => (
                      <div
                        key={route.id}
                        onMouseDown={() => handleRouteSelect(route)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {route.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Bus Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("BUS")}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("SEARCH_BUS")}
                value={searchTags.bus}
                onChange={(e) => {
                  handleSearchTagChange("bus", e.target.value);
                  toggleDropdown("showBus", true);
                }}
                onFocus={() => toggleDropdown("showBus", true)}
                onBlur={() =>
                  setTimeout(() => toggleDropdown("showBus", false), 200)
                }
                className="w-full p-2 border rounded"
              />
              {dropdowns.showBus && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  {buses
                    .filter((bus) =>
                      (bus.plateNumber || bus.id.toString())
                        .toLowerCase()
                        .includes(searchTags.bus.toLowerCase())
                    )
                    .map((bus) => (
                      <div
                        key={bus.id}
                        onMouseDown={() => handleBusSelect(bus)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {bus.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Departure Time Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("DEPARTURE_TIME")}
            </label>
            <input
              type="datetime-local"
              value={formatForDisplayDiscount(filters.departureTime)}
              onChange={handleDateChange}
              className="w-full p-2 border rounded"
            />
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

export default DiscountFilter;
