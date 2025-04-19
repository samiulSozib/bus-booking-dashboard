import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  HorizontaLDots,
  Dashboard,
  User_Group,
  UserIcon,
  Location,
  Direction,
  Station,
  Discount,
  Trip,
  Wallet,
  Bus,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useTranslation } from "react-i18next";
import SidebarBottom from "./SidebarBottom";
import {userType } from "../utils/utils";
import { parse } from "postcss";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isRtl, setIsRtl] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // Get user role
  const user = userType()
  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";
  const isAgent = user?.role === "agent";


  // Memoized navigation items configuration
  const navItems = useMemo(() => [
    {
      icon: <Dashboard />,
      name: "DASHBOARD",
      path: "/",
      roles: ["admin", "vendor","agent"]
    },
    {
      icon: <Location />,
      name: "LOCATION",
      roles: ["admin"],
      subItems: [
        { name: "COUNTRY", path: "/location/countries" },
        { name: "PROVINCE", path: "/location/provinces" },
        { name: "CITY", path: "/location/cities" }
      ],
    },
    {
      icon: <Direction />,
      name: "ROUTES",
      path: "/routes",
      roles: ["admin"]
    },
    {
      icon: <Station />,
      name: "STATIONS",
      path: "/stations",
      roles: ["admin"]
    },
    {
      icon: <Discount />,
      name: "DISCOUNTS",
      path: "/discounts",
      roles: ["admin"]
    },
    {
      icon: <Trip />,
      name: "TRIPS",
      path: "/trips",
      roles: ["admin", "vendor"]
    },
    {
      icon: <User_Group />,
      name: "USERS",
      path: "/users",
      roles: ["admin"]
    },
    {
      icon: <Wallet />,
      name: "WALLET_TRANSACTION",
      path: "/wallet-transactions",
      roles: ["admin"]
    },
    {
      icon: <Bus />,
      name: "BUS",
      path: "/buses",
      roles: ["admin", "vendor"]
    },
    {
      icon: <User_Group />,
      name: "DRIVERS",
      path: "/drivers",
      roles: ["vendor"]
    },
    
    {
      icon: <User_Group />,
      name: "BOOKING",
      path: "/bookings",
      roles: ["agent"]
    },
    {
      icon: <User_Group />,
      name: "TRIP_CANCELLATION_POLICY",
      path: "/trip-cancellation-policy",
      roles: ["admin"]
    }
  ], []);

  const othersItems = useMemo(() => [
    {
      icon: <UserIcon />,
      name: "PROFILE",
      path: "/profile",
      roles: ["admin", "vendor"]
    },
  ], []);

  // Memoize filtered items
  const filterItemsByRole = useCallback((items) => {
    return items.filter(item => {
      if (!item.roles) return false;
      // Admin sees everything (except items without roles)
      if (isAdmin) return true;
      // Others only see items that include their role
      return item.roles.includes(user?.role);
    });
  }, [isAdmin, user?.role]);

  const filteredNavItems = useMemo(() => filterItemsByRole(navItems), [filterItemsByRole, navItems]);
  const filteredOthersItems = useMemo(() => filterItemsByRole(othersItems), [filterItemsByRole, othersItems]);

  // RTL detection
  useEffect(() => {
    setIsRtl(i18n.dir() === "rtl");
  }, [i18n.language]);

  // Active route detection
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Submenu auto-expand logic
  useEffect(() => {
    let submenuMatched = false;
    
    const checkSubItems = (items, menuType) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    };

    checkSubItems(navItems, "main");
    checkSubItems(othersItems, "others");

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive, navItems, othersItems]);

  // Calculate submenu height when opened
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Toggle submenu
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu?.type === menuType && prevOpenSubmenu?.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Render menu items
  const renderMenuItems = useCallback((items, menuType) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={`${menuType}-${index}-${nav.name}`}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{t(nav.name)}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="text-sm font-normal menu-item-text">
                    {t(nav.name)}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {t(subItem.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  ), [openSubmenu, isExpanded, isHovered, isMobileOpen, isActive, t, subMenuHeight]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100vh-4rem)] sm:h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"}
        lg:translate-x-0
        ${isRtl ? "right-0 border-l border-r-0" : "left-0 border-r border-l-0"}
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden rounded-xl"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&s"
                alt="Logo"
                width={60}
                height={40}
              />
              <img
                className="hidden dark:block rounded-xl"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&sg"
                alt="Logo"
                width={60}
                height={40}
              />
            </>
          ) : (
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&s" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 font-bold text-xs uppercase flex leading-[20px] text-black-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "General" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarBottom /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;