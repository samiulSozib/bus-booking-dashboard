export function categorizeServices(data) {
  const categorized = {
    nonsocial: {},
    social: {},
  };

  // Sets to track seen companies for social and nonsocial services
  const seenSocialCompanies = new Set();
  const seenNonSocialCompanies = new Set();

  data.forEach((category) => {
    const type = category.type;
    const categoryId = category.id;
    const categoryName = category.category_name;

    category.services.forEach((service) => {
      const country = service.company?.country?.country_name;
      const countryId = service.company?.country_id;
      const countryImage = service.company?.country?.country_flag_image_url;
      const companyId = service.company?.id;
      let companyLogo;

      if (type === "social") {
        companyLogo = service.company.company_logo;

        // Check for duplicate social companies
        if (!seenSocialCompanies.has(companyId)) {
          seenSocialCompanies.add(companyId);

          // Initialize social category if it doesn't exist
          if (!categorized.social[categoryName]) {
            categorized.social[categoryName] = {
              companies: [],
            };
          }

          const socialCompanyInfo = {
            companyId: companyId,
            companyName: service.company.company_name,
            companyLogo: companyLogo,
            categoryId: categoryId,
            categoryName: categoryName,
            countryId: countryId,
          };

          categorized.social[categoryName].companies.push(socialCompanyInfo);
        }
      } else {
        // Check for duplicate non-social companies

        seenNonSocialCompanies.add(companyId);

        // Initialize non-social category for country if it doesn't exist
        if (!categorized.nonsocial[country]) {
          categorized.nonsocial[country] = {
            country_id: countryId,
            countryImage: countryImage,
            categories: {}, // Change to an object for categories keyed by categoryId
            //companies: []
          };
        }

        // Add unique category name and ID if not already in the list for the country
        if (!categorized.nonsocial[country].categories[categoryId]) {
          categorized.nonsocial[country].categories[categoryId] = {
            categoryName: categoryName,
            companies: [], // Hold unique companies for this category
          };
        }

        const nonSocialCompanyInfo = {
          companyId: companyId,
          companyName: service.company.company_name,
          companycodes: service.company.companycodes,
        };

        // Add company info to the respective category
        categorized.nonsocial[country].categories[categoryId].companies.push(
          nonSocialCompanyInfo
        );

        // // Also push company info to the main country companies list if not already added
        //categorized.nonsocial[country].companies.push(nonSocialCompanyInfo);
      }
    });
  });

  for (const country in categorized.nonsocial) {
    const categoriesObject = categorized.nonsocial[country].categories;
    // Convert the categories object into an array
    categorized.nonsocial[country].categories = Object.keys(
      categoriesObject
    ).map((categoryId) => ({
      categoryId: categoryId,
      ...categoriesObject[categoryId],
    }));
  }
  //console.log(data)

  return categorized;
}

// Correct way to export function declarations
export function formatForDisplay(datetime) {
  if (!datetime) return "";
  return datetime.replace("T", " ");
}

export function formatForInput(displayTime) {
  if (!displayTime) return "";
  return displayTime.replace(" ", "T");
}

// export function formatForDisplayDiscount(datetime) {
//   if (!datetime) return '';
//   // Convert from "Y-m-d H:i:s" to datetime-local format (YYYY-MM-DDTHH:MM)
//   const [date, time] = datetime.split(' ');
//   return date + 'T' + time;
// }

export function formatForDisplayDiscount(datetime) {
  if (!datetime) return "";

  // If the string has both date and time
  if (datetime.includes(" ")) {
    const [date, time] = datetime.split(" ");
    return date + "T" + time;
  }

  // If only date (e.g., "2025-04-10"), append default time "00:00"
  if (/^\d{4}-\d{2}-\d{2}$/.test(datetime)) {
    return `${datetime} 00:00:00`;
  }

  // Fallback
  return datetime;
}

export function formatForInputDiscount(displayTime) {
  if (!displayTime) return "";

  // Handle case where time is already in correct format
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(displayTime)) {
    return displayTime.length === 16 ? `${displayTime}:00` : displayTime;
  }

  // Split datetime-local format
  const [date, time] = displayTime.split("T");

  if (!time) {
    // If no time part, default to midnight
    return `${date} 00:00:00`;
  }

  // Handle time part - remove seconds if they exist, then add :00 if needed
  const timeParts = time.split(":");
  const hoursMins = timeParts.slice(0, 2).join(":");

  return `${date} ${hoursMins}:00`;
}

