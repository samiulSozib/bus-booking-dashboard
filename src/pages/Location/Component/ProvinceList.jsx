import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { useEffect } from "react";
import { _fetchCountries, _addCountry, _editCountry, _showCountry } from "../../../redux/actions/countriesActions";
import { Delete, Edit, View } from "../../../icons";
import { _addProvince, _editProvince, _fetchProvinces, _showProvince } from "../../../redux/actions/provinceAction";

export default function ProvinceList() {
    const dispatch = useDispatch();
    const { countries} = useSelector((state) => state.countriesReducer);
    const { provinces,selectedProvince } = useSelector((state) => state.provinceReducer);

    const [searchTag, setSearchTag] = useState("");
    const [countrySearchTag, setCountrySearchTag] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProvinceId, setCurrentProvinceId] = useState(null);
    const [selectedCountryId, setSelectedCountryId] = useState(null);

    const [provinceName, setProvinceName] = useState({ en: "", ps: "", fa: "" });
    const [provinceCode, setProvinceCode] = useState("");

    const [showCountryDropdown, setShowCountryDropdown] = useState(false); // State to control dropdown visibility

    useEffect(() => {
        dispatch(_fetchProvinces(selectedCountryId, searchTag));
    }, [dispatch,selectedCountryId, searchTag]);

    useEffect(() => {
        dispatch(_fetchCountries(countrySearchTag));
    }, [dispatch, countrySearchTag]);

    useEffect(()=>{
        console.log(selectedCountryId)
    },[dispatch,selectedCountryId])

    useEffect(() => {
        if (selectedProvince) {
            setProvinceName({ en: selectedProvince.name.en, ps: selectedProvince.name.ps, fa: selectedProvince.name.fa });
            setProvinceCode(selectedProvince.code);
            setSelectedCountryId(null)
        }
    }, [selectedProvince]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!provinceName.en.trim()) {
            alert("English name is required!");
            return;
        }

        const provinceData = {
            provinceName,
            provinceCode,
            countryId: selectedCountryId,
        };

        if (isEditing) {
            dispatch(_editProvince(currentProvinceId, provinceData));
        } else {
            dispatch(_addProvince(provinceData));
        }

        setProvinceName({ en: "", ps: "", fa: "" });
        setProvinceCode("");
        setSelectedCountryId(null);
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentProvinceId(null);
    };

    const handleEdit = (provinceId) => {
        dispatch(_showProvince(provinceId))
        setIsEditing(true)
        setCurrentProvinceId(provinceId)
        setIsModalOpen(true)
    };

    const handleCountrySelect = (country) => {
        setSelectedCountryId(country.id);
        setCountrySearchTag(country.name); // Set the selected country name in the search input
        setShowCountryDropdown(false); // Hide the dropdown after selection
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditing ? "Edit Province" : "Add Province"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Province Name (Compulsory) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Province Name (en) *
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.en}
                                    onChange={(e) =>
                                        setProvinceName({ ...provinceName, en: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Pashto Name (Optional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pashto Name (ps)
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.ps}
                                    onChange={(e) =>
                                        setProvinceName({ ...provinceName, ps: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Farsi Name (Optional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Farsi Name (fa)
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.fa}
                                    onChange={(e) =>
                                        setProvinceName({ ...provinceName, fa: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Province Code */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Province Code
                                </label>
                                <input
                                    type="text"
                                    value={provinceCode}
                                    onChange={(e) => setProvinceCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Country ID (Searchable Dropdown) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Country *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={countrySearchTag}
                                        onChange={(e) => {
                                            setCountrySearchTag(e.target.value);
                                            setShowCountryDropdown(true); // Show dropdown when typing
                                        }}
                                        onFocus={() => setShowCountryDropdown(true)} // Show dropdown when input is focused
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
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsEditing(false); // Reset edit mode
                                        setCurrentProvinceId(null); // Reset current province ID
                                    }}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isEditing ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Header and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Province List
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        className="rounded-md"
                        placeholder="Search"
                        prefix=""
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsEditing(false); // Ensure modal is in add mode
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        Add Province
                    </button>
                </div>
            </div>

            <hr />

            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-end mt-1">
                
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearchTag}
                        onChange={(e) => {
                            setCountrySearchTag(e.target.value);
                            setShowCountryDropdown(true); // Show dropdown when typing
                        }}
                        onFocus={() => setShowCountryDropdown(true)} // Show dropdown when input is focused
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {countries
                                
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

                

            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Code
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {provinces.map((province) => (
                            <TableRow key={province.id} className="">
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {province.name} {/* Display English name by default */}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {province.code}
                                </TableCell>

                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex flex-row items-center justify-start gap-2">
                                        <Edit
                                            className="w-6 h-6 cursor-pointer"
                                            onClick={() => handleEdit(province.id)} // Handle edit button click
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
        </div>
    );
}