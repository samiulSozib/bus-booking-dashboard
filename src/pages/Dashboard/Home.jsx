import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { fetchDashboardData } from "../../store/slices/statisticsSlice";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Booking,
  Bus,
  DollarLineIcon,
  Ticket,
  Trip,
  User_Group,
} from "../../icons";
import { userType } from "../../utils/utils";
import { fetchWebCitiesList } from "../../store/slices/citySlice";

export default function Home() {
  const role = userType();
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(fetchDashboardData({}));
  }, [dispatch]);

  const iconMap = {
    bus_count: Bus,
    customers_count: User_Group,
    agents_count: User_Group,
    vendors_count: User_Group,
    trip_count: Trip,
    active_trip_count: Trip,
    all_booking_count: Booking,
    pending_booking_count: Booking,
    paid_booking_count: Booking,
    partial_paid_booking_count: Booking,
    cancelled_booking_count: Booking,
    all_ticket_count: Ticket,
    booked_ticket_count: Ticket,
    used_ticket_count: Ticket,
    cancelled_ticket_count: Ticket,
    total_balance: DollarLineIcon,
    customers_total_balance: DollarLineIcon,
    agents_total_balance: DollarLineIcon,
    vendors_total_balance: DollarLineIcon,
  };
  const bgGradientMap = {
    bus_count: "bg-gradient-to-r from-blue-100 to-indigo-200",
    trip_count: "bg-gradient-to-r from-purple-100 to-pink-200",
    active_trip_count: "bg-gradient-to-r from-green-100 to-teal-200",
    customers_count: "bg-gradient-to-r from-yellow-100 to-orange-200",
    agents_count: "bg-gradient-to-r from-fuchsia-100 to-purple-200",
    vendors_count: "bg-gradient-to-r from-cyan-100 to-blue-200",
    all_booking_count: "bg-gradient-to-r from-indigo-100 to-purple-200",
    pending_booking_count: "bg-gradient-to-r from-orange-100 to-amber-200",
    paid_booking_count: "bg-gradient-to-r from-green-100 to-emerald-200",
    partial_paid_booking_count:
      "bg-gradient-to-r from-yellow-100 to-yellow-200",
    cancelled_booking_count: "bg-gradient-to-r from-red-100 to-pink-200",
    all_ticket_count: "bg-gradient-to-r from-cyan-100 to-teal-200",
    booked_ticket_count: "bg-gradient-to-r from-sky-100 to-blue-200",
    used_ticket_count: "bg-gradient-to-r from-lime-100 to-green-200",
    cancelled_ticket_count: "bg-gradient-to-r from-rose-100 to-red-200",
    total_balance: "bg-gradient-to-r from-gray-100 to-gray-300",
    customers_total_balance: "bg-gradient-to-r from-yellow-200 to-amber-200",
    agents_total_balance: "bg-gradient-to-r from-purple-200 to-indigo-200",
    vendors_total_balance: "bg-gradient-to-r from-blue-200 to-cyan-200",
  };

  // Check if data exists and is an object
  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Bus Booking" description="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Object.entries(data).map(([key, value]) => {
          const Icon = iconMap[key];
          const bgClass = bgGradientMap[key] || "bg-white dark:bg-white/[0.03]";

          return (
            <ComponentCard
              key={key}
              title={key}
              value={value.toString()}
              icon={Icon}
              bgClass={bgClass}
            />
          );
        })}
      </div>
    </>
  );
}
