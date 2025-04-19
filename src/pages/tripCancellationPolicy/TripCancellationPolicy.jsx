import PageMeta from "../../components/common/PageMeta";
import TripCancellationPolicyList from "./TripCancellationPolicyList";

export default function TripCancellationPolicy() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <TripCancellationPolicyList/>
      </div>
    </>
  );
}
