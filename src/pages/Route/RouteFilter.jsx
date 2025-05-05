// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCountries } from "../../store/slices/countrySlice";
// import { fetchProvinces } from "../../store/slices/provinceSlice";
// import { fetchCities } from "../../store/slices/citySlice";
// import { fetchStations } from "../../store/slices/stationSlice";
// import { useTranslation } from "react-i18next";
// import { CloseIcon, FunnelIcon } from "../../icons";

// const RouteFilter = ({ isOpen, onClose, onApplyFilters }) => {
//     const { t } = useTranslation();
//     const dispatch = useDispatch();
//     const { countries } = useSelector((state) => state.countries);
//     const { provinces } = useSelector((state) => state.provinces);
//     const { cities } = useSelector((state) => state.cities);
//     const { stations } = useSelector((state) => state.stations);

//     // Filter states
//     const [filters, setFilters] = useState({
//         originCountryId: null,
//         originProvinceId: null,
//         originCityId: null,
//         originStationId: null,
//         destinationCountryId: null,
//         destinationProvinceId: null,
//         destinationCityId: null,
//         destinationStationId: null,
//     });

//     // Search tags for dropdowns
//     const [searchTags, setSearchTags] = useState({
//         originCountry: "",
//         originProvince: "",
//         originCity: "",
//         originStation: "",
//         destinationCountry: "",
//         destinationProvince: "",
//         destinationCity: "",
//         destinationStation: "",
//     });

//     // Dropdown visibility
//     const [dropdowns, setDropdowns] = useState({
//         showOriginCountry: false,
//         showOriginProvince: false,
//         showOriginCity: false,
//         showOriginStation: false,
//         showDestinationCountry: false,
//         showDestinationProvince: false,
//         showDestinationCity: false,
//         showDestinationStation: false,
//     });

//     // Fetch countries on component mount
//     useEffect(() => {
//         dispatch(fetchCountries({}));
//     }, [dispatch]);

//     // Fetch provinces for origin country
//     useEffect(() => {
//         if (filters.originCountryId) {
//             dispatch(fetchProvinces({ countryId: filters.originCountryId, searchTag: searchTags.originProvince }));
//         }
//     }, [dispatch, filters.originCountryId, searchTags.originProvince]);

//     // Fetch provinces for destination country
//     useEffect(() => {
//         if (filters.destinationCountryId) {
//             dispatch(fetchProvinces({ countryId: filters.destinationCountryId, searchTag: searchTags.destinationProvince }));
//         }
//     }, [dispatch, filters.destinationCountryId, searchTags.destinationProvince]);

//     // Fetch cities for origin province
//     useEffect(() => {
//         if (filters.originProvinceId) {
//             dispatch(fetchCities({ provinceId: filters.originProvinceId }));
//         }
//     }, [dispatch, filters.originProvinceId]);

//     // Fetch cities for destination province
//     useEffect(() => {
//         if (filters.destinationProvinceId) {
//             dispatch(fetchCities({ provinceId: filters.destinationProvinceId }));
//         }
//     }, [dispatch, filters.destinationProvinceId]);

//     // Fetch stations for origin city
//     useEffect(() => {
//         if (filters.originCityId) {
//             dispatch(fetchStations({ cityId: filters.originCityId, searchTag: searchTags.originStation }));
//         }
//     }, [dispatch, filters.originCityId, searchTags.originStation]);

//     // Fetch stations for destination city
//     useEffect(() => {
//         if (filters.destinationCityId) {
//             dispatch(fetchStations({ cityId: filters.destinationCityId, searchTag: searchTags.destinationStation }));
//         }
//     }, [dispatch, filters.destinationCityId, searchTags.destinationStation]);

//     // Toggle dropdown
//     const toggleDropdown = (dropdownKey, isOpen) => {
//         setDropdowns((prevDropdowns) => ({
//             ...prevDropdowns,
//             [dropdownKey]: isOpen,
//         }));
//     };

//     // Handle search tag change
//     const handleSearchTagChange = (searchTagKey, value) => {
//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [searchTagKey]: value,
//         }));
//     };

