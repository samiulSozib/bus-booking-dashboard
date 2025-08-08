import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, FunnelIcon, View } from "../../icons";
import {
  addTrip,
  deleteTrip,
  editTrip,
  fetchTrips,
  showTrip,
  updateTripSeatPrices,
} from "../../store/slices/tripSlice";
import { fetchBuses } from "../../store/slices/busSlice";
import { fetchRoutes } from "../../store/slices/routeSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  checkPermission,
  formatForDisplay,
  formatForInput,
  formatForInputDiscount,
  useHasPermission,
  userType,
  useUserPermissions,
} from "../../utils/utils";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import DiscountFilter from "../Discount/DiscountFilter";
import useOutsideClick from "../../hooks/useOutSideClick";
import { fetchBranches } from "../../store/slices/branchSlice";

// Updated Yup validation schema
const getTripSchema = (t, isAdmin) => {
  const schema = {
    route_id: Yup.number().required(t("trip.routeRequired")),
    bus_id: Yup.number().required(t("trip.busRequired")),
    total_seats: Yup.number().required(t("trip.totalSeatsRequired")),
    ticket_price: Yup.number().required(t("trip.ticketPriceRequired")),
    departure_time: Yup.string().required(t("trip.departureTimeRequired")),
    arrival_time: Yup.string().required(t("trip.arrivalTimeRequired")),
    booking_deadline: Yup.string().required(t("trip.bookingDeadlineRequired")),
    status: Yup.string()
      .oneOf(["active", "inactive"], t("trip.invalidStatus"))
      .required(t("trip.statusRequired")),
    allow_partial_payment: Yup.string().oneOf(
      ["0", "1"],
      t("trip.invalidPartialPayment")
    ),
  };

  // Only add vendor_id validation if isAdmin is true
  if (isAdmin) {
    schema.vendor_id = Yup.number().required(t("trip.vendorRequired"));
  }

  return Yup.object().shape(schema);
};

