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
import { Delete, Edit, View, FunnelIcon, SearchIcon } from "../../icons"; // Add FunnelIcon
import {
  addCountry,
  deleteCountry,
  editCountry,
  fetchCountries,
  showCountry,
} from "../../store/slices/countrySlice";
import Pagination from "../../components/pagination/pagination";
import { useTranslation } from "react-i18next";
import {
  addTelecomOperator,
  deleteTelecomOperator,
  editTelecomOperator,
  fetchTelecomOperators,
  showTelecomOperator,
} from "../../store/slices/telecomOperatorSlice";
import { fetchRecharges } from "../../store/slices/rechargeSlice";
import StatusBadge from "../../components/ui/badge/StatusBadge";
import RechargeFilter from "./RechargeFilter";

// Validation schema
const getOperatorSchema = (t) =>
  Yup.object().shape({
    operator: Yup.string()
      .required(t("OPERATOR_NAME_REQUIRED"))
      .oneOf(
        ["salaam", "etisalat", "roshan", "mtn", "awcc"],
        t("OPERATOR_NAME_INVALID")
      ),
    prefix: Yup.string()
      .required(t("OPERATOR_PREFIX_REQUIRED"))
      .matches(/^\+?\d{1,5}$/, t("OPERATOR_PREFIX_INVALID")),
  });

export default function RechargeList() {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    //setShowModalBusDropdown(false);
  });

  const dispatch = useDispatch();

  const { operators, selectedOperator, pagination } = useSelector(
    (state) => state.telecomOperators
  );

  const { recharges, loading } = useSelector((state) => state.recharges);

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOperatorId, setCurrentOperatorId] = useState(null);
  const [operator, setOperator] = useState("");
  const [prefix, setPrefix] = useState("");
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State for filter dropdown
  // const [filters, setFilters] = useState({ searchTag: "", code: "" }); // State for filters
  const [filters, setFilters] = useState({}); // State for filters
  const { t } = useTranslation();

  const OPERATORS = [
    { value: "salaam", label: "Salaam" },
    { value: "etisalat", label: "Etisalat" },
    { value: "roshan", label: "Roshan" },
    { value: "mtn", label: "MTN" },
    { value: "awcc", label: "AWCC" },
  ];

  useEffect(() => {
    dispatch(fetchRecharges({ page: currentPage,fromDate:filters.fromDate,toDate:filters.toDate }));
  }, [dispatch, currentPage,filters]);

  // useEffect(() => {
  //   if (selectedOperator && isEditing) {
  //     setOperator(selectedOperator.operator)
  //     setPrefix(selectedOperator.prefix);
  //   }
  // }, [selectedOperator]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const operatorData = { operator, prefix };

    try {
      await getOperatorSchema(t).validate(operatorData, { abortEarly: false });

      if (isEditing) {
        const editAction = await dispatch(
          editTelecomOperator({ id: currentOperatorId, operator, prefix })
        );
        if (editTelecomOperator.fulfilled.match(editAction)) {
          Swal.fire({
            icon: "success",
            title: t("OPERATOR_SUCCESS_TITLE"),
            text: t("OPERATOR_SUCCESS_UPDATE"),
          });
        }
      } else {
        const addAction = await dispatch(
          addTelecomOperator({ operator, prefix })
        );
        if (addTelecomOperator.fulfilled.match(addAction)) {
          Swal.fire({
            icon: "success",
            title: t("OPERATOR_SUCCESS_TITLE"),
            text: t("OPERATOR_SUCCESS_CREATE"),
          });
        }
      }

      // Reset form
      setOperator("");
      setPrefix("");
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentOperatorId(null);
      setErrors({});
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
          title: t("OPERATOR_ERROR_TITLE"),
          text: error.message || t("OPERATOR_ERROR_DEFAULT"),
        });
      }
    }
  };

  const handleDelete = (operatorId) => {
    Swal.fire({
      title: t("OPERATOR_DELETE_CONFIRM_TITLE"),
      text: t("OPERATOR_DELETE_CONFIRM_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("OPERATOR_DELETE_CONFIRM_YES"),
      cancelButtonText: t("OPERATOR_BUTTON_CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(
            deleteTelecomOperator(operatorId)
          );
          if (deleteTelecomOperator.fulfilled.match(deleteAction)) {
            Swal.fire(
              t("OPERATOR_DELETE_SUCCESS_TITLE"),
              t("OPERATOR_DELETE_SUCCESS_TEXT"),
              "success"
            );
            // Refresh the operators list
            dispatch(fetchTelecomOperators({ page: currentPage }));
          }
        } catch (error) {
          Swal.fire(
            t("OPERATOR_ERROR_TITLE"),
            error.message || t("OPERATOR_DELETE_ERROR_TEXT"),
            "error"
          );
        }
      }
    });
  };

  const handleEdit = (operator) => {
    //dispatch(showTelecomOperator(operatorId));
    setIsEditing(true);

    setCurrentOperatorId(operator.id);
    setOperator(operator.operator);
    setPrefix(operator.prefix);
    setIsModalOpen(true);
  };

  const handleApplyFilters = (filters) => {
    console.log(filters)
    setFilters(filters);
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilters({ searchTag: "", code: "" }); // Reset filters
    setIsFilterOpen(false); // Close filter dropdown
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {/* {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_OPERATOR") : t("ADD_OPERATOR")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("OPERATOR")} *
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">{t("SELECT_OPERATOR")}</option>
                  {OPERATORS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.operator && (
                  <p className="text-red-500 text-sm mt-1">{errors.operator}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("PREFIX")}
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.prefix && (
                  <p className="text-red-500 text-sm mt-1">{errors.prefix}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOperator("");
                    setPrefix("");
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setCurrentOperatorId(null);
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
      )} */}

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("OPERATOR_LIST")}
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
              placeholder={t("SEARCH")}
              value={filters.searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
            />
          </div>

          {/* Filter Button and Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FunnelIcon className="h-5 w-5" />
              {t("FILTER")}
            </button>

            
          </div>

          {/* Add Country Button */}
          {/* <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_OPERATOR")}
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          
          <Table className="w-full table-auto">
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MOBILE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FEE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TRANSACTION")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("REQUEST_STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("CREATED")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("CREATED_BY")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE")}
                </TableCell>

                {/* <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell> */}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recharges.map((recharge) => (
                <TableRow key={recharge.id}>
                  <TableCell className="py-3 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {recharge.mobile}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge.amount}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge.fee}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge.tx}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    <StatusBadge status={recharge?.status} />
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    <StatusBadge status={recharge?.request_status} />
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge.created_at}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge.user?.first_name} {recharge?.user?.last_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    {recharge?.user?.role}
                  </TableCell>

                  {/* <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(operator)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                        onClick={() => handleDelete(operator.id)}
                      >
                        <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                      </div>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />


        <RechargeFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

    </div>
  );
}
