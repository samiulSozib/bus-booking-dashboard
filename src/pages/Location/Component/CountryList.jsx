import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../../icons"; // Add FunnelIcon
import { addCountry, editCountry, fetchCountries, showCountry } from "../../../store/slices/countrySlice";
import Pagination from "../../../components/pagination/pagination";
import { useTranslation } from "react-i18next";

// Validation schema
const getCountrySchema = (t) =>
    Yup.object().shape({
      countryName: Yup.object().shape({
        en: Yup.string().required(t('country.englishNameRequired')),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
      }),
      countryCode: Yup.string()
        .required(t('country.codeRequired'))
        .matches(/^[A-Z]{3}$/, t('country.codeInvalid')),
    });
  

export default function CountryList() {
    const dispatch = useDispatch();
    const { countries, selectedCountry, loading,pagination } = useSelector((state) => state.countries);

    const [searchTag, setSearchTag] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCountryId, setCurrentCountryId] = useState(null);
    const [countryName, setCountryName] = useState({ en: "", ps: "", fa: "" });
    const [countryCode, setCountryCode] = useState("");
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // State for filter dropdown
    // const [filters, setFilters] = useState({ searchTag: "", code: "" }); // State for filters
    const [filters, setFilters] = useState({}); // State for filters
    const {t}=useTranslation()

    useEffect(() => {
        dispatch(fetchCountries({searchTag:searchTag,page:currentPage}));
    }, [dispatch, searchTag, currentPage]);

    useEffect(() => {
        if (selectedCountry && isEditing) {
            setCountryName({ en: selectedCountry.name.en, ps: selectedCountry.name.ps, fa: selectedCountry.name.fa });
            setCountryCode(selectedCountry.code);
        }
    }, [selectedCountry]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const countryData = {
            countryName,
            countryCode,
        };

        try {
            // Validate form data using Yup
            await getCountrySchema(t).validate(countryData, { abortEarly: false });

            if (isEditing) {
                // Edit country
                await dispatch(editCountry({ countryId: currentCountryId, updatedData: countryData })).unwrap();
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Country updated successfully!",
                });
            } else {
                // Add country
                await dispatch(addCountry(countryData)).unwrap();
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Country added successfully!",
                });
            }

            // Reset form and close modal
            setCountryName({ en: "", ps: "", fa: "" });
            setCountryCode("");
            setIsModalOpen(false);
            setIsEditing(false);
            setCurrentCountryId(null);
            setErrors({}); // Clear errors
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                // Yup validation errors
                const newErrors = {};
                error.inner.forEach((err) => {
                    const path = err.path.split(".");
                    if (path.length === 2) {
                        // Handle nested fields (e.g., countryName.en)
                        if (!newErrors[path[0]]) newErrors[path[0]] = {};
                        newErrors[path[0]][path[1]] = err.message;
                    } else {
                        // Handle top-level fields (e.g., countryCode)
                        newErrors[path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                // API or other errors
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Failed to add/update country. Please try again.",
                });
            }
        }
    };

    const handleEdit = (countryId) => {
        dispatch(showCountry(countryId));
        setIsEditing(true);
        setCurrentCountryId(countryId);
        setIsModalOpen(true);
    };

    const handleApplyFilters = () => {
        setIsFilterOpen(false); // Close filter dropdown
    };

    const handleResetFilters = () => {
        setFilters({ searchTag: "", code: "" }); // Reset filters
        setIsFilterOpen(false); // Close filter dropdown
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditing ? t("EDIT_COUNTRY") : t("ADD_COUNTRY")}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* English Name (Compulsory) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ENGLISH_NAME")} *
                                </label>
                                <input
                                    type="text"
                                    value={countryName.en}
                                    onChange={(e) => setCountryName({ ...countryName, en: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.countryName?.en && (
                                    <p className="text-red-500 text-sm mt-1">{errors.countryName.en}</p>
                                )}
                            </div>

                            {/* Pashto Name (Optional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("PASHTO_NAME")}
                                </label>
                                <input
                                    type="text"
                                    value={countryName.ps}
                                    onChange={(e) => setCountryName({ ...countryName, ps: e.target.value })}
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
                                    value={countryName.fa}
                                    onChange={(e) => setCountryName({ ...countryName, fa: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Country Code */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("COUNTRY_CODE")}
                                </label>
                                <input
                                    type="text"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.countryCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.countryCode}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCountryName({ en: "", ps: "", fa: "" });
                                        setCountryCode("");
                                        setIsModalOpen(false);
                                        setIsEditing(false);
                                        setCurrentCountryId(null);
                                        setErrors({}); // Clear errors
                                    }}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {t("CANCEL")}
                                </button>
                                <button
                                    type="submit"
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
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("COUNTRY_LIST")}
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
                            value={filters.searchTag}
                            onChange={(e) => setSearchTag(e.target.value)}
                        />
                    </div>

                    {/* Filter Button and Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                            <FunnelIcon className="h-5 w-5" />
                            {t("FILTER")}
                        </button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-4 space-y-4">
                                    {/* Search Tag Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Search Tag
                                        </label>
                                        <input
                                            type="text"
                                            value={filters.searchTag}
                                            onChange={(e) => setFilters({ ...filters, searchTag: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    {/* Country Code Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Country Code
                                        </label>
                                        <input
                                            type="text"
                                            value={filters.code}
                                            onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Filter Buttons */}
                                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        onClick={handleResetFilters}
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Country Button */}
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsEditing(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_COUNTRY")}
                    </button>
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
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("COUNTRY_NAME")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("COUNTRY_CODE")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ACTION")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {countries.map((country) => (
                                <TableRow key={country.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {country.name}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {country.code}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-row items-center justify-start gap-2">
                                            <Edit
                                                className="w-6 h-6 cursor-pointer"
                                                onClick={() => handleEdit(country.id)}
                                            />
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