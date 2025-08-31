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
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  showExpense,
  attachExpenseFile,
  deleteExpenseFile,
} from "../../store/slices/expenseSlice";
import { Edit, SearchIcon, Delete, FileIcon, FunnelIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchExpenseCategories } from "../../store/slices/expenseCategorySlice";
import { fetchTrips } from "../../store/slices/tripSlice";
import { formatToYMD, useHasPermission, userType } from "../../utils/utils";
import ExpenseFilter from "./ExpenseFilter";
import Modal from "react-modal";
import { fetchBranches } from "../../store/slices/branchSlice";
import PersianDateText from "../../utils/persianDateShowFormat";
import CustomPersianDatePicker from "../../components/mycomponent/CustomPersianDatePicker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import { format } from "date-fns";

// Validation schema
const getExpenseSchema = (t, role) =>
  Yup.object().shape({
    title: Yup.string().required(t("VALIDATION.EXPENSE.TITLE_REQUIRED")),
    amount: Yup.number()
      .required(t("VALIDATION.EXPENSE.AMOUNT_REQUIRED"))
      .positive(t("VALIDATION.EXPENSE.AMOUNT_POSITIVE")),
    expense_date: Yup.date().required(t("VALIDATION.EXPENSE.DATE_REQUIRED")),
    vendor_branch_id:
      role === "branch"
        ? Yup.number().notRequired() // Skip validation if role is "branch"
        : Yup.number()
            .typeError(t("bus.vendorBranchRequired"))
            .required(t("bus.vendorBranchRequired"))
            .positive(t("bus.vendorBranchRequired"))
            .integer(t("bus.vendorBranchRequired")),
  });

