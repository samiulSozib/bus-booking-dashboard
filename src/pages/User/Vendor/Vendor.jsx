import PageMeta from "../../../components/common/PageMeta";
import VendorList from "./VendorList";

export default function Vendor() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <VendorList/>
      </div>
    </>
  );
}
