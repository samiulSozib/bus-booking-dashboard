import PageMeta from "../../../components/common/PageMeta";
import CountryList from "../Component/CountryList";

export default function Country() {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
        <CountryList/>
      </div>
    </>
  );
}
