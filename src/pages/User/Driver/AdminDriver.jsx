import PageMeta from "../../../components/common/PageMeta";
import DriverList from "./DriverList";

export default function AdminDriver() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <DriverList/>
      </div>
    </>
  );
}
