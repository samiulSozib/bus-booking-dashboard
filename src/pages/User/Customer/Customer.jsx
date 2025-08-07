import PageMeta from "../../../components/common/PageMeta";
import CustomerList from "./CustomerList";

export default function Customer() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <CustomerList/>
      </div>
    </>
  );
}
