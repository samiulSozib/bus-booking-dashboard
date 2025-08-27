// import { useDispatch, useSelector } from "react-redux";
// import { useState, useEffect, useRef } from "react";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHeader,
//     TableRow,
// } from "../../components/ui/table";
// import { Delete, Edit, FunnelIcon, SearchIcon, View } from "../../icons";
// import { addCity, editCity, fetchCities, showCity } from "../../store/slices/citySlice";
// import { fetchCountries } from "../../store/slices/countrySlice";
// import { fetchProvinces } from "../../store/slices/provinceSlice";
// import { fetchStations, addStation, editStation, showStation } from "../../store/slices/stationSlice";
// import * as Yup from 'yup';
// import Swal from "sweetalert2";
// import { useTranslation } from "react-i18next";
// import Pagination from "../../components/pagination/pagination";
// import StationFilter from "./StationFIlter";
// import useOutsideClick from "../../hooks/useOutSideClick";

// const getStationSchema = (t) =>
//     Yup.object().shape({
//       stationName: Yup.object().shape({
//         en: Yup.string().required(t('station.stationNameRequiredEn')),
//         ps: Yup.string().optional(),
//         fa: Yup.string().optional(),
//       }),
//       stationLat: Yup.number()
//         .typeError(t('station.latitudeTypeError'))
//         .required(t('station.latitudeRequired'))
//         .min(-90, t('station.latitudeMin'))
//         .max(90, t('station.latitudeMax')),
//       stationLong: Yup.number()
//         .typeError(t('station.longitudeTypeError'))
//         .required(t('station.longitudeRequired'))
//         .min(-180, t('station.longitudeMin'))
//         .max(180, t('station.longitudeMax')),
//       countryId: Yup.string().required(t('station.countryRequired')),
//       provinceId: Yup.string().required(t('station.provinceRequired')),
//       cityId: Yup.string().required(t('station.cityRequired')),
//     });

// export default function StationList() {
//     const countryDropdownRef = useRef(null);
//     const provinceDropdownRef = useRef(null);
//     const cityDropdownRef = useRef(null);

//     useOutsideClick(countryDropdownRef, () => {
//         setShowModalCountryDropdown(false);
//     });
//     useOutsideClick(provinceDropdownRef, () => {
//         setShowModalProvinceDropdown(false)
//     });
//     useOutsideClick(cityDropdownRef, () => {
//         setShowModalCityDropdown(false)
//     });

//     const dispatch = useDispatch();
//     const { countries } = useSelector((state) => state.countries);
//     const { provinces } = useSelector((state) => state.provinces);
//     const { cities, selectedCity } = useSelector((state) => state.cities);
//     const { stations, selectedStation,loading,pagination } = useSelector((state) => state.stations);

//     // State for table filtering
//     const [searchTag, setSearchTag] = useState("");
//     const [selectedCountryId, setSelectedCountryId] = useState(null);
//     const [selectedProvinceId, setSelectedProvinceId] = useState(null);
//     const [showCountryDropdown, setShowCountryDropdown] = useState(false);
//     const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
//     const [countrySearchTag, setCountrySearchTag] = useState(""); // For country dropdown search
//     const [provinceSearchTag, setProvinceSearchTag] = useState(""); // For province dropdown search
//     const [errors, setErrors] = useState({});
//     const {t}=useTranslation()
//     const [currentPage, setCurrentPage] = useState(1);

//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const [activeFilters, setActiveFilters] = useState({});

