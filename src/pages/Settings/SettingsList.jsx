// import { useDispatch, useSelector } from "react-redux";
// import { useState, useEffect, useRef } from "react";
// import * as Yup from "yup";
// import useOutsideClick from "../../hooks/useOutSideClick";
// import Swal from "sweetalert2";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
// import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../icons";
// import Pagination from "../../components/pagination/pagination";
// import { useTranslation } from "react-i18next";
// import {
//   fetchSettings,
// } from "../../store/slices/settingsSlice";

// // Validation schema
// const getSettingSchema = (t) =>
//   Yup.object().shape({
//     key: Yup.string().required(t("SETTING_KEY_REQUIRED")),
//     value: Yup.string()
//       .required(t("SETTING_VALUE_REQUIRED"))
//       .test('is-json', t("SETTING_VALUE_JSON_INVALID"), (value) => {
//         try {
//           JSON.parse(value);
//           return true;
//         } catch (e) {
//           return false;
//         }
//       }),
//   });

// export default function SettingsList() {
//   const dropdownRef = useRef(null);
//   useOutsideClick(dropdownRef, () => {
//     //setShowModalBusDropdown(false);
//   });

//   const dispatch = useDispatch();

//   const { settings, loading, pagination, currentSetting } = useSelector(
//     (state) => state.settings
//   );

//   const [searchTag, setSearchTag] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentSettingId, setCurrentSettingId] = useState(null);
//   const [key, setKey] = useState("");
//   const [value, setValue] = useState("");
//   const [errors, setErrors] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [filters, setFilters] = useState({});
//   const { t } = useTranslation();

//   const COMMISSION_TYPES = [
//     { value: "fixed", label: t("FIXED") },
//     { value: "percentage", label: t("PERCENTAGE") },
//   ];

//   useEffect(() => {
//     dispatch(fetchSettings({ page: currentPage }));
//   }, [dispatch, currentPage]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const settingData = { key, value };

//     try {
//       await getSettingSchema(t).validate(settingData, { abortEarly: false });

//       // if (isEditing) {
//       //   const editAction = await dispatch(
//       //     editSetting({ id: currentSettingId, key, value })
//       //   );
//       //   if (editSetting.fulfilled.match(editAction)) {
//       //     Swal.fire({
//       //       icon: "success",
//       //       title: t("SETTING_SUCCESS_TITLE"),
//       //       text: t("SETTING_SUCCESS_UPDATE"),
//       //     });
//       //   }
//       // } else {
//       //   const addAction = await dispatch(
//       //     addSetting({ key, value })
//       //   );
//       //   if (addSetting.fulfilled.match(addAction)) {
//       //     Swal.fire({
//       //       icon: "success",
//       //       title: t("SETTING_SUCCESS_TITLE"),
//       //       text: t("SETTING_SUCCESS_CREATE"),
//       //     });
//       //   }
//       // }

//       // Reset form
//       setKey("");
//       setValue("");
//       setIsModalOpen(false);
//       setIsEditing(false);
//       setCurrentSettingId(null);
//       setErrors({});
//     } catch (error) {
//       if (error instanceof Yup.ValidationError) {
//         const newErrors = {};
//         error.inner.forEach((err) => {
//           newErrors[err.path] = err.message;
//         });
//         setErrors(newErrors);
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: t("SETTING_ERROR_TITLE"),
//           text: error.message || t("SETTING_ERROR_DEFAULT"),
//         });
//       }
//     }
//   };

