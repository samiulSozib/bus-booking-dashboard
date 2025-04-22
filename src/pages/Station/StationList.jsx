import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Delete, Edit, SearchIcon, View } from "../../icons";
import { addCity, editCity, fetchCities, showCity } from "../../store/slices/citySlice";
import { fetchCountries } from "../../store/slices/countrySlice";
import { fetchProvinces } from "../../store/slices/provinceSlice";
import { fetchStations, addStation, editStation, showStation } from "../../store/slices/stationSlice";
import * as Yup from 'yup';
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";


const stationSchema = Yup.object().shape({
    stationName: Yup.object().shape({
        en: Yup.string().required('Station Name (English) is required'),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
    }),
    stationLat: Yup.number()
        .typeError('Latitude must be a number')
        .required('Latitude is required')
        .min(-90, 'Latitude must be greater than or equal to -90')
        .max(90, 'Latitude must be less than or equal to 90'),
    stationLong: Yup.number()
        .typeError('Longitude must be a number')
        .required('Longitude is required')
        .min(-180, 'Longitude must be greater than or equal to -180')
        .max(180, 'Longitude must be less than or equal to 180'),
    countryId: Yup.string().required('Country is required'),
    provinceId: Yup.string().required('Province is required'),
    cityId: Yup.string().required('City is required'),
});

