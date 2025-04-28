import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Delete, Edit, FunnelIcon, SearchIcon, View } from "../../icons";
import { addRoute, editRoute, fetchRoutes, showRoute } from "../../store/slices/routeSlice";
import { fetchCountries } from "../../store/slices/countrySlice";
import { fetchProvinces } from "../../store/slices/provinceSlice";
import { fetchCities } from "../../store/slices/citySlice";
import { fetchStations } from "../../store/slices/stationSlice";
import * as Yup from 'yup';
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import RouteFilter from "./RouteFilter";
import { userType } from "../../utils/utils";
import useOutsideClick from "../../hooks/useOutSideClick";

const getValidationSchema = (t) =>
    Yup.object().shape({
      origin: Yup.object().shape({
        countryId: Yup.string().required(t('route.origin.countryRequired')),
        provinceId: Yup.string().required(t('route.origin.provinceRequired')),
        cityId: Yup.string().required(t('route.origin.cityRequired')),
        stationId: Yup.string().required(t('route.origin.stationRequired')),
      }),
      destination: Yup.object().shape({
        countryId: Yup.string().required(t('route.destination.countryRequired')),
        provinceId: Yup.string().required(t('route.destination.provinceRequired')),
        cityId: Yup.string().required(t('route.destination.cityRequired')),
        stationId: Yup.string().required(t('route.destination.stationRequired')),
      }),
      name: Yup.string()
        .typeError(t('route.name.typeError'))
        .required(t('route.name.required')),
      distance: Yup.number()
        .typeError(t('route.distance.typeError'))
        .required(t('route.distance.required'))
        .min(0, t('route.distance.min')),
    });
  

export default function RouteList() {
    // Create refs for each dropdown
        const originCountryRef = useRef(null);
        const originProvinceRef = useRef(null);
        const originCityRef = useRef(null);
        const originStationRef = useRef(null);
        const destinationCountryRef = useRef(null);
        const destinationProvinceRef = useRef(null);
        const destinationCityRef = useRef(null);
        const destinationStationRef = useRef(null);

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

    const dispatch = useDispatch();
    const { countries } = useSelector((state) => state.countries);
    const { provinces } = useSelector((state) => state.provinces);
    const { cities } = useSelector((state) => state.cities);
    const { stations } = useSelector((state) => state.stations);
    const { routes, selectedRoute,loading,pagination } = useSelector((state) => state.routes);
    const {t}=useTranslation()
    const [currentPage, setCurrentPage] = useState(1);
    const role=userType()


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});


    // State for table filtering
    const [searchTag, setSearchTag] = useState("");

    // State for Add/Edit Route Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentRouteId, setCurrentRouteId] = useState(null);
    const [formErrors,setFormErrors]=useState({})


    // Origin and Destination States
    const [origin, setOrigin] = useState({
        countryId: null,
        provinceId: null,
        cityId: null,
        stationId: null,
    });
    const [destination, setDestination] = useState({
        countryId: null,
        provinceId: null,
        cityId: null,
        stationId: null,
    });

    // Search Tags
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

    // Dropdown Visibility
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

    // Route Name and Distance
    const [routeName, setRouteName] = useState("");
    const [distance, setDistance] = useState(0);

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setCurrentPage(1); 
    };

    // Fetch routes 
    useEffect(() => {
        dispatch(fetchRoutes({searchTag,page:currentPage,filters:activeFilters}));
    }, [dispatch,currentPage, searchTag,activeFilters]);

    // Fetch countries on component mount
    useEffect(() => {
        dispatch(fetchCountries({}));
    }, [dispatch]);

// Fetch provinces for origin country
useEffect(() => {
    if (origin.countryId) {
        dispatch(fetchProvinces({ countryId: origin.countryId, searchTag: searchTags.originProvince }));
    }
}, [dispatch, origin.countryId, searchTags.originProvince]);

// Fetch provinces for destination country
useEffect(() => {
    if (destination.countryId) {
        dispatch(fetchProvinces({ countryId: destination.countryId, searchTag: searchTags.destinationProvince }));
    }
}, [dispatch, destination.countryId, searchTags.destinationProvince]);

// Fetch cities for origin province
useEffect(() => {
    if (origin.provinceId) {
        dispatch(fetchCities({ provinceId: origin.provinceId }));
    }
}, [dispatch, origin.provinceId]);

// Fetch cities for destination province
useEffect(() => {
    if (destination.provinceId) {
        dispatch(fetchCities({ provinceId: destination.provinceId }));
    }
}, [dispatch, destination.provinceId]);