//     // State for Add/Edit Station Modal
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isEditMode, setIsEditMode] = useState(false); // Track if modal is in edit mode
//     const [stationName, setStationName] = useState({ en: "", ps: "", fa: "" });
//     const [stationLat, setStationLat] = useState("");
//     const [stationLong, setStationLong] = useState("");
//     const [currentStationId, setCurrentStationId] = useState(null);
//     const [modalCountrySearchTag, setModalCountrySearchTag] = useState("");
//     const [modalProvinceSearchTag, setModalProvinceSearchTag] = useState("");
//     const [modalCitySearchTag, setModalCitySearchTag] = useState("");
//     const [modalSelectedCountryId, setModalSelectedCountryId] = useState(null);
//     const [modalSelectedProvinceId, setModalSelectedProvinceId] = useState(null);
//     const [modalSelectedCityId, setModalSelectedCityId] = useState(null);
//     const [showModalCountryDropdown, setShowModalCountryDropdown] = useState(false);
//     const [showModalProvinceDropdown, setShowModalProvinceDropdown] = useState(false);
//     const [showModalCityDropdown, setShowModalCityDropdown] = useState(false);

//     const handleApplyFilters = (filters) => {
//         setActiveFilters(filters);
//         setCurrentPage(1);
//     };

//     // Fetch stations
//     useEffect(() => {
//         dispatch(fetchStations({searchTag,page:currentPage,filters:activeFilters}));
//     }, [dispatch,currentPage, searchTag,activeFilters]);

//     // Fetch countries on component mount
//     useEffect(() => {
//         dispatch(fetchCountries({searchTag:""}));
//     }, [dispatch,searchTag]);

//     // Fetch provinces when a country is selected (for table filtering)
//     useEffect(() => {
//         if (selectedCountryId) {
//             dispatch(fetchProvinces({ countryId:selectedCountryId, searchTag:provinceSearchTag }));
//         }
//     }, [dispatch, selectedCountryId, provinceSearchTag]);

//     // Fetch provinces when a country is selected in the modal
//     useEffect(() => {
//         if (modalSelectedCountryId) {
//             dispatch(fetchProvinces({ countryId: modalSelectedCountryId, searchTag: modalProvinceSearchTag }));
//         }
//     }, [dispatch, modalSelectedCountryId, modalProvinceSearchTag]);

//     // Fetch cities when a province is selected in the modal
//     useEffect(() => {
//         if (modalSelectedProvinceId) {
//             dispatch(fetchCities({ provinceId: modalSelectedProvinceId, searchTag: modalCitySearchTag }));
//         }
//     }, [dispatch, modalSelectedProvinceId, modalCitySearchTag]);

//     // Set station details when a station is selected for editing
//     useEffect(() => {
//         if (selectedStation && isEditMode) {
//             setStationName({ en: selectedStation?.name?.en??selectedStation.name, ps: selectedStation.name.ps, fa: selectedStation.name.fa });
//             setModalSelectedCountryId(selectedStation.city.country.id)
//             setModalCountrySearchTag(selectedStation.city.country.name)
//             setModalSelectedProvinceId(selectedStation.city.province.id)
//             setModalProvinceSearchTag(selectedStation.city.province.name)
//             setModalSelectedCityId(selectedStation.city.id);
//             setModalCitySearchTag(selectedStation.city.name)
//             setStationLat(selectedStation.latitude);
//             setStationLong(selectedStation.longitude)

//         }
//     }, [selectedStation]);

//     // Handle country selection (for table filtering)
//     const handleCountrySelect = (country) => {
//         setSelectedCountryId(country.id);
//         setSelectedProvinceId(null); // Reset selected province when country changes
//         setShowCountryDropdown(false); // Close the dropdown
//         setCountrySearchTag(country.name); // Set the input value to the selected country name
//     };

//     // Handle province selection (for table filtering)
//     const handleProvinceSelect = (province) => {
//         setSelectedProvinceId(province.id);
//         setShowProvinceDropdown(false); // Close the dropdown
//         setProvinceSearchTag(province.name); // Set the input value to the selected province name
//     };

//     // Handle country selection in modal
//     const handleModalCountrySelect = (country) => {
//         setModalSelectedCountryId(country.id);
//         setModalCountrySearchTag(country.name);
//         setShowModalCountryDropdown(false);
//         setModalSelectedProvinceId(null); // Reset selected province in modal when country changes
//         setModalSelectedCityId(null); // Reset selected city in modal when country changes
//     };

