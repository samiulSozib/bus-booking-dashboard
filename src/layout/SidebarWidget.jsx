import { useSelector } from "react-redux";

export default function SidebarWidget() {
  const { profile } = useSelector((state) => state.auth);
  return (
    <div
      className={`flex items-center mx-auto mb-2 w-full max-w-60 rounded-2xl bg-gray-200 px-2 py-2 text-center dark:bg-white/[0.02]`}>
      
      <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/public/images/user/owner.jpg" alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{profile?.first_name}{profile?.last_name}</span>
      
    </div>
  );
}