//     // Handle country selection
//     const handleCountrySelect = (country, type) => {
//         const countryKey = `${type}CountryId`;
//         const provinceKey = `${type}ProvinceId`;
//         const cityKey = `${type}CityId`;
//         const stationKey = `${type}StationId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [countryKey]: country.id,
//             [provinceKey]: null,
//             [cityKey]: null,
//             [stationKey]: null,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}Country`]: country.name,
//             [`${type}Province`]: "",
//             [`${type}City`]: "",
//             [`${type}Station`]: "",
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Country`, false);
//     };

//     // Handle province selection
//     const handleProvinceSelect = (province, type) => {
//         const provinceKey = `${type}ProvinceId`;
//         const cityKey = `${type}CityId`;
//         const stationKey = `${type}StationId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [provinceKey]: province.id,
//             [cityKey]: null,
//             [stationKey]: null,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}Province`]: province.name,
//             [`${type}City`]: "",
//             [`${type}Station`]: "",
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Province`, false);
//     };

//     // Handle city selection
//     const handleCitySelect = (city, type) => {
//         const cityKey = `${type}CityId`;
//         const stationKey = `${type}StationId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [cityKey]: city.id,
//             [stationKey]: null,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}City`]: city.name,
//             [`${type}Station`]: "",
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}City`, false);
//     };

//     // Handle station selection
//     const handleStationSelect = (station, type) => {
//         const stationKey = `${type}StationId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [stationKey]: station.id,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}Station`]: station.name.en,
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Station`, false);
//     };

//     // Apply filters
//     const handleApplyFilters = () => {
//         const appliedFilters = {
//             "origin-city-id": filters.originCityId,
//             "destination-city-id": filters.destinationCityId,
//             "origin-station-id": filters.originStationId,
//             "destination-station-id": filters.destinationStationId,
//         };
//         onApplyFilters(appliedFilters);
//         onClose();
//     };

//     // Reset filters
//     const handleResetFilters = () => {
//         setFilters({
//             originCountryId: null,
//             originProvinceId: null,
//             originCityId: null,
//             originStationId: null,
//             destinationCountryId: null,
//             destinationProvinceId: null,
//             destinationCityId: null,
//             destinationStationId: null,
//         });
//         setSearchTags({
//             originCountry: "",
//             originProvince: "",
//             originCity: "",
//             originStation: "",
//             destinationCountry: "",
//             destinationProvince: "",
//             destinationCity: "",
//             destinationStation: "",
//         });
//         onApplyFilters({});
//         onClose();
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-end justify-end">
//             <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
//             <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
//                 <div className="flex items-center justify-between p-4 border-b">
//                     <h3 className="text-lg font-semibold"></h3>
//                     <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//                         <CloseIcon className="w-6 h-6" />
//                     </button>
//                 </div>

//                 <div className="p-4">
//                     {/* Origin Section */}
//                     <div className="mb-6">
//                         <h4 className="font-medium text-gray-700 mb-3">{t("ORIGIN")}</h4>
                        
//                         {/* Origin Country */}
//                         <div className="mb-3">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">{t("COUNTRY")}</label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     placeholder={t("SEARCH_COUNTRY")}
//                                     value={searchTags.originCountry}
//                                     onChange={(e) => {
//                                         handleSearchTagChange("originCountry", e.target.value);
//                                         toggleDropdown("showOriginCountry", true);
//                                     }}
//                                     onFocus={() => toggleDropdown("showOriginCountry", true)}
//                                     className="w-full p-2 border rounded"
//                                 />
//                                 {dropdowns.showOriginCountry && (
//                                     <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                         {countries
//                                             .filter((country) =>
//                                                 country.name.toLowerCase().includes(searchTags.originCountry.toLowerCase())
//                                             )
//                                             .map((country) => (
//                                                 <div
//                                                     key={country.id}
//                                                     onClick={() => handleCountrySelect(country, "origin")}
//                                                     className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                 >
//                                                     {country.name}
//                                                 </div>
//                                             ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Origin Province */}
//                         {filters.originCountryId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("PROVINCE")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_PROVINCE")}
//                                         value={searchTags.originProvince}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("originProvince", e.target.value);
//                                             toggleDropdown("showOriginProvince", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showOriginProvince", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showOriginProvince && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {provinces
//                                                 .filter((province) =>
//                                                     province.name.toLowerCase().includes(searchTags.originProvince.toLowerCase())
//                                                 )
//                                                 .map((province) => (
//                                                     <div
//                                                         key={province.id}
//                                                         onClick={() => handleProvinceSelect(province, "origin")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {province.name}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Origin City */}
//                         {filters.originProvinceId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("CITY")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_CITY")}
//                                         value={searchTags.originCity}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("originCity", e.target.value);
//                                             toggleDropdown("showOriginCity", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showOriginCity", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showOriginCity && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {cities
//                                                 .filter((city) =>
//                                                     city.name.toLowerCase().includes(searchTags.originCity.toLowerCase())
//                                                 )
//                                                 .map((city) => (
//                                                     <div
//                                                         key={city.id}
//                                                         onClick={() => handleCitySelect(city, "origin")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {city.name}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Origin Station */}
//                         {filters.originCityId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("STATION")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_STATION")}
//                                         value={searchTags.originStation}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("originStation", e.target.value);
//                                             toggleDropdown("showOriginStation", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showOriginStation", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showOriginStation && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {stations
//                                                 .filter((station) =>
//                                                     station.name.en.toLowerCase().includes(searchTags.originStation.toLowerCase())
//                                                 )
//                                                 .map((station) => (
//                                                     <div
//                                                         key={station.id}
//                                                         onClick={() => handleStationSelect(station, "origin")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {station.name.en}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Destination Section */}
//                     <div className="mb-6">
//                         <h4 className="font-medium text-gray-700 mb-3">{t("DESTINATION")}</h4>
                        
