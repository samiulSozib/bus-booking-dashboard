import { useSelector } from "react-redux";

export default function SidebarWidget() {
  const { user_info } = useSelector((state) => state.auth);
  return (
    <div
      className={`flex items-center mx-auto mb-2 w-full max-w-60 rounded-2xl bg-gray-200 px-2 py-2 text-center dark:bg-white/[0.02]`}>
      
      <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src={user_info?.reseller?.profile_image_url} alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{user_info?.name}</span>
      
    </div>
  );
}
