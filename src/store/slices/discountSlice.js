import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Async Thunks
export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchDiscounts",
  async ({ searchTag = "", page = 1, filters = {} }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      const filterQuery = Object.entries(filters)
        .filter(
          ([_, value]) => value !== null && value !== undefined && value !== ""
        )
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&");

      const response = await axios.get(
        `${base_url}/admin/discounts?search=${searchTag}&page=${page}${
          filterQuery ? `&${filterQuery}` : ""
        }`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const showDiscount = createAsyncThunk(
  "discounts/showDiscount",
  async (discountId) => {
    const token = getAuthToken();
    const response = await axios.get(
      `${base_url}/admin/discounts/${discountId}/show`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.body.item;
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

      const response = await axios.post(
        `${base_url}/admin/discounts`,
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

export const updateDiscount = createAsyncThunk(
  "discounts/updateDiscount",
  async ({ id, discountData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append("id", id);

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
      await axios.delete(`${base_url}/admin/discounts/${id}/delete`, {
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
    selectedDiscount: null,
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
      // Fetch Discounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(showDiscount.pending, (state) => {
        state.error = null;
      })
      .addCase(showDiscount.fulfilled, (state, action) => {
        state.selectedDiscount = action.payload;
        state.error = null;
      })
      .addCase(showDiscount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Discount
      .addCase(createDiscount.pending, (state) => {
        state.error = null;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.discounts.push(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Discount
      .addCase(updateDiscount.pending, (state) => {
        state.error = null;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.map((discount) =>
          discount.id === action.payload.id ? action.payload : discount
        );
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Discount
      .addCase(deleteDiscount.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(
          (discount) => discount.id !== action.payload
        );
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default discountSlice.reducer;
