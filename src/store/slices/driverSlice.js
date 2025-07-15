import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Drivers
export const fetchDrivers = createAsyncThunk(
  "drivers/fetchDrivers",
  async ({ searchTag, page = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const response = await axios.get(
        `${base_url}/${type.role}/drivers?search=${searchTag}&page=${page}`,
        {
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

// Show Driver
export const showDriver = createAsyncThunk(
  "drivers/showDriver",
  async (driverId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const response = await axios.get(
        `${base_url}/${type.role}/drivers/${driverId}/show`,
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

// Add Driver
export const addDriver = createAsyncThunk(
  "drivers/addDriver",
  async (driverData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const formData = new FormData();
      formData.append("first_name", driverData.firstName);
      formData.append("last_name", driverData.lastName);
      formData.append("email", driverData.email);
      formData.append("mobile", driverData.mobile);
      formData.append("password", driverData.password);
      formData.append("status", driverData.status);

      const response = await axios.post(
        `${base_url}/${type.role}/drivers`,
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
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Edit Driver
export const editDriver = createAsyncThunk(
  "drivers/editDriver",
  async ({ driverId, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const formData = new FormData();
      formData.append("id", driverId);
      formData.append("first_name", updatedData.first_name);
      formData.append("last_name", updatedData.last_name);
      formData.append("email", updatedData.email);
      formData.append("mobile", updatedData.mobile);
      formData.append("password", updatedData.password);
      formData.append("status", updatedData.status);

      const response = await axios.post(
        `${base_url}/${type.role}/drivers/update`,
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
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Delete Driver
export const deleteDriver = createAsyncThunk(
  "drivers/deleteDriver",
  async (driverId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      await axios.delete(`${base_url}/${type.role}/drivers/${driverId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return driverId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const driversSlice = createSlice({
  name: "drivers",
  initialState: {
    loading: false,
    drivers: [],
    selectedDriver: null,
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
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(showDriver.fulfilled, (state, action) => {
        state.selectedDriver = action.payload;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload);
        state.pagination.total += 1;
      })
      .addCase(editDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.map((driver) =>
          driver.id === action.payload.id ? action.payload : driver
        );
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(
          (driver) => driver.id !== action.payload
        );
      });
  },
});

export default driversSlice.reducer;
