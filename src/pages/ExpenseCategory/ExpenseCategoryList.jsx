import { useState, useEffect } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  showExpenseCategory,
} from "../../store/slices/expenseCategorySlice";
import { Edit, SearchIcon, Delete } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";

// Validation schema
const getExpenseCategorySchema = (t) => Yup.object().shape({
  name: Yup.string().required(t("VALIDATION.EXPENSE_CATEGORY.NAME_REQUIRED")),
  type: Yup.string()
    .required(t("VALIDATION.EXPENSE_CATEGORY.TYPE_REQUIRED")),
});

export default function ExpenseCategoryList() {
  const dispatch = useDispatch();
  const { categories, selectedCategory, loading, pagination } = useSelector(
    (state) => state.expenseCategory
  );

  const [searchTag, setSearchTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("trip");
  const [parentId, setParentId] = useState(null);
  const [sort, setSort] = useState(0);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchExpenseCategories({
        search: searchTag,
        type: typeFilter,
        page: currentPage,
      })
    );
  }, [dispatch, currentPage, searchTag, typeFilter]);

  useEffect(() => {
    if (selectedCategory && isEditing) {
      setName(selectedCategory.name);
      setType(selectedCategory.type);
      setParentId(selectedCategory.parent_id || null);
      setSort(selectedCategory.sort || 0);
    }
  }, [selectedCategory, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = {
      name,
      type,
      parent_id: parentId,
      sort,
    };

    try {
      await getExpenseCategorySchema(t).validate(categoryData,{abortEarly:false})

      if (isEditing) {
        const resultAction = await dispatch(
          updateExpenseCategory({
            id: currentCategoryId,
            updatedData: categoryData,
          })
        );
        if (updateExpenseCategory.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("categoryUpdateSuccess"),
          });
        }
      } else {
        const resultAction = await dispatch(
          createExpenseCategory(categoryData)
        );
        if (createExpenseCategory.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("categoryAddSuccess"),
          });
        }
      }

      // Reset form
      setName("");
      setType("trip");
      setParentId(null);
      setSort(0);
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentCategoryId(null);
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
          title: t("error"),
          text: error.message || t("failedToAddUpdateCategory"),
        });
      }
    }
  };

  const handleEdit = (categoryId) => {
    dispatch(showExpenseCategory(categoryId));
    setIsEditing(true);
    setCurrentCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteExpenseCategory(categoryId))
          .then(() => {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          })
          .catch((error) => {
            console.log(error)
            Swal.fire(
              t("ERROR"),
              error.message || t("FAILED_TO_DELETE_ITEM"),
              "error"
            );
          });
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_CATEGORY") : t("ADD_CATEGORY")}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("NAME")} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("TYPE")} *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="trip">Trip</option>
                  <option value="office">Office</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              {/* Parent ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("PARENT_CATEGORY")}
                </label>
                <select
                  value={parentId || ""}
                  onChange={(e) =>
                    setParentId(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">None</option>
                  {categories
                    .filter((category) => category.id !== currentCategoryId)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sort Order */}
              {/* <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("SORT_ORDER")}
                </label>
                <input
                  type="number"
                  value={sort}
                  onChange={(e) => setSort(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div> */}

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setType("trip");
                    setParentId(null);
                    setSort(0);
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setCurrentCategoryId(null);
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

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("EXPENSE_CATEGORIES")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* <div className="relative flex-1">
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
          </div> */}
          <div className="relative flex-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="trip">Trip</option>
              <option value="office">Office</option>
            </select>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_CATEGORY")}
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
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TYPE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("PARENT")}
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {category.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {category.type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {category?.parent?.name}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(category.id)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
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