export function userType() {
  // return JSON.parse(localStorage.getItem("profile")||"{}");
  const profile = localStorage.getItem("profile");
  let data = profile ? JSON.parse(profile) : null;
  if(!data) return
  if (data.role === "vendor_branch" || data.role==="vendor_branch_user") {
    return { ...data, role: "branch" }; // Return full object with modified role
  }
  if (data.role === "vendor_user") {
    return { ...data, role: "vendor" }; // Return full object with modified role
  }
  return data;
}
export function userTypeForSidebar() {
  // return JSON.parse(localStorage.getItem("profile")||"{}");
  const profile = localStorage.getItem("profile");
  let data = profile ? JSON.parse(profile) : null;
  if(!data) return
  
  return data;
}

export function formatToYMD(datetime) {
  if (!datetime) return "";

  // Handle both "YYYY-MM-DDTHH:mm:ss" and "YYYY-MM-DD HH:mm:ss"
  const datePart = datetime.split("T")[0] || datetime.split(" ")[0];
  return datePart;
}

// utils/permissionUtils.js
export const checkPermission = (permissions, permissionTitle) => {
  return permissions?.some(
    (permission) =>
      permission.title === permissionTitle && permission.has_permission
  );
};

// export const hasPermission = (permissionName, role, permissions = []) => {
//   if (role === 'admin' || role === 'vendor') return true;
//   return permissions.some(p => p.name === permissionName && p.has_permission);
// };

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPermissions } from "../store/slices/vendorUserSlice";

export function useUserPermissions(userId) {
  const dispatch = useDispatch();
  const { userPermissions } = useSelector((state) => state.vendorUser);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPermissions(userId));
    }
  }, [dispatch, userId]);
  //console.log(userPermissions)
  return userPermissions;
}

// export function useHasPermission(permissionName) {
//   // const dispatch = useDispatch();
//   // const { userPermissions } = useSelector((state) => state.vendorUser);

//   const profile = localStorage.getItem("profile");
//   const user = profile ? JSON.parse(profile) : null;

//   // useEffect(() => {
//   //   if (user?.id && (user.role === 'vendor_user')) {
//   //     dispatch(fetchUserPermissions(user.id));
//   //   }
//   // }, [dispatch, user?.id]);
//   const userPermissions = profile ? JSON.parse(profile)?.permissions || [] : [];

//   // Admin and Vendor have full access
//   if (!user) return false;
//   if (user.role === "admin" || user.role === "vendor" || user.role==="branch" || user.role==="vendor_branch") return true;

//   // Vendor_user: check permission from list
//   return userPermissions.some(
//     (p) => p.name === permissionName && p.has_permission
//   );
// }


// hooks/useHasPermission.js
export function useHasPermission(permissionNames) {
  const profileStr = localStorage.getItem("profile");
  if (!profileStr) return false;

  let user;
  try {
    user = JSON.parse(profileStr);
  } catch {
    return false;
  }

  const { role, permissions = [] } = user;

  // Roles with full access
  const fullAccessRoles = ["admin", "vendor", "vendor_branch"];
  if (fullAccessRoles.includes(role)) return true;

  // Ensure we always work with an array
  const requiredPermissions = Array.isArray(permissionNames)
    ? permissionNames
    : [permissionNames];

  // Vendor_user: check permission list
  if (role === "vendor_user" || role==="vendor_branch_user") {
    return permissions.some(
      (p) => requiredPermissions.includes(p.name) && p.has_permission
    );
  }

  // Default: no access
  return false;
}



  export function formatSeatNumber(num) {
    const str = num.toString();
    const rowNumber = parseInt(str.slice(0, -1), 10);
    const seatNumber = parseInt(str.slice(-1), 10);

    // Convert rowNumber to letter(s)
    let rowLabel = "";
    let n = rowNumber;
    while (n > 0) {
      n--; // adjust for 0-based index
      rowLabel = String.fromCharCode(65 + (n % 26)) + rowLabel;
      n = Math.floor(n / 26);
    }

    return `${rowLabel}${seatNumber}`;
  }


  // utils/dateFormatter.js

export function formatDate(isoString, locale = "en-US") {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "long",   // "August"
    day: "numeric",  // 16
    hour: "2-digit", // 02
    minute: "2-digit",
    second: "2-digit",
    hour12: true,    // 12-hour format with AM/PM (set to false for 24h)
  });
}