export default function StationList() {
    const dispatch = useDispatch();
    const { countries } = useSelector((state) => state.countries);
    const { provinces } = useSelector((state) => state.provinces);
    const { cities, selectedCity } = useSelector((state) => state.cities);
    const { stations, selectedStation,loading,pagination } = useSelector((state) => state.stations);

    // State for table filtering
    const [searchTag, setSearchTag] = useState("");
    const [selectedCountryId, setSelectedCountryId] = useState(null);
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [countrySearchTag, setCountrySearchTag] = useState(""); // For country dropdown search
    const [provinceSearchTag, setProvinceSearchTag] = useState(""); // For province dropdown search
    const [errors, setErrors] = useState({});
    const {t}=useTranslation()
    const [currentPage, setCurrentPage] = useState(1);

    // State for Add/Edit Station Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // Track if modal is in edit mode
    const [stationName, setStationName] = useState({ en: "", ps: "", fa: "" });
    const [stationLat, setStationLat] = useState("");
    const [stationLong, setStationLong] = useState("");
    const [currentStationId, setCurrentStationId] = useState(null);
    const [modalCountrySearchTag, setModalCountrySearchTag] = useState("");
    const [modalProvinceSearchTag, setModalProvinceSearchTag] = useState("");
    const [modalCitySearchTag, setModalCitySearchTag] = useState("");
    const [modalSelectedCountryId, setModalSelectedCountryId] = useState(null);
    const [modalSelectedProvinceId, setModalSelectedProvinceId] = useState(null);
    const [modalSelectedCityId, setModalSelectedCityId] = useState(null);
    const [showModalCountryDropdown, setShowModalCountryDropdown] = useState(false);
    const [showModalProvinceDropdown, setShowModalProvinceDropdown] = useState(false);
    const [showModalCityDropdown, setShowModalCityDropdown] = useState(false);

    // Fetch stations 
    useEffect(() => {
        dispatch(fetchStations({searchTag,page:currentPage}));
    }, [dispatch,currentPage, searchTag]);

    // Fetch countries on component mount
    useEffect(() => {
        dispatch(fetchCountries({searchTag:""}));
    }, [dispatch]);

    // Fetch provinces when a country is selected (for table filtering)
    useEffect(() => {
        if (selectedCountryId) {
            dispatch(fetchProvinces({ countryId:selectedCountryId, searchTag:provinceSearchTag }));
        }
    }, [dispatch, selectedCountryId, provinceSearchTag]);

    // Fetch provinces when a country is selected in the modal
    useEffect(() => {
        if (modalSelectedCountryId) {
            dispatch(fetchProvinces({ countryId: modalSelectedCountryId, searchTag: modalProvinceSearchTag }));
        }
    }, [dispatch, modalSelectedCountryId, modalProvinceSearchTag]);

    // Fetch cities when a province is selected in the modal
    useEffect(() => {
        if (modalSelectedProvinceId) {
            dispatch(fetchCities({ provinceId: modalSelectedProvinceId, searchTag: modalCitySearchTag }));
        }
    }, [dispatch, modalSelectedProvinceId, modalCitySearchTag]);

    // Set station details when a station is selected for editing
    useEffect(() => {
        if (selectedStation) {
            setStationName({ en: selectedStation.name.en, ps: selectedStation.name.ps, fa: selectedStation.name.fa });
            setStationLat(selectedStation.latitude);
            setStationLong(selectedStation.longitude)
            setModalSelectedCityId(selectedStation.city.id);
        }
    }, [selectedStation]);

    // Handle country selection (for table filtering)
    const handleCountrySelect = (country) => {
        setSelectedCountryId(country.id);
        setSelectedProvinceId(null); // Reset selected province when country changes
        setShowCountryDropdown(false); // Close the dropdown
        setCountrySearchTag(country.name); // Set the input value to the selected country name
    };

    // Handle province selection (for table filtering)
    const handleProvinceSelect = (province) => {
        setSelectedProvinceId(province.id);
        setShowProvinceDropdown(false); // Close the dropdown
        setProvinceSearchTag(province.name); // Set the input value to the selected province name
    };

    // Handle country selection in modal
    const handleModalCountrySelect = (country) => {
        setModalSelectedCountryId(country.id);
        setModalCountrySearchTag(country.name);
        setShowModalCountryDropdown(false);
        setModalSelectedProvinceId(null); // Reset selected province in modal when country changes
        setModalSelectedCityId(null); // Reset selected city in modal when country changes
    };

    // Handle province selection in modal
    const handleModalProvinceSelect = (province) => {
        setModalSelectedProvinceId(province.id);
        setModalProvinceSearchTag(province.name);
        setShowModalProvinceDropdown(false);
        setModalSelectedCityId(null); // Reset selected city in modal when province changes
    };

    // Handle city selection in modal
    const handleModalCitySelect = (city) => {
        setModalSelectedCityId(city.id);
        setModalCitySearchTag(city.name);
        setShowModalCityDropdown(false);
    };

    // Handle add/edit station form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const stationData = {
            stationName,
            stationLat: parseFloat(stationLat), // Convert to number
            stationLong: parseFloat(stationLong), // Convert to number
            countryId: modalSelectedCountryId,
            provinceId: modalSelectedProvinceId,
            cityId: modalSelectedCityId,
        };
    
        try {
            // Validate form data
            await stationSchema.validate(stationData, { abortEarly: false });
    
            if (isEditMode) {
                await dispatch(editStation({ id: currentStationId, stationData }));
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Station updated successfully.',
                });
            } else {
                await dispatch(addStation(stationData));
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Station added successfully.',
                });
            }
    
            // Reset modal state
            resetModal();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                // Handle Yup validation errors
                const newErrors = {};
                error.inner.forEach((err) => {
                    const path = err.path.split('.');
                    if (path.length === 2) {
                        // Handle nested fields (e.g., stationName.en)
                        if (!newErrors[path[0]]) newErrors[path[0]] = {};
                        newErrors[path[0]][path[1]] = err.message;
                    } else {
                        // Handle top-level fields (e.g., stationLat)
                        newErrors[path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                // Handle API or other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error || 'Failed to add/update station. Please try again.',
                });
            }
        }
    };

    // Reset modal state
    const resetModal = () => {
        setIsEditMode(false);
        setStationName({ en: "", ps: "", fa: "" });
        setStationLat("");
        setStationLong("")
        setModalSelectedCountryId(null);
        setModalSelectedProvinceId(null);
        setModalSelectedCityId(null);
        setIsModalOpen(false);
        setCurrentStationId(null);
        setErrors({})
    };

    // Handle edit station button click
    const handleEditStation = (stationId) => {
        dispatch(showStation(stationId));
        setIsEditMode(true);
        setIsModalOpen(true);
        setCurrentStationId(stationId);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Station Search and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("STATION_LIST")}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon/>
                        </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder={t("SEARCH")}
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_STATION")}
                    </button>
                </div>
            </div>

            {/* Table Filtering Section */}
            <div className="flex flex-row items-center justify-end gap-3 mb-4">
                {/* Country Dropdown */}
                <div className="relative">
                    <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon/>
                            </div>
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearchTag}
                            onChange={(e) => {
                                setCountrySearchTag(e.target.value);
                                setShowCountryDropdown(true);
                            }}
                            onFocus={() => setShowCountryDropdown(true)}
                            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                    </div>
                    {showCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {countries
                                .filter((country) =>
                                    country.name.toLowerCase().includes(countrySearchTag.toLowerCase())
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

                {/* Province Dropdown (only shown if a country is selected) */}
                {selectedCountryId && (
                    <div className="relative">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon/>
                                </div>
                            <input
                                type="text"
                                placeholder="Search province..."
                                value={provinceSearchTag}
                                onChange={(e) => {
                                    setProvinceSearchTag(e.target.value);
                                    setShowProvinceDropdown(true);
                                }}
                                onFocus={() => setShowProvinceDropdown(true)}
                                className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        {showProvinceDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {provinces
                                    .filter((province) =>
                                        province.name.toLowerCase().includes(provinceSearchTag.toLowerCase())
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
                )}
            </div>

            {/* Station Table */}
            <div className="max-w-full overflow-x-auto">
            {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
            ) : (
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            {t("STATION_NAME")}
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            {t("STATION_CODE")}
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            {t("ACTION")}
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {stations.map((station) => (
                            <TableRow key={station.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {station.name.en}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {station.city.name}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex flex-row items-center justify-start gap-2">
                                        <Edit
                                            className="w-6 h-6 cursor-pointer"
                                            onClick={() => handleEditStation(station.id)}
                                        />
                                        {/* <Delete className="w-6 h-6" />
                                        <View className="w-6 h-6" /> */}
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

            {/* Add/Edit Station Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? t("EDIT_STATION") : t("ADD_STATION")}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Country Dropdown in Modal */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("COUNTRY")} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={modalCountrySearchTag}
                                        onChange={(e) => {
                                            setModalCountrySearchTag(e.target.value);
                                            setShowModalCountryDropdown(true);
                                        }}
                                        onFocus={() => setShowModalCountryDropdown(true)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {showModalCountryDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {countries
                                                .filter((country) =>
                                                    country.name.toLowerCase().includes(modalCountrySearchTag.toLowerCase())
                                                )
                                                .map((country) => (
                                                    <div
                                                        key={country.id}
                                                        onClick={() => handleModalCountrySelect(country)}
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

                            {/* Province Dropdown in Modal (only shown if a country is selected) */}
                            {modalSelectedCountryId && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("PROVINCE")} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search province..."
                                            value={modalProvinceSearchTag}
                                            onChange={(e) => {
                                                setModalProvinceSearchTag(e.target.value);
                                                setShowModalProvinceDropdown(true);
                                            }}
                                            onFocus={() => setShowModalProvinceDropdown(true)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {showModalProvinceDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {provinces
                                                    .filter((province) =>
                                                        province.name.toLowerCase().includes(modalProvinceSearchTag.toLowerCase())
                                                    )
                                                    .map((province) => (
                                                        <div
                                                            key={province.id}
                                                            onClick={() => handleModalProvinceSelect(province)}
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

                            {/* City Dropdown in Modal (only shown if a province is selected) */}
                            {modalSelectedProvinceId && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("CITY")} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search city..."
                                            value={modalCitySearchTag}
                                            onChange={(e) => {
                                                setModalCitySearchTag(e.target.value);
                                                setShowModalCityDropdown(true);
                                            }}
                                            onFocus={() => setShowModalCityDropdown(true)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {showModalCityDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {cities
                                                    .filter((city) =>
                                                        city.name.toLowerCase().includes(modalCitySearchTag.toLowerCase())
                                                    )
                                                    .map((city) => (
                                                        <div
                                                            key={city.id}
                                                            onClick={() => handleModalCitySelect(city)}
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
                                {t("ENGLISH_NAME")} *
                                </label>
                                <input
                                    type="text"
                                    value={stationName.en}
                                    onChange={(e) =>
                                        setStationName({ ...stationName, en: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.stationName?.en && (
                                    <p className="text-red-500 text-sm mt-1">{errors.stationName.en}</p>
                                )}
                            </div>

                            

                            {/* Station Name (Pashto) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("PASHTO_NAME")}
                                </label>
                                <input
                                    type="text"
                                    value={stationName.ps}
                                    onChange={(e) =>
                                        setStationName({ ...stationName, ps: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Station Name (Farsi) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("FARSI_NAME")}
                                </label>
                                <input
                                    type="text"
                                    value={stationName.fa}
                                    onChange={(e) =>
                                        setStationName({ ...stationName, fa: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Station lat */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("STATION_LAT")} *
                                </label>
                                <input
                                    type="text"
                                    value={stationLat}
                                    onChange={(e) => setStationLat(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    
                                />
                                {errors.stationLat && (
                                    <p className="text-red-500 text-sm mt-1">{errors.stationLat}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("STATION_LONG")} *
                                </label>
                                <input
                                    type="text"
                                    value={stationLong}
                                    onChange={(e) => setStationLong(e.target.value)}
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
                                    onClick={resetModal}
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
            )}
        </div>
    );
}