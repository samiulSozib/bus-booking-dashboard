import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Delete, Edit, View } from "../../icons";
import { addTrip, editTrip, fetchTrips, showTrip } from "../../store/slices/tripSlice";
import { fetchBuses } from "../../store/slices/busSlice";
import { fetchRoutes } from "../../store/slices/routeSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { formatForDisplay, formatForInput, formatForInputDiscount, userType } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";


// Yup validation schema
const tripSchema = Yup.object().shape({
    vendor_id: Yup.number().required("Vendor is required"),
    route_id: Yup.number().required("Route is required"),
    bus_id: Yup.number().required("Bus is required"),
    total_seats: Yup.number().required("Total seats is required"),
    ticket_price: Yup.number().required("Ticket price is required"),
    departure_time: Yup.string().required("Departure time is required"),
    arrival_time: Yup.string().required("Arrival time is required"),
    booking_deadline: Yup.string().required("Booking Deadline is required"),
    status: Yup.string()
        .oneOf(["active", "inactive"], "Invalid status")
        .required("Status is required"),
    min_partial_payment: Yup.number().required("Min Partial Payment is required"),

});



export default function TripList() {
    const dispatch = useDispatch();
    const { trips, selectedTrip, loading,pagination } = useSelector((state) => state.trips);
    const { buses } = useSelector((state) => state.buses);
    const { routes } = useSelector((state) => state.routes);
    const { users } = useSelector((state) => state.users);
    const {t}=useTranslation()
    const [currentPage, setCurrentPage] = useState(1);

    // State for table filtering
    const [searchTag, setSearchTag] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [showRouteDropdown, setShowRouteDropdown] = useState(false);
    const [showBusDropdown, setShowBusDropdown] = useState(false);
    const [vendorSearchTag, setVendorSearchTag] = useState("");
    const [routeSearchTag, setRouteSearchTag] = useState("");
    const [busSearchTag, setBusSearchTag] = useState("");
    const [errors, setErrors] = useState({});

    // State for Add/Edit Trip Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [vendorId, setVendorId] = useState(null);
    const [routeId, setRouteId] = useState(null);
    const [busId, setBusId] = useState(null);
    const [totalSeats, setTotalSeats] = useState("");
    const [ticketPrice, setTicketPrice] = useState("");
    const [departureTime, setDepartureTime] = useState("");
    const [arrivalTime, setArrivalTime] = useState("");
    const [bookingDeadLine,setBookingDeadLine]=useState("")
    const [status, setStatus] = useState("active");
    const [allowPartialPayment,setAllowPartialPayment]=useState(false)
    const [partialPaymentType,setPartialPaymentType]=useState("total")
    const [minPartialPayment,setMinPartialPayment]=useState("")
    const [currentTripId, setCurrentTripId] = useState(null);
    const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
    const [modalRouteSearchTag, setModalRouteSearchTag] = useState("");
    const [modalBusSearchTag, setModalBusSearchTag] = useState("");
    const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);
    const [showModalRouteDropdown, setShowModalRouteDropdown] = useState(false);
    const [showModalBusDropdown, setShowModalBusDropdown] = useState(false);

    const isAdmin=userType().role==="admin"


    // Fetch buses, routes, and vendors on component mount
    useEffect(() => {
        dispatch(fetchTrips({page:currentPage}))
    }, [dispatch,currentPage]);

     // Fetch buses, routes, and vendors on component mount
     useEffect(() => {
        dispatch(fetchUsers({searchTag:modalVendorSearchTag,role:"vendor"}))
        dispatch(fetchBuses({ searchTag: modalBusSearchTag }));
        dispatch(fetchRoutes({searchTag:modalRouteSearchTag}));
    }, [dispatch, modalBusSearchTag, modalRouteSearchTag,modalVendorSearchTag]);

    
    

    // Pre-fill form when editing a trip
    useEffect(() => {
        if (selectedTrip) {
            setVendorId(selectedTrip.vendor.id);
            setRouteId(selectedTrip.route.id);
            setBusId(selectedTrip.bus.id);
            setTotalSeats(selectedTrip.total_seats);
            setTicketPrice(selectedTrip.ticket_price);
            setDepartureTime(selectedTrip.departure_time);
            setArrivalTime(selectedTrip.arrival_time);
            setBookingDeadLine(selectedTrip.booking_deadline)
            setStatus(selectedTrip.status);
            setAllowPartialPayment(selectedTrip.allow_partial_payment)
            setMinPartialPayment(selectedTrip.min_partial_payment)
            setPartialPaymentType(selectedTrip.partial_payment_type)
        }
    }, [selectedTrip, users, routes, buses]);

    // Handle vendor selection (for table filtering)
    const handleVendorSelect = (vendor) => {
        setSelectedVendorId(vendor.value);
        setShowVendorDropdown(false);
        setVendorSearchTag(vendor.label);
    };

    // Handle route selection (for table filtering)
    const handleRouteSelect = (route) => {
        setSelectedRouteId(route.value);
        setShowRouteDropdown(false);
        setRouteSearchTag(route.label);
    };

    // Handle bus selection (for table filtering)
    const handleBusSelect = (bus) => {
        setSelectedBusId(bus.value);
        setShowBusDropdown(false);
        setBusSearchTag(bus.label);
    };

    // Handle vendor selection in modal
    const handleModalVendorSelect = (vendor) => {
        setVendorId(vendor.vendor.id);
        setModalVendorSearchTag(vendor.first_name);
        setShowModalVendorDropdown(false);
    };

    // Handle route selection in modal
    const handleModalRouteSelect = (route) => {
        setRouteId(route.id);
        setModalRouteSearchTag(route.name);
        setShowModalRouteDropdown(false);
    };

    // Handle bus selection in modal
    const handleModalBusSelect = (bus) => {
        setBusId(bus.id);
        setTicketPrice(bus.ticket_price)
        setTotalSeats(bus?.seats?.seats.length||0)
        setModalBusSearchTag(bus.name);
        setShowModalBusDropdown(false);
    };

    // Handle add/edit trip form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const tripData = {
            //vendor_id: vendorId.value,
            route_id: routeId,
            bus_id: busId,
            total_seats: totalSeats,
            ticket_price: ticketPrice,
            departure_time: departureTime,
            arrival_time: arrivalTime,
            booking_deadline:bookingDeadLine,
            status,
            allow_partial_payment:allowPartialPayment,
            min_partial_payment:minPartialPayment,
            partial_payment_type:partialPaymentType
        };

        if(isAdmin){
            tripData.vendor_id=vendorId
        }
        //console.log(tripData)
        //return

        try {
            await tripSchema.validate(tripData, { abortEarly: false });

            if (isEditMode) {
                await dispatch(
                    editTrip({ tripId: currentTripId, updatedData: tripData })
                ).unwrap();
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Trip updated successfully.",
                });
            } else {
                await dispatch(addTrip(tripData)).unwrap();
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Trip added successfully.",
                });
            }

            resetModal();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error || "Failed to add/update trip. Please try again.",
                });
            }
        }
    };

    // Reset modal state
    const resetModal = () => {
        setIsEditMode(false);
        setVendorId(null);
        setRouteId(null);
        setBusId(null);
        setTotalSeats("");
        setTicketPrice("");
        setDepartureTime("");
        setArrivalTime("");
        setStatus("active");
        setIsModalOpen(false);
        setCurrentTripId(null);
        setErrors({});
    };

    // Handle edit trip button click
    const handleEditTrip = (tripId) => {
        dispatch(showTrip(tripId));
        setIsEditMode(true);
        setIsModalOpen(true);
        setCurrentTripId(tripId);
    };


    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Trip Search and Add Button */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("TRIP_LIST")}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        className="rounded-md"
                        placeholder={t("SEARCH_ROUTE")} 
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t("ADD_TRIP")}
                    </button>
                </div>
            </div>

            {/* Table Filtering Section */}
            <div className="flex flex-row items-center justify-end gap-3 mb-4">
                

                {/* Route Dropdown */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t("SEARCH_ROUTE")}
                        value={routeSearchTag}
                        onChange={(e) => {
                            setRouteSearchTag(e.target.value);
                            setShowRouteDropdown(true);
                        }}
                        onFocus={() => setShowRouteDropdown(true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showRouteDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {routes
                                .filter((route) =>
                                    route.label.toLowerCase().includes(routeSearchTag.toLowerCase())
                                )
                                .map((route) => (
                                    <div
                                        key={route.value}
                                        onClick={() => handleRouteSelect(route)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        {route.label}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Bus Dropdown */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t("SEARCH_BUS")}
                        value={busSearchTag}
                        onChange={(e) => {
                            setBusSearchTag(e.target.value);
                            setShowBusDropdown(true);
                        }}
                        onFocus={() => setShowBusDropdown(true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {showBusDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {buses
                                .filter((bus) =>
                                    bus.label.toLowerCase().includes(busSearchTag.toLowerCase())
                                )
                                .map((bus) => (
                                    <div
                                        key={bus.value}
                                        onClick={() => handleBusSelect(bus)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        {bus.label}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Trip Table */}
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
                                {t("VENDOR")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ROUTES")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("BUS")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("TOTAL_SEATS")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("TICKET_PRICE")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("DEPARTURE_TIME")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ARRIVAL_TIME")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("STATUS")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("MIN_PARTIAL_PAYMENT")}
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                {t("ACTION")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {trips.map((trip) => (
                                <TableRow key={trip.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {trip?.vendor.name}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip?.route.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip?.bus.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.total_seats}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.ticket_price}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.departure_time}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.arrival_time}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.status}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {trip.min_partial_payment}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-row items-center justify-start gap-2">
                                            <Edit
                                                className="w-6 h-6 cursor-pointer"
                                                onClick={() => handleEditTrip(trip.id)}
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

            <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* Add/Edit Trip Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[70vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? t("EDIT_TRIP") :t("ADD_TRIP")}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            
                            

                            {isAdmin && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("VENDOR")} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={t("SEARCH_VENDOR")}
                                            value={modalVendorSearchTag}
                                            onChange={(e) => {
                                                setModalVendorSearchTag(e.target.value);
                                                setShowModalVendorDropdown(true);
                                            }}
                                            onFocus={() => setShowModalVendorDropdown(true)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {showModalVendorDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {users
                                                    .filter((user) => 
                                                        user.first_name.toLowerCase().includes(modalVendorSearchTag.toLowerCase())
                                                    )
                                                    .map((vendor) => (
                                                        <div
                                                            key={vendor.id}
                                                            onClick={() => handleModalVendorSelect(vendor)}
                                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                        >
                                                            {vendor.first_name}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.vendor_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Route Dropdown in Modal */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ROUTES")} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t("SEARCH_ROUTE")}
                                        value={modalRouteSearchTag}
                                        onChange={(e) => {
                                            setModalRouteSearchTag(e.target.value);
                                            setShowModalRouteDropdown(true);
                                        }}
                                        onFocus={() => setShowModalRouteDropdown(true)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {showModalRouteDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {routes
                                                .filter((route) =>
                                                    route.name.toLowerCase().includes(modalRouteSearchTag.toLowerCase())
                                                )
                                                .map((route) => (
                                                    <div
                                                        key={route.id}
                                                        onClick={() => handleModalRouteSelect(route)}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                    >
                                                        {route.name}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {errors.route_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.route_id}</p>
                                )}
                            </div>

                            {/* Bus Dropdown in Modal */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("BUS")} *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t("SEARCH_BUS")}
                                        value={modalBusSearchTag}
                                        onChange={(e) => {
                                            
                                            setModalBusSearchTag(e.target.value);
                                            setShowModalBusDropdown(true);
                                        }}
                                        onFocus={() => setShowModalBusDropdown(true)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {showModalBusDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {buses
                                                
                                                .map((bus) => (
                                                    <div
                                                        key={bus.id}
                                                        onClick={() => handleModalBusSelect(bus)}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                    >
                                                        {bus.name}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {errors.bus_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.bus_id}</p>
                                )}
                            </div>

                            {/* Total Seats */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("TOTAL_SEATS")} *
                                </label>
                                <input
                                    type="number"
                                    value={totalSeats}
                                    onChange={(e) => setTotalSeats(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.total_seats && (
                                    <p className="text-red-500 text-sm mt-1">{errors.total_seats}</p>
                                )}
                            </div>

                            {/* Ticket Price */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("TICKET_PRICE")} *
                                </label>
                                <input
                                    type="number"
                                    value={ticketPrice}
                                    onChange={(e) => setTicketPrice(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.ticket_price && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ticket_price}</p>
                                )}
                            </div>

                            {/* Departure Time */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("DEPARTURE_TIME")} *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formatForDisplay(departureTime)}
                                    onChange={(e) => setDepartureTime(formatForInputDiscount(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.departure_time && (
                                    <p className="text-red-500 text-sm mt-1">{errors.departure_time}</p>
                                )}
                            </div>

                            {/* Arrival Time */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ARRIVAL_TIME")} *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formatForDisplay(arrivalTime)}
                                    onChange={(e) => setArrivalTime(formatForInputDiscount(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.arrival_time && (
                                    <p className="text-red-500 text-sm mt-1">{errors.arrival_time}</p>
                                )}
                            </div>

                            {/* booking deadline */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("BOOKING_DEADLINE")} *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formatForDisplay(bookingDeadLine)}
                                    onChange={(e) => setBookingDeadLine(formatForInputDiscount(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.booking_deadline && (
                                    <p className="text-red-500 text-sm mt-1">{errors.booking_deadline}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("STATUS")} *
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                )}
                            </div>

                            {/* Allow partial payment */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("ALLOW_PARTIAL_PAYMENT")} *
                                </label>
                                <select
                                    value={allowPartialPayment}
                                    onChange={(e) => {
                                        const value = e.target.value === "true";
                                        setAllowPartialPayment(value);
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                                
                            </div>

                            {/*  partial payment type*/}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("PARTIAL_PAYMENT_TYPE")} *
                                </label>
                                <select
                                    value={partialPaymentType}
                                    onChange={(e) => setPartialPaymentType(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="total">Total</option>
                                    <option value="per_seat">Per Seat</option>
                                </select>
                                
                            </div>

                            {/* min partial payment */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                {t("MIN_PARTIAL_PAYMENT")} *
                                </label>
                                <input
                                    type="number"
                                    value={minPartialPayment}
                                    onChange={(e) => setMinPartialPayment(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.min_partial_payment && (
                                    <p className="text-red-500 text-sm mt-1">{errors.min_partial_payment}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {t("CANCEL")}
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isEditMode ? t("UPDATE") : t("ADD")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}