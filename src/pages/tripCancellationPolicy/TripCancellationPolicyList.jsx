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
} from "../../components/ui/table";
import { Edit, FunnelIcon, SearchIcon, PlusIcon, Delete } from "../../icons";
import { 
    fetchTripCancellationPolicy, 
    createOrUpdateTripCancellationPolicy,
} from "../../store/slices/tripCancellationPolicy";
import { fetchUsers } from "../../store/slices/userSlice";
import { useTranslation } from "react-i18next";

// Validation schema
const policySchema = Yup.object().shape({
    vendor_id: Yup.number().required("Vendor is required"),
    penalty_steps: Yup.array()
        .of(
            Yup.object().shape({
                hours: Yup.number()
                    .required("Hours is required")
                    .positive("Hours must be positive")
                    .integer("Hours must be an integer"),
                percentage: Yup.number()
                    .required("Percentage is required")
                    .min(0, "Percentage must be at least 0")
                    .max(100, "Percentage cannot exceed 100"),
            })
        )
        .required("At least one penalty step is required")
        .test(
            "unique-hours",
            "Hours values must be unique",
            function (steps) {
                const hours = steps.map(step => step.hours);
                return new Set(hours).size === hours.length;
            }
        ),
});

export default function TripCancellationPolicyList() {
    const dispatch = useDispatch();
    const { policy, loading, error } = useSelector((state) => state.tripCancellationPolicy);
    const { users } = useSelector((state) => state.users);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [penaltySteps, setPenaltySteps] = useState([{ hours: 0, percentage: 0 }]);
    const [errors, setErrors] = useState({});
    const { t } = useTranslation();
    
    // Vendor selection states
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [vendorSearchTerm, setVendorSearchTerm] = useState("");
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [modalVendorId, setModalVendorId] = useState(null);
    const [modalVendorSearchTerm, setModalVendorSearchTerm] = useState("");
    const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);

    // Fetch vendors when search term changes
    useEffect(() => {
        dispatch(fetchUsers({ searchTag: vendorSearchTerm, role: "vendor" }));
    }, [dispatch, vendorSearchTerm]);

    useEffect(() => {
        dispatch(fetchUsers({ searchTag: modalVendorSearchTerm, role: "vendor" }));
    }, [dispatch, modalVendorSearchTerm]);

    // Fetch policy when selected vendor changes
    useEffect(() => {
        if (selectedVendorId) {
            dispatch(fetchTripCancellationPolicy(selectedVendorId));
        }
    }, [dispatch, selectedVendorId]);

    // Set initial form values when policy is loaded
    useEffect(() => {
        if (policy) {
            setPenaltySteps(policy.penalty_steps || [{ hours: 0, percentage: 0 }]);
            setModalVendorId(policy.vendor_id);
        }
    }, [policy]);

    const openEditModal = () => {
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setPenaltySteps([{ hours: 0, percentage: 0 }]);
        setModalVendorId(selectedVendorId);
        setModalVendorSearchTerm(
            users.find(user => user.id === selectedVendorId)?.name || ""
        );
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const policyData = {
            vendor_id: modalVendorId,
            penalty_steps: penaltySteps,
        };

        try {
            await policySchema.validate(policyData, { abortEarly: false });

            await dispatch(createOrUpdateTripCancellationPolicy(policyData)).unwrap();

            Swal.fire({
                icon: "success",
                title: "Success",
                text: isEditMode ? "Policy updated successfully!" : "Policy created successfully!",
            });

            setIsModalOpen(false);
            setErrors({});
            
            // Refresh the policy after update/create
            if (modalVendorId === selectedVendorId) {
                dispatch(fetchTripCancellationPolicy(selectedVendorId));
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    const path = err.path.split(/[\[\].]+/).filter(Boolean);
                    if (path.length > 1) {
                        if (!newErrors[path[0]]) newErrors[path[0]] = [];
                        if (!newErrors[path[0]][path[1]]) newErrors[path[0]][path[1]] = {};
                        newErrors[path[0]][path[1]][path[2]] = err.message;
                    } else {
                        newErrors[path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Failed to save policy. Please try again.",
                });
            }
        }
    };

    const addPenaltyStep = () => {
        setPenaltySteps([...penaltySteps, { hours: 0, percentage: 0 }]);
    };

    const removePenaltyStep = (index) => {
        if (penaltySteps.length > 1) {
            const newSteps = [...penaltySteps];
            newSteps.splice(index, 1);
            setPenaltySteps(newSteps);
        }
    };

    const updatePenaltyStep = (index, field, value) => {
        const newSteps = [...penaltySteps];
        newSteps[index][field] = value;
        setPenaltySteps(newSteps);
    };

    // Handle vendor selection for viewing policy
    const handleVendorSelect = (vendor) => {
        setSelectedVendorId(vendor.id);
        setVendorSearchTerm(vendor.name);
        setShowVendorDropdown(false);
    };

    // Handle vendor selection in modal
    const handleModalVendorSelect = (vendor) => {
        setModalVendorId(vendor.id);
        setModalVendorSearchTerm(vendor.name);
        setShowModalVendorDropdown(false);
    };

    // Sort steps by hours in descending order for display
    const sortedSteps = policy?.penalty_steps 
        ? [...policy.penalty_steps].sort((a, b) => b.hours - a.hours) 
        : [];

  

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? t("EDIT_POLICY") : t("CREATE_POLICY")}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Vendor Dropdown in Modal */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("VENDOR")} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t("SEARCH_VENDOR")}
                                        value={modalVendorSearchTerm}
                                        onChange={(e) => {
                                            setModalVendorSearchTerm(e.target.value);
                                            setShowModalVendorDropdown(true);
                                        }}
                                        onFocus={() => setShowModalVendorDropdown(true)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {showModalVendorDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleModalVendorSelect(user?.vendor)}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {user?.vendor.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.vendor_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
                                )}
                            </div>

                            {/* Penalty Steps */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("PENALTY_STEPS")}
                                </label>
                                
                                {penaltySteps.map((step, index) => (
                                    <div key={index} className="flex gap-2 mb-3 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">
                                                {t("HOURS_BEFORE_TRIP")}
                                            </label>
                                            <input
                                                type="number"
                                                value={step.hours}
                                                onChange={(e) => updatePenaltyStep(index, 'hours', parseInt(e.target.value) || 0)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.penalty_steps?.[index]?.hours && (
                                                <p className="text-red-500 text-xs mt-1">{errors.penalty_steps[index].hours}</p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">
                                                {t("PENALTY_PERCENTAGE")}
                                            </label>
                                            <input
                                                type="number"
                                                value={step.percentage}
                                                onChange={(e) => updatePenaltyStep(index, 'percentage', parseFloat(e.target.value) || 0)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.penalty_steps?.[index]?.percentage && (
                                                <p className="text-red-500 text-xs mt-1">{errors.penalty_steps[index].percentage}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePenaltyStep(index)}
                                            className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                                            disabled={penaltySteps.length <= 1}
                                        >
                                            <Delete className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={addPenaltyStep}
                                    className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    {t("ADD_PENALTY_STEP")}
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {t("CANCEL")}
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isEditMode ? t("UPDATE") : t("SAVE")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vendor Selection and Action Buttons */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Header */}
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {t("TRIP_CANCELLATION_POLICY")}
                    </h3>
                </div>

                {/* Search and Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:flex-nowrap">
                    {/* Search Input + Dropdown */}
                    <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder={t("SEARCH_VENDOR")}
                        value={vendorSearchTerm}
                        onChange={(e) => {
                        setVendorSearchTerm(e.target.value);
                        setShowVendorDropdown(true);
                        }}
                        onFocus={() => setShowVendorDropdown(true)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showVendorDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {users.map((user) => (
                            <div
                            key={user.id}
                            onClick={() => handleVendorSelect(user?.vendor)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                            {user?.vendor.name}
                            </div>
                        ))}
                        </div>
                    )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                    {selectedVendorId && policy && (
                        <button
                        onClick={openEditModal}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-300 px-4 py-2.5 text-sm font-medium text-black shadow hover:bg-gray-50 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                        <Edit className="h-4 w-4" />
                        {t("EDIT_POLICY")}
                        </button>
                    )}
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-sm font-medium text-black shadow hover:bg-gray-50 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        <PlusIcon className="h-4 w-4" />
                        {t("CREATE_POLICY")}
                    </button>
                    </div>
                </div>
            </div>

            

            {/* Policy Display */}
            <div className="max-w-full overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 p-4">{error}</div>
                ) : policy ? (
                    <>
                        <div className="mb-4">
                            <h4 className="text-md font-semibold">
                                {t("POLICY_FOR_VENDOR")}: {users.find(u => u.id === selectedVendorId)?.name || selectedVendorId}
                            </h4>
                        </div>
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        {t("HOURS_BEFORE_TRIP")}
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        {t("PENALTY_PERCENTAGE")}
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {sortedSteps.map((step, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="py-3">
                                            {step.hours} {t("HOURS")}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {step.percentage}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : selectedVendorId ? (
                    <div className="text-gray-500 p-4">
                        {t("NO_CANCELLATION_POLICY_SET")}
                    </div>
                ) : (
                    <div className="text-gray-500 p-4">
                        {t("SELECT_VENDOR_TO_VIEW_POLICY")}
                    </div>
                )}
            </div>
        </div>
    );
}