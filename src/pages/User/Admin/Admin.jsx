import PageMeta from "../../../components/common/PageMeta";
import AdminList from "./AdminList";

export default function Admin() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <AdminList/>
      </div>
    </>
  );
}