export default function TripList() {
  const vendorDropdownRef = useRef(null);
  const routeDropdownRef = useRef(null);
  const busDropdownRef = useRef(null);

  useOutsideClick(vendorDropdownRef, () => {
    if (showModalVendorDropdown) {
      setShowModalVendorDropdown(false);
    }
  });

  useOutsideClick(routeDropdownRef, () => {
    if (showModalRouteDropdown) {
      setShowModalRouteDropdown(false);
    }
  });

  useOutsideClick(busDropdownRef, () => {
    if (showModalBusDropdown) {
      setShowModalBusDropdown(false);
    }
  });

  const dispatch = useDispatch();
  const { trips, selectedTrip, loading, pagination } = useSelector(
    (state) => state.trips
  );
  const { buses } = useSelector((state) => state.buses);
  const { routes } = useSelector((state) => state.routes);
  const { vendorList } = useSelector((state) => state.users);
  const { branches } = useSelector((state) => state.branch);

  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

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
  const [openSeatsDialog, setOpenSeatsDialog] = useState(false);
  const [openSeatsEditDialog, setOpenSeatsEditDialog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [vendor_branch_id, setVendor_branch_id] = useState("");

  const [routeId, setRouteId] = useState(null);
  const [busId, setBusId] = useState(null);
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [bookingDeadLine, setBookingDeadLine] = useState("");
  const [status, setStatus] = useState("active");
  const [allowPartialPayment, setAllowPartialPayment] = useState("0");
  const [partialPaymentType, setPartialPaymentType] = useState("total");
  const [minPartialPayment, setMinPartialPayment] = useState(0);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
  const [modalRouteSearchTag, setModalRouteSearchTag] = useState("");
  const [modalBusSearchTag, setModalBusSearchTag] = useState("");
  const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);
  const [showModalRouteDropdown, setShowModalRouteDropdown] = useState(false);
  const [showModalBusDropdown, setShowModalBusDropdown] = useState(false);

  const [vendorBranchSearch, setVendorBranchSearch] = useState("");
  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const isAdmin = userType().role === "admin";
  const isBranch = userType().role === "branch";
  const user_type = userType();

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // Fetch buses, routes, and vendors on component mount
  useEffect(() => {
    dispatch(
      fetchTrips({ page: currentPage, filters: activeFilters, searchTag })
    );
  }, [dispatch, currentPage, activeFilters, searchTag]);

  // Fetch buses, routes, and vendors on component mount
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers({ searchTag: modalVendorSearchTag, role: "vendor" }));
    }

    dispatch(fetchRoutes({ searchTag: modalRouteSearchTag }));
  }, [dispatch, modalBusSearchTag, modalRouteSearchTag, modalVendorSearchTag]);

  useEffect(() => {
    dispatch(
      fetchBuses({
        searchTag: modalBusSearchTag,
        vendor_id: vendorId,
      })
    );
  }, [dispatch, modalBusSearchTag, vendorId]);

  useEffect(() => {
    if (isAdmin && vendorId) {
      dispatch(
        fetchBranches({
          searchTag: vendorBranchSearch,
          vendor_id: vendorId,
        })
      );
    } else {
      dispatch(fetchBranches({ searchTag: vendorBranchSearch }));
    }
  }, [dispatch, vendorBranchSearch, vendorId]);

  // Pre-fill form when editing a trip
  useEffect(() => {
    if (selectedTrip && isEditMode) {
      setVendorId(selectedTrip.vendor.id);
      setModalVendorSearchTag(selectedTrip.vendor.name);
      setRouteId(selectedTrip.route.id);
      setModalRouteSearchTag(selectedTrip.route.name);
      setBusId(selectedTrip.bus.id);
      setSeats(selectedTrip.seat_prices);
      setModalBusSearchTag(selectedTrip.bus.name);
      setTotalSeats(selectedTrip.total_seats);
      setTicketPrice(selectedTrip.ticket_price);
      setDepartureTime(selectedTrip.departure_time);
      setArrivalTime(selectedTrip.arrival_time);
      setBookingDeadLine(selectedTrip.booking_deadline);
      setStatus(selectedTrip.status);
      setAllowPartialPayment(selectedTrip.allow_partial_payment);
      setMinPartialPayment(selectedTrip.min_partial_payment);
      setPartialPaymentType(selectedTrip.partial_payment_type);
    }
  }, [selectedTrip, vendorList, routes, buses]);

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

  const handleVendorBranchSelect = (branch) => {
    setSelectedVendorBranch(branch);
    //setFormData({ ...formData, vendor_branch_id: branch.id });
    setVendor_branch_id(branch.id);
    setShowVendorBranchDropdown(false);
    // setErrors((prevErrors) => {
    //   const newErrors = { ...prevErrors };
    //   delete newErrors.vendor_branch_id;
    //   return newErrors;
    // });
  };

  // Handle vendor selection in modal
  const handleModalVendorSelect = (vendor) => {
    setVendorId(vendor.id);
    setModalVendorSearchTag(vendor.name);
    setShowModalVendorDropdown(false);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.vendor_id;
      return newErrors;
    });
  };

  // Handle route selection in modal
  const handleModalRouteSelect = (route) => {
    setRouteId(route.id);
    setModalRouteSearchTag(route.name);
    setShowModalRouteDropdown(false);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.route_id;
      return newErrors;
    });
  };

  // Handle bus selection in modal
  // const handleModalBusSelect = (bus) => {
  //     //console.log(bus)
  //     setBusId(bus.id);
  //     setBus(bus)
  //     setSeats(bus?.seats.seats)
  //     setTicketPrice(bus.ticket_price)
  //     setTotalSeats(bus?.seats?.seats.length||0)
  //     setModalBusSearchTag(bus.name);
  //     setShowModalBusDropdown(false);
  // };
  const handleModalBusSelect = (bus) => {
    setBusId(bus.id);
    setBus(bus);

    // Add status: "available" to each seat
    const updatedSeats = bus?.seats?.seats.map((seat) => ({
      ...seat,
      status: "available",
    }));

    setSeats(updatedSeats);
    setTicketPrice(bus.ticket_price);
    setTotalSeats(updatedSeats.length || 0);
    setModalBusSearchTag(bus.name);
    setShowModalBusDropdown(false);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.bus_id;
      return newErrors;
    });
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
      booking_deadline: bookingDeadLine,
      status,
      allow_partial_payment: allowPartialPayment,
      min_partial_payment: minPartialPayment,
      partial_payment_type: partialPaymentType,
    };

    //console.log(tripData)

    if (isAdmin) {
      tripData.vendor_id = vendorId;
    }
    if (!isEditMode) {
      tripData.ticket_price_per_seat = seats.map((seat) => ({
        seat_number: seat.seat_number,
        ticket_price: seat.price,
        status: seat.status,
      }));
    }

    if (isEditMode && !isAdmin) {
      tripData.ticket_price_per_seat = seats.map((seat) => ({
        seat_number: seat.seat_number,
        ticket_price: seat.price,
        status: seat.status,
      }));
    }

    if (vendor_branch_id) {
      tripData.vendor_branch_id = vendor_branch_id;
    }

    try {
      await getTripSchema(t, isAdmin).validate(tripData, { abortEarly: false });
      // const ticket_price_per_seat = seats.map(seat => ({
      //     seat_number: seat.seat_number,
      //     ticket_price: seat.price
      //   }));

      //   console.log(ticket_price_per_seat);

      //return
      //console.log(tripData);
      //console.log(currentTripId);
      //return

      if (isEditMode) {
        const editAction = await dispatch(
          editTrip({ tripId: currentTripId, updatedData: tripData })
        );
        if (editTrip.fulfilled.match(editAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("tripUpdateSuccessfully"),
          });
        }
      } else {
        const addAction = await dispatch(addTrip(tripData));
        if (addTrip.fulfilled.match(addAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("tripAddedSuccessfully"),
          });
        }
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
          title: t("error"),
          text: error || t("tripAddUpdateFail"),
        });
      }
    }
  };

  // Reset modal state
  const resetModal = () => {
    setIsEditMode(false);
    setVendorId(null);
    setModalVendorSearchTag("");
    setRouteId(null);
    setModalRouteSearchTag("");
    setBusId(null);
    setModalBusSearchTag("");
    setTotalSeats(0);
    setTicketPrice(0);
    setDepartureTime("");
    setArrivalTime("");
    setStatus("active");
    setMinPartialPayment(0);
    setIsModalOpen(false);
    setCurrentTripId(null);
    setErrors({});
    setAllowPartialPayment("0");
  };

  // Handle edit trip button click
  const handleEditTrip = (tripId) => {
    dispatch(showTrip({ trip_id: tripId }));
    setIsEditMode(true);
    setIsModalOpen(true);
    setCurrentTripId(tripId);
  };

  const handleSeatClick = (row, column) => {
    const seat = seats.find((s) => s.row === row && s.column === column);

    const rowChar = String.fromCharCode(64 + row);
    const seatNumberInt = parseInt(`${row}${column}`, 10);

    setSelectedSeat({
      row,
      column,
      seat_number: seatNumberInt,
      ...seat,
    });
  };

  const handleSeatEditClick = (seat) => {
    //console.log(seat)

    setSelectedSeat({
      seat_number: seat.seat_number,
      ticket_price: seat.ticket_price,
      status: seat.state,
      ...seat,
    });
  };

  const handleSeatSave = (seatData) => {
    const { row, column, ...rest } = seatData;
    const updatedSeats = seats.filter(
      (s) => !(s.row === row && s.column === column)
    );
    updatedSeats.push({ row, column, ...rest });

    setSeats(updatedSeats);
    setSelectedSeat(null);
  };

  const handleEditSeatSave = (seatData) => {
    setSeats((prevSeats) => {
      const index = prevSeats.findIndex(
        (seat) => seat.seat_number === seatData.seat_number
      );

      if (index !== -1) {
        const updatedSeats = [...prevSeats];
        updatedSeats[index] = seatData;
        return updatedSeats;
      } else {
        return [...prevSeats, seatData];
      }
    });

    setSelectedSeat(null);
  };

  const handleSaveChangeSeat = async (e) => {
    //console.log(seats)
    const data = seats.map((seat) => ({
      seat_number: seat.seat_number,
      ticket_price: seat.ticket_price,
      status: seat.status,
    }));
    await dispatch(
      updateTripSeatPrices({
        trip_id: selectedTrip.id,
        ticket_price_per_seat: data,
      })
    );
    setSeats(data);
    setOpenSeatsEditDialog(false);
  };

  const generateSeatLayout = (rows, columns) => {
    if (!rows || !columns) return null;

    // Determine the number of seats on the left and right sides
    let leftSeats, rightSeats;
    if (columns === 2) {
      leftSeats = 1;
      rightSeats = 1;
    } else if (columns === 3) {
      leftSeats = 1;
      rightSeats = 2;
    } else if (columns === 4) {
      leftSeats = 2;
      rightSeats = 2;
    } else if (columns === 5) {
      leftSeats = 2;
      rightSeats = 3;
    } else {
      // Default to equal split for other column counts
      leftSeats = Math.floor(columns / 2);
      rightSeats = columns - leftSeats;
    }

    // Function to get row hint text (A, B, C, D, etc.)
    const getRowHint = (rowIndex) => {
      return String.fromCharCode(65 + rowIndex); // 65 is ASCII for 'A'
    };

    return (
      <div className="grid gap-2 mt-4">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-2 justify-between mb-3 bg-gray-100 rounded-md p-1"
          >
            {/* Left Side Seats */}
            <div className="flex gap-2">
              {Array.from({ length: leftSeats }, (_, colIndex) => {
                const seatNumber = `${getRowHint(rowIndex)}${colIndex + 1}`; // e.g., A1, A2, etc.
                const seat = seats.find(
                  (s) => s.row === rowIndex + 1 && s.column === colIndex + 1
                );
                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 rounded-md p-2 flex flex-col gap-1 items-center justify-center dark:border-gray-600 cursor-pointer ${
                      seat ? "bg-green-200" : "dark:bg-gray-700"
                    }`}
                    onClick={() => handleSeatClick(rowIndex + 1, colIndex + 1)}
                  >
                    <img
                      src="/images/img/seat.png"
                      alt=""
                      className="w-8 h-8"
                    />
                    <span className="text-xs">{seatNumber}</span>
                  </div>
                );
              })}
            </div>

            {/* Right Side Seats */}
            <div className="flex gap-2">
              {Array.from({ length: rightSeats }, (_, colIndex) => {
                const seatNumber = `${getRowHint(rowIndex)}${
                  colIndex + leftSeats + 1
                }`; // e.g., A3, A4, etc.
                const seat = seats.find(
                  (s) =>
                    s.row === rowIndex + 1 &&
                    s.column === colIndex + leftSeats + 1
                );
                return (
                  <div
                    key={colIndex + leftSeats}
                    className={`w-14 h-14 rounded-md p-2 flex flex-col items-center justify-center dark:border-gray-600 cursor-pointer ${
                      seat ? "bg-green-200" : "dark:bg-gray-700"
                    }`}
                    onClick={() =>
                      handleSeatClick(rowIndex + 1, colIndex + leftSeats + 1)
                    }
                  >
                    <img
                      src="/images/img/seat.png"
                      alt=""
                      className="w-8 h-8"
                    />
                    <span className="text-xs">{seatNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const generateSeatEditLayout = () => {
    const getRowHint = (rowIndex) => {
      return String.fromCharCode(65 + rowIndex); // 65 is ASCII for 'A'
    };
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 mt-4">
        {seats.map((seat, index) => (
          <div
            key={seat.seat_number || index}
            className="w-20 h-20 p-1 rounded-md flex flex-col items-center justify-center cursor-pointer bg-green-200 text-center"
            onClick={() => handleSeatEditClick(seat)}
          >
            <img src="/images/img/seat.png" alt="Seat" className="w-8 h-8" />
            <span className="text-[10px] font-medium">
              No: {seat.seat_number}
            </span>
            <span className="text-[10px] font-medium">
              Price: {seat.ticket_price}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Handle delete trip
  const handleDelete = (tripId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(deleteTrip(tripId));
          if (deleteTrip.fulfilled.match(deleteAction)) {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          }
          // Refresh the countries list
          dispatch(fetchTrips({ searchTag: searchTag, page: currentPage }));
        } catch (error) {
          console.log(error);
          Swal.fire(
            t("ERROR"),
            error.message || t("FAILED_TO_DELETE_ITEM"),
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Trip Search and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
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
          {useHasPermission("v1.vendor.trip.create") && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {t("ADD_TRIP")}
            </button>
          )}
        </div>
      </div>

      {/* Table Filtering Section */}
      <div className="flex flex-row items-center justify-end gap-3 mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <FunnelIcon className="w-5 h-5" />
          {t("FILTER")}
        </button>
      </div>

      {/* Trip Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table className="min-w-[120%]">
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("VENDOR")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROUTES")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("BUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TOTAL_SEATS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TICKET_PRICE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("DEPARTURE_TIME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ARRIVAL_TIME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MIN_PARTIAL_PAYMENT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
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
                    {trip.allow_partial_payment === 1 ||
                    trip.allow_partial_payment === "1"
                      ? trip.min_partial_payment
                      : "--"}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.trip.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEditTrip(trip.id)}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                      )}
                      {useHasPermission("v1.vendor.trip.delete") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                        </div>
                      )}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditMode ? t("EDIT_TRIP") : t("ADD_TRIP")}
            </h2>
            <form onSubmit={handleSubmit}>
              {isAdmin && (
                <div className="mb-4" ref={vendorDropdownRef}>
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
                        {vendorList
                          .filter((vendor) => {
                            const name =
                              vendor?.vendor?.name?.toLowerCase() ?? "";
                            const search =
                              modalVendorSearchTag?.toLowerCase() ?? "";
                            return name && name.includes(search);
                          })

                          .map((vendor) => (
                            <div
                              key={vendor?.vendor?.id}
                              onClick={() =>
                                handleModalVendorSelect(vendor?.vendor)
                              }
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {vendor?.vendor?.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors.vendor_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.vendor_id}
                    </p>
                  )}
                </div>
              )}

              {/* Route Dropdown in Modal */}
              <div className="mb-4" ref={routeDropdownRef}>
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
                          route.name
                            .toLowerCase()
                            .includes(modalRouteSearchTag.toLowerCase())
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

              {/* branch for vendor */}
              {!isBranch && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("BRANCH")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("SEARCH_BRANCH")}
                    value={vendorBranchSearch} // Always use driverSearch for the value
                    onChange={(e) => {
                      setVendorBranchSearch(e.target.value);
                      setShowVendorBranchDropdown(true);
                      if (
                        selectedVendorBranch &&
                        e.target.value !== `${selectedVendorBranch?.name}`
                      ) {
                        setSelectedVendorBranch(null);
                        //setFormData({ ...formData, vendor_branch_id: "" });
                        setVendor_branch_id("");
                      }
                    }}
                    onFocus={() => setShowVendorBranchDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowVendorBranchDropdown(false), 200)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  {showVendorBranchDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                      {branches
                        .filter((branch) =>
                          `${branch?.branch?.name} || ""}`
                            .toLowerCase()
                            .includes(vendorBranchSearch.toLowerCase())
                        )
                        .map((branch) => (
                          <div
                            key={branch?.branch?.id}
                            onClick={() => {
                              handleVendorBranchSelect(branch?.branch);
                              setVendorBranchSearch(`${branch?.branch?.name}`);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                          >
                            {branch?.branch?.name}
                          </div>
                        ))}
                      {branches.filter((branch) =>
                        `${branch?.branch?.name} || ""}`
                          .toLowerCase()
                          .includes(vendorBranchSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                          {t("NO_BRANCH_FOUND")}
                        </div>
                      )}
                    </div>
                  )}
                  {errors.vendor_branch_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.vendor_branch_id}
                    </p>
                  )}
                </div>
              )}
              {/* branch for vendor */}

              {/* Bus Dropdown in Modal */}
              <div className="mb-4" ref={busDropdownRef}>
                <label className="block text-sm font-medium text-gray-700">
                  {t("BUS")} *
                </label>
                <div className="relative">
                  <input
                    disabled={isAdmin && !vendorId}
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
                      {buses.length > 0 ? (
                        buses.map((bus) => (
                          <div
                            key={bus.id}
                            onClick={() => handleModalBusSelect(bus)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {bus.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          {t("NO_BUS_FOUND")}
                        </div>
                      )}
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.total_seats}
                  </p>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ticket_price}
                  </p>
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
                  onChange={(e) => {
                    setDepartureTime(formatForInputDiscount(e.target.value)),
                      setErrors((prevErrors) => {
                        const newErrors = { ...prevErrors };
                        delete newErrors.departure_time;
                        return newErrors;
                      });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.departure_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departure_time}
                  </p>
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
                  onChange={(e) => {
                    setArrivalTime(formatForInputDiscount(e.target.value)),
                      setErrors((prevErrors) => {
                        const newErrors = { ...prevErrors };
                        delete newErrors.arrival_time;
                        return newErrors;
                      });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.arrival_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.arrival_time}
                  </p>
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
                  onChange={(e) => {
                    setBookingDeadLine(formatForInputDiscount(e.target.value)),
                      setErrors((prevErrors) => {
                        const newErrors = { ...prevErrors };
                        delete newErrors.booking_deadline;
                        return newErrors;
                      });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.booking_deadline && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.booking_deadline}
                  </p>
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
                  onChange={(e) => setAllowPartialPayment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>

              {/*  partial payment type*/}
              {(allowPartialPayment === "1" || allowPartialPayment === 1) && (
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
              )}

              {/* min partial payment */}
              {(allowPartialPayment === "1" || allowPartialPayment === 1) && (
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
                  {/* {errors.min_partial_payment && (
                                        <p className="text-red-500 text-sm mt-1">{errors.min_partial_payment}</p>
                                    )} */}
                </div>
              )}

              {isEditMode ? (
                <div className="flex justify-end mt-2 mb-2">
                  {useHasPermission(
                    "v1.vendor.trip.create_or_update_seat_prices"
                  ) && (
                    <button
                      type="button"
                      onClick={() => setOpenSeatsEditDialog(true)}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {t("EDIT_SEATS")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end mt-2 mb-2">
                  {busId && (
                    <div>
                      {useHasPermission(
                        "v1.vendor.trip.create_or_update_seat_prices"
                      ) && (
                        <button
                          type="button"
                          onClick={() => setOpenSeatsDialog(true)}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {t("MANAGE_SEATS")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

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

      {/* add seats dialog */}
      {openSeatsDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col dark:bg-gray-800 overflow-y-auto">
            <div className="mt-4">
              {/* Seat Layout Preview */}
              {generateSeatLayout(bus?.seats.rows, bus?.seats.columns)}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {/* {busId && (
                            <button
                                onClick={handleSaveChangeSeat}
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {t("SAVE_CHANGE")}
                            </button>
                        )} */}
              <button
                type="button"
                onClick={() => setOpenSeatsDialog(false)}
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                {t("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/*  */}

      {/* edit seats dialog */}
      {openSeatsEditDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col dark:bg-gray-800 overflow-y-auto">
            <div className="mt-4">
              {/* Seat Layout Preview */}
              {generateSeatEditLayout()}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {selectedTrip && (
                <button
                  onClick={handleSaveChangeSeat}
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {t("SAVE_CHANGE")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpenSeatsEditDialog(false)}
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                {t("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/*  */}

      {/* Dialog for Seat Details */}
      {selectedSeat && !isEditMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white/90">
              {t("EDIT_SEAT")} {String.fromCharCode(64 + selectedSeat.row)}
              {selectedSeat.column} ({selectedSeat.row}
              {selectedSeat.column})
            </h3>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {/* Seat Number (Read-Only) */}
              {/* <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("SEAT_NUMBER")}</label>
                                <input
                                onChange={(e) => {
                                    const seatNumber = e.target.value;
                                    const rowChar = seatNumber.charAt(0).toUpperCase();  // First character is the row (A, B, C, etc.)
                                    const columnNumber = seatNumber.slice(1);             // The remaining part is the column (1, 2, 3, etc.)

                                    // Convert rowChar (e.g., 'A' -> 1, 'B' -> 2, etc.)
                                    const row = rowChar.charCodeAt(0) - 64;  // 'A' -> 1, 'B' -> 2, etc.

                                    // Construct seat_number as a combination of row and column, for example: 'A1' becomes 11, 'B2' becomes 21
                                    const seatNumberInt = parseInt(`${row}${columnNumber}`, 10);

                                    // Update the state with the parsed seat_number
                                    setSelectedSeat({...selectedSeat, seat_number: seatNumberInt });
                                }}
                                    type="text"
                                    value={`${String.fromCharCode(64 + selectedSeat.row)}${selectedSeat.column}`}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-100"
                                    
                                />
                            </div> */}

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("PRICE")}
                </label>
                <input
                  type="number"
                  value={selectedSeat.price || ""}
                  onChange={(e) =>
                    setSelectedSeat({
                      ...selectedSeat,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("STATUS")}
                </label>
                <select
                  value={selectedSeat.status || "available"}
                  onChange={(e) =>
                    setSelectedSeat({ ...selectedSeat, status: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="available">{t("Available")}</option>
                  <option value="unavailable">{t("Unavailable")}</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setSelectedSeat(null)}
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                {t("CANCEL")}
              </button>
              <button
                type="button"
                onClick={() => handleSeatSave(selectedSeat)}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {t("SAVE")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Seat Edit in Edit Mode */}
      {selectedSeat && isEditMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white/90">
              {t("EDIT_SEAT")}
            </h3>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {/* Seat Number Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("SEAT_NUMBER")}
                </label>
                <input
                  disabled
                  type="text"
                  value={selectedSeat.seat_number}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("PRICE")}
                </label>
                <input
                  type="number"
                  value={selectedSeat.ticket_price || ""}
                  onChange={(e) =>
                    setSelectedSeat({
                      ...selectedSeat,
                      ticket_price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("STATUS")}
                </label>
                <select
                  value={selectedSeat.status || "available"}
                  onChange={(e) =>
                    setSelectedSeat({ ...selectedSeat, status: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="available">{t("Available")}</option>
                  <option value="unavailable">{t("Unavailable")}</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setSelectedSeat(null)}
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                {t("CANCEL")}
              </button>
              <button
                type="button"
                onClick={() => handleEditSeatSave(selectedSeat)}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {t("SAVE")}
              </button>
            </div>
          </div>
        </div>
      )}

      <DiscountFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