//   const handleDelete = (settingId) => {
//     // Swal.fire({
//     //   title: t("SETTING_DELETE_CONFIRM_TITLE"),
//     //   text: t("SETTING_DELETE_CONFIRM_TEXT"),
//     //   icon: "warning",
//     //   showCancelButton: true,
//     //   confirmButtonColor: "#3085d6",
//     //   cancelButtonColor: "#d33",
//     //   confirmButtonText: t("SETTING_DELETE_CONFIRM_YES"),
//     //   cancelButtonText: t("SETTING_BUTTON_CANCEL"),
//     // }).then(async (result) => {
//     //   if (result.isConfirmed) {
//     //     try {
//     //       const deleteAction = await dispatch(
//     //         deleteSetting(settingId)
//     //       );
//     //       if (deleteSetting.fulfilled.match(deleteAction)) {
//     //         Swal.fire(
//     //           t("SETTING_DELETE_SUCCESS_TITLE"),
//     //           t("SETTING_DELETE_SUCCESS_TEXT"),
//     //           "success"
//     //         );
//     //         // Refresh the settings list
//     //         dispatch(fetchSettings({ page: currentPage }));
//     //       }
//     //     } catch (error) {
//     //       Swal.fire(
//     //         t("SETTING_ERROR_TITLE"),
//     //         error.message || t("SETTING_DELETE_ERROR_TEXT"),
//     //         "error"
//     //       );
//     //     }
//     //   }
//     // });
//   };

//   const handleEdit = (setting) => {
//     setIsEditing(true);
//     setCurrentSettingId(setting.id);
//     setKey(setting.key);

//     try {
//       // Try to parse the value and format it for display
//       const parsedValue = JSON.parse(setting.value);
//       if (parsedValue.commission_amount && parsedValue.commission_type) {
//         setValue(JSON.stringify({
//           commission_amount: parsedValue.commission_amount,
//           commission_type: parsedValue.commission_type
//         }, null, 2));
//       } else {
//         setValue(setting.value);
//       }
//     } catch (e) {
//       setValue(setting.value);
//     }

//     setIsModalOpen(true);
//   };

//   const handleApplyFilters = () => {
//     setIsFilterOpen(false);
//     dispatch(fetchSettings({ page: 1, ...filters }));
//   };

//   const handleResetFilters = () => {
//     setFilters({});
//     setIsFilterOpen(false);
//     dispatch(fetchSettings({ page: 1 }));
//   };

//   return (
//     <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h2 className="text-lg font-semibold mb-4">
//               {isEditing ? t("EDIT_SETTING") : t("ADD_SETTING")}
//             </h2>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   {t("KEY")} *
//                 </label>
//                 <input
//                   type="text"
//                   value={key}
//                   onChange={(e) => setKey(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 />
//                 {errors.key && (
//                   <p className="text-red-500 text-sm mt-1">{errors.key}</p>
//                 )}
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   {t("VALUE")} (JSON) *
//                 </label>
//                 <textarea
//                   rows={5}
//                   value={value}
//                   onChange={(e) => setValue(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-sm"
//                   placeholder={`Example:\n{\n  "commission_amount": 1,\n  "commission_type": "fixed"\n}`}
//                 />
//                 {errors.value && (
//                   <p className="text-red-500 text-sm mt-1">{errors.value}</p>
//                 )}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setKey("");
//                     setValue("");
//                     setIsModalOpen(false);
//                     setIsEditing(false);
//                     setCurrentSettingId(null);
//                     setErrors({});
//                   }}
//                   className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                 >
//                   {t("CANCEL")}
//                 </button>
//                 <button
//                   type="submit"
//                   className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                 >
//                   {isEditing ? t("UPDATE") : t("ADD")}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Table Header and Add Button */}
//       <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//             {t("SETTINGS")}
//           </h3>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <SearchIcon />
//             </div>
//             <input
//               type="text"
//               className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               placeholder={t("SEARCH_BY_KEY")}
//               value={filters.search || ""}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//             />
//           </div>

//           {/* Filter Button */}
//           <button
//             onClick={() => setIsFilterOpen(!isFilterOpen)}
//             className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
//           >
//             <FunnelIcon className="h-5 w-5" />
//             {t("FILTER")}
//           </button>

