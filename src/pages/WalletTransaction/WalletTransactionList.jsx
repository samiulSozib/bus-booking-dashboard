import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, SearchIcon, View } from "../../icons";
import {
  fetchWalletTransactions,
  createWalletTransaction,
  updateWalletTransaction,
  deleteWalletTransaction,
} from "../../store/slices/walletTransactionSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";

// Yup validation schema
const getTransactionSchema = (t) =>
  Yup.object().shape({
    user_id: Yup.number().required(t("transaction.userRequired")),
    amount: Yup.number()
      .required(t("transaction.amountRequired"))
      .positive(t("transaction.amountPositive")),
    fee: Yup.number()
      .required(t("transaction.feeRequired"))
      .min(0, t("transaction.feeMin")),
    total: Yup.number()
      .required(t("transaction.totalRequired"))
      .positive(t("transaction.totalPositive")),
    status: Yup.string()
      .oneOf(
        ["pending", "verified", "rejected", "failed", "cancelled"],
        t("transaction.invalidStatus")
      )
      .required(t("transaction.statusRequired")),
    type: Yup.string()
      .oneOf(["credit", "debit", "withdrawal"], t("transaction.invalidType"))
      .required(t("transaction.typeRequired")),
    data: Yup.object()
      .shape({
        reason: Yup.string().optional(),
        description: Yup.string().optional(),
      })
      .optional(),
  });

export default function WalletTransactionList() {
  const dispatch = useDispatch();
  const { transactions, loading, error, pagination } = useSelector(
    (state) => state.walletTransactions
  );
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  // State for table filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // State for searchable dropdowns
  const [selectedUserId, setSelectedUserId] = useState(null);

  // State for Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [formData, setFormData] = useState({
    user_id: null,
    amount: "",
    fee: "",
    total: "",
    status: "pending",
    type: "credit",
    data: {
      reason: "",
      description: "",
    },
  });
  const [errors, setErrors] = useState({});

  // Modal dropdown states
  const [modalUserSearchTag, setModalUserSearchTag] = useState("");
  const [showModalUserDropdown, setShowModalUserDropdown] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dispatch(
      fetchWalletTransactions({ page: currentPage, searchTag: searchTerm })
    );
    dispatch(fetchUsers({}));
  }, [dispatch, currentPage, searchTerm]);

  // Fetch users when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchUsers({ searchTag: modalUserSearchTag }));
    }, 300);

    return () => clearTimeout(timer);
  }, [modalUserSearchTag, dispatch]);

  // Calculate total when amount or fee changes
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const fee = parseFloat(formData.fee) || 0;

    if (formData.type === "credit") {
      setFormData((prev) => ({
        ...prev,
        total: (amount + fee).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        total: (amount + fee).toFixed(2),
      }));
    }
  }, [formData.amount, formData.fee, formData.type]);

  // Handle data field changes
  const handleDataFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  // Handle user selection in modal
  const handleModalUserSelect = (user) => {
    setFormData((prev) => ({
      ...prev,
      user_id: user.id,
    }));
    setModalUserSearchTag(`${user.first_name} ${user.last_name}`);
    setShowModalUserDropdown(false);
  };

  // Open modal for editing
  const handleEditTransaction = (transaction) => {
    const user = users.find((u) => u.id === transaction.user_id);
    const transactionData =
      typeof transaction.data === "string"
        ? JSON.parse(transaction.data)
        : transaction.data || {};

    setFormData({
      user_id: transaction.user_id,
      amount: transaction.amount,
      fee: transaction.fee,
      total: transaction.total,
      status: transaction.status,
      type: transaction.type,
      data: {
        reason: transactionData.reason || "",
        description: transactionData.description || "",
      },
    });

    if (transaction) {
      setModalUserSearchTag(
        `${transaction?.user?.first_name} ${transaction?.user?.last_name}`
      );
    }
    setCurrentTransactionId(transaction.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await getTransactionSchema(t).validate(formData, { abortEarly: false });

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        fee: parseFloat(formData.fee),
        total: parseFloat(formData.total),
      };

      if (isEditMode) {
        await dispatch(
          updateWalletTransaction({
            id: currentTransactionId,
            transactionData: payload,
          })
        ).unwrap();
        Swal.fire(t('success'), t('transactionUpdatedSuccessfully'), "success");
      } else {
        await dispatch(createWalletTransaction(payload)).unwrap();
        Swal.fire(t('success'), t('transactionAddedSuccess'), "success");
      }

      setIsModalOpen(false);
      resetForm();
      // dispatch(fetchWalletTransactions());
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire(t('error'), error.message || t('failedToAddUpdateTransaction'), "error");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      user_id: null,
      amount: "",
      fee: "",
      total: "",
      status: "pending",
      type: "credit",
      data: {
        reason: "",
        description: "",
      },
    });
    setModalUserSearchTag("");
    setErrors({});
    setCurrentTransactionId(null);
    setIsEditMode(false);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toString().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm.toLowerCase()) ||
      users
        .find((u) => u.id === transaction.user_id)
        ?.name?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus
      ? transaction.status === selectedStatus
      : true;
    const matchesType = selectedType ? transaction.type === selectedType : true;
    const matchesUser = selectedUserId
      ? transaction.user_id === selectedUserId
      : true;
    return matchesSearch && matchesStatus && matchesType && matchesUser;
  });

  // Format data object for display
  const formatData = (data) => {
    if (!data) return "-";
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      return Object.entries(parsedData)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return "-";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header and Search */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("TRANSACTION_LIST")}
        </h3>
        <div className="flex items-center gap-3">
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

          <select
            className="rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="rounded-md"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_TRANSACTION")}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ID")}
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
                  {t("TOTAL")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TYPE")}
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
                  {t("DETAILS")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-6 whitespace-nowrap font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    #{transaction.id}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    ${transaction.amount}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    ${transaction.fee}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    ${transaction.total}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                    {transaction.type}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : transaction.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : transaction.status === "failed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell
                    title={formatData(transaction.data)}
                    className="max-w-xs truncate"
                  >
                    {formatData(transaction.data)}
                  </TableCell>
                  <TableCell className="py-3 px-6 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      {/* <div
      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
      onClick={() => handleDelete(bus.id)}
    >
      <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
    </div> */}
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

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? t("EDIT_TRANSACTION") : t("ADD_TRANSACTION")}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* User - Searchable Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("USER")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder=""
                    value={modalUserSearchTag}
                    onChange={(e) => {
                      setModalUserSearchTag(e.target.value);
                      setShowModalUserDropdown(true);
                    }}
                    onFocus={() => setShowModalUserDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowModalUserDropdown(false), 200)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  {showModalUserDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {usersLoading ? (
                        <div className="px-4 py-2 text-gray-500">
                          Loading...
                        </div>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleModalUserSelect(user)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {user.first_name} {user.last_name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.user_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>
                )}
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("TYPE")} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("AMOUNT")} *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  step="0.01"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Fee */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("FEE")} *
                </label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({ ...formData, fee: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  step="0.01"
                />
                {errors.fee && (
                  <p className="text-red-500 text-sm mt-1">{errors.fee}</p>
                )}
              </div>

              {/* Total (read-only) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("TOTAL")}
                </label>
                <input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("STATUS")} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              {/* Transaction Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("TRANSACTION")} {t("DETAILS")}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t("REASON")}
                    </label>
                    <input
                      type="text"
                      value={formData.data?.reason || ""}
                      onChange={(e) =>
                        handleDataFieldChange("reason", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter reason for transaction"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t("DESCRIPTION")}
                    </label>
                    <textarea
                      value={formData.data?.description || ""}
                      onChange={(e) =>
                        handleDataFieldChange("description", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Enter transaction description"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>
                      Additional data will be stored as JSON:{" "}
                      {JSON.stringify(formData.data)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  {t("CANCEL")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {isEditMode ? t("UPDATE") : t("ADD")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
