import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Async Thunks
export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchDiscounts",
  async ({searchParams = "",page=1}, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/discounts?${searchParams}&page=${page}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return {items:response.data.body.items,pagination:response.data.body.data};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createDiscount = createAsyncThunk(
  "discounts/createDiscount",
  async (discountData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      // Required fields
      formData.append("scope", discountData.scope);
      formData.append("discount_amount", discountData.discount_amount);
      formData.append("discount_type", discountData.discount_type);
      formData.append("start_date", discountData.start_date);
      formData.append("end_date", discountData.end_date);
      formData.append("status", discountData.status);

      // Conditional fields based on scope
      if (discountData.scope === "vendor" && discountData.vendor_id) {
        formData.append("vendor_id", discountData.vendor_id);
      }
      if (discountData.scope === "route" && discountData.route_id) {
        formData.append("route_id", discountData.route_id);
      }
      if (discountData.scope === "trip" && discountData.trip_id) {
        formData.append("trip_id", discountData.trip_id);
      }
      if (discountData.scope === "bus" && discountData.bus_id) {
        formData.append("bus_id", discountData.bus_id);
      }

      const response = await axios.post(`${base_url}/admin/discounts`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateDiscount = createAsyncThunk(
  "discounts/updateDiscount",
  async ({ id, discountData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append("id",id)

      formData.append("scope", discountData.scope);
      formData.append("discount_amount", discountData.discount_amount);
      formData.append("discount_type", discountData.discount_type);
      formData.append("start_date", discountData.start_date);
      formData.append("end_date", discountData.end_date);
      formData.append("status", discountData.status);

      // Conditional fields based on scope
      if (discountData.scope === "vendor" && discountData.vendor_id) {
        formData.append("vendor_id", discountData.vendor_id);
      }
      if (discountData.scope === "route" && discountData.route_id) {
        formData.append("route_id", discountData.route_id);
      }
      if (discountData.scope === "trip" && discountData.trip_id) {
        formData.append("trip_id", discountData.trip_id);
      }
      if (discountData.scope === "bus" && discountData.bus_id) {
        formData.append("bus_id", discountData.bus_id);
      }
      const response = await axios.post(
        `${base_url}/admin/discounts/update`,
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
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteDiscount = createAsyncThunk(
  "discounts/deleteDiscount",
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${base_url}/admin/discounts/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const discountSlice = createSlice({
  name: "discounts",
  initialState: {
    loading: false,
    discounts: [],
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0
  }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Discounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.items;
        state.pagination=action.payload.pagination;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Discount
      .addCase(createDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts.push(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Discount
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = state.discounts.map((discount) =>
          discount.id === action.payload.id ? action.payload : discount
        );
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Discount
      .addCase(deleteDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = state.discounts.filter(
          (discount) => discount.id !== action.payload
        );
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default discountSlice.reducer;