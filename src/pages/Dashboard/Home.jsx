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

export default function Home() {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(fetchDashboardData({}));
  }, [dispatch]);

  const iconMap = {
    bus_count:Bus,
    customers_count:User_Group,
    agents_count:User_Group,
    vendors_count:User_Group,
    trip_count:Trip,
    active_trip_count:Trip,
    all_booking_count:Booking,
    pending_booking_count:Booking,
    paid_booking_count:Booking,
    partial_paid_booking_count:Booking,
    cancelled_booking_count:Booking,
    all_ticket_count:Ticket,
    booked_ticket_count:Ticket,
    used_ticket_count:Ticket,
    cancelled_ticket_count:Ticket,
    total_balance:DollarLineIcon,
    customers_total_balance:DollarLineIcon,
    agents_total_balance:DollarLineIcon,
    vendors_total_balance:DollarLineIcon
  };

  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    return (
      <>
        <PageMeta title="Bus Booking" description="" />
        <div>Loading data...</div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Object.entries(data).map(([key, value]) => {
        const Icon = iconMap[key] 
        
        return (
          <ComponentCard 
            key={key}
            title={key}
            value={value.toString()}
            icon={Icon}
          />
        );
      })}
      </div>
    </>
  );
}