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
  downloadBookingTickets,
} from "../../store/slices/bookingSlice";
import Pagination from "../../components/pagination/pagination";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  checkPermission,
  formatSeatNumber,
  useHasPermission,
  userType,
  userTypeForSidebar,
  useUserPermissions,
} from "../../utils/utils";
import { BusTicket } from "./BusTicket";
import BookingFilter from "./BookingFilter";
import PersianDateText from "../../utils/persianDateShowFormat";

export default function BookingList() {
  const dispatch = useDispatch();
  const { bookings, bookingDetails, loading, pagination } = useSelector(
    (state) => state.bookings
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const { t } = useTranslation();
  const navigate = useNavigate();
  const type = userType();
  const user_type = userType();
  // Booking Permissions

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  useEffect(() => {
    dispatch(
      fetchBookings({
        page: currentPage,
        filters: activeFilters,
        status: selectedStatus,
      })
    );
  }, [dispatch, currentPage, activeFilters, selectedStatus]);

  const handleViewDetails = (bookingId) => {
    dispatch(getBookingDetails(bookingId));
    setIsViewModalOpen(true);
  };

  const handleMarkAsPaid = async (bookingId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to make paid this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, make paid it!",
      cancelButtonText: "No, keep it",
    });
    if (result.isConfirmed) {
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
    }
  };

  const handleCancelBooking = async (bookingId) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
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
        Swal.fire("Success", "Tickets downloaded successfully!", "success");
      })
      .catch((error) => {
        Swal.fire("Error", error || "Failed to download tickets", "error");
      });
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      from_date: "",
      to_date: "",
      customer_mobile: "",
    });
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* View Details Modal */}
      {isViewModalOpen && bookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <BusTicket
            bookingDetails={bookingDetails}
            onClose={() => setIsViewModalOpen(false)}
          />
        </div>
      )}

      {/* Table Header and Search/Filter */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("BOOKING_LIST")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">{t("ALL")}</option>
            <option value="paid">{t("PAID")}</option>
            <option value="unpaid">{t("UNPAID")}</option>
            <option value="partial_paid">{t("PARTIAL_PAID")}</option>
            <option value="cancelled">{t("CANCELLED")}</option>
          </select>

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
          {useHasPermission([
            "v1.vendor.booking.store_booking",
            "v1.branch.booking.store_booking",
          ]) &&
            userTypeForSidebar().role != "admin" && (
              <button
                onClick={() => navigate("/add-booking")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                {t("ADD_BOOKING")}
              </button>
            )}
        </div>
      </div>

      {/* Table */}
      <div className="">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("ROUTES")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("VENDOR")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("BUS")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("booking.totalAmount")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("booking.remainingAmount")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("TICKET_COUNT")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("STATUS")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("BOOKED_AT")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("ACTION")}
                  </TableCell>
                  {/* {(type.role==="admin")&&(
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {t("DOWNLOAD")}
                                </TableCell>
                              )} */}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="py-3 px-2 w-[150px] truncate">
                      <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {booking?.trip?.route?.name}
                      </div>
                    </TableCell>
                    {/* <TableCell className="py-3 px-2 w-[150px] truncate">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {booking.customer_first_name} {booking.customer_last_name}
                                            </p>
                                            <p className="text-gray-500 text-xs">{booking.customer_mobile}</p>
                                        </div>
                                    </TableCell> */}

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {booking?.vendor?.short_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-[150px]">
                      {booking?.trip?.bus?.bus_number}{" "}
                      {booking?.trip?.bus?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {booking?.total_price}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {booking?.remaining_amount}
                    </TableCell>
                    <TableCell className="py-3 px-2 w-[150px] truncate text-gray-500 font-bold text-theme-sm dark:text-gray-400">
                      {booking?.tickets
                        .map((ticket) => formatSeatNumber(ticket.seat_number))
                        .join(", ")}
                    </TableCell>

                    <TableCell className="py-3 px-2 w-[150px] truncate">
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-[200px]">
                      {/* {formatDate(booking.created_at)} */}
                      {<PersianDateText value={booking.created_at} />}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-row items-center justify-start gap-3">
                        {useHasPermission([
                          "v1.vendor.booking.show",
                          "v1.branch.booking.show",
                        ]) && (
                          <View
                            className="w-5 h-5 cursor-pointer text-blue-500"
                            onClick={() => handleViewDetails(booking.id)}
                          />
                        )}
                        {useHasPermission([
                          "v1.vendor.booking.make_cancel",
                          "v1.branch.booking.make_cancel",
                        ]) &&
                          ["paid", "pending", "partial_paid"].includes(
                            booking.status
                          ) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t("booking.cancel")}
                            </button>
                          )}

                        {useHasPermission([
                          "v1.vendor.booking.make_paid",
                          "v1.branch.booking.make_paid",
                        ]) &&
                          ["pending", "partial_paid"].includes(
                            booking.status
                          ) && (
                            <button
                              onClick={() => handleMarkAsPaid(booking.id)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t("booking.paid")}
                            </button>
                          )}
                      </div>
                    </TableCell>
                    {/* {(type.role==="admin")&&(
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                      <button
                                                 onClick={() => handleDownload(booking.id)}
                                                 className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                             >
                                                 Download
                                             </button>
                                    </TableCell>
                                  )} */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

      <BookingFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
