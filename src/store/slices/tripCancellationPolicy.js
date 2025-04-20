import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from '../../utils/const';
import { userType } from '../../utils/utils';

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch cancellation policy by vendor_id
export const fetchTripCancellationPolicy = createAsyncThunk(
  'tripCancellationPolicy/fetch',
  async (vendor_id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type=userType()
      const response = await axios.get(
        `${base_url}/${type.role}/trip-cancellation-policies/${vendor_id}/show`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create or update cancellation policy
export const createOrUpdateTripCancellationPolicy = createAsyncThunk(
  'tripCancellationPolicy/createOrUpdate',
  async ({ vendor_id, penalty_steps }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      const type=userType()
      formData.append('vendor_id', vendor_id);
      formData.append('penalty_steps', JSON.stringify(penalty_steps));

      const response = await axios.post(
        `${base_url}/${type.role}/trip-cancellation-policies`,
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
      console.log(error)
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const tripCancellationPolicySlice = createSlice({
  name: 'tripCancellationPolicy',
  initialState: {
    loading: false,
    policy: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTripCancellationPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripCancellationPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policy = action.payload;
      })
      .addCase(fetchTripCancellationPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrUpdateTripCancellationPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateTripCancellationPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policy = action.payload;
      })
      .addCase(createOrUpdateTripCancellationPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tripCancellationPolicySlice.reducer;
