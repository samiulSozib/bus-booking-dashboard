import PageMeta from "../../components/common/PageMeta";
import RouteList from "./RouteList";

export default function BusRoute() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <RouteList/>
      </div>
    </>
  );
}
