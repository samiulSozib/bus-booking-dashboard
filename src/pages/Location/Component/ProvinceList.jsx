import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Delete, Edit, Search, SearchIcon, View } from "../../../icons";
import { fetchCountries } from "../../../store/slices/countrySlice";
import { addProvince, editProvince, fetchProvinces, showProvince } from "../../../store/slices/provinceSlice";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/pagination/pagination";

// Yup validation schema
const provinceSchema = Yup.object().shape({
    provinceName: Yup.object().shape({
        en: Yup.string().required('English name is required'),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
    }),
    provinceCode: Yup.string()
        .required('Province code is required')
        .matches(/^[A-Z]{2,3}$/, 'Province code must be 2-3 uppercase letters'),
    countryId: Yup.string().required('Country is required'),
});

export default function ProvinceList() {
    const dispatch = useDispatch();
    const { countries } = useSelector((state) => state.countries);
    const { provinces, selectedProvince, loading,pagination } = useSelector((state) => state.provinces);

    const [searchTag, setSearchTag] = useState("");
    const [countrySearchTag, setCountrySearchTag] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProvinceId, setCurrentProvinceId] = useState(null);
    const [selectedCountryId, setSelectedCountryId] = useState(null);

    const [provinceName, setProvinceName] = useState({ en: "", ps: "", fa: "" });
    const [provinceCode, setProvinceCode] = useState("");
    const [errors, setErrors] = useState({});

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const {t}=useTranslation()
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        dispatch(fetchProvinces({ countryId: selectedCountryId, searchTag: searchTag,page:currentPage }));
    }, [dispatch,currentPage, selectedCountryId, searchTag]);

    useEffect(() => {
        dispatch(fetchCountries({searchTag:countrySearchTag}));
    }, [dispatch, countrySearchTag]);

    useEffect(() => {
        if (selectedProvince) {
            setProvinceName({ en: selectedProvince.name.en, ps: selectedProvince.name.ps, fa: selectedProvince.name.fa });
            setProvinceCode(selectedProvince.code);
            setSelectedCountryId(selectedProvince.countryId);
            
        }
    }, [selectedProvince]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const provinceData = {
            provinceName,
            provinceCode,
            countryId: selectedCountryId,
        };

        try {
            // Validate form data using Yup
            await provinceSchema.validate(provinceData, { abortEarly: false });

            if (isEditing) {
                // Edit province
                await dispatch(editProvince({ provinceId: currentProvinceId, updatedData: provinceData })).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Province updated successfully!',
                });
            } else {
                // Add province
                await dispatch(addProvince(provinceData)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Province added successfully!',
                });
            }

            // Reset form and close modal
            setProvinceName({ en: "", ps: "", fa: "" });
            setProvinceCode("");
            setSelectedCountryId(null);
            setIsModalOpen(false);
            setIsEditing(false);
            setCurrentProvinceId(null);
            setErrors({}); // Clear errors
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                // Yup validation errors
                const newErrors = {};
                error.inner.forEach((err) => {
                    const path = err.path.split('.');
                    if (path.length === 2) {
                        // Handle nested fields (e.g., provinceName.en)
                        if (!newErrors[path[0]]) newErrors[path[0]] = {};
                        newErrors[path[0]][path[1]] = err.message;
                    } else {
                        // Handle top-level fields (e.g., provinceCode)
                        newErrors[path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                // API or other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error || 'Failed to add/update province. Please try again.',
                });
            }
        }
    };

    const handleEdit = (provinceId) => {
        dispatch(showProvince(provinceId));
        setIsEditing(true);
        setCurrentProvinceId(provinceId);
        setIsModalOpen(true);
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
                            {isEditing ? t("EDIT_PROVINCE") : t("ADD_PROVINCE")}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Province Name (Compulsory) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ENGLISH_NAME")} *
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.en}
                                    onChange={(e) => setProvinceName({ ...provinceName, en: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.provinceName?.en && (
                                    <p className="text-red-500 text-sm mt-1">{errors.provinceName.en}</p>
                                )}
                            </div>

                            {/* Pashto Name (Optional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("PASHTO_NAME")}
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.ps}
                                    onChange={(e) => setProvinceName({ ...provinceName, ps: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Farsi Name (Optional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("FARSI_NAME")}
                                </label>
                                <input
                                    type="text"
                                    value={provinceName.fa}
                                    onChange={(e) => setProvinceName({ ...provinceName, fa: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Province Code */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("PROVINCE_CODE")} *
                                </label>
                                <input
                                    type="text"
                                    value={provinceCode}
                                    onChange={(e) => setProvinceCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.provinceCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.provinceCode}</p>
                                )}
                            </div>

                            {/* Country ID (Searchable Dropdown) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("COUNTRY")} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t("SEARCH_COUNTRY")}
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
                                {errors.countryId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.countryId}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProvinceName({ en: "", ps: "", fa: "" });
                                        setProvinceCode("");
                                        setIsModalOpen(false);
                                        setIsEditing(false);
                                        setCurrentProvinceId(null);
                                        setErrors({}); // Clear errors
                                    }}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {t("CANCEL")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading} // Disable button while loading
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    
                                    {isEditing ? t("UPDATE") : t("ADD")}
                                    
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
                        {t("PROVINCE_LIST")}
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
                            prefix=""
                            onChange={(e) => setSearchTag(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsEditing(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_PROVINCE")}
                    </button>
                </div>
            </div>

            <hr />

            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-end mt-1">
                <div className="relative">
                    <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon/>
                            </div>
                    <input
                        type="text"
                        placeholder={t("SEARCH_COUNTRY")}
                        value={countrySearchTag}
                        onChange={(e) => {
                            setCountrySearchTag(e.target.value);
                            setShowCountryDropdown(true); // Show dropdown when typing
                        }}
                        onFocus={() => setShowCountryDropdown(true)} // Show dropdown when input is focused
                        className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    {showCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {countries.map((country) => (
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
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
                ) : (
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    {t("PROVINCE_NAME")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    {t("PROVINCE_CODE")}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    {t("ACTION")}
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
                                                    {province.name}
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
                                                onClick={() => handleEdit(province.id)}
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
             {/* Pagination */}
            <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}