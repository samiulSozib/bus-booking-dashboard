import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { createBooking } from "../../store/slices/bookingSlice";
import {
  fetchActiveTrips,
  fetchTrips,
  showTrip,
} from "../../store/slices/tripSlice";
import { fetchBusById } from "../../store/slices/busSlice";
import Swal from "sweetalert2";
import { formatSeatNumber, userType } from "../../utils/utils";
import PersianDateText from "../../utils/persianDateShowFormat";
import {
  FaChevronDown,
  FaChevronUp,
  FaChair,
  FaUser,
  FaMoneyBillWave,
  FaRoute,
  FaInfoCircle,
  FaBars,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const AddBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t,i18n } = useTranslation();
  const { trips, activeTrips, loading, selectedTrip } = useSelector(
    (state) => state.trips
  );
  const { bus } = useSelector((state) => state.buses);
  const [trip, setTrip] = useState(null);
  const [ticketPrices, setTicketPrices] = useState(null);
  const [minPartialAmount, setMinPartialAmount] = useState(0);
  const [partialAmountType, setPartialAmountType] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [useCustomerInfo, setUseCustomerInfo] = useState(false);
  const [quickBookingMode, setQuickBookingMode] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    trip: true,
    customer: true,
    seats: true,
    passengers: false,
    payment: true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    trip_id: "",
    is_partial_payment: "0",
    amount: 0,
    customer_mobile: "",
    customer_first_name: "",
    customer_last_name: "",
    tickets: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errors, setErrors] = useState({});
  const [amountError, setAmountError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  // Detect RTL language and update state
  useEffect(() => {
    setIsRtl(i18n.dir() === "rtl");
  }, [i18n.language]);

  useEffect(() => {
    dispatch(fetchActiveTrips({ search: searchTerm }));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    if (selectedTripId) {
      dispatch(showTrip({ trip_id: selectedTripId }));
    }
  }, [selectedTripId, dispatch]);

  useEffect(() => {
    if (selectedTrip && selectedTrip.bus && selectedTrip.bus.id) {
      setTrip(selectedTrip);
      setFormData((prev) => ({
        ...prev,
        is_partial_payment: String(selectedTrip.allow_partial_payment || "0"),
        amount:
          selectedTrip.allow_partial_payment === "1"
            ? selectedTrip.partial_payment_type === "total"
              ? selectedTrip.min_partial_payment
              : selectedTrip.min_partial_payment * 0
            : 0,
      }));
      setMinPartialAmount(selectedTrip.min_partial_payment);
      setPartialAmountType(selectedTrip.partial_payment_type);
      setTicketPrices(selectedTrip?.seat_prices);
      dispatch(fetchBusById(selectedTrip.bus.id));
    }
  }, [selectedTrip, dispatch]);

  useEffect(() => {
    const totalAmount = selectedSeats.reduce((sum, seat) => {
      const seatPrice = ticketPrices?.find(
        (tp) => tp.seat_number === seat.seat_number
      );
      return sum + (seatPrice ? Number(seatPrice.ticket_price) : 0);
    }, 0);
    setTotalAmount(totalAmount);

    if (formData.is_partial_payment !== "1") {
      setFormData((prev) => ({
        ...prev,
        amount: totalAmount,
      }));
    } else {
      let partialAmount = 0;
      if (partialAmountType === "total") {
        partialAmount = minPartialAmount;
      } else if (partialAmountType === "per_seat") {
        partialAmount = minPartialAmount * selectedSeats.length;
      }
      setFormData((prev) => ({
        ...prev,
        amount: Math.min(partialAmount, totalAmount),
      }));
    }
  }, [
    selectedSeats,
    ticketPrices,
    formData.is_partial_payment,
    minPartialAmount,
    partialAmountType,
  ]);

  useEffect(() => {
    if (
      useCustomerInfo &&
      formData.customer_first_name &&
      formData.customer_last_name &&
      formData.customer_mobile
    ) {
      const updatedSeats = selectedSeats.map((seat) => ({
        ...seat,
        first_name: formData.customer_first_name,
        last_name: formData.customer_last_name,
        phone: formData.customer_mobile,
      }));
      setSelectedSeats(updatedSeats);
    }
  }, [
    useCustomerInfo,
    formData.customer_first_name,
    formData.customer_last_name,
    formData.customer_mobile,
  ]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tripOptions = activeTrips.map((trip) => ({
    value: trip.id,
    label: (
      <>
        {trip?.route?.origin_station?.name} →{" "}
        {trip?.route?.destination_station?.name} -
        <PersianDateText value={trip.departure_time} /> ({trip.bus?.name})
      </>
    ),
  }));

  const handleTripSelect = (selectedOption) => {
    setFormData({ ...formData, trip_id: selectedOption.value });
    setSelectedTripId(selectedOption.value);
    setSelectedSeats([]);
    setErrors({});
    setAmountError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;

    if (formData.is_partial_payment === "1") {
      const minAmount =
        partialAmountType === "total"
          ? minPartialAmount
          : minPartialAmount * selectedSeats.length;

      if (value < minAmount) {
        setAmountError(`Amount must be at least ${minAmount}`);
      } else if (value > totalAmount) {
        setAmountError(`Amount cannot exceed total ${totalAmount}`);
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }

    setFormData({
      ...formData,
      amount: formData.is_partial_payment === "1" ? value : totalAmount,
    });
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some(
        (s) => s.seat_number === seat.seat_number
      );

      if (isAlreadySelected) {
        return prev.filter((s) => s.seat_number !== seat.seat_number);
      } else {
        return [
          ...prev,
          {
            trip_seat_price_id: seat.trip_seat_price_id,
            price: seat.price,
            seat_number: seat.seat_number,
            first_name: useCustomerInfo
              ? formData.customer_first_name
              : quickBookingMode
              ? "Passenger"
              : "",
            last_name: useCustomerInfo
              ? formData.customer_last_name
              : quickBookingMode
              ? String(selectedSeats.length + 1)
              : "",
            email: "",
            phone: useCustomerInfo ? formData.customer_mobile : "",
            national_id: "",
            birthday: "",
            gender: "male",
            is_child: 0,
          },
        ];
      }
    });
  };

  const handlePassengerChange = (index, field, value) => {
    setSelectedSeats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const bookingSchema = Yup.object().shape({
    trip_id: Yup.number()
      .required(t("booking.tripRequired"))
      .positive(t("booking.tripRequired")),
    customer_first_name: Yup.string().required(t("booking.firstNameRequired")),
    tickets: Yup.array()
      .min(1, t("booking.atLeastOneSeat"))
      .of(
        Yup.object().shape({
          first_name: Yup.string().required(
            t("booking.passengerFirstNameRequired")
          ),
          last_name: Yup.string().required(
            t("booking.passengerLastNameRequired")
          ),
          gender: Yup.string().required(t("booking.passengerGenderRequired")),
        })
      ),
    amount: Yup.number()
      .required(t("booking.amountRequired"))
      .test("amount-validation", t("booking.amountInvalid"), function (value) {
        const { is_partial_payment } = this.parent;

        if (is_partial_payment === "1") {
          const minAmount =
            partialAmountType === "total"
              ? minPartialAmount
              : minPartialAmount * selectedSeats.length;

          return value >= minAmount && value <= totalAmount;
        } else {
          return value === totalAmount;
        }
      }),
  });

  const resetBookingForm = () => {
    setTrip(null);
    setTicketPrices(null);
    setMinPartialAmount(0);
    setPartialAmountType("");
    setTotalAmount(0);
    setUseCustomerInfo(false);
    setFormData({
      trip_id: "",
      is_partial_payment: "0",
      amount: 0,
      customer_mobile: "",
      customer_first_name: "",
      customer_last_name: "",
      tickets: [],
    });
    setSelectedTripId(null);
    setSelectedSeats([]);
    setErrors({});
    setAmountError("");
    setExpandedSections({
      trip: true,
      customer: true,
      seats: true,
      passengers: false,
      payment: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ticketsData = selectedSeats.map((seat) => ({
        first_name: seat.first_name,
        last_name: seat.last_name,
        email: seat.email || "",
        phone: seat.phone,
        national_id: seat.national_id || "",
        birthday: seat.birthday || "",
        gender: seat.gender,
        trip_seat_price_id: seat.trip_seat_price_id,
        is_child: seat.is_child || 0,
      }));

      const bookingData = {
        ...formData,
        tickets: ticketsData,
      };

      if (bookingData.customer_last_name === "") {
        bookingData.customer_last_name = userType().role;
      }
      if (bookingData.customer_mobile === "") {
        bookingData.customer_mobile = userType().mobile;
      }

      await bookingSchema.validate(bookingData, { abortEarly: false });
      if (bookingData.is_partial_payment === "0") {
        bookingData.amount = 0;
      }
      //console.log(bookingData);
      //return;
      const resultAction = await dispatch(createBooking(bookingData));

      if (createBooking.fulfilled.match(resultAction)) {
        Swal.fire({
          title: t("success"),
          text: t("bookingSuccess"),
          icon: "success",
          confirmButtonText: "OK",
          background: "#f0fdf4",
          color: "#166534",
          confirmButtonColor: "#16a34a",
        }).then(() => {
          //navigate('/bookings');
          resetBookingForm();
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire({
          title: t("error"),
          text: error || t("bookingFailed"),
          icon: "error",
          confirmButtonText: "OK",
          background: "#fef2f2",
          color: "#b91c1c",
          confirmButtonColor: "#ef4444",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tooltipContent = (seat) => (
    <div className="p-2 bg-white border border-purple-200 rounded-md shadow-sm text-xs">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
              Type
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-gray-500">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                  seat.seat_type === "window"
                    ? "bg-blue-100 text-blue-800"
                    : seat.seat_type === "aisle"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {seat.seat_type || "N/A"}
              </span>
            </td>
          </tr>
          <tr>
            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
              Class
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-gray-500">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                  seat.seat_class === "economic"
                    ? "bg-purple-100 text-purple-800"
                    : seat.seat_class === "business"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {seat.seat_class || "N/A"}
              </span>
            </td>
          </tr>
          <tr>
            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
              Recliner
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-gray-500">
              {seat.is_recliner ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                  Yes
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                  No
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
              Sleeper
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-gray-500">
              {seat.is_sleeper ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                  Yes
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                  No
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderSeatLayout = () => {
    if (!selectedTripId || !bus?.seats)
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <FaChair className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            {t("selectTripToViewAvailableSeats")}
          </p>
        </div>
      );

    const { rows, columns, seats } = bus.seats;

    const leftSeats = Math.ceil(columns / 2);
    const rightSeats = columns - leftSeats;

    return (
      <div className="grid gap-2 mt-3">
        <div className="w-full h-6 bg-blue-100 rounded-md flex items-center justify-center mb-2">
          <span className="text-xs font-medium text-blue-800">Driver</span>
        </div>

        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-1 justify-between mb-1 bg-gray-50 rounded p-1"
          >
            <div className="flex gap-1">
              {Array.from({ length: leftSeats }, (_, colIndex) => {
                const seatNumber = colIndex + 1;
                const seat = seats.find(
                  (s) => s.row === rowIndex + 1 && s.column === seatNumber
                );
                const _seatNumber = parseInt(`${rowIndex + 1}${colIndex + 1}`);
                const seat_price = ticketPrices?.find(
                  (s) => s.seat_number == _seatNumber
                );
                const isSelected = selectedSeats.some(
                  (s) => s.seat_number === _seatNumber
                );
                const isBooked = !seat_price?.is_avaiable;

                if (!seat) return null;

                return (
                  <div key={`left-${colIndex}`} className="relative group">
                    <button
                      type="button"
                      disabled={isBooked}
                      onClick={() =>
                        handleSeatSelect({
                          ...seat,
                          trip_seat_price_id: seat_price?.id,
                          price: seat_price?.ticket_price,
                          seat_number: _seatNumber,
                        })
                      }
                      className={`w-8 h-8 md:w-10 md:h-8 rounded-sm p-0.5 flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                        isBooked
                          ? "bg-red-200 text-red-800 cursor-not-allowed"
                          : isSelected
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50"
                      }`}
                    >
                      <span className="font-medium text-[10px] md:text-xs">
                        {String.fromCharCode(65 + rowIndex)}
                        {seatNumber}
                      </span>
                      {seat_price && (
                        <span className="text-[10px] md:text-xs">
                          {seat_price.ticket_price}
                        </span>
                      )}
                    </button>
                    <div className="absolute z-10 hidden group-hover:block bg-white border border-blue-200 p-1 rounded shadow-sm w-32 text-left">
                      {tooltipContent(seat)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-3 md:w-4 bg-gray-100 rounded-md mx-1"></div>

            <div className="flex gap-1">
              {Array.from({ length: rightSeats }, (_, colIndex) => {
                const seatNumber = leftSeats + colIndex + 1;
                const seat = seats.find(
                  (s) => s.row === rowIndex + 1 && s.column === seatNumber
                );
                const _seatNumber = parseInt(`${rowIndex + 1}${seatNumber}`);
                const seat_price = ticketPrices?.find(
                  (s) => s.seat_number == _seatNumber
                );
                const isSelected = selectedSeats.some(
                  (s) => s.seat_number === _seatNumber
                );
                const isBooked = !seat_price?.is_avaiable;

                if (!seat) return null;

                return (
                  <div key={`right-${colIndex}`} className="relative group">
                    <button
                      type="button"
                      disabled={isBooked}
                      onClick={() =>
                        handleSeatSelect({
                          ...seat,
                          trip_seat_price_id: seat_price?.id,
                          price: seat_price?.ticket_price,
                          seat_number: _seatNumber,
                        })
                      }
                      className={`w-8 h-8 md:w-10 md:h-8 rounded-sm p-0.5 flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                        isBooked
                          ? "bg-red-200 text-red-800 cursor-not-allowed"
                          : isSelected
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50"
                      }`}
                    >
                      <span className="font-medium text-[10px] md:text-xs">
                        {String.fromCharCode(65 + rowIndex)}
                        {seatNumber}
                      </span>
                      {seat_price && (
                        <span className="text-[10px] md:text-xs">
                          {seat_price.ticket_price}
                        </span>
                      )}
                    </button>
                    <div className="absolute z-10 hidden group-hover:block bg-white border border-blue-200 p-1 rounded shadow-sm w-32 text-left">
                      {tooltipContent(seat)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPassengerForms = () => {
    return selectedSeats.map((seat, index) => (
      <div
        key={seat.trip_seat_price_id}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-sm shadow-sm border border-blue-100"
      >
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          {t("booking.passengerInfo")} - Seat{" "}
          {formatSeatNumber(seat.seat_number)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("booking.firstName")} *
            </label>
            <input
              type="text"
              value={seat.first_name}
              onChange={(e) =>
                handlePassengerChange(index, "first_name", e.target.value)
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
              required
            />
            {errors[`tickets[${index}].first_name`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`tickets[${index}].first_name`]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("booking.lastName")} *
            </label>
            <input
              type="text"
              value={seat.last_name}
              onChange={(e) =>
                handlePassengerChange(index, "last_name", e.target.value)
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
              required
            />
            {errors[`tickets[${index}].last_name`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`tickets[${index}].last_name`]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("booking.phone")}
            </label>
            <input
              type="tel"
              value={seat.phone}
              onChange={(e) =>
                handlePassengerChange(index, "phone", e.target.value)
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("booking.gender")} *
            </label>
            <select
              value={seat.gender}
              onChange={(e) =>
                handlePassengerChange(index, "gender", e.target.value)
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
              required
            >
              <option value="male">{t("booking.male")}</option>
              <option value="female">{t("booking.female")}</option>
              <option value="other">{t("booking.other")}</option>
            </select>
            {errors[`tickets[${index}].gender`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`tickets[${index}].gender`]}
              </p>
            )}
          </div>
          {!quickBookingMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("booking.email")}
                </label>
                <input
                  type="email"
                  value={seat.email}
                  onChange={(e) =>
                    handlePassengerChange(index, "email", e.target.value)
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("booking.nationalId")}
                </label>
                <input
                  type="text"
                  value={seat.national_id}
                  onChange={(e) =>
                    handlePassengerChange(index, "national_id", e.target.value)
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("booking.birthday")}
                </label>
                <input
                  type="date"
                  value={seat.birthday}
                  onChange={(e) =>
                    handlePassengerChange(index, "birthday", e.target.value)
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("is_child")}
                </label>
                <select
                  value={seat.is_child}
                  onChange={(e) =>
                    handlePassengerChange(index, "is_child", e.target.value)
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 border"
                >
                  <option value="0">{t("no")}</option>
                  <option value="1">{t("yes")}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto  text-sm bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        {/* Left side - Title and Toggle */}
        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-3 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center whitespace-nowrap">
            <button className="cursor-pointer">{isRtl?<FaArrowRight onClick={()=>navigate(-1)}/>:<FaArrowLeft onClick={()=>navigate(-1)}/>}</button>
            <FaChair className="mx-3 text-blue-600 text-2xl md:text-3xl" />
            {t("booking.newBooking")}
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow rounded-lg md:rounded-xl p-2 border border-blue-100 flex items-center justify-center space-x-2 w-full sm:w-auto">
            <span
              className={`text-xs md:text-sm ${
                quickBookingMode ? "font-medium text-blue-600" : "text-gray-500"
              }`}
            >
              {t("booking.quickMode")}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!quickBookingMode}
                onChange={() => setQuickBookingMode(!quickBookingMode)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 md:w-11 md:h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span
              className={`text-xs md:text-sm ${
                !quickBookingMode
                  ? "font-medium text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {t("booking.detailedMode")}
            </span>
          </div>
        </div>

        {/* Right side - Submit button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || selectedSeats.length === 0 || !selectedTrip}
          className="px-4 py-3 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center w-full lg:w-auto min-w-[160px] md:min-w-[180px]"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-xs md:text-sm">
                {t("booking.creating")}
              </span>
            </>
          ) : (
            <>
              <FaChair className="mr-2 text-base md:text-lg" />
              <span className="text-xs md:text-sm">
                {t("booking.createBooking")}
              </span>
            </>
          )}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-4 md:p-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-5">
            {/* Trip Selection Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("trip")}
              >
                <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center">
                  <FaRoute className="mr-2 text-blue-600" />
                  {t("booking.tripDetails")}
                </h2>
                <span className="text-blue-600">
                  {expandedSections.trip ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {expandedSections.trip && (
                <div className="mt-3 md:mt-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      {t("booking.selectTrip")} *
                    </label>
                    <Select
                      options={tripOptions}
                      value={
                        selectedTripId
                          ? tripOptions.find(
                              (option) => option.value === selectedTripId
                            )
                          : null
                      }
                      onChange={handleTripSelect}
                      onInputChange={setSearchTerm}
                      placeholder={t("booking.searchTrip")}
                      className="basic-multi-select text-sm"
                      classNamePrefix="select"
                      isSearchable
                      isLoading={loading}
                      noOptionsMessage={() => t("booking.noTripsFound")}
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: "38px",
                          fontSize: "14px",
                          borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #3b82f6"
                            : "none",
                          "&:hover": {
                            borderColor: state.isFocused
                              ? "#3b82f6"
                              : "#9ca3af",
                          },
                        }),
                        dropdownIndicator: (base) => ({
                          ...base,
                          padding: "6px",
                        }),
                        clearIndicator: (base) => ({
                          ...base,
                          padding: "6px",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "0px 8px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: "0px",
                          padding: "0px",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, fontSize: "14px" }),
                      }}
                    />
                    {errors.trip_id && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.trip_id}
                      </p>
                    )}
                  </div>

                  {trip && selectedTripId && (
                    <div className="p-3 md:p-4 bg-blue-100 rounded-lg mt-3 md:mt-4 text-xs border border-blue-200">
                      <h3 className="text-xs md:text-sm font-semibold mb-2 text-blue-800">
                        {t("booking.tripInfo")}
                      </h3>
                      <div className="grid grid-cols-1 gap-1 md:gap-2">
                        <div className="flex">
                          <span className="font-medium w-16 md:w-20 text-blue-700">
                            {t("booking.route")}:
                          </span>
                          <span className="text-blue-900 text-xs md:text-sm">
                            {trip?.route?.name} → {trip.end_point}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-16 md:w-20 text-blue-700">
                            {t("booking.departure")}:
                          </span>
                          <span className="text-blue-900 text-xs md:text-sm">
                            <PersianDateText value={trip.departure_time} />
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-16 md:w-20 text-blue-700">
                            {t("booking.bus")}:
                          </span>
                          <span className="text-blue-900 text-xs md:text-sm">
                            {trip.bus?.name} ({trip.bus?.bus_number})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Details Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("customer")}
              >
                <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  {t("booking.customerDetails")}
                </h2>
                <span className="text-blue-600">
                  {expandedSections.customer ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </div>
              {expandedSections.customer && (
                <div className="mt-3 md:mt-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.firstName")} *
                      </label>
                      <input
                        type="text"
                        name="customer_first_name"
                        value={formData.customer_first_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 md:p-3 border"
                        required
                      />
                      {errors.customer_first_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.customer_first_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.lastName")}
                      </label>
                      <input
                        type="text"
                        name="customer_last_name"
                        value={formData.customer_last_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 md:p-3 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.mobile")}
                      </label>
                      <input
                        type="tel"
                        name="customer_mobile"
                        value={formData.customer_mobile}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-2 md:p-3 border"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={useCustomerInfo}
                        onChange={(e) => setUseCustomerInfo(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-xs text-gray-700">
                        {t("booking.useCustomerInfoForPassengers")}
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Passenger Details Section */}
            {selectedSeats.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("passengers")}
                >
                  <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    {t("booking.passengerDetails")} ({selectedSeats.length})
                  </h2>
                  <span className="text-blue-600">
                    {expandedSections.passengers ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                </div>
                {expandedSections.passengers && (
                  <div className="mt-3 md:mt-4">{renderPassengerForms()}</div>
                )}
              </div>
            )}

            {/* Payment Details Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("payment")}
              >
                <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-blue-600" />
                  {t("booking.paymentDetails")}
                </h2>
                <span className="text-blue-600">
                  {expandedSections.payment ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </div>
              {expandedSections.payment && (
                <div className="mt-3 md:mt-4 text-xs">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.paymentType")}
                      </label>
                      <input
                        className="w-full rounded-lg border-gray-300 shadow-sm bg-blue-50 text-xs p-2 md:p-3 border border-blue-200"
                        value={
                          formData.is_partial_payment === "1"
                            ? t("booking.partialPayment")
                            : t("booking.fullPayment")
                        }
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.paymentAmount")}
                        {formData.is_partial_payment === "1" && (
                          <span className="text-xs text-blue-600 ml-1">
                            (Min:{" "}
                            {partialAmountType === "total"
                              ? minPartialAmount
                              : `${minPartialAmount} × ${
                                  selectedSeats.length
                                } = ${minPartialAmount * selectedSeats.length}`}
                            )
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        min={
                          formData.is_partial_payment === "1"
                            ? partialAmountType === "total"
                              ? minPartialAmount
                              : minPartialAmount * selectedSeats.length
                            : totalAmount
                        }
                        max={totalAmount}
                        disabled={formData.is_partial_payment !== "1"}
                        className={`w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 md:p-3 border ${
                          formData.is_partial_payment !== "1"
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }`}
                      />
                      {amountError && (
                        <p className="text-red-500 text-xs mt-1">
                          {amountError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("booking.totalAmount")}
                      </label>
                      <input
                        readOnly
                        type="text"
                        value={totalAmount}
                        className="w-full rounded-lg border-gray-300 shadow-sm bg-blue-50 text-xs p-2 md:p-3 border border-blue-200"
                      />
                    </div>
                    {formData.is_partial_payment === "1" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("booking.remainingAmount")}
                        </label>
                        <input
                          readOnly
                          type="text"
                          value={totalAmount - formData.amount}
                          className="w-full rounded-lg border-gray-300 shadow-sm bg-blue-50 text-xs p-2 md:p-3 border border-blue-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seat Selection Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-5 border border-blue-100 max-h-[500px] md:max-h-[650px] overflow-y-auto">
            <div
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => toggleSection("seats")}
            >
              <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center">
                <FaChair className="mr-2 text-blue-600" />
                {t("booking.selectSeats")}
              </h2>
              <span className="text-blue-600">
                {expandedSections.seats ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expandedSections.seats && (
              <>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-xs bg-blue-100 p-2 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-sm mr-1 md:mr-2"></div>
                    <span>{t("booking.selected")}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-300 rounded-sm mr-1 md:mr-2"></div>
                    <span>{t("booking.booked")}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white border border-blue-300 rounded-sm mr-1 md:mr-2"></div>
                    <span>{t("booking.available")}</span>
                  </div>
                </div>
                {renderSeatLayout()}
                {errors.tickets && (
                  <p className="text-red-500 text-xs mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    {errors.tickets}
                  </p>
                )}
                {selectedSeats.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg text-xs border border-blue-200">
                    <p className="font-medium text-blue-800">
                      {t("booking.selectedSeats")}:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat.seat_number}
                          className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                        >
                          {formatSeatNumber(seat.seat_number)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-blue-300">
                      <p className="font-medium text-blue-800">
                        {t("booking.totalAmount")}:{" "}
                        <span className="text-green-700">{totalAmount}</span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse md:flex-row justify-between items-center pt-4 border-t border-gray-200 gap-4 md:gap-0">
          <div className="text-xs md:text-sm text-gray-600 w-full md:w-auto">
            {selectedSeats.length > 0 && (
              <p className="flex flex-col md:flex-row items-start md:items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-0 md:mr-2 mb-2 md:mb-0">
                  {selectedSeats.length} {t("booking.seatsSelected")}
                </span>
                <span className="font-medium">
                  {t("booking.total")}:{" "}
                  <span className="text-green-600">{totalAmount}</span>
                </span>
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || selectedSeats.length === 0 || !selectedTrip}
            className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("booking.creating")}
              </>
            ) : (
              <>
                <FaChair className="mr-2" />
                {t("booking.createBooking")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBooking;

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import * as Yup from 'yup';
// import { useTranslation } from 'react-i18next';
// import Select from 'react-select';
// import { createBooking } from '../../store/slices/bookingSlice';
// import { fetchActiveTrips, fetchTrips, showTrip } from '../../store/slices/tripSlice';
// import { fetchBusById } from '../../store/slices/busSlice';
// import Swal from 'sweetalert2';
// import { formatSeatNumber } from '../../utils/utils';
// import PersianDateText from '../../utils/persianDateShowFormat';

// const AddBooking = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { t } = useTranslation();
//     const { trips,activeTrips, loading,selectedTrip } = useSelector((state) => state.trips);
//     const {bus}=useSelector((state)=>state.buses)
//     const [trip, setTrip] = useState(null);
//     const [ticketPrices,setTicketPrices]=useState(null)
//     const [minPartialAmount,setMinPartialAmount]=useState(0)
//     const [partialAmountType,setPartialAmountType]=useState("")
//     const [totalAmount,setTotalAmount]=useState(0)
//     const [useCustomerInfo, setUseCustomerInfo] = useState(false);

//     const [formData, setFormData] = useState({
//         trip_id: '',
//         is_partial_payment: '0',
//         amount: 0,
//         customer_mobile: '',
//         customer_first_name: '',
//         customer_last_name: '',
//         tickets: [],
//     });

//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedTripId, setSelectedTripId] = useState(null);
//     const [selectedSeats, setSelectedSeats] = useState([]);
//     const [errors, setErrors] = useState({});
//     const [amountError, setAmountError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         dispatch(fetchActiveTrips({ search: searchTerm }));
//     }, [dispatch, searchTerm]);

//     useEffect(() => {
//         if (selectedTripId) {
//             dispatch(showTrip({ trip_id: selectedTripId }));
//         }
//     }, [selectedTripId, dispatch]);

//     useEffect(() => {
//         if (selectedTrip && selectedTrip.bus && selectedTrip.bus.id) {
//             setTrip(selectedTrip);
//             setFormData(prev => ({
//                 ...prev,
//                 is_partial_payment: String(selectedTrip.allow_partial_payment || '0'),
//                 amount: selectedTrip.allow_partial_payment === "1" ?
//                     (selectedTrip.partial_payment_type === "total" ?
//                         selectedTrip.min_partial_payment :
//                         selectedTrip.min_partial_payment * 0)
//                     : 0
//             }));
//             setMinPartialAmount(selectedTrip.min_partial_payment);
//             setPartialAmountType(selectedTrip.partial_payment_type);
//             setTicketPrices(selectedTrip?.seat_prices);
//             dispatch(fetchBusById(selectedTrip.bus.id));
//         }
//     }, [selectedTrip, dispatch]);

//     useEffect(() => {
//         const totalAmount = selectedSeats.reduce((sum, seat) => {
//             const seatPrice = ticketPrices?.find(tp => tp.seat_number === seat.seat_number);
//             return sum + (seatPrice ? Number(seatPrice.ticket_price) : 0);
//         }, 0);
//         setTotalAmount(totalAmount);

//         if (formData.is_partial_payment !== "1") {
//             setFormData(prev => ({
//                 ...prev,
//                 amount: totalAmount,
//             }));
//         } else {
//             let partialAmount = 0;
//             if (partialAmountType === "total") {
//                 partialAmount = minPartialAmount;
//             } else if (partialAmountType === "per_seat") {
//                 partialAmount = minPartialAmount * selectedSeats.length;
//             }
//             setFormData(prev => ({
//                 ...prev,
//                 amount: Math.min(partialAmount, totalAmount),
//             }));
//         }
//     }, [selectedSeats, ticketPrices, formData.is_partial_payment, minPartialAmount, partialAmountType]);

//     useEffect(() => {
//         if (useCustomerInfo && formData.customer_first_name && formData.customer_last_name && formData.customer_mobile) {
//             const updatedSeats = selectedSeats.map(seat => ({
//                 ...seat,
//                 first_name: formData.customer_first_name,
//                 last_name: formData.customer_last_name,
//                 phone: formData.customer_mobile
//             }));
//             setSelectedSeats(updatedSeats);
//         }
//     }, [useCustomerInfo, formData.customer_first_name, formData.customer_last_name, formData.customer_mobile]);

//     const tripOptions = activeTrips.map(trip => ({
//         value: trip.id,
//         // label: `${trip?.route?.origin_station?.name} → ${trip?.route?.destination_station?.name} - ${new Date(trip.departure_time).toLocaleString()} (${trip.bus?.name})`
// label: (
//   <>
//     {trip?.route?.origin_station?.name} → {trip?.route?.destination_station?.name} -
//     <PersianDateText value={trip.departure_time} /> ({trip.bus?.name})
//   </>
// )
//     }));

//     const handleTripSelect = (selectedOption) => {
//         setFormData({...formData,trip_id:selectedOption.value})
//         setSelectedTripId(selectedOption.value);
//         setSelectedSeats([]);
//         setErrors({})
//         setAmountError("")
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleAmountChange = (e) => {
//         const value = parseFloat(e.target.value) || 0;

//         if (formData.is_partial_payment === "1") {
//             const minAmount = partialAmountType === "total" ?
//                 minPartialAmount :
//                 minPartialAmount * selectedSeats.length;

//             if (value < minAmount) {
//                 setAmountError(`Amount must be at least ${minAmount}`);
//             } else if (value > totalAmount) {
//                 setAmountError(`Amount cannot exceed total ${totalAmount}`);
//             } else {
//                 setAmountError('');
//             }
//         } else {
//             setAmountError('');
//         }

//         setFormData({
//             ...formData,
//             amount: formData.is_partial_payment === "1" ? value : totalAmount,
//         });
//     };

//     const handleSeatSelect = (seat) => {
//         setSelectedSeats(prev => {
//             const isAlreadySelected = prev.some(s => s.seat_number === seat.seat_number);

//             if (isAlreadySelected) {
//                 return prev.filter(s => s.seat_number !== seat.seat_number);
//             } else {
//                 return [...prev, {
//                     trip_seat_price_id: seat.trip_seat_price_id,
//                     price: seat.price,
//                     seat_number: seat.seat_number,
//                     first_name: useCustomerInfo ? formData.customer_first_name : '',
//                     last_name: useCustomerInfo ? formData.customer_last_name : '',
//                     email: '',
//                     phone: useCustomerInfo ? formData.customer_mobile : '',
//                     national_id: '',
//                     birthday: '',
//                     gender: 'male',
//                     is_child: 0
//                 }];
//             }
//         });
//     };

//     const handlePassengerChange = (index, field, value) => {
//         setSelectedSeats(prev => {
//             const updated = [...prev];
//             updated[index] = { ...updated[index], [field]: value };
//             return updated;
//         });
//     };

//     const bookingSchema = Yup.object().shape({
//         trip_id: Yup.number()
//             .required(t('booking.tripRequired'))
//             .positive(t('booking.tripRequired')),
//         customer_mobile: Yup.string()
//             .required(t('booking.mobileRequired')),
//         customer_first_name: Yup.string()
//             .required(t('booking.firstNameRequired')),
//         customer_last_name: Yup.string()
//             .required(t('booking.lastNameRequired')),
//         tickets: Yup.array()
//             .min(1, t('booking.atLeastOneSeat'))
//             .of(
//                 Yup.object().shape({
//                     first_name: Yup.string().required(t('booking.passengerFirstNameRequired')),
//                     last_name: Yup.string().required(t('booking.passengerLastNameRequired')),
//                     phone: Yup.string().required(t('booking.passengerPhoneRequired')),
//                     gender: Yup.string().required(t('booking.passengerGenderRequired')),
//                 })
//             ),
//             amount: Yup.number()
//             .required(t('booking.amountRequired'))
//             .test(
//                 'amount-validation',
//                 t('booking.amountInvalid'),
//                 function(value) {
//                     const { is_partial_payment } = this.parent;

//                     if (is_partial_payment === "1") {
//                         const minAmount = partialAmountType === "total"
//                             ? minPartialAmount
//                             : minPartialAmount * selectedSeats.length;

//                         return value >= minAmount && value <= totalAmount;
//                     } else {
//                         return value === totalAmount;
//                     }
//                 }
//             )
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const ticketsData = selectedSeats.map(seat => ({
//                 first_name: seat.first_name,
//                 last_name: seat.last_name,
//                 email: seat.email || '',
//                 phone: seat.phone,
//                 national_id: seat.national_id || '',
//                 birthday: seat.birthday || '',
//                 gender: seat.gender,
//                 trip_seat_price_id: seat.trip_seat_price_id,
//                 is_child: seat.is_child || 0
//             }));

//             const bookingData = {
//                 ...formData,
//                 tickets: ticketsData
//             };

//             await bookingSchema.validate(bookingData, { abortEarly: false });
//             if(bookingData.is_partial_payment==="0"){
//                 bookingData.amount=0
//             }

//             const resultAction = await dispatch(createBooking(bookingData));

//         if (createBooking.fulfilled.match(resultAction)) {
//             Swal.fire({
//                 title: t('success'),
//                 text: t('bookingSuccess'),
//                 icon: 'success',
//                 confirmButtonText: 'OK'
//             }).then(() => {
//                 navigate('/bookings');
//             });
//         }

//         } catch (error) {
//             console.log(error)
//             if (error instanceof Yup.ValidationError) {
//                 const newErrors = {};
//                 error.inner.forEach(err => {
//                     newErrors[err.path] = err.message;
//                 });
//                 setErrors(newErrors);
//             } else {
//                 Swal.fire({
//                     title: t('error'),
//                     text: error || t('bookingFailed'),
//                     icon: 'error',
//                     confirmButtonText: 'OK'
//                 });
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const tooltipContent = (seat) => (
//         <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm">
//             <table className="min-w-full divide-y divide-gray-200">
//                 <tbody className="bg-white divide-y divide-gray-200">
//                     <tr>
//                         <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Type</td>
//                         <td className="px-2 py-1 whitespace-nowrap text-gray-500">
//                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
//                                 seat.seat_type === 'window' ? 'bg-blue-100 text-blue-800' :
//                                 seat.seat_type === 'aisle' ? 'bg-green-100 text-green-800' :
//                                 'bg-gray-100 text-gray-800'
//                             }`}>
//                                 {seat.seat_type || 'N/A'}
//                             </span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Class</td>
//                         <td className="px-2 py-1 whitespace-nowrap text-gray-500">
//                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
//                                 seat.seat_class === 'economic' ? 'bg-purple-100 text-purple-800' :
//                                 seat.seat_class === 'business' ? 'bg-yellow-100 text-yellow-800' :
//                                 'bg-gray-100 text-gray-800'
//                             }`}>
//                                 {seat.seat_class || 'N/A'}
//                             </span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Recliner</td>
//                         <td className="px-2 py-1 whitespace-nowrap text-gray-500">
//                             {seat.is_recliner ? (
//                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
//                                     Yes
//                                 </span>
//                             ) : (
//                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
//                                     No
//                                 </span>
//                             )}
//                         </td>
//                     </tr>
//                     <tr>
//                         <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Sleeper</td>
//                         <td className="px-2 py-1 whitespace-nowrap text-gray-500">
//                             {seat.is_sleeper ? (
//                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
//                                     Yes
//                                 </span>
//                             ) : (
//                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
//                                     No
//                                 </span>
//                             )}
//                         </td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     );

//     const renderSeatLayout = () => {
//         if (!selectedTripId||!bus?.seats) return null;

//         const { rows, columns, seats } = bus.seats;

//         const leftSeats = Math.ceil(columns / 2);
//         const rightSeats = columns - leftSeats;

//         return (
//             <div className="grid gap-3 mt-3">
//                 {Array.from({ length: rows }, (_, rowIndex) => (
//                     <div key={rowIndex} className="flex gap-3 justify-between mb-2 bg-gray-100 rounded p-2">
//                         <div className="flex gap-2">
//                             {Array.from({ length: leftSeats }, (_, colIndex) => {
//                                 const seatNumber = colIndex + 1;
//                                 const seat = seats.find(s => s.row === rowIndex + 1 && s.column === seatNumber);
//                                 const _seatNumber = parseInt(`${rowIndex + 1}${colIndex + 1}`);
//                                 const seat_price = ticketPrices?.find(s => s.seat_number == _seatNumber);
//                                 const isSelected = selectedSeats.some(s => s.seat_number === _seatNumber);
//                                 const isBooked = !seat_price?.is_avaiable;

//                                 if (!seat) return null;

//                                 return (
//                                     <div key={`left-${colIndex}`} className="relative group">
//                                         <button
//                                             type="button"
//                                             disabled={isBooked}
//                                             onClick={() => handleSeatSelect({
//                                                 ...seat,
//                                                 trip_seat_price_id: seat_price?.id,
//                                                 price: seat_price?.ticket_price,
//                                                 seat_number: _seatNumber
//                                             })}
//                                             className={`w-14 h-12 rounded-sm p-1 flex flex-col items-center justify-center text-sm ${
//                                                 isBooked ? 'bg-red-200 cursor-not-allowed' :
//                                                 isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'
//                                             } hover:${isBooked ? '' : 'bg-blue-100'}`}
//                                         >
//                                             <span className="font-medium text-xs">
//                                                 {String.fromCharCode(65 + rowIndex)}{seatNumber}
//                                             </span>
//                                             {seat_price && (
//                                                 <span className="text-xs">{seat_price.ticket_price}</span>
//                                             )}
//                                         </button>
//                                         <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-sm w-40 text-left">
//                                             {tooltipContent(seat)}
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         <div className="w-6"></div>

//                         <div className="flex gap-2">
//                             {Array.from({ length: rightSeats }, (_, colIndex) => {
//                                 const seatNumber = leftSeats + colIndex + 1;
//                                 const seat = seats.find(s => s.row === rowIndex + 1 && s.column === seatNumber);
//                                 const _seatNumber = parseInt(`${rowIndex + 1}${seatNumber}`);
//                                 const seat_price = ticketPrices?.find(s => s.seat_number == _seatNumber);
//                                 const isSelected = selectedSeats.some(s => s.seat_number === _seatNumber);
//                                 const isBooked = !seat_price?.is_avaiable;

//                                 if (!seat) return null;

//                                 return (
//                                     <div key={`right-${colIndex}`} className="relative group">
//                                         <button
//                                             type="button"
//                                             disabled={isBooked}
//                                             onClick={() => handleSeatSelect({
//                                                 ...seat,
//                                                 trip_seat_price_id: seat_price?.id,
//                                                 price: seat_price?.ticket_price,
//                                                 seat_number: _seatNumber
//                                             })}
//                                             className={`w-14 h-12 rounded-sm p-1 flex flex-col items-center justify-center text-sm ${
//                                                 isBooked ? 'bg-red-200 cursor-not-allowed' :
//                                                 isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'
//                                             } hover:${isBooked ? '' : 'bg-blue-100'}`}
//                                         >
//                                             <span className="font-medium text-xs">
//                                                 {String.fromCharCode(65 + rowIndex)}{seatNumber}
//                                             </span>
//                                             {seat_price && (
//                                                 <span className="text-xs">{seat_price.ticket_price}</span>
//                                             )}
//                                         </button>
//                                         <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-sm w-40 text-left">
//                                             {tooltipContent(seat)}
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     const renderPassengerForms = () => {
//         return selectedSeats.map((seat, index) => (
//             <div key={seat.trip_seat_price_id} className="bg-gray-50 p-3 rounded-sm mb-3 text-base">
//                 <h3 className="text-base font-medium mb-2">
//                     {t('booking.passengerInfo')} - Seat {formatSeatNumber(seat.seat_number)}
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.firstName')} *
//                         </label>
//                         <input
//                             type="text"
//                             value={seat.first_name}
//                             onChange={(e) => handlePassengerChange(index, 'first_name', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                             required
//                         />
//                         {errors[`tickets[${index}].first_name`] && (
//                             <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].first_name`]}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.lastName')} *
//                         </label>
//                         <input
//                             type="text"
//                             value={seat.last_name}
//                             onChange={(e) => handlePassengerChange(index, 'last_name', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                             required
//                         />
//                         {errors[`tickets[${index}].last_name`] && (
//                             <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].last_name`]}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.email')}
//                         </label>
//                         <input
//                             type="email"
//                             value={seat.email}
//                             onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.phone')} *
//                         </label>
//                         <input
//                             type="tel"
//                             value={seat.phone}
//                             onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                             required
//                         />
//                         {errors[`tickets[${index}].phone`] && (
//                             <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].phone`]}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.nationalId')}
//                         </label>
//                         <input
//                             type="text"
//                             value={seat.national_id}
//                             onChange={(e) => handlePassengerChange(index, 'national_id', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.birthday')}
//                         </label>
//                         <input
//                             type="date"
//                             value={seat.birthday}
//                             onChange={(e) => handlePassengerChange(index, 'birthday', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('booking.gender')} *
//                         </label>
//                         <select
//                             value={seat.gender}
//                             onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                             required
//                         >
//                             <option value="male">{t('booking.male')}</option>
//                             <option value="female">{t('booking.female')}</option>
//                             <option value="other">{t('booking.other')}</option>
//                         </select>
//                         {errors[`tickets[${index}].gender`] && (
//                             <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].gender`]}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {t('is_child')}
//                         </label>
//                         <select
//                             value={seat.is_child}
//                             onChange={(e) => handlePassengerChange(index, 'is_child', e.target.value)}
//                             className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                         >
//                             <option value="0">{t('no')}</option>
//                             <option value="1">{t('yes')}</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>
//         ));
//     };

//     return (
//         <div className="container mx-auto px-4 py-6 text-base">
//             <h1 className="text-xl font-bold mb-4">{t('booking.newBooking')}</h1>

//             <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 {t('booking.selectTrip')} *
//                             </label>
//                             <Select
//                                 options={tripOptions}
//                                 value={selectedTripId ? tripOptions.find(option => option.value === selectedTripId) : null}
//                                 onChange={handleTripSelect}
//                                 onInputChange={setSearchTerm}
//                                 placeholder={t('booking.searchTrip')}
//                                 className="basic-multi-select text-sm"
//                                 classNamePrefix="select"
//                                 isSearchable
//                                 isLoading={loading}
//                                 noOptionsMessage={() => t('booking.noTripsFound')}
//                                 styles={{
//                                     control: (base) => ({
//                                         ...base,
//                                         minHeight: '36px'
//                                     }),
//                                     dropdownIndicator: (base) => ({
//                                         ...base,
//                                         padding: '6px'
//                                     }),
//                                     clearIndicator: (base) => ({
//                                         ...base,
//                                         padding: '6px'
//                                     }),
//                                     valueContainer: (base) => ({
//                                         ...base,
//                                         padding: '2px 8px'
//                                     }),
//                                     input: (base) => ({
//                                         ...base,
//                                         margin: '0px',
//                                         padding: '0px'
//                                     })
//                                 }}
//                             />
//                             {errors.trip_id && (
//                                 <p className="text-red-500 text-xs mt-1">{errors.trip_id}</p>
//                             )}
//                         </div>

//                         {(trip && selectedTripId) && (
//                             <div className="p-3 bg-blue-50 rounded-lg text-sm">
//                                 <h2 className="text-base font-semibold mb-2">{t('booking.tripDetails')}</h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                     <div>
//                                         <p className="font-medium">{t('booking.route')}</p>
//                                         <p>{trip?.route?.name} → {trip.end_point}</p>
//                                     </div>
//                                     <div>
//                                         <p className="font-medium">{t('booking.departure')}</p>
//                                         {/* <p>{new Date(trip.departure_time).toLocaleString()}</p> */}
//                                         {<PersianDateText value={trip.departure_time} />}
//                                     </div>
//                                     <div>
//                                         <p className="font-medium">{t('booking.bus')}</p>
//                                         <p>{trip.bus?.name} ({trip.bus?.bus_number})</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                          <div>
//                             <h2 className="text-base font-semibold mb-3">{t('booking.customerDetails')}</h2>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.firstName')} *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="customer_first_name"
//                                         value={formData.customer_first_name}
//                                         onChange={handleChange}
//                                         className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                                         required
//                                     />
//                                     {errors.customer_first_name && (
//                                         <p className="text-red-500 text-xs mt-1">{errors.customer_first_name}</p>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.lastName')} *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="customer_last_name"
//                                         value={formData.customer_last_name}
//                                         onChange={handleChange}
//                                         className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                                         required
//                                     />
//                                     {errors.customer_last_name && (
//                                         <p className="text-red-500 text-xs mt-1">{errors.customer_last_name}</p>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.mobile')} *
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         name="customer_mobile"
//                                         value={formData.customer_mobile}
//                                         onChange={handleChange}
//                                         className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
//                                         required
//                                     />
//                                     {errors.customer_mobile && (
//                                         <p className="text-red-500 text-xs mt-1">{errors.customer_mobile}</p>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="mt-3">
//                                 <label className="inline-flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         checked={useCustomerInfo}
//                                         onChange={(e) => setUseCustomerInfo(e.target.checked)}
//                                         className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//                                     />
//                                     <span className="ml-2 text-sm text-gray-700">
//                                         {t('booking.useCustomerInfoForPassengers')}
//                                     </span>
//                                 </label>
//                             </div>
//                         </div>

//                         {selectedSeats.length > 0 && (
//                             <div>
//                                 <h2 className="text-base font-semibold mb-3">{t('booking.passengerDetails')}</h2>
//                                 {renderPassengerForms()}
//                             </div>
//                         )}

//                         <div className="p-3 bg-gray-50 rounded-lg text-sm">
//                             <h2 className="text-base font-semibold mb-3">{t('booking.paymentDetails')}</h2>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.paymentType')}
//                                     </label>
//                                     <input
//                                         className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
//                                         value={(formData.is_partial_payment === "1")
//                                             ? t("booking.partialPayment")
//                                             : t("booking.fullPayment")}
//                                         readOnly
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.paymentAmount')}
//                                         {formData.is_partial_payment === "1" && (
//                                             <span className="text-xs text-gray-500">
//                                                 (Min: {partialAmountType === "total" ?
//                                                     minPartialAmount :
//                                                     `${minPartialAmount} × ${selectedSeats.length} = ${minPartialAmount * selectedSeats.length}`})
//                                             </span>
//                                         )}
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="amount"
//                                         value={formData.amount}
//                                         onChange={handleAmountChange}
//                                         min={formData.is_partial_payment === "1" ?
//                                             (partialAmountType === "total" ? minPartialAmount : minPartialAmount * selectedSeats.length)
//                                             : totalAmount}
//                                         max={totalAmount}
//                                         disabled={formData.is_partial_payment !== "1"}
//                                         className={`w-full rounded border-gray-300 shadow-sm text-sm p-2 ${
//                                             formData.is_partial_payment !== "1" ? 'bg-gray-100' : ''
//                                         }`}
//                                     />
//                                     {amountError && (
//                                         <p className="text-red-500 text-xs mt-1">{amountError}</p>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {t('booking.totalAmount')}
//                                     </label>
//                                     <input
//                                         readOnly
//                                         type="text"
//                                         value={totalAmount}
//                                         className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
//                                     />
//                                 </div>
//                                 {formData.is_partial_payment === "1" && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             {t('booking.remainingAmount')}
//                                         </label>
//                                         <input
//                                             readOnly
//                                             type="text"
//                                             value={totalAmount - formData.amount}
//                                             className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     <div className="p-4 bg-white rounded-lg shadow border border-gray-200 max-h-[600px] overflow-y-auto">
//                         <h2 className="text-base font-semibold mb-3">{t('booking.selectSeats')}</h2>
//                         <div className="flex items-center gap-3 mb-3 text-sm">
//                             <div className="flex items-center">
//                                 <div className="w-4 h-4 bg-green-200 mr-2"></div>
//                                 <span>{t('booking.selected')}</span>
//                             </div>
//                             <div className="flex items-center">
//                                 <div className="w-4 h-4 bg-red-200 mr-2"></div>
//                                 <span>{t('booking.booked')}</span>
//                             </div>
//                             <div className="flex items-center">
//                                 <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
//                                 <span>{t('booking.available')}</span>
//                             </div>
//                         </div>
//                         {renderSeatLayout()}
//                         {errors.tickets && (
//                             <p className="text-red-500 text-sm mt-2">{errors.tickets}</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="mt-4 flex justify-end">
//                     <button
//                         type="submit"
//                         disabled={isLoading || selectedSeats.length === 0 || !selectedTrip}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//                     >
//                         {isLoading ? t('booking.creating') : t('booking.createBooking')}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddBooking;
