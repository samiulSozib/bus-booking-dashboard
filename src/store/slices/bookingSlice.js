import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (searchParams = "", { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      const response = await axios.get(`${base_url}/${type.role}/bookings?${searchParams}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      console.log(response.data.body.items)
      return {items:response.data.body.items,pagination:response.data.body.data};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create Booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      const formData = new FormData();
      console.log(bookingData)
      formData.append("trip_id", bookingData.trip_id);
      formData.append("is_partial_payment", bookingData.is_partial_payment);
      formData.append("amount", bookingData.amount);
      formData.append("customer_mobile", bookingData.customer_mobile);
      formData.append("customer_first_name", bookingData.customer_first_name);
      formData.append("customer_last_name", bookingData.customer_last_name);
      formData.append("tickets", JSON.stringify(bookingData.tickets));

      const response = await axios.post(`${base_url}/${type.role}/bookings`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response)
      return response.data.body.item
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Booking Details
export const getBookingDetails = createAsyncThunk(
  "bookings/getBookingDetails",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      const response = await axios.get(`${base_url}/${type.role}/bookings/${bookingId}/show`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      console.log(response.data.body.item)
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Mark Booking as Paid
export const markBookingAsPaid = createAsyncThunk(
  "bookings/markBookingAsPaid",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      const response = await axios.get(`${base_url}/${type.role}/bookings/${bookingId}/paid`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cancel Booking
export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      const response = await axios.get(
        `${base_url}/${type.role}/bookings/${bookingId}/cancel`,
       
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response.statusText || error.message);
    }
  }
);

// Slice
const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    loading: false,
    bookings: [],
    bookingDetails: null,
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
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.items;
        state.pagination=action.payload.pagination
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.pagination.total+=1
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Booking Details
      .addCase(getBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetails = action.payload;
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as Paid
      .addCase(markBookingAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markBookingAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(markBookingAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload; // Update booking as cancelled
        }
        if (state.bookingDetails && state.bookingDetails.id === action.payload.id) {
          state.bookingDetails = action.payload; // Also update detailed view if active
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bookingSlice.reducer;
