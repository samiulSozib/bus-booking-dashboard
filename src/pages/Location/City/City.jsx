import PageMeta from "../../../components/common/PageMeta";
import CityList from "../Component/CityList";

export default function City() {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
        <CityList/>
      </div>
    </>
  );
}