//                         {/* Destination Country */}
//                         <div className="mb-3">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">{t("COUNTRY")}</label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     placeholder={t("SEARCH_COUNTRY")}
//                                     value={searchTags.destinationCountry}
//                                     onChange={(e) => {
//                                         handleSearchTagChange("destinationCountry", e.target.value);
//                                         toggleDropdown("showDestinationCountry", true);
//                                     }}
//                                     onFocus={() => toggleDropdown("showDestinationCountry", true)}
//                                     className="w-full p-2 border rounded"
//                                 />
//                                 {dropdowns.showDestinationCountry && (
//                                     <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                         {countries
//                                             .filter((country) =>
//                                                 country.name.toLowerCase().includes(searchTags.destinationCountry.toLowerCase())
//                                             )
//                                             .map((country) => (
//                                                 <div
//                                                     key={country.id}
//                                                     onClick={() => handleCountrySelect(country, "destination")}
//                                                     className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                 >
//                                                     {country.name}
//                                                 </div>
//                                             ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Destination Province */}
//                         {filters.destinationCountryId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("PROVINCE")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_PROVINCE")}
//                                         value={searchTags.destinationProvince}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("destinationProvince", e.target.value);
//                                             toggleDropdown("showDestinationProvince", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showDestinationProvince", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showDestinationProvince && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {provinces
//                                                 .filter((province) =>
//                                                     province.name.toLowerCase().includes(searchTags.destinationProvince.toLowerCase())
//                                                 )
//                                                 .map((province) => (
//                                                     <div
//                                                         key={province.id}
//                                                         onClick={() => handleProvinceSelect(province, "destination")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {province.name}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Destination City */}
//                         {filters.destinationProvinceId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("CITY")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_CITY")}
//                                         value={searchTags.destinationCity}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("destinationCity", e.target.value);
//                                             toggleDropdown("showDestinationCity", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showDestinationCity", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showDestinationCity && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {cities
//                                                 .filter((city) =>
//                                                     city.name.toLowerCase().includes(searchTags.destinationCity.toLowerCase())
//                                                 )
//                                                 .map((city) => (
//                                                     <div
//                                                         key={city.id}
//                                                         onClick={() => handleCitySelect(city, "destination")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {city.name}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Destination Station */}
//                         {filters.destinationCityId && (
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">{t("STATION")}</label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={t("SEARCH_STATION")}
//                                         value={searchTags.destinationStation}
//                                         onChange={(e) => {
//                                             handleSearchTagChange("destinationStation", e.target.value);
//                                             toggleDropdown("showDestinationStation", true);
//                                         }}
//                                         onFocus={() => toggleDropdown("showDestinationStation", true)}
//                                         className="w-full p-2 border rounded"
//                                     />
//                                     {dropdowns.showDestinationStation && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//                                             {stations
//                                                 .filter((station) =>
//                                                     station.name.en.toLowerCase().includes(searchTags.destinationStation.toLowerCase())
//                                                 )
//                                                 .map((station) => (
//                                                     <div
//                                                         key={station.id}
//                                                         onClick={() => handleStationSelect(station, "destination")}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {station.name.en}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex justify-between mt-6">
//                         <button
//                             type="button"
//                             onClick={handleResetFilters}
//                             className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                         >
//                             {t("RESET")}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={handleApplyFilters}
//                             className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
//                         >
//                             {t("APPLY_FILTERS")}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RouteFilter;

//
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations } from '../../store/slices/stationSlice';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../../icons';
import useOutsideClick from '../../hooks/useOutSideClick';

const RouteFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stations = [] } = useSelector((state) => state.stations);

  // Filter states
  const [filters, setFilters] = useState({
    originStationId: null,
    destinationStationId: null,
  });

  // Search tags
  const [searchTags, setSearchTags] = useState({
    originStation: "",
    destinationStation: "",
  });

  // Dropdown visibility
  const [dropdowns, setDropdowns] = useState({
    showOriginStation: false,
    showDestinationStation: false,
  });

  // Refs for dropdowns
  const originStationRef = useRef(null);
  const destinationStationRef = useRef(null);

  // Close dropdowns when clicking outside
  useOutsideClick(originStationRef, () => toggleDropdown("showOriginStation", false));
  useOutsideClick(destinationStationRef, () => toggleDropdown("showDestinationStation", false));

  // Fetch stations for origin city
  useEffect(() => {
    if (searchTags.originStation || dropdowns.showOriginStation) {
      dispatch(fetchStations({ 
        searchTag: searchTags.originStation 
      }));
    }
  }, [dispatch, searchTags.originStation, dropdowns.showOriginStation]);

  // Fetch stations for destination city
  useEffect(() => {
    if (searchTags.destinationStation || dropdowns.showDestinationStation) {
      dispatch(fetchStations({ 
        searchTag: searchTags.destinationStation 
      }));
    }
  }, [dispatch, searchTags.destinationStation, dropdowns.showDestinationStation]);

  const toggleDropdown = (dropdownKey, isOpen) => {
    setDropdowns(prev => ({ ...prev, [dropdownKey]: isOpen }));
  };

  const handleSearchTagChange = (searchTagKey, value) => {
    setSearchTags(prev => ({ ...prev, [searchTagKey]: value }));
    
    // Reset corresponding ID when search is cleared
    if (value === "") {
      const idKey = searchTagKey === 'originStation' ? 'originStationId' : 'destinationStationId';
      setFilters(prev => ({ ...prev, [idKey]: null }));
    }
  };

  const handleStationSelect = (station, type) => {
    const stationKey = `${type}StationId`;
    const oppositeType = type === 'origin' ? 'destination' : 'origin';
    const oppositeStationKey = `${oppositeType}StationId`;

    setFilters(prev => ({
      ...prev,
      [stationKey]: station.id,
      // Reset opposite station if it's the same as the newly selected one
      ...(prev[oppositeStationKey] === station.id && { [oppositeStationKey]: null })
    }));

    setSearchTags(prev => ({
      ...prev,
      [`${type}Station`]: station?.name?.en || station.name || "",
      // Clear opposite station search if it was the same
      ...(prev[`${oppositeType}Station`] === (station?.name?.en || station.name) && { 
        [`${oppositeType}Station`]: "" 
      })
    }));

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Station`, false);
  };

  const handleApplyFilters = () => {
    const appliedFilters = {
      "origin-station-id": filters.originStationId,
      "destination-station-id": filters.destinationStationId,
    };
    onApplyFilters(appliedFilters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      originStationId: null,
      destinationStationId: null,
    });
    setSearchTags({
      originStation: "",
      destinationStation: "",
    });
    onApplyFilters({});
    onClose();
  };

  if (!isOpen) return null;

  // Helper function to filter stations
  const filterStations = (stations, searchTerm) => {
    if (!searchTerm) return stations;
    return stations.filter(station => {
      const name = station?.name?.en || station.name || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t("FILTERS")}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Origin Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">{t("ORIGIN")}</h4>
            
            {/* Origin Station */}
            <div className="mb-3" ref={originStationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("STATION")}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("SEARCH_STATION")}
                  value={searchTags.originStation}
                  onChange={(e) => {
                    handleSearchTagChange("originStation", e.target.value);
                    toggleDropdown("showOriginStation", true);
                  }}
                  onFocus={() => toggleDropdown("showOriginStation", true)}
                  className="w-full p-2 border rounded"
                />
                {dropdowns.showOriginStation && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(stations, searchTags.originStation).length > 0 ? (
                      filterStations(stations, searchTags.originStation).map(station => (
                        <div
                          key={station.id}
                          onClick={() => handleStationSelect(station, "origin")}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {station?.name?.en || station.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        {t("NO_STATIONS_FOUND")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Destination Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">{t("DESTINATION")}</h4>

            {/* Destination Station */}
            <div className="mb-3" ref={destinationStationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("STATION")}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("SEARCH_STATION")}
                  value={searchTags.destinationStation}
                  onChange={(e) => {
                    handleSearchTagChange("destinationStation", e.target.value);
                    toggleDropdown("showDestinationStation", true);
                  }}
                  onFocus={() => toggleDropdown("showDestinationStation", true)}
                  className="w-full p-2 border rounded"
                />
                {dropdowns.showDestinationStation && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(stations, searchTags.destinationStation).length > 0 ? (
                      filterStations(stations, searchTags.destinationStation).map(station => (
                        <div
                          key={station.id}
                          onClick={() => handleStationSelect(station, "destination")}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {station?.name?.en || station.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        {t("NO_STATIONS_FOUND")}
                      </div>
                    )}
                  </div>
                )}
              </div>
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

export default RouteFilter;