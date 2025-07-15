import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons";
import { formatForDisplayDiscount, formatForInputDiscount, formatToYMD, userType } from "../../utils/utils";
import { fetchTrips } from "../../store/slices/tripSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import Select from 'react-select';

const BusFilter = ({ isOpen, onClose, onApplyFilters }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { vendorList, loading: vendorsLoading } = useSelector((state) => state.users);

    const type=userType()

    useEffect(()=>{
        console.log(vendorList)
    },[dispatch,vendorList])

    // Filter states
    const [filters, setFilters] = useState({
        vendor_id: null,
    });


    const [vendorSearchTerm, setVendorSearchTerm] = useState("");

    
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    

    // Fetch initial data
    useEffect(() => {
        dispatch(fetchTrips({}));
        if (type?.role === 'admin') {
            dispatch(fetchUsers({ role: 'vendor' }));
        }
    }, [dispatch, type?.role]);

    

    // Fetch vendors when search term changes (only for admin)
    useEffect(() => {
        if (type?.role === 'admin') {
            const timer = setTimeout(() => {
                dispatch(fetchUsers({ 
                    role: 'vendor',
                    searchTag: vendorSearchTerm 
                }));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [dispatch, vendorSearchTerm, type?.role]);

    

    // Handle vendor selection (only for admin)
    const handleVendorSelect = (selectedOption) => {
        setSelectedVendorId(selectedOption?.value || null);
        setFilters(prevFilters => ({
            ...prevFilters,
            vendor_id: selectedOption?.value || null
        }));
    };

   

    // Apply filters
    const handleApplyFilters = () => {
        const appliedFilters = {
            "trip-id": filters.trip_id,
            "vendor-id": filters.vendor_id,
            "from-date": formatToYMD(filters.from_date),
            "to-date": formatToYMD(filters.to_date)
        };
        onApplyFilters(appliedFilters);
        onClose();
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            vendor_id: null,
        });
        setSelectedVendorId(null);
        onApplyFilters({});
        onClose();
    };

    
    // Format vendors for react-select (only for admin)
    const vendorOptions = vendorList.map(vendor => ({
        value: vendor?.vendor?.id,
        label: `${vendor?.vendor?.name} (${vendor?.vendor?.email})`
    }));

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
                    {/* Vendor Filter (only for admin) */}
                    {type?.role === 'admin' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("VENDOR")}</label>
                            <Select
                                options={vendorOptions}
                                value={vendorOptions.find(option => option.value === selectedVendorId)}
                                onChange={handleVendorSelect}
                                onInputChange={setVendorSearchTerm}
                                placeholder={t('booking.searchVendor')}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                isSearchable
                                isLoading={vendorsLoading}
                                noOptionsMessage={() => t('booking.noVendorsFound')}
                            />
                        </div>
                    )}

                   

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

export default BusFilter;