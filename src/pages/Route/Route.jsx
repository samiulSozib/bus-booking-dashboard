import PageMeta from "../../components/common/PageMeta";
import RouteList from "./RouteList";

export default function BusRoute() {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <RouteList/>
      </div>
    </>
  );
}