//           {/* Filter Dropdown */}
//           {isFilterOpen && (
//             <div
//               ref={dropdownRef}
//               className="absolute right-4 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
//             >
//               <div className="p-4 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     {t("SEARCH_BY_KEY")}
//                   </label>
//                   <input
//                     type="text"
//                     value={filters.search || ""}
//                     onChange={(e) =>
//                       setFilters({ ...filters, search: e.target.value })
//                     }
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
//                 <button
//                   onClick={handleResetFilters}
//                   className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                 >
//                   {t("RESET")}
//                 </button>
//                 <button
//                   onClick={handleApplyFilters}
//                   className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                 >
//                   {t("APPLY")}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Add Setting Button */}
//           <button
//             onClick={() => {
//               setIsModalOpen(true);
//               setIsEditing(false);
//               setKey("");
//               setValue("");
//             }}
//             className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
//           >
//             {t("ADD_SETTING")}
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="max-w-full overflow-x-auto">
//         {loading ? (
//           <div className="flex justify-center items-center h-32">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//           </div>
//         ) : (
//           <Table>
//             {/* Table Header */}
//             <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
//               <TableRow>
//                 <TableCell
//                   isHeader
//                   className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//                 >
//                   {t("KEY")}
//                 </TableCell>
//                 <TableCell
//                   isHeader
//                   className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//                 >
//                   {t("VALUE")}
//                 </TableCell>
//                 <TableCell
//                   isHeader
//                   className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//                 >
//                   {t("ACTION")}
//                 </TableCell>
//               </TableRow>
//             </TableHeader>

//             {/* Table Body */}
//             <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
//               {settings.map((setting) => (
//                 <TableRow key={setting.key}>
//                   <TableCell className="py-3 px-2 w-[150px] truncate">
//                     <div className="flex items-center gap-3">
//                       <div>
//                         <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                           {setting.key}
//                         </p>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                     {(() => {
//                       try {
//                         const parsedValue = JSON.parse(setting.value);
//                         if (
//                           parsedValue.commission_amount &&
//                           parsedValue.commission_type
//                         ) {
//                           return (
//                             <div className="space-y-1">
//                               <div className="flex items-center">
//                                 <span className="font-medium mr-2">{t('COMMISSION_AMOUNT')}:</span>
//                                 <span>{parsedValue.commission_amount}</span>
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="font-medium mr-2">{t('COMMISSION_TYPE')}:</span>
//                                 <span className="capitalize">{parsedValue.commission_type}</span>
//                               </div>
//                             </div>
//                           );
//                         }
//                         return (
//                           <div className="max-w-xs truncate">
//                             {setting.value}
//                           </div>
//                         );
//                       } catch (e) {
//                         return (
//                           <div className="max-w-xs truncate">
//                             {setting.value}
//                           </div>
//                         );
//                       }
//                     })()}
//                   </TableCell>
//                   <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                     <div className="flex flex-row items-center justify-start gap-2">
//                       <div
//                         className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
//                         onClick={() => handleEdit(setting)}
//                       >
//                         <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
//                       </div>
//                       <div
//                         className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
//                         onClick={() => handleDelete(setting.id)}
//                       >
//                         <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
//                       </div>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>

//       {/* Pagination */}
//       {settings.length > 0 && (
//         <Pagination
//           currentPage={pagination.current_page}
//           totalPages={pagination.last_page}
//           onPageChange={(page) => setCurrentPage(page)}
//         />
//       )}
//     </div>
//   );
// }

import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import useOutsideClick from "../../hooks/useOutSideClick";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../icons";
import Pagination from "../../components/pagination/pagination";
import { useTranslation } from "react-i18next";
import {
  fetchSettings,
  createOrUpdateSetting,
} from "../../store/slices/settingsSlice";

// Validation schema
const getSettingSchema = (t) =>
  Yup.object().shape({
    key: Yup.string().required(t("SETTING_KEY_REQUIRED")),
    commission_amount: Yup.number()
      .required(t("SETTING_COMMISSION_AMOUNT_REQUIRED"))
      .positive(t("SETTING_COMMISSION_AMOUNT_POSITIVE")),
    commission_type: Yup.string()
      .required(t("SETTING_COMMISSION_TYPE_REQUIRED"))
      .oneOf(["fixed", "percentage"], t("SETTING_COMMISSION_TYPE_INVALID")),
  });