//     // Handle province selection in modal
//     const handleModalProvinceSelect = (province) => {
//         setModalSelectedProvinceId(province.id);
//         setModalProvinceSearchTag(province.name);
//         setShowModalProvinceDropdown(false);
//         setModalSelectedCityId(null); // Reset selected city in modal when province changes
//     };

//     // Handle city selection in modal
//     const handleModalCitySelect = (city) => {
//         setModalSelectedCityId(city.id);
//         setModalCitySearchTag(city.name);
//         setShowModalCityDropdown(false);
//     };

//     // Handle add/edit station form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const stationData = {
//             stationName,
//             stationLat: parseFloat(stationLat), // Convert to number
//             stationLong: parseFloat(stationLong), // Convert to number
//             countryId: modalSelectedCountryId,
//             provinceId: modalSelectedProvinceId,
//             cityId: modalSelectedCityId,
//         };

//         try {
//             // Validate form data
//             await getStationSchema(t).validate(stationData, { abortEarly: false });

//             if (isEditMode) {
//                 const resultAction=await dispatch(editStation({ id: currentStationId, stationData }));
//                 if(editStation.fulfilled.match(resultAction)){
//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Success!',
//                         text: 'Station updated successfully.',
//                     });
//                 }else {
//                     throw new Error(resultAction.payload || "Failed to add station.");
//                 }

//             } else {
//                 const resultAction=await dispatch(addStation(stationData));
//                 if(addStation.fulfilled.match(resultAction)){
//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Success!',
//                         text: 'Station added successfully.',
//                     });
//                 }else{
//                     throw new Error(resultAction.payload || "Failed to add station.");

//                 }
//             }

//             // Reset modal state
//             resetModal();
//         } catch (error) {
//             if (error instanceof Yup.ValidationError) {
//                 // Handle Yup validation errors
//                 const newErrors = {};
//                 error.inner.forEach((err) => {
//                     const path = err.path.split('.');
//                     if (path.length === 2) {
//                         // Handle nested fields (e.g., stationName.en)
//                         if (!newErrors[path[0]]) newErrors[path[0]] = {};
//                         newErrors[path[0]][path[1]] = err.message;
//                     } else {
//                         // Handle top-level fields (e.g., stationLat)
//                         newErrors[path[0]] = err.message;
//                     }
//                 });
//                 setErrors(newErrors);
//             } else {
//                 // Handle API or other errors
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: error || 'Failed to add/update station. Please try again.',
//                 });
//             }
//         }
//     };

//     // Reset modal state
//     const resetModal = () => {
//         setIsEditMode(false);
//         setStationName({ en: "", ps: "", fa: "" });
//         setStationLat("");
//         setStationLong("")
//         setModalSelectedCountryId(null);
//         setModalSelectedProvinceId(null);
//         setModalSelectedCityId(null);
//         setIsModalOpen(false);
//         setCurrentStationId(null);
//         setErrors({})
//         setModalCountrySearchTag("");
//         setModalProvinceSearchTag("");
//         setModalCitySearchTag("");
//     };

//     // Handle edit station button click
//     const handleEditStation = (stationId) => {
//         dispatch(showStation(stationId));
//         setIsEditMode(true);
//         setIsModalOpen(true);
//         setCurrentStationId(stationId);
//     };

//     return (
//         <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
//             {/* Station Search and Add Button */}
//             <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex flex-row gap-2 items-center">
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//                         {t("STATION_LIST")}
//                     </h3>
//                 </div>

