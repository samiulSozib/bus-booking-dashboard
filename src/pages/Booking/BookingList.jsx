// import { useDispatch, useSelector } from "react-redux";
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHeader,
//     TableRow,
// } from "../../../components/ui/table";
// import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../../icons";
// import { 
//     fetchBookings, 
//     getBookingDetails, 
//     markBookingAsPaid, 
//     cancelBooking 
// } from "../../../store/slices/bookingSlice";
// import Pagination from "../../../components/pagination/pagination";
// import { useTranslation } from "react-i18next";
// import { format } from 'date-fns';

// export default function BookingList() {
//     const dispatch = useDispatch();
//     const { bookings, bookingDetails, loading, pagination } = useSelector((state) => state.bookings);

//     const [searchTerm, setSearchTerm] = useState("");
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//     const [currentBookingId, setCurrentBookingId] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [currentPage, setCurrentPage] = useState(1);
//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const [filters, setFilters] = useState({
//         status: "",
//         from_date: "",
//         to_date: "",
//         customer_mobile: ""
//     });
//     const { t } = useTranslation();

//     useEffect(() => {
//         const params = new URLSearchParams();
        
//         if (searchTerm) params.append('search', searchTerm);
//         if (filters.status) params.append('status', filters.status);
//         if (filters.from_date) params.append('from_date', filters.from_date);
//         if (filters.to_date) params.append('to_date', filters.to_date);
//         if (filters.customer_mobile) params.append('customer_mobile', filters.customer_mobile);
        
//         params.append('page', currentPage);
        
//         dispatch(fetchBookings(params.toString()));
//     }, [dispatch, searchTerm, filters, currentPage]);

//     const handleViewDetails = (bookingId) => {
//         dispatch(getBookingDetails(bookingId));
//         setCurrentBookingId(bookingId);
//         setIsViewModalOpen(true);
//     };

//     const handleMarkAsPaid = async (bookingId) => {
//         try {
//             await dispatch(markBookingAsPaid(bookingId)).unwrap();
//             Swal.fire({
//                 icon: "success",
//                 title: "Success",
//                 text: "Booking marked as paid successfully!",
//             });
//         } catch (error) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Error",
//                 text: error || "Failed to mark booking as paid",
//             });
//         }
//     };

//     const handleCancelBooking = async (bookingId) => {
//         try {
//             await dispatch(cancelBooking(bookingId)).unwrap();
//             Swal.fire({
//                 icon: "success",
//                 title: "Success",
//                 text: "Booking cancelled successfully!",
//             });
//         } catch (error) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Error",
//                 text: error || "Failed to cancel booking",
//             });
//         }
//     };

//     const handleApplyFilters = () => {
//         setIsFilterOpen(false);
//         setCurrentPage(1); // Reset to first page when filters change
//     };

//     const handleResetFilters = () => {
//         setFilters({
//             status: "",
//             from_date: "",
//             to_date: "",
//             customer_mobile: ""
//         });
//         setIsFilterOpen(false);
//         setCurrentPage(1);
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '-';
//         return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
//     };

//     const getStatusBadge = (status) => {
//         const statusClasses = {
//             'pending': 'bg-yellow-100 text-yellow-800',
//             'confirmed': 'bg-blue-100 text-blue-800',
//             'paid': 'bg-green-100 text-green-800',
//             'cancelled': 'bg-red-100 text-red-800',
//             'completed': 'bg-purple-100 text-purple-800'
//         };
        
//         return (
//             <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
//                 {status}
//             </span>
//         );
//     };

//     return (
//         <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
//             {/* View Details Modal */}
//             {isViewModalOpen && bookingDetails && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                         <h2 className="text-lg font-semibold mb-4">
//                             {t("BOOKING_DETAILS")}
//                         </h2>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                             <div>
//                                 <h3 className="font-medium text-gray-700">{t("CUSTOMER_INFO")}</h3>
//                                 <p>{bookingDetails.customer_first_name} {bookingDetails.customer_last_name}</p>
//                                 <p>{bookingDetails.customer_mobile}</p>
//                             </div>
                            
//                             <div>
//                                 <h3 className="font-medium text-gray-700">{t("BOOKING_INFO")}</h3>
//                                 <p>Booking #: {bookingDetails.booking_reference}</p>
//                                 <p>Status: {getStatusBadge(bookingDetails.status)}</p>
//                                 <p>Amount: {bookingDetails.total_amount} {bookingDetails.currency}</p>
//                             </div>
//                         </div>
                        
//                         <h3 className="font-medium text-gray-700 mb-2">{t("TICKETS")}</h3>
//                         <div className="border rounded-lg overflow-hidden">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
//                                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
//                                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {bookingDetails.tickets.map((ticket, index) => (
//                                         <tr key={index}>
//                                             <td className="px-4 py-2 whitespace-nowrap">{ticket.passenger_name}</td>
//                                             <td className="px-4 py-2 whitespace-nowrap">{ticket.seat_number}</td>
//                                             <td className="px-4 py-2 whitespace-nowrap">{ticket.price} {bookingDetails.currency}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
                        
