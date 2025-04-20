import PageMeta from "../../components/common/PageMeta";
import AdminWalletList from "./AdminWalletList";

export default function AdminWallet() {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <AdminWalletList/>
      </div>
    </>
  );
}
