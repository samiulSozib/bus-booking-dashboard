import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteBus,
  fetchBusById,
  fetchBuses,
} from "../../store/slices/busSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, FunnelIcon, SearchIcon, View } from "../../icons";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import BusFilter from "./BusFilter";
import Swal from "sweetalert2";
import {
  checkPermission,
  useHasPermission,
  userType,
  useUserPermissions,
} from "../../utils/utils";

const BusList = () => {
  const [searchTag, setSearchTag] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { buses, loading, pagination } = useSelector((state) => state.buses);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const user_type = userType();

  useEffect(() => {
    dispatch(
      fetchBuses({ searchTag, page: currentPage, filters: activeFilters })
    );
  }, [dispatch, currentPage, searchTag, activeFilters]);

  const handleEdit = (busId) => {
    navigate(`/add-bus/${busId}`); // Navigate to edit page with busId
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // Handle delete trip
  const handleDelete = (busId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(deleteBus(busId));
          if (deleteBus.fulfilled.match(deleteAction)) {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          }
          // Refresh the countries list
          dispatch(fetchBuses({ searchTag: searchTag, page: currentPage }));
        } catch (error) {
          console.log(error);
          Swal.fire(
            t("ERROR"),
            error.message || t("FAILED_TO_DELETE_ITEM"),
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Bus Search and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("BUS_LIST")}
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
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <FunnelIcon className="h-5 w-5" />
            {t("FILTER")}
          </button>

          {(useHasPermission("v1.vendor.bus.create") && userType().role !== "branch") && (
            <button
              onClick={() => navigate("/add-bus")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {t("ADD_BUS")}
            </button>
          )}
        </div>
      </div>

      {/* Bus Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("BUS_NO")}.
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("BUS_NAME")}
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FACILITIES")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("RATING")}
                </TableCell>
                {user_type.role == "admin" && (
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {t("VENDOR")}
                  </TableCell>
                )}

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TICKET_PRICE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("SEATS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="">
                        <img
                          className="w-14 h-12 rounded-md"
                          src={bus.image}
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {bus.bus_number}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.name}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.facilities}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.rating}
                  </TableCell>
                  {user_type.role == "admin" && (
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {bus?.vendor?.name}
                    </TableCell>
                  )}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.ticket_price}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.seats?.seats?.length}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bus.status}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.bus.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEdit(bus.id)}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                      )}

                      {useHasPermission("v1.vendor.bus.delete") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                          onClick={() => handleDelete(bus.id)}
                        >
                          <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                        </div>
                      )}
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

      <BusFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default BusList;
