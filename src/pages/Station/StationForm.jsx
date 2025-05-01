import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../store/slices/countrySlice';
import { fetchProvinces } from '../../store/slices/provinceSlice';
import { fetchCities } from '../../store/slices/citySlice';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const StationForm = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  initialData,
  errors,
  formData,
  searchTags,
  setFormData,
  setSearchTags
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { countries } = useSelector((state) => state.countries);
  const { provinces } = useSelector((state) => state.provinces);
  const { cities } = useSelector((state) => state.cities);

  const countryDropdownRef = useRef(null);
  const provinceDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);



  const [dropdowns, setDropdowns] = useState({
    showCountry: false,
    showProvince: false,
    showCity: false,
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        stationName: {
          en: initialData?.name?.en ?? initialData.name,
          ps: initialData.name.ps,
          fa: initialData.name.fa,
        },
        stationLat: initialData.latitude,
        stationLong: initialData.longitude,
        countryId: initialData.city.country.id,
        provinceId: initialData.city.province.id,
        cityId: initialData.city.id,
      });
      setSearchTags({
        country: initialData.city.country.name,
        province: initialData.city.province.name,
        city: initialData.city.name,
      });
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    dispatch(fetchCountries({ searchTag: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (formData.countryId) {
      dispatch(fetchProvinces({ countryId: formData.countryId, searchTag: searchTags.province }));
    }
  }, [dispatch, formData.countryId, searchTags.province]);

  useEffect(() => {
    if (formData.provinceId) {
      dispatch(fetchCities({ provinceId: formData.provinceId, searchTag: searchTags.city }));
    }
  }, [dispatch, formData.provinceId, searchTags.city]);

  const handleCountrySelect = (country) => {
    setFormData({
      ...formData,
      countryId: country.id,
      provinceId: null,
      cityId: null,
    });
    setSearchTags({
      ...searchTags,
      country: country.name,
      province: '',
      city: '',
    });
    setDropdowns({ ...dropdowns, showCountry: false });
  };

  const handleProvinceSelect = (province) => {
    setFormData({
      ...formData,
      provinceId: province.id,
      cityId: null,
    });
    setSearchTags({
      ...searchTags,
      province: province.name,
      city: '',
    });
    setDropdowns({ ...dropdowns, showProvince: false });
  };

  const handleCitySelect = (city) => {
    setFormData({
      ...formData,
      cityId: city.id,
    });
    setSearchTags({
      ...searchTags,
      city: city.name,
    });
    setDropdowns({ ...dropdowns, showCity: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('stationName.')) {
      const [_, field] = name.split('.');
      setFormData({
        ...formData,
        stationName: {
          ...formData.stationName,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      stationName: { en: '', ps: '', fa: '' },
      stationLat: '',
      stationLong: '',
      countryId: null,
      provinceId: null,
      cityId: null,
    });
    setSearchTags({
      country: '',
      province: '',
      city: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? t('EDIT_STATION') : t('ADD_STATION')}
        </h2>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmitForm}>
            {/* Country Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('COUNTRY')} *
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchTags.country}
                  onChange={(e) => {
                    setSearchTags({ ...searchTags, country: e.target.value });
                    setDropdowns({ ...dropdowns, showCountry: true });
                  }}
                  onFocus={() => setDropdowns({ ...dropdowns, showCountry: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {dropdowns.showCountry && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {countries
                      .filter((country) =>
                        country.name.toLowerCase().includes(searchTags.country.toLowerCase())
                      )
                      .map((country) => (
                        <div
                          key={country.id}
                          onClick={() => handleCountrySelect(country)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {country.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {errors.countryId && (
                <p className="text-red-500 text-sm mt-1">{errors.countryId}</p>
              )}
            </div>

            {/* Province Dropdown */}
            {formData.countryId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('PROVINCE')} *
                </label>
                <div className="relative" ref={provinceDropdownRef}>
                  <input
                    type="text"
                    placeholder="Search province..."
                    value={searchTags.province}
                    onChange={(e) => {
                      setSearchTags({ ...searchTags, province: e.target.value });
                      setDropdowns({ ...dropdowns, showProvince: true });
                    }}
                    onFocus={() => setDropdowns({ ...dropdowns, showProvince: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {dropdowns.showProvince && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {provinces
                        .filter((province) =>
                          province.name.toLowerCase().includes(searchTags.province.toLowerCase())
                        )
                        .map((province) => (
                          <div
                            key={province.id}
                            onClick={() => handleProvinceSelect(province)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {province.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {errors.provinceId && (
                  <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>
                )}
              </div>
            )}

            {/* City Dropdown */}
            {formData.provinceId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('CITY')} *
                </label>
                <div className="relative" ref={cityDropdownRef}>
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={searchTags.city}
                    onChange={(e) => {
                      setSearchTags({ ...searchTags, city: e.target.value });
                      setDropdowns({ ...dropdowns, showCity: true });
                    }}
                    onFocus={() => setDropdowns({ ...dropdowns, showCity: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {dropdowns.showCity && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cities
                        .filter((city) =>
                          city.name.toLowerCase().includes(searchTags.city.toLowerCase())
                        )
                        .map((city) => (
                          <div
                            key={city.id}
                            onClick={() => handleCitySelect(city)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {city.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {errors.cityId && (
                  <p className="text-red-500 text-sm mt-1">{errors.cityId}</p>
                )}
              </div>
            )}

            {/* Station Name (English) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('ENGLISH_NAME')} *
              </label>
              <input
                type="text"
                name="stationName.en"
                value={formData.stationName.en}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.stationName?.en && (
                <p className="text-red-500 text-sm mt-1">{errors.stationName.en}</p>
              )}
            </div>

            {/* Station Name (Pashto) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('PASHTO_NAME')}
              </label>
              <input
                type="text"
                name="stationName.ps"
                value={formData.stationName.ps}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Station Name (Farsi) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('FARSI_NAME')}
              </label>
              <input
                type="text"
                name="stationName.fa"
                value={formData.stationName.fa}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Station Latitude */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('STATION_LAT')} *
              </label>
              <input
                type="text"
                name="stationLat"
                value={formData.stationLat}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.stationLat && (
                <p className="text-red-500 text-sm mt-1">{errors.stationLat}</p>
              )}
            </div>

            {/* Station Longitude */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('STATION_LONG')} *
              </label>
              <input
                type="text"
                name="stationLong"
                value={formData.stationLong}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.stationLong && (
                <p className="text-red-500 text-sm mt-1">{errors.stationLong}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t('CANCEL')}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isEditMode ? t('UPDATE') : t('ADD')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StationForm;