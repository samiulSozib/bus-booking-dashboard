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
  ListIcon,
  MobileOperator,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useTranslation } from "react-i18next";
import SidebarBottom from "./SidebarBottom";
import { userType, userTypeForSidebar } from "../utils/utils";

// Permission mapping - maps routes to required permissions for both vendor and branch
const PERMISSION_MAP = {
  // Dashboard
  '/': [
    'v1.vendor.statistics.general_statistics', 
    'v1.branch.statistics.general_statistics'
  ],
  
  // Stations
  '/stations': [
    'v1.vendor.station.get_listing',
    'v1.branch.station.get_listing'
  ],
  
  // Routes
  '/routes': [
    'v1.branch.route.get_listing',
    'v1.vendor.route.get_listing'
  ],
  
  // Trips
  '/trips': [
    'v1.branch.trip.get',
    'v1.vendor.trip.get'
  ],
  
  // Buses
  '/buses': [
    'v1.branch.bus.get',
    'v1.vendor.bus.get'
  ],
  
  // Drivers
  '/drivers': [
    'v1.driver.vendor.list',
    'v1.branch.driver.list'
  ],
  
  // Vendor Users
  '/vendor-users': [
    'v1.branch.user.get',
    'v1.vendor.user.get'
  ],
  
  // Vendor Roles
  '/vendor-users-roles': [
    'v1.branch.role.get',
    'v1.vendor.role.get'
  ],
  
  // Bookings
  '/bookings': [
    'v1.branch.booking.get',
    'v1.vendor.booking.get'
  ],
  
  // Expense Category
  '/expense-category': [
    'v1.branch.expense_categories.get',
    'v1.vendor.expense_categories.get'
  ],
  
  // Expense
  '/expense': [
    'v1.branch.expenses.get',
    'v1.vendor.expenses.get'
  ],
  
  // Wallet
  '/vendor-wallet': [
    'v1.branch.wallet.balance',
    'v1.vendor.wallet.balance'
  ],
  
  '/wallet-transactions': [
    'v1.vendor.wallet_transaction.get',
    'v1.branch.wallet_transaction.get'
  ],
  
  // Trip Cancellation Policy
  '/trip-cancellation-policy': [
    'v1.vendor.trip_cancellation_policy.show'
  ]
};

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isRtl, setIsRtl] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // Get user info
  const user = userTypeForSidebar();
  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor" ;
  const isBranch = user?.role == "vendor_branch";
  const isVendorUser=user?.role==="vendor_user"
  const isVendorBranchUser=user?.role==="vendor_branch_user"
  const isAgent=user?.role==="agent"


  //console.log(user.permissions)

  // Check if user has permission for a route
  const hasPermission = useCallback((path) => {
    // Admin has all permissions
    if (isAdmin) return true;
    
    // Vendor has all vendor permissions
    if (isVendor) return true;

    if(isBranch) return true;

    if(isAgent) return true
    
    // Check permissions for branch/vendor_branch_user
    if (isVendorUser || isVendorBranchUser) {
      const requiredPermissions = PERMISSION_MAP[path];
      if (!requiredPermissions) return false;
      
      // Check if user has any of the required permissions
      return requiredPermissions.some(permission => 
        user.permissions?.some(p => p.name === permission && p.has_permission)
      );
    }
    
    return false;
  }, [user?.permissions, isAdmin, isVendor, isVendorUser,isVendorBranchUser]);

  // Memoized navigation items configuration
  const navItems = useMemo(() => {
    const items = [
      {
        icon: <Dashboard />,
        name: "DASHBOARD",
        path: "/",
        roles: ["admin", "vendor", "branch","vendor_branch", "vendor_user", "vendor_branch_user"],
        show: hasPermission('/')
      },
      {
        icon: <Location />,
        name: "LOCATION",
        roles: ["admin"],
        show: isAdmin,
        subItems: [
          { name: "COUNTRY", path: "/location/countries", show: isAdmin },
          { name: "PROVINCE", path: "/location/provinces", show: isAdmin },
          { name: "CITY", path: "/location/cities", show: isAdmin },
        ],
      },
      {
        icon: <Station />,
        name: "STATIONS",
        path: "/stations",
        roles: ["admin","vendor", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/stations')
      },
      {
        icon: <Direction />,
        name: "ROUTES",
        path: "/routes",
        roles: ["admin", "vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/routes')
      },
      {
        icon: <Discount />,
        name: "DISCOUNTS",
        path: "/discounts",
        roles: ["admin"],
        show: isAdmin
      },
      {
        icon: <Trip />,
        name: "TRIPS",
        path: "/trips",
        roles: ["admin", "vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/trips')
      },
       {
        icon: <User_Group />,
        name: "AGENT",
        path: "/agents",
        roles: [ "vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/agent')
      },
      {
        icon: <User_Group />,
        name: "USERS",
        roles: ["admin"],
        show: isAdmin,
        subItems: [
          { name: "ADMIN", path: "/users/admin", show: isAdmin },
          { name: "AGENT", path: "/users/agent", show: isAdmin },
          { name: "BRANCH", path: "/users/branch", show: isAdmin },
          { name: "CUSTOMER", path: "/users/customer", show: isAdmin },
          { name: "DRIVER", path: "/users/driver", show: isAdmin },
          { name: "VENDOR", path: "/users/vendor", show: isAdmin }
        ],
      },
      {
        icon: <Wallet />,
        name: "WALLET",
        roles: ["admin", "vendor", "branch","vendor_branch", "vendor_user", "vendor_branch_user","agent"],
        show: isAdmin || isVendor || hasPermission('/vendor-wallet'),
        getSubItems: (role) => {
          const items = [];
          if (role === "admin") {
            items.push(
              { name: "WALLET", path: "/admin-wallet", show: true },
              { name: "WALLET_TRANSACTION", path: "/wallet-transactions", show: true }
            );
          }
          if (role === "vendor" || role === "vendor_user" || role === "branch" || role === "vendor_branch_user"|| role==="agent") {
            items.push(
              { name: "WALLET", path: "/vendor-wallet", show: hasPermission('/vendor-wallet') },
              { name: "TRANSACTIONS", path: "/wallet-transactions", show: hasPermission('/wallet-transactions') }
            );
          }
          return items.filter(item => item.show);
        },
      },
      {
        icon: <Bus />,
        name: "BUS",
        path: "/buses",
        roles: ["admin", "vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/buses')
      },
      {
        icon: <User_Group />,
        name: "DRIVERS",
        path: "/drivers",
        roles: ["vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/drivers')
      },
      {
        icon: <User_Group />,
        name: "VENDOR_USER",
        path: "/vendor-users",
        roles: ["vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/vendor-users')
      },
      {
        icon: <User_Group />,
        name: "ROLES",
        path: "/vendor-users-roles",
        roles: ["vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/vendor-users-roles')
      },
      {
        icon: <Ticket />,
        name: "BOOKING",
        path: "/bookings",
        roles: ["admin", "vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user","agent"],
        show: hasPermission('/bookings')
      },
      {
        icon: <Settings />,
        name: "TRIP_CANCELLATION_POLICY",
        path: "/trip-cancellation-policy",
        roles: ["admin", "vendor", "vendor_user"],
        show: isAdmin || isVendor || hasPermission('/trip-cancellation-policy')
      },
      {
        icon: <Wallet />,
        name: "EXPENSE_CATEGORY",
        path: "/expense-category",
        roles: ["vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/expense-category')
      },
      {
        icon: <Wallet />,
        name: "EXPENSE",
        path: "/expense",
        roles: ["vendor", "vendor_user", "branch","vendor_branch", "vendor_branch_user"],
        show: hasPermission('/expense')
      },
      {
        icon: <Wallet />,
        name: "BRANCH",
        path: "/branch",
        roles: ["vendor", "vendor_user"],
        show: isVendor && hasPermission('/branch')
      },
      {
        icon: <Settings />,
        name: "SETTINGS",
        path: "/settings",
        roles: ["admin"],
        show: isAdmin
      },
      {
        icon: <MobileOperator />,
        name: "TELECOM_OPERATOR",
        path: "/telecom-operators",
        roles: ["admin"],
        show: isAdmin
      },
      {
        icon: <ListIcon />,
        name: "RECHARGE_LIST",
        path: "/recharges",
        roles: ["admin"],
        show: isAdmin
      },
      {
        icon: <ListIcon />,
        name: "PAGES",
        path: "/pages",
        roles: ["admin"],
        show: isAdmin
      },
    ];

    return items.filter(item => item.show);
  }, [hasPermission, isAdmin, isVendor]);

  const othersItems = useMemo(() => [
    {
      icon: <UserIcon />,
      name: "PROFILE",
      path: "/profile",
      roles: ["admin", "vendor", "vendor_user", "branch","vendor_branch"],
      show: true
    },
  ], []);

  // Filter items by role and permissions
  const filterItemsByRole = useCallback((items) => {
    return items.filter(item => {
      if (!item.roles) return false;
      return item.roles.includes(user?.role) && item.show !== false;
    }).map(item => {
      if (item.getSubItems) {
        return {
          ...item,
          subItems: item.getSubItems(user?.role)
        };
      }
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(subItem => {
            if (!subItem.roles) return subItem.show !== false;
            return subItem.roles.includes(user?.role) && subItem.show !== false;
          })
        };
      }
      return item;
    });
  }, [user?.role]);

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
          {nav.subItems && nav.subItems.length > 0 && (isExpanded || isHovered || isMobileOpen) && (
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
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEEdmbtnM6XzTWvM6mwvLIlg-ludm_CuQ-UA&s"
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
                {isExpanded || isHovered || isMobileOpen ? t('GENERAL') : <HorizontaLDots />}
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