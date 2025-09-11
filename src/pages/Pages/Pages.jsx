import PageMeta from "../../components/common/PageMeta";
import PageList from "./PageList";

export default function Pages() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <PageList/>
      </div>
    </>
  );
}
