// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCountries } from "../../store/slices/countrySlice";
// import { fetchProvinces } from "../../store/slices/provinceSlice";
// import { fetchCities } from "../../store/slices/citySlice";
// import { fetchStations } from "../../store/slices/stationSlice";
// import { useTranslation } from "react-i18next";
// import { CloseIcon, FunnelIcon } from "../../icons";

// const StationFilter = ({ isOpen, onClose, onApplyFilters }) => {
//     const { t } = useTranslation();
//     const dispatch = useDispatch();
//     const { countries } = useSelector((state) => state.countries);
//     const { provinces } = useSelector((state) => state.provinces);
//     const { cities } = useSelector((state) => state.cities);

//     // Filter states
//     const [filters, setFilters] = useState({
//         originCountryId: null,
//         originProvinceId: null,
//         originCityId: null,
//     });

//     // Search tags for dropdowns
//     const [searchTags, setSearchTags] = useState({
//         originCountry: "",
//         originProvince: "",
//         originCity: "",        
//     });

//     // Dropdown visibility
//     const [dropdowns, setDropdowns] = useState({
//         showOriginCountry: false,
//         showOriginProvince: false,
//         showOriginCity: false,
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

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [countryKey]: country.id,
//             [provinceKey]: null,
//             [cityKey]: null,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}Country`]: country.name,
//             [`${type}Province`]: "",
//             [`${type}City`]: "",
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Country`, false);
//     };

//     // Handle province selection
//     const handleProvinceSelect = (province, type) => {
//         const provinceKey = `${type}ProvinceId`;
//         const cityKey = `${type}CityId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [provinceKey]: province.id,
//             [cityKey]: null,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}Province`]: province.name,
//             [`${type}City`]: "",
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Province`, false);
//     };

//     // Handle city selection
//     const handleCitySelect = (city, type) => {
//         const cityKey = `${type}CityId`;

//         setFilters((prevFilters) => ({
//             ...prevFilters,
//             [cityKey]: city.id,
//         }));

//         setSearchTags((prevSearchTags) => ({
//             ...prevSearchTags,
//             [`${type}City`]: city.name,
//         }));

//         toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}City`, false);
//     };

   

//     // Apply filters
//     const handleApplyFilters = () => {
//         const appliedFilters = {
//             "city-id": filters.originCityId,
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
            
//         });
//         setSearchTags({
//             originCountry: "",
//             originProvince: "",
//             originCity: "",
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

// export default StationFilter;


// 
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../store/slices/countrySlice';
import { fetchProvinces } from '../../store/slices/provinceSlice';
import { fetchCities } from '../../store/slices/citySlice';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../../icons';

const StationFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { countries } = useSelector((state) => state.countries);
  const { provinces } = useSelector((state) => state.provinces);
  const { cities } = useSelector((state) => state.cities);

  const [filters, setFilters] = useState({
    originCountryId: null,
    originProvinceId: null,
    originCityId: null,
  });

  const [searchTags, setSearchTags] = useState({
    originCountry: '',
    originProvince: '',
    originCity: '',
  });

  const [dropdowns, setDropdowns] = useState({
    showOriginCountry: false,
    showOriginProvince: false,
    showOriginCity: false,
  });

  useEffect(() => {
    dispatch(fetchCountries({}));
  }, [dispatch]);

  useEffect(() => {
    if (filters.originCountryId) {
      dispatch(fetchProvinces({ countryId: filters.originCountryId, searchTag: searchTags.originProvince }));
    }
  }, [dispatch, filters.originCountryId, searchTags.originProvince]);

  useEffect(() => {
    if (filters.originProvinceId) {
      dispatch(fetchCities({ provinceId: filters.originProvinceId }));
    }
  }, [dispatch, filters.originProvinceId]);

  const toggleDropdown = (dropdownKey, isOpen) => {
    setDropdowns((prevDropdowns) => ({
      ...prevDropdowns,
      [dropdownKey]: isOpen,
    }));
  };

  const handleSearchTagChange = (searchTagKey, value) => {
    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      [searchTagKey]: value,
    }));
  };

  const handleCountrySelect = (country, type) => {
    const countryKey = `${type}CountryId`;
    const provinceKey = `${type}ProvinceId`;
    const cityKey = `${type}CityId`;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [countryKey]: country.id,
      [provinceKey]: null,
      [cityKey]: null,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      [`${type}Country`]: country.name,
      [`${type}Province`]: '',
      [`${type}City`]: '',
    }));

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Country`, false);
  };

  const handleProvinceSelect = (province, type) => {
    const provinceKey = `${type}ProvinceId`;
    const cityKey = `${type}CityId`;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [provinceKey]: province.id,
      [cityKey]: null,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      [`${type}Province`]: province.name,
      [`${type}City`]: '',
    }));

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Province`, false);
  };

  const handleCitySelect = (city, type) => {
    const cityKey = `${type}CityId`;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [cityKey]: city.id,
    }));

    setSearchTags((prevSearchTags) => ({
      ...prevSearchTags,
      [`${type}City`]: city.name,
    }));

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}City`, false);
  };

  const handleApplyFilters = () => {
    const appliedFilters = {
      'city-id': filters.originCityId,
    };
    onApplyFilters(appliedFilters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      originCountryId: null,
      originProvinceId: null,
      originCityId: null,
    });
    setSearchTags({
      originCountry: '',
      originProvince: '',
      originCity: '',
    });
    onApplyFilters({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold"></h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Origin Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">{t('ORIGIN')}</h4>
            
            {/* Origin Country */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('COUNTRY')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('SEARCH_COUNTRY')}
                  value={searchTags.originCountry}
                  onChange={(e) => {
                    handleSearchTagChange('originCountry', e.target.value);
                    toggleDropdown('showOriginCountry', true);
                  }}
                  onFocus={() => toggleDropdown('showOriginCountry', true)}
                  className="w-full p-2 border rounded"
                />
                {dropdowns.showOriginCountry && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {countries
                      .filter((country) =>
                        country.name.toLowerCase().includes(searchTags.originCountry.toLowerCase())
                      )
                      .map((country) => (
                        <div
                          key={country.id}
                          onClick={() => handleCountrySelect(country, 'origin')}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {country.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Origin Province */}
            {filters.originCountryId && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('PROVINCE')}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('SEARCH_PROVINCE')}
                    value={searchTags.originProvince}
                    onChange={(e) => {
                      handleSearchTagChange('originProvince', e.target.value);
                      toggleDropdown('showOriginProvince', true);
                    }}
                    onFocus={() => toggleDropdown('showOriginProvince', true)}
                    className="w-full p-2 border rounded"
                  />
                  {dropdowns.showOriginProvince && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                      {provinces
                        .filter((province) =>
                          province.name.toLowerCase().includes(searchTags.originProvince.toLowerCase())
                        )
                        .map((province) => (
                          <div
                            key={province.id}
                            onClick={() => handleProvinceSelect(province, 'origin')}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {province.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Origin City */}
            {filters.originProvinceId && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('CITY')}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('SEARCH_CITY')}
                    value={searchTags.originCity}
                    onChange={(e) => {
                      handleSearchTagChange('originCity', e.target.value);
                      toggleDropdown('showOriginCity', true);
                    }}
                    onFocus={() => toggleDropdown('showOriginCity', true)}
                    className="w-full p-2 border rounded"
                  />
                  {dropdowns.showOriginCity && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                      {cities
                        .filter((city) =>
                          city.name.toLowerCase().includes(searchTags.originCity.toLowerCase())
                        )
                        .map((city) => (
                          <div
                            key={city.id}
                            onClick={() => handleCitySelect(city, 'origin')}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {city.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('RESET')}
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t('APPLY_FILTERS')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationFilter;