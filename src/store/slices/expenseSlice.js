import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Expenses
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (
    {
      search = "",
      tripId = "",
      categoryId = "",
      fromDate = "",
      toDate = "",
      page = 1,
      perPage = 10,
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      const response = await axios.get(`${base_url}/${type.role}/expenses`, {
        params: {
          search,
          "trip-id": tripId,
          "category-id": categoryId,
          "from-date": fromDate,
          "to-date": toDate,
          page,
          per_page: perPage,
        },
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Show Expense
export const showExpense = createAsyncThunk(
  "expenses/showExpense",
  async (expenseId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/expenses/${expenseId}/show`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create Expense
export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      // const formData = new FormData();

      // // Append basic fields
      // if (expenseData.vendor_expense_category_id) {
      //   formData.append(
      //     "vendor_expense_category_id",
      //     expenseData.vendor_expense_category_id
      //   );
      // }
      // if (expenseData.trip_id) {
      //   formData.append("trip_id", expenseData.trip_id);
      // }
      // formData.append("title", expenseData.title);
      // formData.append("description", expenseData.description);
      // formData.append("amount", expenseData.amount);
      // formData.append("expense_date", expenseData.expense_date);

      // // Append files if they exist
      // if (expenseData.files && expenseData.files.length > 0) {
      //   expenseData.files.forEach((file) => {
      //     formData.append("files[]", file);
      //   });
      // }
      // for (let pair of formData.entries()) {
      //   console.log(`${pair[0]}:`, pair[1]);
      // }
      const response = await axios.post(
        `${base_url}/${type.role}/expenses`,
        expenseData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      return response.data.body.item;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// Update Expense
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      // Append basic fields
      formData.append("id", id);
      if (updatedData.vendor_expense_category_id) {
        formData.append(
          "vendor_expense_category_id",
          updatedData.vendor_expense_category_id
        );
      }
      if (updatedData.trip_id) {
        formData.append("trip_id", updatedData.trip_id);
      }
      formData.append("title", updatedData.title);
      formData.append("description", updatedData.description);
      formData.append("amount", updatedData.amount);
      formData.append("expense_date", updatedData.expense_date);

      const response = await axios.post(
        `${base_url}/${type.role}/expenses/update`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// Delete Expense
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (expenseId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      await axios.delete(
        `${base_url}/${type.role}/expenses/${expenseId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Attach Expense File
export const attachExpenseFile = createAsyncThunk(
  "expenses/attachExpenseFile",
  async ({ expenseId, title, file }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      const formData = new FormData();
      formData.append("vendor_expense_id", expenseId);
      formData.append("title", title);
      formData.append("file", file);

      const response = await axios.post(
        `${base_url}/${type.role}/expenses/files`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        expenseId,
        file: response.data.body.item,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// Delete Expense File
export const deleteExpenseFile = createAsyncThunk(
  "expenses/deleteExpenseFile",
  async (fileId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }

      await axios.delete(
        `${base_url}/${type.role}/expenses/files/${fileId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return fileId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    loading: false,
    expenses: [],
    selectedExpense: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 10,
    },
  },
  reducers: {
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    },
    resetExpensesState: (state) => {
      state.loading = false;
      state.expenses = [];
      state.selectedExpense = null;
      state.error = null;
      state.pagination = {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show Expense
      .addCase(showExpense.pending, (state) => {
        state.error = null;
      })
      .addCase(showExpense.fulfilled, (state, action) => {
        state.selectedExpense = action.payload;
      })
      .addCase(showExpense.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        );
        state.selectedExpense = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Attach Expense File
      .addCase(attachExpenseFile.pending, (state) => {
        state.error = null;
      })
      .addCase(attachExpenseFile.fulfilled, (state, action) => {
        const { expenseId, file } = action.payload;
        state.expenses = state.expenses.map((expense) => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              files: [...(expense.files || []), file],
            };
          }
          return expense;
        });

        if (state.selectedExpense && state.selectedExpense.id === expenseId) {
          state.selectedExpense = {
            ...state.selectedExpense,
            files: [...(state.selectedExpense.files || []), file],
          };
        }
      })
      .addCase(attachExpenseFile.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Expense File
      .addCase(deleteExpenseFile.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExpenseFile.fulfilled, (state, action) => {
        const fileId = action.payload;
        state.expenses = state.expenses.map((expense) => {
          if (expense.files) {
            return {
              ...expense,
              files: expense.files.filter((file) => file.id !== fileId),
            };
          }
          return expense;
        });

        if (state.selectedExpense && state.selectedExpense.files) {
          state.selectedExpense = {
            ...state.selectedExpense,
            files: state.selectedExpense.files.filter(
              (file) => file.id !== fileId
            ),
          };
        }
      })
      .addCase(deleteExpenseFile.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedExpense, resetExpensesState } =
  expensesSlice.actions;
export default expensesSlice.reducer;
