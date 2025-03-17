import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Drivers
export const fetchDrivers = createAsyncThunk(
    "drivers/fetchDrivers",
    async (searchTag, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${base_url}/admin/drivers?search=${searchTag}`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.body.items;
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
            const response = await axios.get(`${base_url}/admin/drivers/${driverId}/show`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
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
            const formData = new FormData();
            formData.append('first_name', driverData.first_name);
            formData.append('last_name', driverData.last_name);
            formData.append('email', driverData.email);
            formData.append('mobile', driverData.mobile);
            formData.append('password', driverData.password);
            formData.append('status', driverData.status);

            const response = await axios.post(`${base_url}/admin/drivers`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit Driver
export const editDriver = createAsyncThunk(
    "drivers/editDriver",
    async ({ driverId, updatedData }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('first_name', updatedData.first_name);
            formData.append('last_name', updatedData.last_name);
            formData.append('email', updatedData.email);
            formData.append('mobile', updatedData.mobile);
            formData.append('password', updatedData.password);
            formData.append('status', updatedData.status);

            const response = await axios.post(`${base_url}/admin/drivers/${driverId}/update`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Delete Driver
export const deleteDriver = createAsyncThunk(
    "drivers/deleteDriver",
    async (driverId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${base_url}/admin/drivers/${driverId}`, {
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
                state.drivers = action.payload;
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
            })
            .addCase(editDriver.fulfilled, (state, action) => {
                state.drivers = state.drivers.map((driver) =>
                    driver.id === action.payload.id ? action.payload : driver
                );
            })
            .addCase(deleteDriver.fulfilled, (state, action) => {
                state.drivers = state.drivers.filter((driver) => driver.id !== action.payload);
            });
    },
});

export default driversSlice.reducer;