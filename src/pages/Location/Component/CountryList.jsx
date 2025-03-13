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
import { Delete, Edit, View } from "../../../icons";
import { addCountry, editCountry, fetchCountries, showCountry } from "../../../store/slices/countrySlice";

// Validation schema
const countrySchema = Yup.object().shape({
    countryName: Yup.object().shape({
        en: Yup.string().required('English name is required'),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
    }),
    countryCode: Yup.string()
        .required('Country code is required')
        .matches(/^[A-Z]{3}$/, 'Country code must be exactly 3 uppercase letters'),
});

export default function CountryList() {
    const dispatch = useDispatch();
    const { countries, selectedCountry, loading } = useSelector((state) => state.countries);

    const [searchTag, setSearchTag] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCountryId, setCurrentCountryId] = useState(null);
    const [countryName, setCountryName] = useState({ en: "", ps: "", fa: "" });
    const [countryCode, setCountryCode] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchCountries(searchTag));
    }, [dispatch, searchTag]);

    useEffect(() => {
        if (selectedCountry) {
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
            await countrySchema.validate(countryData, { abortEarly: false });

            if (isEditing) {
                // Edit country
                await dispatch(editCountry({ countryId: currentCountryId, updatedData: countryData })).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Country updated successfully!',
                });
            } else {
                // Add country
                await dispatch(addCountry(countryData)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Country added successfully!',
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
                    const path = err.path.split('.');
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
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to add/update country. Please try again.',
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

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditing ? "Edit Country" : "Add Country"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* English Name (Compulsory) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    English Name (en) *
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
                                    Pashto Name (ps)
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
                                    Farsi Name (fa)
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
                                    Country Code
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
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Country List
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
                            setIsEditing(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        Add Country
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
                                            {/* <Delete className="w-6 h-6" />
                                            <View className="w-6 h-6"/> */}
                                        </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}