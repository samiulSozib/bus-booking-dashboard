import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

const buildRechargeQuery = (params = {}) => {
  const { userId, fromDate, toDate, page = 1 } = params;
  let query = `page=${page}`;
  
  if (userId) query += `&user_id=${userId}`;
  if (fromDate) query += `&from-date=${encodeURIComponent(fromDate)}`;
  if (toDate) query += `&to-date=${encodeURIComponent(toDate)}`;
  
  return query;
};

export const fetchRecharges = createAsyncThunk(
  'recharges/fetchRecharges',
  async (params, { rejectWithValue }) => {
    console.log(params)
    const token = getAuthToken();
    try {
      const query = buildRechargeQuery(params);
      const response = await axios.get(
        `${base_url}/admin/recharges?${query}`,
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

export const fetchRechargeById = createAsyncThunk(
  'recharges/fetchRechargeById',
  async (rechargeId, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${base_url}/admin/recharges/${rechargeId}/show`,
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

const rechargeSlice = createSlice({
  name: 'recharges',
  initialState: {
    loading: false,
    recharges: [],
    currentRecharge: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
    filters: {
      userId: null,
      fromDate: null,
      toDate: null,
    },
  },
  reducers: {
    setRechargeFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearRechargeFilters: (state) => {
      state.filters = {
        userId: null,
        fromDate: null,
        toDate: null,
      };
    },
    clearCurrentRecharge: (state) => {
      state.currentRecharge = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecharges.fulfilled, (state, action) => {
        state.loading = false;
        state.recharges = action.payload.items || [];
        state.pagination = action.payload.data || state.pagination;
        state.error = null;
      })
      .addCase(fetchRecharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRechargeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRechargeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecharge = action.payload;
        state.error = null;
      })
      .addCase(fetchRechargeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setRechargeFilters, 
  clearRechargeFilters, 
  clearCurrentRecharge 
} = rechargeSlice.actions;

export default rechargeSlice.reducer;