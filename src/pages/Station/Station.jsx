import PageMeta from "../../components/common/PageMeta";
import StationList from "./StationList";

export default function Station() {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <StationList/>
      </div>
    </>
  );
}
