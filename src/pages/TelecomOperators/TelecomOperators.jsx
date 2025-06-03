import PageMeta from "../../components/common/PageMeta";
import TelecomOperatorList from "./TelecomOperatorList";

export default function TelecomOperators() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <TelecomOperatorList/>
      </div>
    </>
  );
}
