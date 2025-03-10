import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function SidebarBottom() {
  const {t}=useTranslation()
  return (
    <div
      className={`flex justify-center items-center mx-auto w-full max-w-60 rounded-[50PX] bg-green-600 px-2 py-2 text-center dark:bg-white/[0.02] mb-5`}>
      
      <span className="mr-3 overflow-hidden rounded-full h-8 w-8">
          <img src="/images/img/whatsapp.png" className="w-8 h-8 object-contain"  alt="User" />
        </span>

        <span className="block mr-1 text-sm text-white font-bold">{t('CONTACT_US')}</span>
      
    </div>
  );
}
