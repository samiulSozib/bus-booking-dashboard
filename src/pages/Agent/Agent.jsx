import PageMeta from "../../components/common/PageMeta";
import AgentList from "./AgentList";

export default function VendorBranchAgent() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <AgentList/>
      </div>
    </>
  );
}
