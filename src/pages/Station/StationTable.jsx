import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit } from "../../icons";
import { useTranslation } from "react-i18next";

const StationTable = ({ stations, loading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              {t("STATION_NAME")}
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              {t("LATITUDE")}
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              {t("LONGITUDE")}
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              {t("CITY_NAME")}
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
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {station?.name?.en ?? station.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {station.latitude}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {station.longitude}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {station.city.name}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex flex-row items-center justify-start gap-2">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => onEdit(station.id)}
                  >
                    <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                  </div>
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                    onClick={() => onDelete(station.id)}
                  >
                    <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StationTable;
