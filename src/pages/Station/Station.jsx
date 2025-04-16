import PageMeta from "../../components/common/PageMeta";
import StationList from "./StationList";

export default function Station() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <StationList/>
      </div>
    </>
  );
}