// Fetch stations for origin city
useEffect(() => {
    if (origin.cityId) {
        dispatch(fetchStations({ cityId: origin.cityId, searchTag: searchTags.originStation }));
    }
}, [dispatch, origin.cityId, searchTags.originStation]);

// Fetch stations for destination city
useEffect(() => {
    if (destination.cityId) {
        dispatch(fetchStations({ cityId: destination.cityId, searchTag: searchTags.destinationStation }));
    }
}, [dispatch, destination.cityId, searchTags.destinationStation]);

    // Set route details when a route is selected for editing
    useEffect(() => {
        if (selectedRoute && isEditMode) {
            setRouteName(selectedRoute.name);
            setDropdowns({originCountry:true})
            setSearchTags(
                {
                    originCountry:selectedRoute?.origin_city?.country?.name||"",
                    originProvince:selectedRoute?.origin_city?.province.name||"",
                    originCity:selectedRoute?.origin_city?.name||"",
                    originStation:selectedRoute?.origin_station?.name||"",

                    destinationCountry:selectedRoute?.destination_city?.country?.name||"",
                    destinationProvince:selectedRoute?.destination_city?.province.name||"",
                    destinationCity:selectedRoute?.destination_city?.name||"",
                    destinationStation:selectedRoute?.destination_station?.name||""
                }
            )
            setOrigin({
                countryId:selectedRoute.origin_city.country.id,
                provinceId:selectedRoute.origin_city.province.id,
                cityId: selectedRoute.origin_city.id,
                stationId: selectedRoute.origin_station.id,
            });
            setDestination({
                countryId:selectedRoute.destination_city.country.id,
                provinceId:selectedRoute.destination_city.province.id,
                cityId: selectedRoute.destination_city.id,
                stationId: selectedRoute.destination_station.id,
            });
            setDistance(selectedRoute.distance);
        }
    }, [selectedRoute]);

    // Handle add/edit route form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = {
            origin: {
                countryId: origin.countryId,
                provinceId: origin.provinceId,
                cityId: origin.cityId,
                stationId: origin.stationId,
            },
            destination: {
                countryId: destination.countryId,
                provinceId: destination.provinceId,
                cityId: destination.cityId,
                stationId: destination.stationId,
            },
            name:routeName,
            distance: parseFloat(distance), // Convert to number
        };
    
        try {
            // Validate form data
            await getValidationSchema(t).validate(formData, { abortEarly: false });
    
            if (isEditMode) {
                await dispatch(editRoute({ id: currentRouteId, formData })).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Route updated successfully.',
                });
            } else {
                await dispatch(addRoute(formData)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Route added successfully.',
                });
            }
    
            // Reset modal state
            resetModal();
        } catch (err) {
            if (err.inner) {
                // Yup validation errors
                const errors = {};
                err.inner.forEach((error) => {
                    const path = error.path.split('.');
                    if (path.length === 2) {
                        // Handle nested fields (e.g., origin.countryId)
                        if (!errors[path[0]]) errors[path[0]] = {};
                        errors[path[0]][path[1]] = error.message;
                    } else {
                        // Handle top-level fields (e.g., distance)
                        errors[path[0]] = error.message;
                    }
                });
                setFormErrors(errors);
    
                
            } else {
                // API or other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err || 'Failed to add/update route. Please try again.',
                });
            }
        }
    };

    // Reset modal state
    const resetModal = () => {
        setIsEditMode(false);
        setRouteName("");
        setOrigin({
            countryId: null,
            provinceId: null,
            cityId: null,
            stationId: null,
        });
        setDestination({
            countryId: null,
            provinceId: null,
            cityId: null,
            stationId: null,
        });
        setRouteName("")
        setDistance(0);
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
        setDropdowns({
            showOriginCountry: false,
            showOriginProvince: false,
            showOriginCity: false,
            showOriginStation: false,
            showDestinationCountry: false,
            showDestinationProvince: false,
            showDestinationCity: false,
            showDestinationStation: false,
        });
        setIsModalOpen(false);
        setCurrentRouteId(null);
    };

    // Handle edit route button click
    const handleEditRoute = (routeId) => {
        dispatch(showRoute(routeId));
        setIsEditMode(true);
        setIsModalOpen(true);
        setCurrentRouteId(routeId);
    };

    // Handle dropdown toggle
    const toggleDropdown = (dropdownKey, isOpen) => {
        setDropdowns((prevDropdowns) => ({
            ...prevDropdowns,
            [dropdownKey]: isOpen,
        }));
    };

    // Handle search tag change
    const handleSearchTagChange = (searchTagKey, value) => {
        console.log(value)
        setSearchTags((prevSearchTags) => ({
            ...prevSearchTags,
            [searchTagKey]: value,
        }));
    };

    // Handle country selection
    const handleCountrySelect = (country, type) => {
        if (type === "origin") {
            setOrigin((prevOrigin) => ({
                ...prevOrigin,
                countryId: country.id,
                provinceId: null,
                cityId: null,
                stationId: null,
            }));
        } else {
            setDestination((prevDestination) => ({
                ...prevDestination,
                countryId: country.id,
                provinceId: null,
                cityId: null,
                stationId: null,
            }));
        }
        setSearchTags((prevSearchTags) => ({
            ...prevSearchTags,
            [`${type}Country`]: country.name,
            [`${type}Province`]: "",
            [`${type}City`]: "",
            [`${type}Station`]: "",
        }));
        toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Country`, false);
    };

    // Handle province selection
    const handleProvinceSelect = (province, type) => {
        if (type === "origin") {
            setOrigin((prevOrigin) => ({
                ...prevOrigin,
                provinceId: province.id,
                cityId: null,
                stationId: null,
            }));
        } else {
            setDestination((prevDestination) => ({
                ...prevDestination,
                provinceId: province.id,
                cityId: null,
                stationId: null,
            }));
        }
        setSearchTags((prevSearchTags) => ({
            ...prevSearchTags,
            [`${type}Province`]: province.name,
            [`${type}City`]: "",
            [`${type}Station`]: "",
        }));
        toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Province`, false);
    };

    // Handle city selection
    const handleCitySelect = (city, type) => {
        if (type === "origin") {
            setOrigin((prevOrigin) => ({
                ...prevOrigin,
                cityId: city.id,
                stationId: null,
            }));
        } else {
            setDestination((prevDestination) => ({
                ...prevDestination,
                cityId: city.id,
                stationId: null,
            }));
        }
        setSearchTags((prevSearchTags) => ({
            ...prevSearchTags,
            [`${type}City`]: city.name,
            [`${type}Station`]: "",
        }));
        toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}City`, false);
    };

    // Handle station selection
    const handleStationSelect = (station, type) => {
        if (type === "origin") {
            setOrigin((prevOrigin) => ({
                ...prevOrigin,
                stationId: station.id,
            }));
        } else {
            setDestination((prevDestination) => ({
                ...prevDestination,
                stationId: station.id,
            }));
        }
        setSearchTags((prevSearchTags) => ({
            ...prevSearchTags,
            [`${type}Station`]: station.name.en,
        }));
        toggleDropdown(`show${type.charAt(0).toUpperCase() + type.slice(1)}Station`, false);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Route Search and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("ROUTE_LIST")}
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
                        onClick={() => setIsFilterOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        <FunnelIcon className="w-5 h-5" />
                        {t("FILTER")}
                    </button>
                    {role.role==="admin"&&(
                        <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_ROUTE")}
                    </button>
                    )}
                    
                </div>
            </div>

            {/* Route Table */}
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
                                {t("ROUTE_NAME")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ORIGIN")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("DESTINATION")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("DISTANCE")}
                                </TableCell>
                                {role.role==="admin"&&(
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("ACTION")}
                                    </TableCell>
                                )}
                                
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {routes.map((route) => (
                                <TableRow key={route.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {route.name}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {route.origin_city.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {route.destination_city.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {route.distance} Km
                                    </TableCell>
                                    {role.role==="admin"&&(
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-row items-center justify-start gap-2">
                                            <Edit
                                                className="w-6 h-6 cursor-pointer"
                                                onClick={() => handleEditRoute(route.id)}
                                            />
                                            
                                        </div>
                                    </TableCell>
                                    )}
                                    
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

            {/* Add/Edit Route Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
                    <h2 className="text-lg font-semibold mb-4">
                        {isEditMode ? t("EDIT_ROUTE") : t("ADD_ROUTE")}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Origin Section */}
                            <div>
                                <h3 className="text-md font-semibold mb-2">{t("ORIGIN")}</h3>
                                {/* Origin Country Dropdown */}
                                <div className="mb-4" ref={originCountryRef}>
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("ORIGIN")} {t("COUNTRY")} *
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
                                                    .filter((country) =>
                                                        country.name
                                                            .toLowerCase()
                                                            .includes(searchTags.originCountry.toLowerCase())
                                                    )
                                                    .map((country) => (
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
                                    {formErrors?.origin?.countryId && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.origin.countryId}</p>
                                    )}
                                </div>

                                {/* Origin Province Dropdown */}
                                {origin.countryId && (
                                    <div className="mb-4" ref={originProvinceRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("ORIGIN")} {t("PROVINCE")} *
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
                                                        .filter((province) =>
                                                            province.name
                                                                .toLowerCase()
                                                                .includes(searchTags.originProvince.toLowerCase())
                                                        )
                                                        .map((province) => (
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
                                        {formErrors?.origin?.provinceId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.origin.provinceId}</p>
                                        )}
                                    </div>
                                )}

                                {/* Origin City Dropdown */}
                                {origin.provinceId && (
                                    <div className="mb-4" ref={originCityRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("ORIGIN")} {t("CITY")} *
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
                                                        .filter((city) =>
                                                            city.name
                                                                .toLowerCase()
                                                                .includes(searchTags.originCity.toLowerCase())
                                                        )
                                                        .map((city) => (
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
                                        {formErrors?.origin?.cityId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.origin.cityId}</p>
                                        )}
                                    </div>
                                )}

                                {/* Origin Station Dropdown */}
                                {origin.cityId && (
                                    <div className="mb-4" ref={originStationRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("ORIGIN")} {t("STATION")} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={t("SEARCH")}
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
                                                        .filter((station) =>
                                                            station.name.en
                                                                .includes(searchTags.originStation)
                                                        )
                                                        .map((station) => (
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
                                        {formErrors?.origin?.stationId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.origin.stationId}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Destination Section */}
                            <div>
                                <h3 className="text-md font-semibold mb-2">{t("DESTINATION")}</h3>
                                {/* Destination Country Dropdown */}
                                <div className="mb-4" ref={destinationCountryRef}>
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("DESTINATION")} {t("COUNTRY")} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            disabled={!origin.stationId}
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
                                                    .filter((country) =>
                                                        country.name
                                                            .toLowerCase()
                                                            .includes(searchTags.destinationCountry.toLowerCase())
                                                    )
                                                    .map((country) => (
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
                                    {formErrors?.destination?.countryId && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.destination.countryId}</p>
                                    )}
                                </div>

                                {/* Destination Province Dropdown */}
                                {destination.countryId && (
                                    <div className="mb-4" ref={destinationProvinceRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("DESTINATION")} {t("PROVINCE")} *
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
                                                        .filter((province) =>
                                                            province.name
                                                                .toLowerCase()
                                                                .includes(searchTags.destinationProvince.toLowerCase())
                                                        )
                                                        .map((province) => (
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
                                        {formErrors?.destination?.provinceId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.destination.provinceId}</p>
                                        )}
                                    </div>
                                )}

                                {/* Destination City Dropdown */}
                                {destination.provinceId && (
                                    <div className="mb-4" ref={destinationCityRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("DESTINATION")} {t("CITY")} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={t("SEARCH")}
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
                                                        .filter((city) =>
                                                            city.name
                                                                .toLowerCase()
                                                                .includes(searchTags.destinationCity.toLowerCase())
                                                        )
                                                        .map((city) => (
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
                                        {formErrors?.destination?.cityId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.destination.cityId}</p>
                                        )}
                                    </div>
                                )}

                                {/* Destination Station Dropdown */}
                                {destination.cityId && (
                                    <div className="mb-4" ref={destinationStationRef}>
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("DESTINATION")} {t("STATION")} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={t("SEARCH")}
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
                                                        .filter((station) =>
                                                            station.name.en
                                                                .includes(searchTags.destinationStation)
                                                        )
                                                        .map((station) => (
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
                                        {formErrors?.destination?.stationId && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.destination.stationId}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                        </div>

                        {/* Distance */}
                        <div className="mb-4 flex flex-row justify-between gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ROUTE_NAME")} *
                                </label>
                                <input
                                    type="text"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="mt-1 w-full block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    
                                />
                                {formErrors?.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("DISTANCE")} (km) *
                                </label>
                                <input
                                    type="number"
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    className="mt-1 w-full block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    
                                />
                                {formErrors?.distance && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.distance}</p>
                                )}
                            </div>
                            
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
            
            <RouteFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilters={handleApplyFilters}
            />
            
        </div>

        

        
    );
}