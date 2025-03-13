import PageMeta from "../../components/common/PageMeta";
import UserList from "./UserList";

export default function User() {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <UserList/>
      </div>
    </>
  );
}