//                         <div className="mt-6 flex justify-end">
//                             <button
//                                 onClick={() => setIsViewModalOpen(false)}
//                                 className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                             >
//                                 {t("CLOSE")}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Table Header and Search/Filter */}
//             <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//                         {t("BOOKING_LIST")}
//                     </h3>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <div className="relative flex-1">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <SearchIcon/>
//                         </div>
//                         <input
//                             type="text"
//                             className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                             placeholder={t("SEARCH_BOOKINGS")}
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>

//                     {/* Filter Button and Dropdown */}
//                     <div className="relative">
//                         <button
//                             onClick={() => setIsFilterOpen(!isFilterOpen)}
//                             className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
//                         >
//                             <FunnelIcon className="h-5 w-5" />
//                             {t("FILTER")}
//                         </button>

//                         {/* Filter Dropdown */}
//                         {isFilterOpen && (
//                             <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//                                 <div className="p-4 space-y-4">
//                                     {/* Status Filter */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             {t("STATUS")}
//                                         </label>
//                                         <select
//                                             value={filters.status}
//                                             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                         >
//                                             <option value="">All Statuses</option>
//                                             <option value="pending">Pending</option>
//                                             <option value="confirmed">Confirmed</option>
//                                             <option value="paid">Paid</option>
//                                             <option value="cancelled">Cancelled</option>
//                                         </select>
//                                     </div>

//                                     {/* Date Range Filter */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             {t("FROM_DATE")}
//                                         </label>
//                                         <input
//                                             type="date"
//                                             value={filters.from_date}
//                                             onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                         />
//                                     </div>
                                    
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             {t("TO_DATE")}
//                                         </label>
//                                         <input
//                                             type="date"
//                                             value={filters.to_date}
//                                             onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                         />
//                                     </div>

//                                     {/* Customer Mobile Filter */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             {t("CUSTOMER_MOBILE")}
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={filters.customer_mobile}
//                                             onChange={(e) => setFilters({ ...filters, customer_mobile: e.target.value })}
//                                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                             placeholder="Search by mobile"
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Filter Buttons */}
//                                 <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
//                                     <button
//                                         onClick={handleResetFilters}
//                                         className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                                     >
//                                         {t("RESET")}
//                                     </button>
//                                     <button
//                                         onClick={handleApplyFilters}
//                                         className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                                     >
//                                         {t("APPLY")}
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="max-w-full overflow-x-auto">
//                 {loading ? (
//                     <div className="flex justify-center items-center h-32">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//                     </div>
//                 ) : (
//                     <Table>
//                         {/* Table Header */}
//                         <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
//                             <TableRow>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("REFERENCE")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("CUSTOMER")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("TRIP")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("AMOUNT")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("STATUS")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("CREATED_AT")}
//                                 </TableCell>
//                                 <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                                     {t("ACTIONS")}
//                                 </TableCell>
//                             </TableRow>
//                         </TableHeader>

//                         {/* Table Body */}
//                         <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
//                             {bookings.map((booking) => (
//                                 <TableRow key={booking.id}>
//                                     <TableCell className="py-3">
//                                         <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                                             {booking.booking_reference}
//                                         </div>
//                                     </TableCell>
//                                     <TableCell className="py-3">
//                                         <div>
//                                             <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                                                 {booking.customer_first_name} {booking.customer_last_name}
//                                             </p>
//                                             <p className="text-gray-500 text-xs">{booking.customer_mobile}</p>
//                                         </div>
//                                     </TableCell>
//                                     <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                         {booking.trip?.route?.name || 'N/A'}
//                                     </TableCell>
//                                     <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                         {booking.total_amount} {booking.currency}
//                                     </TableCell>
//                                     <TableCell className="py-3">
//                                         {getStatusBadge(booking.status)}
//                                     </TableCell>
//                                     <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                         {formatDate(booking.created_at)}
//                                     </TableCell>
//                                     <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                                         <div className="flex flex-row items-center justify-start gap-2">
//                                             <View
//                                                 className="w-5 h-5 cursor-pointer text-blue-500"
//                                                 onClick={() => handleViewDetails(booking.id)}
//                                             />
//                                             {booking.status === 'confirmed' && (
//                                                 <button
//                                                     onClick={() => handleMarkAsPaid(booking.id)}
//                                                     className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
//                                                 >
//                                                     Mark Paid
//                                                 </button>
//                                             )}
//                                             {['pending', 'confirmed'].includes(booking.status) && (
//                                                 <button
//                                                     onClick={() => handleCancelBooking(booking.id)}
//                                                     className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 )}
//             </div>

//             {/* Pagination */}
//             {pagination && (
//                 <Pagination
//                     currentPage={pagination.current_page}
//                     totalPages={pagination.last_page}
//                     onPageChange={(page) => setCurrentPage(page)}
//                 />
//             )}
//         </div>
//     );
// }