export default function ExpenseList() {
  const dispatch = useDispatch();
  const { expenses, selectedExpense, loading, pagination } = useSelector(
    (state) => state.expenseSlice
  );

  const { categories } = useSelector((state) => state.expenseCategory);
  const { trips } = useSelector((state) => state.trips);

  const [searchTerm, setSearchTerm] = useState("");
  const [tripIdFilter, setTripIdFilter] = useState("");
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState(null);
  const [toDateFilter, setToDateFilter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [vendor_branch_id, setVendor_branch_id] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [vendorExpenseCategoryId, setVendorExpenseCategoryId] = useState("");
  const [tripId, setTripId] = useState("");
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileTitle, setFileTitle] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  Modal.setAppElement("#root");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { branches } = useSelector((state) => state.branch);

  const [vendorBranchSearch, setVendorBranchSearch] = useState("");
  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const isBranch = userType().role === "branch";

  useEffect(() => {
    dispatch(fetchBranches({ searchTag: vendorBranchSearch }));
  }, [dispatch, vendorBranchSearch]);

  useEffect(() => {
    dispatch(
      fetchExpenses({
        search: searchTerm,
        tripId: tripIdFilter,
        categoryId: categoryIdFilter,
        fromDate: fromDateFilter
          ? fromDateFilter.toISOString().split("T")[0]
          : "",
        toDate: toDateFilter ? toDateFilter.toISOString().split("T")[0] : "",
        page: currentPage,
      })
    );
  }, [
    dispatch,
    currentPage,
    searchTerm,
    tripIdFilter,
    categoryIdFilter,
    fromDateFilter,
    toDateFilter,
    appliedFilters,
  ]);

  useEffect(() => {
    dispatch(fetchExpenseCategories({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTrips({ branch_id: vendor_branch_id }));
  }, [dispatch, vendor_branch_id]);

  const handleVendorBranchSelect = (branch) => {
    setSelectedVendorBranch(branch);
    //setFormData({ ...formData, vendor_branch_id: branch.id });
    setVendor_branch_id(branch.id);
    setShowVendorBranchDropdown(false);
    // setErrors((prevErrors) => {
    //   const newErrors = { ...prevErrors };
    //   delete newErrors.vendor_branch_id;
    //   return newErrors;
    // });
  };

  useEffect(() => {
    if (selectedExpense && isEditing) {
      setTitle(selectedExpense.title);
      setDescription(selectedExpense.description);
      setAmount(selectedExpense.amount);
      //setExpenseDate(new Date(selectedExpense.expense_date));
      setExpenseDate(new DateObject({
          date: new Date(selectedExpense.expense_date),
          calendar: persian,
        }))
      setVendorExpenseCategoryId(selectedExpense.category.id || "");
      setTripId(selectedExpense.trip_id || "");
      setFiles(selectedExpense.files || []);
      setVendorBranchSearch(selectedExpense.branch?.name);
      setVendor_branch_id(selectedExpense.branch?.id);
    }
  }, [selectedExpense, isEditing]);

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    // You'll need to modify your fetchExpenses call to use these filters
    dispatch(
      fetchExpenses({
        search: filters.search,
        tripId: filters["trip-id"],
        categoryId: filters["category-id"],
        fromDate: filters["from-date"],
        toDate: filters["to-date"],
        page: currentPage,
      })
    );
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handlePrev = (expenseFiles) => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? expenseFiles.length - 1 : prev - 1
    );
  };

  const handleNext = (expenseFiles) => {
    setSelectedImageIndex((prev) =>
      prev === expenseFiles.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let expenseData = {
      title,
      description,
      amount,
      // expense_date: new Date(expenseDate.toISOString())
      //   .toLocaleString("en-CA", { timeZone: "UTC", hour12: false })
      //   .replace(",", ""),
      expense_date: expenseDate,
      //expenseDate:format(expenseDate.toDate(), "yyyy-MM-dd HH:mm:ss"),
      vendor_expense_category_id: vendorExpenseCategoryId || null,
      trip_id: tripId || null,
    };

    if (vendor_branch_id) {
      expenseData.vendor_branch_id = vendor_branch_id;
    }

    expenseData={...expenseData,expense_date:format(expenseDate.toDate(), "yyyy-MM-dd HH:mm:ss")}

    try {
      await getExpenseSchema(t, userType().role).validate(expenseData, {
        abortEarly: false,
      });

      if (isEditing) {
        // For editing, we'll first update the expense

        const resultAction = await dispatch(
          updateExpense({
            id: currentExpenseId,
            updatedData: expenseData,
          })
        );

        if (updateExpense.fulfilled.match(resultAction)) {
          // Then upload any new files using the attach API
          // const newFiles = files.filter((file) => file instanceof File);
          // if (newFiles.length > 0) {
          //   await Promise.all(
          //     newFiles.map((file) =>
          //       dispatch(
          //         attachExpenseFile({
          //           expenseId: currentExpenseId,
          //           title: file.name,
          //           file: file,
          //         })
          //       )
          //     )
          //   );
          // }

          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("expenseUpdateSuccess"),
          });
        }
      } else {
        // For new expense, include files in the initial creation
        const newFiles = files.filter((file) => file instanceof File);
        const formData = new FormData();

        // Append all expense data
        Object.keys(expenseData).forEach((key) => {
          formData.append(key, expenseData[key]);
        });

        // Append files
        newFiles.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        //return;
        const resultAction = await dispatch(createExpense(formData));

        if (createExpense.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: "success",
            title: t("success"),
            text: t("expenseAddSuccess"),
          });
        }
      }

      // Reset form
      resetForm();
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
          text: error.message || t("failedToAddUpdateExpense"),
        });
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmount("");
    setExpenseDate(new Date());
    setVendorExpenseCategoryId("");
    setTripId("");
    setFiles([]);
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentExpenseId(null);
    setErrors({});
    setVendorBranchSearch("");
    setVendor_branch_id("");
  };

  const handleEdit = (expenseId) => {
    dispatch(showExpense(expenseId));
    setIsEditing(true);
    setCurrentExpenseId(expenseId);
    setIsModalOpen(true);
  };

  const handleDelete = (expenseId) => {
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
          const resultAction = await dispatch(deleteExpense(expenseId));
          if (deleteExpense.fulfilled.match(resultAction)) {
            Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
          }
        } catch (error) {
          Swal.fire(
            t("ERROR"),
            error.message || t("FAILED_TO_DELETE_ITEM"),
            "error"
          );
        }
      }
    });
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !fileTitle) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("FILE_TITLE_REQUIRED"),
      });
      return;
    }

    try {
      const resultAction = await dispatch(
        attachExpenseFile({
          expenseId: currentExpenseId,
          title: fileTitle,
          file: fileToUpload,
        })
      );

      if (attachExpenseFile.fulfilled.match(resultAction)) {
        Swal.fire({
          icon: "success",
          title: t("success"),
          text: t("fileUploadSuccess"),
        });
        // Add the new file to our files state
        setFiles([
          ...files,
          {
            id: resultAction.payload.id,
            title: fileTitle,
            file_name: fileToUpload.name,
          },
        ]);
        setFileToUpload(null);
        setFileTitle("");
        setShowFileModal(false);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: error.message || t("failedToUploadFile"),
      });
    }
  };

  const handleDeleteFile = (fileId) => {
    Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_FILE_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteExpenseFile(fileId))
          .then(() => {
            // Remove the file from our files state
            setFiles(files.filter((file) => file.id !== fileId));
            Swal.fire(t("DELETED"), t("FILE_DELETED_SUCCESSFULLY"), "success");
          })
          .catch((error) => {
            Swal.fire(
              t("ERROR"),
              error.message || t("FAILED_TO_DELETE_FILE"),
              "error"
            );
          });
      }
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];

    // If it's an existing file (has an ID), we need to delete it from the server
    if (removedFile.id) {
      dispatch(deleteExpenseFile(removedFile.id));
    }

    setFiles(newFiles);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Rest of the component remains the same...
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t("EDIT_EXPENSE") : t("ADD_EXPENSE")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* branch id */}

                {!isBranch && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("BRANCH")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("SEARCH_BRANCH")}
                      value={vendorBranchSearch} // Always use driverSearch for the value
                      onChange={(e) => {
                        setVendorBranchSearch(e.target.value);
                        setShowVendorBranchDropdown(true);
                        if (
                          selectedVendorBranch &&
                          e.target.value !== `${selectedVendorBranch?.name}`
                        ) {
                          setSelectedVendorBranch(null);
                          //setFormData({ ...formData, vendor_branch_id: "" });
                          setVendor_branch_id("");
                        }
                      }}
                      onFocus={() => setShowVendorBranchDropdown(true)}
                      onBlur={() =>
                        setTimeout(
                          () => setShowVendorBranchDropdown(false),
                          200
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {showVendorBranchDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                        {branches
                          .filter((branch) =>
                            `${branch?.branch?.name} || ""}`
                              .toLowerCase()
                              .includes(vendorBranchSearch.toLowerCase())
                          )
                          .map((branch) => (
                            <div
                              key={branch?.branch?.id}
                              onClick={() => {
                                handleVendorBranchSelect(branch?.branch);
                                setVendorBranchSearch(
                                  `${branch?.branch?.name}`
                                );
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                            >
                              {branch?.branch?.name}
                            </div>
                          ))}
                        {branches.filter((branch) =>
                          `${branch?.branch?.name} || ""}`
                            .toLowerCase()
                            .includes(vendorBranchSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            {t("NO_BRANCH_FOUND")}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.vendor_branch_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vendor_branch_id}
                      </p>
                    )}
                  </div>
                )}
                {/* branch id */}

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("TITLE")} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("AMOUNT")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount || 0}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("CATEGORY")}
                  </label>
                  <select
                    value={vendorExpenseCategoryId}
                    onChange={(e) => setVendorExpenseCategoryId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">{t("SELECT_CATEGORY")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trip ID */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("TRIP")}
                  </label>
                  <select
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">{t("SELECT_TRIP")}</option>
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip?.route?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expense Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("DATE")} *
                  </label>
                  {/* <DatePicker
                    selected={expenseDate}
                    onChange={(date) => setExpenseDate(date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-full" // Ensures the wrapper takes full width

                  /> */}

                  <CustomPersianDatePicker
                    value={expenseDate}
                    onChange={setExpenseDate}
                  />
                  {errors.expense_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.expense_date}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("DESCRIPTION")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Files */}
                <div className="mb-4 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("FILES")}
                  </label>
                  <div className="mt-1 flex flex-col gap-2">
                    {/* Existing files */}
                    {files
                      .filter((file) => file.id)
                      .map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center">
                            {file.file ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={`${file.file}`}
                                  alt={file.title || file.file_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span>{file.title || file.file_name}</span>
                              </div>
                            ) : (
                              <>
                                <FileIcon className="w-4 h-4 mr-2" />
                                <span>{file.title || file.file_name}</span>
                              </>
                            )}
                          </div>
                          {useHasPermission(
                            "v1.vendor.expenses.files.delete"
                          ) && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Delete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                    {/* New files to be uploaded */}
                    {files
                      .filter((file) => file instanceof File)
                      .map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center">
                            {file.type.match("image.*") ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span>{file.name}</span>
                              </div>
                            ) : (
                              <>
                                <FileIcon className="w-4 h-4 mr-2" />
                                <span>{file.name}</span>
                              </>
                            )}
                          </div>
                          {useHasPermission(
                            "v1.vendor.expenses.files.delete"
                          ) && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Delete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                    {/* Add file button */}
                    <div className="flex gap-2">
                      {!isEditing && (
                        <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                          />
                          <FileIcon className="w-4 h-4 mr-2" />
                          {t("ADD_FILE")}
                        </label>
                      )}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowFileModal(true)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FileIcon className="w-4 h-4 mr-2" />
                          {t("ADD_FILE_WITH_TITLE")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
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

      {/* File Upload Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t("UPLOAD_FILE")}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t("FILE_TITLE")} *
              </label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t("FILE")} *
              </label>
              <input
                type="file"
                onChange={(e) => setFileToUpload(e.target.files[0])}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFileToUpload(null);
                  setFileTitle("");
                  setShowFileModal(false);
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t("CANCEL")}
              </button>
              {useHasPermission("v1.vendor.expenses.files.upload") && (
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t("UPLOAD")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("EXPENSES")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t("SEARCH")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FunnelIcon className="h-5 w-5" />
              {t("FILTER")}
            </button>
          </div>
          {useHasPermission("v1.vendor.expenses.create") && (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {t("ADD_EXPENSE")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table className="min-w-[200%]">
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TITLE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("DATE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("CATEGORY")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TRIP")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FILES")}
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
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="py-3 px-2 w-[150px] truncate">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {expense.title}
                        </p>
                        {expense.description && (
                          <p className="text-gray-500 text-xs mt-1">
                            {expense.description.length > 50
                              ? `${expense.description.substring(0, 50)}...`
                              : expense.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {/* {formatDate(expense.expense_date)} */}
                    {<PersianDateText value={expense.expense_date} />}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {expense.category?.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {expense.trip?.route?.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {expense.files?.length ? (
                      <>
                        <div className="flex space-x-1">
                          {expense.files.map((file, index) => (
                            <img
                              key={file.id}
                              src={file.file}
                              alt={file.title}
                              className="w-8 h-8 object-cover cursor-pointer rounded"
                              onClick={() => handleImageClick(index)}
                            />
                          ))}
                        </div>

                        <Modal
                          isOpen={isImageModalOpen}
                          onRequestClose={() => setIsImageModalOpen(false)}
                          className="modal-content"
                          overlayClassName="modal-overlay"
                        >
                          <div className="relative">
                            {/* Close button */}
                            <button
                              onClick={() => setIsImageModalOpen(false)}
                              className="absolute -top-10 right-0 z-50 p-1 text-gray-300 hover:text-white"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>

                            {/* Main image container */}
                            <div className="max-w-[90vw] max-h-[80vh]">
                              <img
                                src={expense.files[selectedImageIndex].file}
                                alt={`Expense ${selectedImageIndex + 1}`}
                                className="max-h-[70vh] object-contain mx-auto rounded"
                              />
                            </div>

                            {/* Navigation arrows - only show if multiple images */}
                            {expense.files.length > 1 && (
                              <>
                                <button
                                  onClick={() => handlePrev(expense.files)}
                                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 19l-7-7 7-7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleNext(expense.files)}
                                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </Modal>
                      </>
                    ) : (
                      <span>0</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.expenses.update") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleEdit(expense.id)}
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                      )}
                      {useHasPermission("v1.vendor.expenses.delete") && (
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                          onClick={() => handleDelete(expense.id)}
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

      <ExpenseFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
