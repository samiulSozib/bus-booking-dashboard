// import { SidebarProvider, useSidebar } from "../context/SidebarContext";
// import { Outlet } from "react-router";
// import AppHeader from "./AppHeader";
// import Backdrop from "./Backdrop";
// import AppSidebar from "./AppSidebar";

// const LayoutContent = () => {
//   const { isExpanded, isHovered, isMobileOpen } = useSidebar();

//   return (
//     <div className="min-h-screen xl:flex">
//       <div>
//         <AppSidebar />
//         <Backdrop />
//       </div>
//       <div
//         className={`flex-1 transition-all duration-300 ease-in-out ${
//           isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
//         } ${isMobileOpen ? "ml-1" : ""}`}
//       >
//         <AppHeader />
//         <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// const AppLayout = () => {
//   return (
//     <SidebarProvider>
//       <LayoutContent />
//     </SidebarProvider>
//   );
// };

// export default AppLayout;


import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { i18n } = useTranslation(); // Get current language
  const [isRtl, setIsRtl] = useState(false);

  // Detect RTL language and update state
  useEffect(() => {
    setIsRtl(i18n.dir() === "rtl");
  }, [i18n.language]);

  return (
    <div className={`min-h-screen xl:flex ${isRtl ? "rtl" : "ltr"}`}>
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isRtl
            ? isExpanded || isHovered
              ? "lg:mr-[290px]"
              : "lg:mr-[90px]"
            : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]"
        } ${isMobileOpen ? (isRtl ? "mr-1" : "ml-1") : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
