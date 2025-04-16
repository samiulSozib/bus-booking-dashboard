import PageMeta from "../../../components/common/PageMeta";
import ProvinceList from "../Component/ProvinceList";

export default function Province() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <ProvinceList/>
      </div>
    </>
  );
}