//                 <div className="flex items-center gap-3">
//                 <div className="relative flex-1">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <SearchIcon/>
//                         </div>
//                     <input
//                         type="text"
//                         className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                         placeholder={t("SEARCH")}
//                         value={searchTag}
//                         onChange={(e) => setSearchTag(e.target.value)}
//                     />
//                 </div>
//                 <button
//                     onClick={() => setIsFilterOpen(true)}
//                     className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
//                 >
//                     <FunnelIcon className="w-5 h-5" />
//                     {t("FILTER")}
//                 </button>
//                     <button
//                         onClick={() => setIsModalOpen(true)}
//                         className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
//                     >
//                         {t("ADD_STATION")}
//                     </button>
//                 </div>
//             </div>

//             {/* Station Table */}
//             <div className="max-w-full overflow-x-auto">
//             {loading ? (
//                     <div className="flex justify-center items-center h-32">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//                     </div>
//             ) : (
//                 <Table>
//                     <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
//                         <TableRow>
//                             <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                             {t("STATION_NAME")}
//                             </TableCell>
//                             <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                             {t("CITY_NAME")}
//                             </TableCell>
//                             <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                             {t("ACTION")}
//                             </TableCell>
//                         </TableRow>
//                     </TableHeader>

//                     <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
//                         {stations.map((station) => (
//                             <TableRow key={station.id}>
//                                 <TableCell className="py-3">
//                                     <div className="flex items-center gap-3">
//                                         <div>
//                                             <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                                             {station?.name?.en ?? station.name}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </TableCell>
//                                 <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                     {station.city.name}
//                                 </TableCell>
//                                 <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                     <div className="flex flex-row items-center justify-start gap-2">
//                                         <Edit
//                                             className="w-6 h-6 cursor-pointer"
//                                             onClick={() => handleEditStation(station.id)}
//                                         />
//                                         {/* <Delete className="w-6 h-6" />
//                                         <View className="w-6 h-6" /> */}
//                                     </div>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             )}
//             </div>

//             <Pagination
//                 currentPage={pagination.current_page}
//                 totalPages={pagination.last_page}
//                 onPageChange={(page) => setCurrentPage(page)}
//             />

//             {/* Add/Edit Station Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
//                         <h2 className="text-lg font-semibold mb-4">
//                             {isEditMode ? t("EDIT_STATION") : t("ADD_STATION")}
//                         </h2>
//                         <div className="overflow-y-auto flex-1">
//                         <form onSubmit={handleSubmit}>
//                             {/* Country Dropdown in Modal */}
//                             <div className="mb-4" >
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("COUNTRY")} *
//                                 </label>
//                                 <div className="relative" ref={countryDropdownRef}>
//                                     <input
//                                         type="text"
//                                         placeholder="Search country..."
//                                         value={modalCountrySearchTag}
//                                         onChange={(e) => {
//                                             setModalCountrySearchTag(e.target.value);
//                                             setShowModalCountryDropdown(true);
//                                         }}
//                                         onFocus={() => setShowModalCountryDropdown(true)}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                     />
//                                     {showModalCountryDropdown && (
//                                         <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                                             {countries
//                                                 .filter((country) =>
//                                                     country.name.toLowerCase().includes(modalCountrySearchTag.toLowerCase())
//                                                 )
//                                                 .map((country) => (
//                                                     <div
//                                                         key={country.id}
//                                                         onClick={() => handleModalCountrySelect(country)}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                     >
//                                                         {country.name}
//                                                     </div>
//                                                 ))}
//                                         </div>
//                                     )}
//                                 </div>
//                                 {errors.countryId && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.countryId}</p>
//                                 )}
//                             </div>

