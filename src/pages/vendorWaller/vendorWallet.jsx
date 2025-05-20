import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { fetchWallets } from "../../store/slices/vendorWalletSlice";
import { useTranslation } from "react-i18next";

export default function VendorWallet() {
  const dispatch = useDispatch();
  const { balance } = useSelector((state) => state.vendorWallet);
  const {t}=useTranslation()

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
        <p className="font-bold text-[32px]">{t('balance_is:')} {balance}</p>
      </div>
    </>
  );
}
