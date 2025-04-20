import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { fetchWallets } from "../../store/slices/vendorWalletSlice";

export default function VendorWallet() {
  const dispatch = useDispatch();
  const { balance } = useSelector((state) => state.vendorWallet);

  useEffect(()=>{
    dispatch(fetchWallets({}))
  },[dispatch])

  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="text-center mt-3">
        <p className="font-bold text-[32px]">Balance is: {balance}</p>
      </div>
    </>
  );
}