//                             {/* Province Dropdown in Modal (only shown if a country is selected) */}
//                             {modalSelectedCountryId && (
//                                 <div className="mb-4" >
//                                     <label className="block text-sm font-medium text-gray-700">
//                                     {t("PROVINCE")} *
//                                     </label>
//                                     <div className="relative" ref={provinceDropdownRef}>
//                                         <input
//                                             type="text"
//                                             placeholder="Search province..."
//                                             value={modalProvinceSearchTag}
//                                             onChange={(e) => {
//                                                 setModalProvinceSearchTag(e.target.value);
//                                                 setShowModalProvinceDropdown(true);
//                                             }}
//                                             onFocus={() => setShowModalProvinceDropdown(true)}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                         />
//                                         {showModalProvinceDropdown && (
//                                             <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                                                 {provinces
//                                                     .filter((province) =>
//                                                         province.name.toLowerCase().includes(modalProvinceSearchTag.toLowerCase())
//                                                     )
//                                                     .map((province) => (
//                                                         <div
//                                                             key={province.id}
//                                                             onClick={() => handleModalProvinceSelect(province)}
//                                                             className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                         >
//                                                             {province.name}
//                                                         </div>
//                                                     ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                     {errors.provinceId && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>
//                                 )}
//                                 </div>
//                             )}

//                             {/* City Dropdown in Modal (only shown if a province is selected) */}
//                             {modalSelectedProvinceId && (
//                                 <div className="mb-4" >
//                                     <label className="block text-sm font-medium text-gray-700">
//                                     {t("CITY")} *
//                                     </label>
//                                     <div className="relative" ref={cityDropdownRef}>
//                                         <input
//                                             type="text"
//                                             placeholder="Search city..."
//                                             value={modalCitySearchTag}
//                                             onChange={(e) => {
//                                                 setModalCitySearchTag(e.target.value);
//                                                 setShowModalCityDropdown(true);
//                                             }}
//                                             onFocus={() => setShowModalCityDropdown(true)}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                         />
//                                         {showModalCityDropdown && (
//                                             <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                                                 {cities
//                                                     .filter((city) =>
//                                                         city.name.toLowerCase().includes(modalCitySearchTag.toLowerCase())
//                                                     )
//                                                     .map((city) => (
//                                                         <div
//                                                             key={city.id}
//                                                             onClick={() => handleModalCitySelect(city)}
//                                                             className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                                                         >
//                                                             {city.name}
//                                                         </div>
//                                                     ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                     {errors.cityId && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.cityId}</p>
//                                 )}
//                                 </div>
//                             )}

//                             {/* Station Name (English) */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("ENGLISH_NAME")} *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={stationName.en}
//                                     onChange={(e) =>
//                                         setStationName({ ...stationName, en: e.target.value })
//                                     }
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 />
//                                 {errors.stationName?.en && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.stationName.en}</p>
//                                 )}
//                             </div>

//                             {/* Station Name (Pashto) */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("PASHTO_NAME")}
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={stationName.ps}
//                                     onChange={(e) =>
//                                         setStationName({ ...stationName, ps: e.target.value })
//                                     }
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 />
//                             </div>

//                             {/* Station Name (Farsi) */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("FARSI_NAME")}
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={stationName.fa}
//                                     onChange={(e) =>
//                                         setStationName({ ...stationName, fa: e.target.value })
//                                     }
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 />
//                             </div>

//                             {/* Station lat */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("STATION_LAT")} *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={stationLat}
//                                     onChange={(e) => setStationLat(e.target.value)}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"

//                                 />
//                                 {errors.stationLat && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.stationLat}</p>
//                                 )}
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">
//                                 {t("STATION_LONG")} *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={stationLong}
//                                     onChange={(e) => setStationLong(e.target.value)}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 />
//                                 {errors.stationLong && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.stationLong}</p>
//                                 )}
//                             </div>

//                             {/* Buttons */}
//                             <div className="flex justify-end gap-2">
//                                 <button
//                                     type="button"
//                                     onClick={resetModal}
//                                     className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                                 >
//                                     {t("CANCEL")}
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                                 >
//                                     {isEditMode ? t("UPDATE") : t("ADD")}

