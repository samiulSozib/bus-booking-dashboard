import PageMeta from "../../../components/common/PageMeta";
import CountryList from "../Component/CountryList";

export default function Country() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <CountryList/>
      </div>
    </>
  );
}
