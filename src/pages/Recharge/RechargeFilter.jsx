import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons";
import { formatForDisplayDiscount, formatForInputDiscount, formatToYMD, userType } from "../../utils/utils";
import { fetchTrips } from "../../store/slices/tripSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import Select from 'react-select';

const RechargeFilter = ({ isOpen, onClose, onApplyFilters }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const type=userType()

    // Filter states
    const [filters, setFilters] = useState({
        from_date: "",
        to_date: ""
    });





    // Handle date changes
    const handleFromDateChange = (e) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            from_date: (e.target.value),
        }));
    };

    const handleToDateChange = (e) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            to_date: (e.target.value),
        }));
    };

    // Apply filters
    const handleApplyFilters = () => {
        const appliedFilters = {
            "fromDate": formatToYMD(filters.from_date),
            "toDate": formatToYMD(filters.to_date)
        };
        onApplyFilters(appliedFilters);
        onClose();
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            from_date: "",
            to_date: ""
        });
        onApplyFilters({});
        onClose();
    };




    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="relative z-50 bg-white rounded-r-lg shadow-xl w-96 h-full overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{t("FILTERS")}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4">
                   

                    {/* From DateTime Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("from_date")}</label>
                        <input
                            type="datetime-local"
                            value={filters.from_date}
                            onChange={handleFromDateChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* To DateTime Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("to_date")}</label>
                        <input
                            type="datetime-local"
                            value={filters.to_date}
                            onChange={handleToDateChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {t("RESET")}
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            {t("APPLY_FILTERS")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RechargeFilter;