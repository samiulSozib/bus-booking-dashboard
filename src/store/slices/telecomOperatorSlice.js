import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

export const fetchTelecomOperators = createAsyncThunk(
  'telecomOperators/fetchTelecomOperators',
  async ({ page = 1 }, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${base_url}/admin/telecom-operators?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.body;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const showTelecomOperator = createAsyncThunk(
  'telecomOperators/showTelecomOperator',
  async (telecomOperatorId, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${base_url}/admin/telecom-operators/${telecomOperatorId}/show`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addTelecomOperator = createAsyncThunk(
  'telecomOperators/addTelecomOperator',
  async ({ operator, prefix }, { rejectWithValue }) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('operator', operator);
    formData.append('prefix', prefix);

    try {
      const response = await axios.post(
        `${base_url}/admin/telecom-operators`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const editTelecomOperator = createAsyncThunk(
  'telecomOperators/editTelecomOperator',
  async ({ id, operator, prefix }, { rejectWithValue }) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('operator', operator);
    formData.append('prefix', prefix);

    try {
      const response = await axios.post(
        `${base_url}/admin/telecom-operators/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteTelecomOperator = createAsyncThunk(
  'telecomOperators/deleteTelecomOperator',
  async (telecomOperatorId, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      await axios.delete(
        `${base_url}/admin/telecom-operators/${telecomOperatorId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return telecomOperatorId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const telecomOperatorSlice = createSlice({
  name: 'telecomOperators',
  initialState: {
    loading: false,
    operators: [],
    selectedOperator: null,
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
      .addCase(fetchTelecomOperators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTelecomOperators.fulfilled, (state, action) => {
        state.loading = false;
        state.operators = action.payload.items || [];
        state.pagination = action.payload.data || state.pagination;
        state.error = null;
      })
      .addCase(fetchTelecomOperators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(showTelecomOperator.pending, (state) => {
        state.error = null;
      })
      .addCase(showTelecomOperator.fulfilled, (state, action) => {
        state.selectedOperator = action.payload;
        state.error = null;
      })
      .addCase(showTelecomOperator.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addTelecomOperator.pending, (state) => {
        state.error = null;
      })
      .addCase(addTelecomOperator.fulfilled, (state, action) => {
        state.operators.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(addTelecomOperator.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editTelecomOperator.pending, (state) => {
        state.error = null;
      })
      .addCase(editTelecomOperator.fulfilled, (state, action) => {
        state.operators = state.operators.map(operator =>
          operator.id === action.payload.id ? action.payload : operator
        );
        state.error = null;
      })
      .addCase(editTelecomOperator.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteTelecomOperator.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTelecomOperator.fulfilled, (state, action) => {
        state.operators = state.operators.filter(
          operator => operator.id !== action.payload
        );
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteTelecomOperator.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default telecomOperatorSlice.reducer;