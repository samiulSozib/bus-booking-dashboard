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
  Settings,
  Ticket,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useTranslation } from "react-i18next";
import SidebarBottom from "./SidebarBottom";
import { userType } from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPermissions } from "../store/slices/vendorUserSlice";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isRtl, setIsRtl] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const dispatch = useDispatch();
  //   const {
  //   userPermissions,
  // } = useSelector((state) => state.vendorUser);

  // Get user role
  const user = userType();
  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";
  const isAgent = user?.role === "agent";
  const isVendorUser = user?.role === "vendor_user";

  // useEffect(()=>{
  //   dispatch(fetchUserPermissions(user?.id))
  // },[dispatch])

  // useEffect(()=>{
  //   //console.log(userPermissions)
  // },[dispatch,userPermissions])

  const profile = localStorage.getItem("profile");
  const userPermissions = profile ? JSON.parse(profile)?.permissions || [] : [];

  // Helper function to check permissions
  const hasPermission = useCallback(
    (permissionName) => {
      if (!isVendorUser) return true; // Skip check for non-vendor users
      return userPermissions.some(
        (perm) => perm.name === permissionName && perm.has_permission
      );
    },
    [isVendorUser, userPermissions]
  );

  const navItems = useMemo(
    () => [
      {
        icon: <Dashboard />,
        name: "DASHBOARD",
        path: "/",
        roles: ["admin", "vendor", "agent", "vendor_user"],
        permission: "v1.vendor.statistics.general_statistics", // No permission required for dashboard
      },
      {
        icon: <Location />,
        name: "LOCATION",
        roles: ["admin"],
        subItems: [
          { name: "COUNTRY", path: "/location/countries" },
          { name: "PROVINCE", path: "/location/provinces" },
          { name: "CITY", path: "/location/cities" },
        ],
        permission: null,
      },
      {
        icon: <Station />,
        name: "STATIONS",
        path: "/stations",
        roles: ["admin"],
        permission: null,
      },
      {
        icon: <Direction />,
        name: "ROUTES",
        path: "/routes",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.route.get_listing",
      },
      {
        icon: <Discount />,
        name: "DISCOUNTS",
        path: "/discounts",
        roles: ["admin"],
        permission: null,
      },
      {
        icon: <Trip />,
        name: "TRIPS",
        path: "/trips",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.trip.get",
      },
      {
        icon: <User_Group />,
        name: "USERS",
        path: "/users",
        roles: ["admin"],
        permission: null,
      },
      {
        icon: <Wallet />,
        name: "WALLET",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.wallet_transaction.show",
        getSubItems: (role) => {
          const items = [];
          if (role === "admin") {
            items.push(
              { name: "WALLET", path: "/admin-wallet" },
              { name: "WALLET_TRANSACTION", path: "/wallet-transactions" }
            );
          }
          if (role === "vendor" || role === "vendor_user") {
            if (hasPermission("v1.vendor.wallet_transaction.show")) {
              items.push({ name: "WALLET", path: "/vendor-wallet" });
            }
          }
          return items;
        },
      },
      {
        icon: <Bus />,
        name: "BUS",
        path: "/buses",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.bus.get",
      },
      {
        icon: <User_Group />,
        name: "DRIVERS",
        path: "/drivers",
        roles: ["vendor", "vendor_user"],
        permission: "v1.driver.vendor.get",
      },
      {
        icon: <User_Group />,
        name: "VENDOR_USER",
        path: "/vendor-users",
        roles: ["vendor", "vendor_user"],
        permission: "v1.vendor.user.get",
      },
      {
        icon: <User_Group />,
        name: "ROLES",
        path: "/vendor-users-roles",
        roles: ["vendor", "vendor_user"],
        permission: "v1.vendor.user.get",
      },
      {
        icon: <Ticket />,
        name: "BOOKING",
        path: "/bookings",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.booking.get",
      },
      {
        icon: <Settings />,
        name: "TRIP_CANCELLATION_POLICY",
        path: "/trip-cancellation-policy",
        roles: ["admin", "vendor", "vendor_user"],
        permission: "v1.vendor.trip_cancellation_policy.show",
      },
      {
        icon: <Wallet />,
        name: "EXPENSE_CATEGORY",
        path: "/expense-category",
        roles: ["vendor", "vendor_user"],
        permission: "v1.vendor.expense_categories.get",
      },
      {
        icon: <Wallet />,
        name: "EXPENSE",
        path: "/expense",
        roles: ["vendor", "vendor_user"],
        permission: "v1.vendor.expenses.get",
      },
      {
        icon: <Wallet />,
        name: "BRANCH",
        path: "/branch",
        roles: ["vendor", "vendor_user"],
        permission: "v1.vendor.branches.get",
      },
      {
        icon: <Settings />,
        name: "SETTINGS",
        path: "/settings",
        roles: ["admin"],
        permission: null,
      },
    ],
    [hasPermission]
  );

  const othersItems = useMemo(
    () => [
      {
        icon: <UserIcon />,
        name: "PROFILE",
        path: "/profile",
        roles: ["admin", "vendor", "vendor_user"],
        permission: null,
      },
    ],
    []
  );

  // Enhanced filter function that checks both role and permissions
  const filterItemsByRole = useCallback(
    (items) => {
      return items
        .filter((item) => {
          // Check if user has the required role
          if (!item.roles || !item.roles.includes(user?.role)) return false;

          // For vendor_user, check permissions
          if (isVendorUser && item.permission) {
            return hasPermission(item.permission);
          }

          return true;
        })
        .map((item) => {
          // Handle dynamic sub-items
          if (item.getSubItems) {
            return {
              ...item,
              subItems: item.getSubItems(user?.role),
            };
          }
          // Filter regular sub-items
          if (item.subItems) {
            return {
              ...item,
              subItems: item.subItems.filter((subItem) => {
                if (!subItem.roles) return true;
                return subItem.roles.includes(user?.role);
              }),
            };
          }
          return item;
        });
    },
    [user?.role, isVendorUser, hasPermission]
  );

  const filteredNavItems = useMemo(
    () => filterItemsByRole(navItems),
    [filterItemsByRole, navItems]
  );
  const filteredOthersItems = useMemo(
    () => filterItemsByRole(othersItems),
    [filterItemsByRole, othersItems]
  );

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

    checkSubItems(filteredNavItems, "main");
    checkSubItems(filteredOthersItems, "others");

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive, filteredNavItems, filteredOthersItems]);

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
      if (
        prevOpenSubmenu?.type === menuType &&
        prevOpenSubmenu?.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Render menu items
  const renderMenuItems = useCallback(
    (items, menuType) => (
      <ul className="flex flex-col gap-1">
        {items.map((nav, index) => (
          <li key={`${menuType}-${index}-${nav.name}`}>
            {nav.subItems && nav.subItems.length > 0 ? (
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
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
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
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
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
            {nav.subItems &&
              nav.subItems.length > 0 &&
              (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
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
    ),
    [
      openSubmenu,
      isExpanded,
      isHovered,
      isMobileOpen,
      isActive,
      t,
      subMenuHeight,
    ]
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100vh-4rem)] sm:h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${
          isMobileOpen
            ? "translate-x-0"
            : isRtl
            ? "translate-x-full"
            : "-translate-x-full"
        }
        lg:translate-x-0
        ${isRtl ? "right-0 border-l border-r-0" : "left-0 border-r border-l-0"}
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
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
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&s"
                alt="Logo"
                width={60}
                height={40}
              />
            </>
          ) : (
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&s"
              alt="Logo"
              width={32}
              height={32}
            />
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
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ""
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 font-bold text-xs uppercase flex leading-[20px] text-black-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("GENERAL")
                ) : (
                  <HorizontaLDots />
                )}
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
