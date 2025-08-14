import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showTrip } from "../../store/slices/tripSlice";
import { fetchBusById } from "../../store/slices/busSlice";
import { useTranslation } from "react-i18next";

export default function TripView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Get trip details from Redux store
  const { selectedTrip, loading } = useSelector((state) => state.trips);
  const { bus } = useSelector((state) => state.buses);
  const [ticketPrices, setTicketPrices] = useState(null);

  // Fetch trip details on component mount
  useEffect(() => {
    dispatch(showTrip({ trip_id: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedTrip) {
      setTicketPrices(selectedTrip.seat_prices);
      dispatch(fetchBusById(selectedTrip.bus?.id));
    }
  }, [dispatch, selectedTrip]);

  // Render seat layout
  const renderSeatLayout = () => {
    if (!selectedTrip || !bus?.seats) return null;

    const { rows, columns, seats } = bus.seats;
    const leftSeats = Math.ceil(columns / 2);
    const rightSeats = columns - leftSeats;

    return (
      <div className="overflow-x-auto py-2">
        <div className="">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-4 justify-between mb-2 bg-gray-100 rounded-md p-2"
            >
              {/* Left side seats */}
              <div className="flex gap-2">
                {Array.from({ length: leftSeats }, (_, colIndex) => {
                  const seatNumber = colIndex + 1;
                  const seat = seats.find(
                    (s) => s.row === rowIndex + 1 && s.column === seatNumber
                  );
                  const _seatNumber = parseInt(
                    `${rowIndex + 1}${colIndex + 1}`
                  );
                  const seatPrice = ticketPrices?.find(
                    (s) => s.seat_number == _seatNumber
                  );
                  const isBooked = !seatPrice?.is_avaiable;

                  if (!seat) return null;

                  return (
                    <SeatButton
                      key={`left-${colIndex}`}
                      rowIndex={rowIndex}
                      seatNumber={seatNumber}
                      seatPrice={seatPrice}
                      isBooked={isBooked}
                      seat={seat}
                      basePrice={selectedTrip.ticket_price}
                    />
                  );
                })}
              </div>

              {/* Aisle space with row label */}
              <div className="w-6 flex justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
              </div>

              {/* Right side seats */}
              <div className="flex gap-2">
                {Array.from({ length: rightSeats }, (_, colIndex) => {
                  const seatNumber = leftSeats + colIndex + 1;
                  const seat = seats.find(
                    (s) => s.row === rowIndex + 1 && s.column === seatNumber
                  );
                  const _seatNumber = parseInt(`${rowIndex + 1}${seatNumber}`);
                  const seatPrice = ticketPrices?.find(
                    (s) => s.seat_number == _seatNumber
                  );
                  const isBooked = !seatPrice?.is_avaiable;

                  if (!seat) return null;

                  return (
                    <SeatButton
                      key={`right-${colIndex}`}
                      rowIndex={rowIndex}
                      seatNumber={seatNumber}
                      seatPrice={seatPrice}
                      isBooked={isBooked}
                      seat={seat}
                      basePrice={selectedTrip.ticket_price}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading state
  if (!selectedTrip) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (!selectedTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="p-4 rounded-lg">
          <p className="text-lg font-medium">{t("trip_view.not_found")}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span className="font-medium">{t("common.back")}</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">
            {t("trip_view.details")}
          </h1>
          <p className="text-gray-500 text-sm">
            {selectedTrip.route?.name || "N/A"} •{" "}
            {selectedTrip.bus?.name || "N/A"}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Main content - responsive columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Trip information */}
        <div className="lg:w-1/2 space-y-6">
          {/* Trip summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("trip_view.summary")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title={t("trip_view.vendor")}
                value={selectedTrip.vendor?.short_name}
              />
              <InfoCard
                title={t("trip_view.branch")}
                value={selectedTrip.vendor_branch?.name}
              />
              <InfoCard
                title={t("trip_view.bus")}
                value={selectedTrip.bus?.name}
              />
              <InfoCard
                title={t("trip_view.total_seats")}
                value={selectedTrip.total_seats}
              />
            </div>
          </div>

          {/* Schedule info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("trip_view.schedule")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title={t("trip_view.departure")}
                value={selectedTrip.departure_time}
              />
              <InfoCard
                title={t("trip_view.arrival")}
                value={selectedTrip.arrival_time}
              />
              <InfoCard
                title={t("trip_view.booking_deadline")}
                value={selectedTrip.booking_deadline}
              />
              <InfoCard
                title={t("trip_view.status")}
                value={
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedTrip.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedTrip.status?.toUpperCase()}
                  </span>
                }
              />
            </div>
          </div>

          {/* Additional info */}
         
            <div className="p-3 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                {t("trip_view.partial_payment")}
              </h3>
              <p className="text-xs text-blue-700">
                {t("trip_view.min_partial_payment")}:{" "}
                {selectedTrip?.min_partial_payment} 
              </p>
            </div>
          
        </div>

        {/* Right column - Seat layout */}
        <div className="lg:w-1/2">
          <div className="space-y-4 sticky top-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("trip_view.seat_layout")}
              </h2>
          
            </div>

            {/* Scrollable seat layout */}
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 max-h-[700px] overflow-y-auto">
              {renderSeatLayout()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Seat Button Component
const SeatButton = ({
  rowIndex,
  seatNumber,
  seatPrice,
  isBooked,
  seat,
  basePrice,
}) => {
  const seatLabel = `${String.fromCharCode(65 + rowIndex)}${seatNumber}`;

  return (
    <div className="relative group">
      <button
        type="button"
        disabled={isBooked}
        className={`w-12 h-12 rounded flex flex-col items-center justify-center transition-all
          ${
            isBooked
              ? "bg-red-100 border-red-200 cursor-not-allowed"
              : "border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          }
          text-xs`}
      >
        <span className="font-medium">{seatLabel}</span>
        <span className="font-semibold text-blue-600">
          {seatPrice?.ticket_price || basePrice}
        </span>
      </button>

      {/* Seat tooltip */}
      {/* <div className="absolute z-10 hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-white p-2 rounded shadow border border-gray-200 w-40 text-xs">
          <h4 className="font-medium mb-1">Seat {seatLabel}</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span>{seat.seat_type || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Class:</span>
              <span>{seat.seat_class || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span>{isBooked ? "Booked" : "Available"}</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

// Info Card Component
const InfoCard = ({ title, value }) => (
  <div className="border-b pb-2">
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className="font-medium">{value || "N/A"}</p>
  </div>
);
