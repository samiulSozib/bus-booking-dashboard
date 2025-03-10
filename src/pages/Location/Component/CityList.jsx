import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { _fetchCountries } from "../../../redux/actions/countriesActions";
import { _fetchProvinces } from "../../../redux/actions/provinceAction";
import { Delete, Edit, View } from "../../../icons";
import { _fetchCities, _addCity, _editCity, _showCity } from "../../../redux/actions/cityAction";

export default function CityList() {
    const dispatch = useDispatch();
    const { countries } = useSelector((state) => state.countriesReducer);
    const { provinces } = useSelector((state) => state.provinceReducer);
    const { cities,selectedCity } = useSelector((state) => state.cityReducer);

    // State for table filtering
    const [searchTag, setSearchTag] = useState("");
    const [selectedCountryId, setSelectedCountryId] = useState(null);
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [countrySearchTag, setCountrySearchTag] = useState(""); // For country dropdown search
    const [provinceSearchTag, setProvinceSearchTag] = useState(""); // For province dropdown search

    // State for Add/Edit City Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // Track if modal is in edit mode
    const [cityName, setCityName] = useState({ en: "", ps: "", fa: "" });
    const [cityCode, setCityCode] = useState("");
    const [currentCityId,setCurrentCityId]=useState(null)
    const [modalCountrySearchTag, setModalCountrySearchTag] = useState("");
    const [modalProvinceSearchTag, setModalProvinceSearchTag] = useState("");
    const [modalSelectedCountryId, setModalSelectedCountryId] = useState(null);
    const [modalSelectedProvinceId, setModalSelectedProvinceId] = useState(null);
    const [showModalCountryDropdown, setShowModalCountryDropdown] = useState(false);
    const [showModalProvinceDropdown, setShowModalProvinceDropdown] = useState(false);

    // Fetch countries on component mount
    useEffect(() => {
        dispatch(_fetchCountries());
    }, [dispatch]);

    // Fetch provinces when a country is selected (for table filtering)
    useEffect(() => {
        if (selectedCountryId) {
            dispatch(_fetchProvinces(selectedCountryId));
        }
    }, [dispatch, selectedCountryId]);

    // Fetch provinces when a country is selected in the modal
    useEffect(() => {
        if (modalSelectedCountryId) {
            dispatch(_fetchProvinces(modalSelectedCountryId));
        }
    }, [dispatch, modalSelectedCountryId]);

    // Fetch cities when a province is selected (for table filtering)
    useEffect(() => {
        if (selectedProvinceId) {
            dispatch(_fetchCities(selectedProvinceId, searchTag));
        }
    }, [dispatch, selectedProvinceId, searchTag]);

    //
    useEffect(()=>{
        if(selectedCity){
            setCityName({ en: selectedCity.name.en, ps: selectedCity.name.ps, fa: selectedCity.name.fa });
            setCityCode(selectedCity.code);
        }
    },[dispatch,selectedCity])

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
    };

    // Handle province selection in modal
    const handleModalProvinceSelect = (province) => {
        setModalSelectedProvinceId(province.id);
        setModalProvinceSearchTag(province.name);
        setShowModalProvinceDropdown(false);
    };

    // Handle add/edit city form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!modalSelectedCountryId || !modalSelectedProvinceId || !cityName.en.trim()) {
            alert("Please fill all required fields.");
            return;
        }

        const cityData = {
            cityName,
            cityCode,
            provinceId: modalSelectedProvinceId,
        };

        if (isEditMode) {
            dispatch(_editCity(currentCityId,cityData));
        } else {
            dispatch(_addCity(cityData));
        }

        // Reset modal state
        resetModal();
    };

    // Reset modal state
    const resetModal = () => {
        setIsEditMode(false);
        setCityName({ en: "", ps: "", fa: "" });
        setCityCode("");
        setModalSelectedCountryId(null);
        setModalSelectedProvinceId(null);
        setIsModalOpen(false);
        setCurrentCityId(null)
        setCurrentCityId(null)
    };

    // Handle edit city button click
    const handleEditCity = (cityId) => {
        dispatch(_showCity(cityId))
        setIsEditMode(true);
        setSelectedCountryId(null)
        setSelectedProvinceId(null)
        setIsModalOpen(true);
        setCurrentCityId(cityId)
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* City Search and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        City List
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        className="rounded-md"
                        placeholder="Search city..."
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        Add City
                    </button>
                </div>
            </div>

            {/* Table Filtering Section */}
            <div className="flex flex-row items-center justify-end gap-3 mb-4">
                {/* Country Dropdown */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearchTag}
                        onChange={(e) => {
                            setCountrySearchTag(e.target.value);
                            setShowCountryDropdown(true);
                        }}
                        onFocus={() => setShowCountryDropdown(true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
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
                        <input
                            type="text"
                            placeholder="Search province..."
                            value={provinceSearchTag}
                            onChange={(e) => {
                                setProvinceSearchTag(e.target.value);
                                setShowProvinceDropdown(true);
                            }}
                            onFocus={() => setShowProvinceDropdown(true)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
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

            {/* City Table */}
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Name
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Code
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cities.map((city) => (
                            <TableRow key={city.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {city.name}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {city.code}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex flex-row items-center justify-start gap-2">
                                        <Edit
                                            className="w-6 h-6 cursor-pointer"
                                            onClick={() => handleEditCity(city.id)}
                                        />
                                        <Delete className="w-6 h-6" />
                                        <View className="w-6 h-6" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit City Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? "Edit City" : "Add City"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Country Dropdown in Modal */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Country *
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
                            </div>

                            {/* Province Dropdown in Modal (only shown if a country is selected) */}
                            {modalSelectedCountryId && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Province *
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
                                </div>
                            )}

                            {/* City Name (English) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    City Name (en) *
                                </label>
                                <input
                                    type="text"
                                    value={cityName.en}
                                    onChange={(e) =>
                                        setCityName({ ...cityName, en: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* City Name (Pashto) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    City Name (ps)
                                </label>
                                <input
                                    type="text"
                                    value={cityName.ps}
                                    onChange={(e) =>
                                        setCityName({ ...cityName, ps: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* City Name (Farsi) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    City Name (fa)
                                </label>
                                <input
                                    type="text"
                                    value={cityName.fa}
                                    onChange={(e) =>
                                        setCityName({ ...cityName, fa: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* City Code */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    City Code *
                                </label>
                                <input
                                    type="text"
                                    value={cityCode}
                                    onChange={(e) => setCityCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isEditMode ? "Update" : "Add"}
                               

                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}