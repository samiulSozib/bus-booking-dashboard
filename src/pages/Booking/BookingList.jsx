import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../icons";
import { 
    fetchBookings, 
    getBookingDetails, 
    markBookingAsPaid, 
    cancelBooking, 
    downloadBookingTickets
} from "../../store/slices/bookingSlice";
import Pagination from "../../components/pagination/pagination";
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { userType } from "../../utils/utils";

export default function BookingList() {
    const dispatch = useDispatch();
    const { bookings, bookingDetails, loading, pagination } = useSelector((state) => state.bookings);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        from_date: "",
        to_date: "",
        customer_mobile: ""
    });
    const { t } = useTranslation();
    const navigate=useNavigate()
    const type=userType()

    useEffect(() => {
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('search', searchTerm);
        if (filters.status) params.append('status', filters.status);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.customer_mobile) params.append('customer_mobile', filters.customer_mobile);
        
        params.append('page', currentPage);
        
        dispatch(fetchBookings(params.toString()));
    }, [dispatch, searchTerm, filters, currentPage]);

    const handleViewDetails = (bookingId) => {
        dispatch(getBookingDetails(bookingId));
        setIsViewModalOpen(true);
    };

    const handleMarkAsPaid = async (bookingId) => {
        try {
            await dispatch(markBookingAsPaid(bookingId)).unwrap();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Booking marked as paid successfully!",
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error || "Failed to mark booking as paid",
            });
        }
    };

    const handleCancelBooking = async (bookingId) => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        });
    
        // Only proceed if user confirmed
        if (result.isConfirmed) {
            try {
                await dispatch(cancelBooking(bookingId)).unwrap();
                Swal.fire({
                    icon: "success",
                    title: "Cancelled!",
                    text: "Booking has been cancelled.",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error || "Failed to cancel booking",
                });
            }
        }
    };

    const handleDownload = (bookingId) => {
        dispatch(downloadBookingTickets(bookingId))
          .unwrap()
          .then(() => {
            // Success - file download should have started automatically
            Swal.fire('Success', 'Tickets downloaded successfully!', 'success');
          })
          .catch(error => {
            Swal.fire('Error', error || 'Failed to download tickets', 'error');
          });
      };

    const handleApplyFilters = () => {
        setIsFilterOpen(false);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleResetFilters = () => {
        setFilters({
            status: "",
            from_date: "",
            to_date: "",
            customer_mobile: ""
        });
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'paid': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'completed': 'bg-purple-100 text-purple-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* View Details Modal */}
            {isViewModalOpen && bookingDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">
                                {t("BOOKING_DETAILS")}
                            </h2>
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-white hover:text-indigo-200 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            {/* Customer and Booking Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        {t("CUSTOMER_INFO")}
                                    </h3>
                                    <div className="space-y-2 text-gray-700">
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {bookingDetails.user.first_name} {bookingDetails.user.last_name}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {bookingDetails.user.mobile}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {t("BOOKING_INFO")}
                                    </h3>
                                    <div className="space-y-2 text-gray-700">
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Booking #: {bookingDetails.trip.route.name}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Status: {getStatusBadge(bookingDetails.status)}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Amount: <span className="font-semibold ml-1">{bookingDetails.total_price}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Tickets Table */}
                            <div className="mb-8">
                                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                    {t("TICKETS")}
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bookingDetails.tickets.map((ticket, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {ticket.passenger.first_name} {ticket.passenger.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {ticket.seat_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {ticket.price}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t("CLOSE")}
                                </button>
                                <button
                                    onClick={() => {/* Add print or download functionality */}}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t("PRINT_TICKET")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Header and Search/Filter */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("BOOKING_LIST")}
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
                            placeholder={t("SEARCH_BOOKINGS")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

                    
                       
                    </div>
                    {(type.role==="vendor")&&(

                    
                    <button
                        onClick={() => navigate('/add-booking')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_BOOKING")}
                    </button>
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
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("ROUTES")}
                                </TableCell>
                                {/* <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("VENDOR")}
                                </TableCell> */}
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("AMOUNT")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("TICKET_COUNT")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("STATUS")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("BOOKED_AT")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("ACTION")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="py-3">
                                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {booking?.trip?.route?.name}
                                        </div>
                                    </TableCell>
                                    {/* <TableCell className="py-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {booking.customer_first_name} {booking.customer_last_name}
                                            </p>
                                            <p className="text-gray-500 text-xs">{booking.customer_mobile}</p>
                                        </div>
                                    </TableCell> */}
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {booking?.total_price}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {booking.ticket_count}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        {getStatusBadge(booking.status)}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {formatDate(booking.created_at)}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-row items-center justify-start gap-3">
                                            <View
                                                className="w-5 h-5 cursor-pointer text-blue-500"
                                                onClick={() => handleViewDetails(booking.id)}
                                            />
                                            {booking.status === 'unpaid' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(booking.id)}
                                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {['paid', 'confirmed'].includes(booking.status) && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {(type.role==="admin")&&(
                                                 <button
                                                 onClick={() => handleDownload(booking.id)}
                                                 className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                             >
                                                 Download
                                             </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Pagination */}
            {pagination && (
                <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            )}
        </div>
    );
}