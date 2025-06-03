import PageMeta from "../../components/common/PageMeta";
import SettingsList from "./SettingsList";

export default function Settings() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <SettingsList/>
      </div>
    </>
  );
}
