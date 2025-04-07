import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBusById, fetchBuses } from '../../store/slices/busSlice';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Edit, View } from '../../icons';
import { useTranslation } from 'react-i18next';

const BusList = () => {
    const [searchTag, setSearchTag] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { buses, loading } = useSelector((state) => state.buses);
    const {t}=useTranslation()

    useEffect(() => {
        dispatch(fetchBuses(searchTag));
    }, [dispatch, searchTag]);

    const handleEdit = (busId) => {
        navigate(`/add-bus/${busId}`); // Navigate to edit page with busId
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Bus Search and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("BUS_LIST")}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        className="rounded-md"
                        placeholder={t("SEARCH_BUS")}
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                    <button
                        onClick={() => navigate('/add-bus')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_BUS")}
                    </button>
                </div>
            </div>

            {/* Bus Table */}
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
                                {t("BUS_NO")}.
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("BUS_NAME")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("TICKET_PRICE")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("STATUS")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ACTION")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {buses.map((bus) => (
                                <TableRow key={bus.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className=''>
                                                <img className='w-14 h-12 rounded-md' src={bus.image} alt="" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {bus.bus_number}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {bus.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {bus.ticket_price}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {bus.status}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-row items-center justify-start gap-2">
                                            <Edit
                                                className="w-6 h-6 cursor-pointer"
                                                onClick={() => handleEdit(bus.id)}
                                            />
                                            <View className="w-6 h-6" />
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
};

export default BusList;