import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Expense Categories
export const fetchExpenseCategories = createAsyncThunk(
  "expenseCategories/fetchExpenseCategories",
  async ({ search = "", type = "", page = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      

      const response = await axios.get(
        `${base_url}/vendor/expense-categories`,
        {
          params: {
            search,
            type,
            page,
          },
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Show Expense Category
export const showExpenseCategory = createAsyncThunk(
  "expenseCategories/showExpenseCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/expense-categories/${categoryId}/show`,
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

// Create Expense Category
export const createExpenseCategory = createAsyncThunk(
  "expenseCategories/createExpenseCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("name", categoryData.name);
      formData.append("type", categoryData.type);
      if (categoryData.parent_id)
        formData.append("parent_id", categoryData.parent_id);
      if (categoryData.sort) formData.append("sort", categoryData.sort);

      const response = await axios.post(
        `${base_url}/vendor/expense-categories`,
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

// Update Expense Category
export const updateExpenseCategory = createAsyncThunk(
  "expenseCategories/updateExpenseCategory",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", updatedData.name);
      formData.append("type", updatedData.type);
      if (updatedData.parent_id)
        formData.append("parent_id", updatedData.parent_id);
      if (updatedData.sort) formData.append("sort", updatedData.sort);

      const response = await axios.post(
        `${base_url}/vendor/expense-categories/update`,
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

// Delete Expense Category
export const deleteExpenseCategory = createAsyncThunk(
  "expenseCategories/deleteExpenseCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(
        `${base_url}/vendor/expense-categories/${categoryId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const expenseCategoriesSlice = createSlice({
  name: "expenseCategories",
  initialState: {
    loading: false,
    categories: [],
    selectedCategory: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch Expense Categories
      .addCase(fetchExpenseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show Expense Category
      .addCase(showExpenseCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(showExpenseCategory.fulfilled, (state, action) => {
        state.selectedCategory = action.payload;
      })
      .addCase(showExpenseCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Expense Category
      .addCase(createExpenseCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(createExpenseCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createExpenseCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Expense Category
      .addCase(updateExpenseCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(updateExpenseCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        );
        state.selectedCategory = action.payload;
      })
      .addCase(updateExpenseCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Expense Category
      .addCase(deleteExpenseCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteExpenseCategory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedCategory, resetExpenseCategoriesState } =
  expenseCategoriesSlice.actions;
export default expenseCategoriesSlice.reducer;
