import PageMeta from "../../components/common/PageMeta";
import RechargeList from "./RechargeList";

export default function Recharge() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <RechargeList/>
      </div>
    </>
  );
}
