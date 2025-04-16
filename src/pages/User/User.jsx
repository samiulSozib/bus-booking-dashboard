import PageMeta from "../../components/common/PageMeta";
import UserList from "./UserList";

export default function User() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <UserList/>
      </div>
    </>
  );
}