//                                 </button>
//                             </div>
//                         </form>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <StationFilter
//                 isOpen={isFilterOpen}
//                 onClose={() => setIsFilterOpen(false)}
//                 onApplyFilters={handleApplyFilters}
//             />
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStations,
  showStation,
  addStation,
  editStation,
  deleteStation,
} from "../../store/slices/stationSlice";
import { useTranslation } from "react-i18next";
import { SearchIcon, FunnelIcon } from "../../icons";
import StationTable from "./StationTable";
import StationForm from "./StationForm";
import StationFilter from "./StationFIlter";
import Pagination from "../../components/pagination/pagination";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useDebounce from "../../hooks/useDebounce";
import { getStationSchema } from "./ValidationSchema";
import { userType } from "../../utils/utils";

const StationList = () => {
  const dispatch = useDispatch();
  const { stations, selectedStation, loading, pagination } = useSelector(
    (state) => state.stations
  );
  const { t } = useTranslation();

  const [searchTag, setSearchTag] = useState("");
  const debouncedSearchTag = useDebounce(searchTag, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStationId, setCurrentStationId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [errors, setErrors] = useState({});
  const type = userType();

  const [formData, setFormData] = useState({
    stationName: { en: "", ps: "", fa: "" },
    stationLat: 0,
    stationLong: 0,
    countryId: null,
    provinceId: null,
    cityId: null,
  });

  const [searchTags, setSearchTags] = useState({
    country: "",
    province: "",
    city: "",
  });

  // Fetch stations with debounced search and filters
  useEffect(() => {
    dispatch(
      fetchStations({
        searchTag: debouncedSearchTag,
        page: currentPage,
        filters: activeFilters,
      })
    );
  }, [dispatch, debouncedSearchTag, currentPage, activeFilters]);

  const handleEditStation = (stationId) => {
    dispatch(showStation(stationId));
    setIsEditMode(true);
    setIsModalOpen(true);
    setCurrentStationId(stationId);
  };

  const handleSubmit = async (formData) => {
    try {
      // Validate form data
      await getStationSchema(t).validate(formData, { abortEarly: false });
      setErrors({});

      if (isEditMode) {
        const resultAction = await dispatch(
          editStation({ id: currentStationId, stationData: formData })
        );
        if (editStation.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("station.updateSuccess"),
          });
        } else {
          throw new Error(resultAction.payload || t("station.updateFailed"));
        }
      } else {
        const resultAction = await dispatch(addStation(formData));
        if (addStation.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("station.addSuccess"),
          });
          resetForm();
          setIsModalOpen(false);
        } else {
          throw new Error(resultAction.payload || t("station.addFailed"));
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          const path = err.path.split(".");
          if (path.length === 2) {
            if (!newErrors[path[0]]) newErrors[path[0]] = {};
            newErrors[path[0]][path[1]] = err.message;
          } else {
            newErrors[path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: error.message || t("station.operationFailed"),
        });
      }
    }
  };

  const handleDelete = (stationId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(deleteStation(stationId));
          if (deleteStation.fulfilled.match(deleteAction)) {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          }
          // Refresh the countries list
          dispatch(fetchStations({ searchTag: searchTag, page: currentPage }));
        } catch (error) {
          console.log(error);
          Swal.fire(
            t("ERROR"),
            error.message || t("FAILED_TO_DELETE_ITEM"),
            "error"
          );
        }
      }
    });
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData({
      stationName: { en: "", ps: "", fa: "" },
      stationLat: "",
      stationLong: "",
      countryId: null,
      provinceId: null,
      cityId: null,
    });
    setSearchTags({
      country: "",
      province: "",
      city: "",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Station Search and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("STATION_LIST")}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
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
          {type.role==="admin" &&(
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              setCurrentStationId(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_STATION")}
          </button>
          )}
        </div>
      </div>

      {/* Station Table */}
      <StationTable
        stations={stations}
        loading={loading}
        onEdit={handleEditStation}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Station Form Modal */}
      <StationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        initialData={selectedStation}
        errors={errors}
        setErrors={setErrors}
        formData={formData}
        setFormData={setFormData}
        searchTags={searchTags}
        setSearchTags={setSearchTags}
      />

      {/* Station Filter */}
      <StationFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default StationList;
