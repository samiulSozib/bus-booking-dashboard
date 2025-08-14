import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../store/slices/countrySlice';
import { fetchProvinces } from '../../store/slices/provinceSlice';
import { fetchCities } from '../../store/slices/citySlice';
import { fetchStations } from '../../store/slices/stationSlice';
import { useTranslation } from 'react-i18next';
import useOutsideClick from '../../hooks/useOutSideClick';

const RouteForm = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  initialData,
  errors,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { countries } = useSelector((state) => state.countries);
  const { provinces } = useSelector((state) => state.provinces);
  const { cities } = useSelector((state) => state.cities);
  const { stations } = useSelector((state) => state.stations);

  // Refs for dropdowns
  const originCountryRef = useRef(null);
  const originProvinceRef = useRef(null);
  const originCityRef = useRef(null);
  const originStationRef = useRef(null);
  const destinationCountryRef = useRef(null);
  const destinationProvinceRef = useRef(null);
  const destinationCityRef = useRef(null);
  const destinationStationRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    origin: {
      countryId: null,
      provinceId: null,
      cityId: null,
      stationId: null,
    },
    destination: {
      countryId: null,
      provinceId: null,
      cityId: null,
      stationId: null,
    },
    name: "",
    distance: 0,
  });

  const [searchTags, setSearchTags] = useState({
    originCountry: "",
    originProvince: "",
    originCity: "",
    originStation: "",
    destinationCountry: "",
    destinationProvince: "",
    destinationCity: "",
    destinationStation: "",
  });

  const [dropdowns, setDropdowns] = useState({
    showOriginCountry: false,
    showOriginProvince: false,
    showOriginCity: false,
    showOriginStation: false,
    showDestinationCountry: false,
    showDestinationProvince: false,
    showDestinationCity: false,
    showDestinationStation: false,
  });

  // Close dropdowns when clicking outside
 useOutsideClick(originCountryRef, () => {
    if (dropdowns.showOriginCountry) {
      toggleDropdown("showOriginCountry", false);
    }
  });
  
  useOutsideClick(originProvinceRef, () => {
    if (dropdowns.showOriginProvince) {
      toggleDropdown("showOriginProvince", false);
    }
  });
  
  useOutsideClick(originCityRef, () => {
    if (dropdowns.showOriginCity) {
      toggleDropdown("showOriginCity", false);
    }
  });
  
  useOutsideClick(originStationRef, () => {
    if (dropdowns.showOriginStation) {
      toggleDropdown("showOriginStation", false);
    }
  });
  
  useOutsideClick(destinationCountryRef, () => {
    if (dropdowns.showDestinationCountry) {
      toggleDropdown("showDestinationCountry", false);
    }
  });
  
  useOutsideClick(destinationProvinceRef, () => {
    if (dropdowns.showDestinationProvince) {
      toggleDropdown("showDestinationProvince", false);
    }
  });
  
  useOutsideClick(destinationCityRef, () => {
    if (dropdowns.showDestinationCity) {
      toggleDropdown("showDestinationCity", false);
    }
  });
  
  useOutsideClick(destinationStationRef, () => {
    if (dropdowns.showDestinationStation) {
      toggleDropdown("showDestinationStation", false);
    }
  });

  // Initialize form with initialData if in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        origin: {
          countryId: initialData.origin_city.country.id,
          provinceId: initialData.origin_city.province.id,
          cityId: initialData.origin_city.id,
          stationId: initialData.origin_station.id,
        },
        destination: {
          countryId: initialData.destination_city.country.id,
          provinceId: initialData.destination_city.province.id,
          cityId: initialData.destination_city.id,
          stationId: initialData.destination_station.id,
        },
        name: initialData.name,
        distance: initialData.distance,
      });

      setSearchTags({
        originCountry: initialData.origin_city.country.name || "",
        originProvince: initialData.origin_city.province.name || "",
        originCity: initialData.origin_city.name || "",
        originStation: initialData.origin_station.name || "",
        destinationCountry: initialData.destination_city.country.name || "",
        destinationProvince: initialData.destination_city.province.name || "",
        destinationCity: initialData.destination_city.name || "",
        destinationStation: initialData.destination_station.name || "",
      });
    }
  }, [isEditMode, initialData]);

  // Fetch countries on component mount
  useEffect(() => {
    dispatch(fetchCountries({}));
  }, [dispatch]);

  // Fetch provinces for origin country
  useEffect(() => {
    if (formData.origin.countryId) {
      dispatch(fetchProvinces({ 
        countryId: formData.origin.countryId, 
        searchTag: searchTags.originProvince 
      }));
    }
  }, [dispatch, formData.origin.countryId, searchTags.originProvince]);

  // Fetch provinces for destination country
  useEffect(() => {
    if (formData.destination.countryId) {
      dispatch(fetchProvinces({ 
        countryId: formData.destination.countryId, 
        searchTag: searchTags.destinationProvince 
      }));
    }
  }, [dispatch, formData.destination.countryId, searchTags.destinationProvince]);

  // Fetch cities for origin province
  useEffect(() => {
    if (formData.origin.provinceId) {
      dispatch(fetchCities({ provinceId: formData.origin.provinceId }));
    }
  }, [dispatch, formData.origin.provinceId]);

  // Fetch cities for destination province
  useEffect(() => {
    if (formData.destination.provinceId) {
      dispatch(fetchCities({ provinceId: formData.destination.provinceId }));
    }
  }, [dispatch, formData.destination.provinceId]);

  // Fetch stations for origin city
  useEffect(() => {
    if (formData.origin.cityId) {
      dispatch(fetchStations({ 
        cityId: formData.origin.cityId, 
        searchTag: searchTags.originStation 
      }));
    }
  }, [dispatch, formData.origin.cityId, searchTags.originStation]);

  // Fetch stations for destination city
  useEffect(() => {
    if (formData.destination.cityId) {
      dispatch(fetchStations({ 
        cityId: formData.destination.cityId, 
        searchTag: searchTags.destinationStation 
      }));
    }
  }, [dispatch, formData.destination.cityId, searchTags.destinationStation]);

  const toggleDropdown = (dropdownKey, isOpen) => {
    setDropdowns(prev => ({ ...prev, [dropdownKey]: isOpen }));
  };

  const handleSearchTagChange = (searchTagKey, value) => {
    setSearchTags(prev => ({ ...prev, [searchTagKey]: value }));
  };

  const handleCountrySelect = (country, type) => {
    const newFormData = { ...formData };
    newFormData[type] = {
      countryId: country.id,
      provinceId: null,
      cityId: null,
      stationId: null,
    };
    setFormData(newFormData);

    const newSearchTags = { ...searchTags };
    newSearchTags[`${type}Country`] = country.name;
    newSearchTags[`${type}Province`] = "";
    newSearchTags[`${type}City`] = "";
    newSearchTags[`${type}Station`] = "";
    setSearchTags(newSearchTags);

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Country`, false);
  };

  const handleProvinceSelect = (province, type) => {
    const newFormData = { ...formData };
    newFormData[type] = {
      ...newFormData[type],
      provinceId: province.id,
      cityId: null,
      stationId: null,
    };
    setFormData(newFormData);

    const newSearchTags = { ...searchTags };
    newSearchTags[`${type}Province`] = province.name;
    newSearchTags[`${type}City`] = "";
    newSearchTags[`${type}Station`] = "";
    setSearchTags(newSearchTags);

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Province`, false);
  };

  const handleCitySelect = (city, type) => {
    const newFormData = { ...formData };
    newFormData[type] = {
      ...newFormData[type],
      cityId: city.id,
      stationId: null,
    };
    setFormData(newFormData);

    const newSearchTags = { ...searchTags };
    newSearchTags[`${type}City`] = city.name;
    newSearchTags[`${type}Station`] = "";
    setSearchTags(newSearchTags);

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}City`, false);
  };

  const handleStationSelect = (station, type) => {
    const newFormData = { ...formData };
    newFormData[type] = {
      ...newFormData[type],
      stationId: station.id,
    };
    setFormData(newFormData);

    const newSearchTags = { ...searchTags };
    newSearchTags[`${type}Station`] = station.name.en;
    setSearchTags(newSearchTags);

    toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Station`, false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm()
  };

  const resetForm = () => {
    setFormData({
      origin: {
        countryId: null,
        provinceId: null,
        cityId: null,
        stationId: null,
      },
      destination: {
        countryId: null,
        provinceId: null,
        cityId: null,
        stationId: null,
      },
      name: "",
      distance: 0,
    });
    setSearchTags({
      originCountry: "",
      originProvince: "",
      originCity: "",
      originStation: "",
      destinationCountry: "",
      destinationProvince: "",
      destinationCity: "",
      destinationStation: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? t("EDIT_ROUTE") : t("ADD_ROUTE")}
        </h2>
        <form onSubmit={handleSubmitForm}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Section */}
            <div>
              <h3 className="text-md font-semibold mb-2">{t("ORIGIN")}</h3>
              
              {/* Origin Country */}
              <div className="mb-4" ref={originCountryRef}>
                <label className="block text-sm font-medium text-gray-700">
                  {t("COUNTRY")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("SEARCH_COUNTRY")}
                    value={searchTags.originCountry}
                    onChange={(e) => {
                      handleSearchTagChange("originCountry", e.target.value);
                      toggleDropdown("showOriginCountry", true);
                    }}
                    onFocus={() => toggleDropdown("showOriginCountry", true)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {dropdowns.showOriginCountry && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countries
                        .filter(country => 
                          country.name.toLowerCase().includes(searchTags.originCountry.toLowerCase())
                        )
                        .map(country => (
                          <div
                            key={country.id}
                            onClick={() => handleCountrySelect(country, "origin")}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {country.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {errors?.origin?.countryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.origin.countryId}</p>
                )}
              </div>

              {/* Origin Province */}
              {formData.origin.countryId && (
                <div className="mb-4" ref={originProvinceRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("PROVINCE")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_PROVINCE")}
                      value={searchTags.originProvince}
                      onChange={(e) => {
                        handleSearchTagChange("originProvince", e.target.value);
                        toggleDropdown("showOriginProvince", true);
                      }}
                      onFocus={() => toggleDropdown("showOriginProvince", true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showOriginProvince && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {provinces
                          .filter(province => 
                            province.name.toLowerCase().includes(searchTags.originProvince.toLowerCase())
                          )
                          .map(province => (
                            <div
                              key={province.id}
                              onClick={() => handleProvinceSelect(province, "origin")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {province.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.origin?.provinceId && (
                    <p className="text-red-500 text-sm mt-1">{errors.origin.provinceId}</p>
                  )}
                </div>
              )}

              {/* Origin City */}
              {formData.origin.provinceId && (
                <div className="mb-4" ref={originCityRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("CITY")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_CITY")}
                      value={searchTags.originCity}
                      onChange={(e) => {
                        handleSearchTagChange("originCity", e.target.value);
                        toggleDropdown("showOriginCity", true);
                      }}
                      onFocus={() => toggleDropdown("showOriginCity", true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showOriginCity && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {cities
                          .filter(city => 
                            city.name.toLowerCase().includes(searchTags.originCity.toLowerCase())
                          )
                          .map(city => (
                            <div
                              key={city.id}
                              onClick={() => handleCitySelect(city, "origin")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {city.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.origin?.cityId && (
                    <p className="text-red-500 text-sm mt-1">{errors.origin.cityId}</p>
                  )}
                </div>
              )}

              {/* Origin Station */}
              {formData.origin.cityId && (
                <div className="mb-4" ref={originStationRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("STATION")} *
                  </label>
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showOriginStation && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {stations
                          .filter(station => 
                            station.name.en.toLowerCase().includes(searchTags.originStation.toLowerCase())
                          )
                          .map(station => (
                            <div
                              key={station.id}
                              onClick={() => handleStationSelect(station, "origin")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {station.name.en}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.origin?.stationId && (
                    <p className="text-red-500 text-sm mt-1">{errors.origin.stationId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Destination Section */}
            <div>
              <h3 className="text-md font-semibold mb-2">{t("DESTINATION")}</h3>
              
              {/* Destination Country */}
              <div className="mb-4" ref={destinationCountryRef}>
                <label className="block text-sm font-medium text-gray-700">
                  {t("COUNTRY")} *
                </label>
                <div className="relative">
                  <input
                    disabled={!formData.origin.stationId}
                    type="text"
                    placeholder={t("SEARCH_COUNTRY")}
                    value={searchTags.destinationCountry}
                    onChange={(e) => {
                      handleSearchTagChange("destinationCountry", e.target.value);
                      toggleDropdown("showDestinationCountry", true);
                    }}
                    onFocus={() => toggleDropdown("showDestinationCountry", true)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {dropdowns.showDestinationCountry && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countries
                        .filter(country => 
                          country.name.toLowerCase().includes(searchTags.destinationCountry.toLowerCase())
                        )
                        .map(country => (
                          <div
                            key={country.id}
                            onClick={() => handleCountrySelect(country, "destination")}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {country.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {errors?.destination?.countryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination.countryId}</p>
                )}
              </div>

              {/* Destination Province */}
              {formData.destination.countryId && (
                <div className="mb-4" ref={destinationProvinceRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("PROVINCE")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_PROVINCE")}
                      value={searchTags.destinationProvince}
                      onChange={(e) => {
                        handleSearchTagChange("destinationProvince", e.target.value);
                        toggleDropdown("showDestinationProvince", true);
                      }}
                      onFocus={() => toggleDropdown("showDestinationProvince", true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showDestinationProvince && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {provinces
                          .filter(province => 
                            province.name.toLowerCase().includes(searchTags.destinationProvince.toLowerCase())
                          )
                          .map(province => (
                            <div
                              key={province.id}
                              onClick={() => handleProvinceSelect(province, "destination")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {province.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.destination?.provinceId && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.provinceId}</p>
                  )}
                </div>
              )}

              {/* Destination City */}
              {formData.destination.provinceId && (
                <div className="mb-4" ref={destinationCityRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("CITY")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("SEARCH_CITY")}
                      value={searchTags.destinationCity}
                      onChange={(e) => {
                        handleSearchTagChange("destinationCity", e.target.value);
                        toggleDropdown("showDestinationCity", true);
                      }}
                      onFocus={() => toggleDropdown("showDestinationCity", true)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showDestinationCity && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {cities
                          .filter(city => 
                            city.name.toLowerCase().includes(searchTags.destinationCity.toLowerCase())
                          )
                          .map(city => (
                            <div
                              key={city.id}
                              onClick={() => handleCitySelect(city, "destination")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {city.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.destination?.cityId && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.cityId}</p>
                  )}
                </div>
              )}

              {/* Destination Station */}
              {formData.destination.cityId && (
                <div className="mb-4" ref={destinationStationRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("STATION")} *
                  </label>
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {dropdowns.showDestinationStation && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {stations
                          .filter(station => 
                            station.name.en.toLowerCase().includes(searchTags.destinationStation.toLowerCase())
                          )
                          .map(station => (
                            <div
                              key={station.id}
                              onClick={() => handleStationSelect(station, "destination")}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {station.name.en}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors?.destination?.stationId && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.stationId}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Route Name and Distance */}
          <div className="mb-4 flex flex-row justify-between gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("ROUTE_NAME")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("DISTANCE")} (km) *
              </label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                className="mt-1 w-full block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors?.distance && (
                <p className="text-red-500 text-sm mt-1">{errors.distance}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
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
              {isEditMode ? t("UPDATE") : t("ADD")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;