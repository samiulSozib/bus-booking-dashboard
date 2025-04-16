import PageMeta from "../../../components/common/PageMeta";
import CityList from "../Component/CityList";

export default function City() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <CityList/>
      </div>
    </>
  );
}