export default function SettingsList() {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    //setShowModalBusDropdown(false);
  });

  const dispatch = useDispatch();

  const { settings, loading, pagination, currentSetting } = useSelector(
    (state) => state.settings
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSettingId, setCurrentSettingId] = useState(null);
  const [key, setKey] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [commissionType, setCommissionType] = useState("fixed");
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const { t } = useTranslation();

  const COMMISSION_TYPES = [
    { value: "fixed", label: t("FIXED") },
    { value: "percentage", label: t("PERCENTAGE") },
  ];

  useEffect(() => {
    dispatch(fetchSettings({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const settingData = {
      key,
      commission_amount: commissionAmount,
      commission_type: commissionType,
    };

    try {
      await getSettingSchema(t).validate(settingData, { abortEarly: false });

      const value = JSON.stringify({
        commission_amount: parseFloat(commissionAmount),
        commission_type: commissionType,
      });
      const action = await dispatch(createOrUpdateSetting({ key, value }));

      if (createOrUpdateSetting.fulfilled.match(action)) {
        Swal.fire({
          icon: "success",
          title: isEditing
            ? t("SETTING_SUCCESS_UPDATE")
            : t("SETTING_SUCCESS_CREATE"),
          text: t("SETTING_SUCCESS_TITLE"),
        });
      }

      // Reset form
      setKey("");
      setCommissionAmount("");
      setCommissionType("fixed");
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentSettingId(null);
      setErrors({});

      // Refresh settings list
      dispatch(fetchSettings({ page: currentPage }));
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: t("SETTING_ERROR_TITLE"),
          text: error.message || t("SETTING_ERROR_DEFAULT"),
        });
      }
    }
  };

  const handleDelete = (settingId) => {
    // Your existing delete logic
  };

  const handleEdit = (setting) => {
    setIsEditing(true);
    setCurrentSettingId(setting.id);
    setKey(setting.key);

    try {
      const parsedValue = JSON.parse(setting.value);
      if (parsedValue.commission_amount && parsedValue.commission_type) {
        setCommissionAmount(parsedValue.commission_amount.toString());
        setCommissionType(parsedValue.commission_type);
      } else {
        // Fallback for non-commission settings
        setCommissionAmount("");
        setCommissionType("fixed");
      }
    } catch (e) {
      // Fallback for non-JSON values
      setCommissionAmount("");
      setCommissionType("fixed");
    }

    setIsModalOpen(true);
  };

  // ... (keep all other existing functions unchanged)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_SETTING") : t("ADD_SETTING")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("KEY")} *
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isEditing} // Disable editing key when in edit mode
                />
                {errors.key && (
                  <p className="text-red-500 text-sm mt-1">{errors.key}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("COMMISSION_AMOUNT")} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
                {errors.commission_amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.commission_amount}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("COMMISSION_TYPE")} *
                </label>
                <select
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {COMMISSION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.commission_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.commission_type}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKey("");
                    setCommissionAmount("");
                    setCommissionType("fixed");
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setCurrentSettingId(null);
                    setErrors({});
                  }}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t("CANCEL")}
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isEditing ? t("UPDATE") : t("ADD")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("SETTINGS")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t("SEARCH_BY_KEY")}
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Filter Button */}
          {/* <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <FunnelIcon className="h-5 w-5" />
            {t("FILTER")}
          </button> */}

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-4 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("SEARCH_BY_KEY")}
                  </label>
                  <input
                    type="text"
                    value={filters.search || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t("RESET")}
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t("APPLY")}
                </button>
              </div>
            </div>
          )}

          {/* Add Setting Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_SETTING")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("KEY")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION_AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION_TYPE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {settings.map((setting) => (
                <TableRow key={setting.key}>
                  <TableCell className="py-3 px-2 w-[150px] truncate">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {setting.key}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {(() => {
                      try {
                        const parsedValue = JSON.parse(setting.value);
                        return parsedValue.commission_amount || "-";
                      } catch (e) {
                        return "-";
                      }
                    })()}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {(() => {
                      try {
                        const parsedValue = JSON.parse(setting.value);
                        return parsedValue.commission_type ? (
                          <span className="capitalize">
                            {parsedValue.commission_type}
                          </span>
                        ) : (
                          "-"
                        );
                      } catch (e) {
                        return "-";
                      }
                    })()}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(setting)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
