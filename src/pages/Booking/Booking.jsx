import PageMeta from "../../components/common/PageMeta";
import BookingList from "./BookingList";

export default function Booking() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <BookingList/>
      </div>
    </>
  );
}
