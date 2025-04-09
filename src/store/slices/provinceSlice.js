import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Provinces
export const fetchProvinces = createAsyncThunk(
    "provinces/fetchProvinces",
    async ({ countryId, searchTag="" }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            if (!countryId) return rejectWithValue("Invalid country id");
            const response = await axios.get(`${base_url}/admin/location/${countryId}/provinces?search=${searchTag}`, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.body.items;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Show Province
export const showProvince = createAsyncThunk(
    "provinces/showProvince",
    async (provinceId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${base_url}/admin/location/provinces/${provinceId}/show`, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Add Province
export const addProvince = createAsyncThunk(
    "provinces/addProvince",
    async (provinceData, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("name", JSON.stringify(provinceData.provinceName));
            formData.append("code", provinceData.provinceCode);
            formData.append("country_id", provinceData.countryId);
            formData.append("sort", 0);

            const response = await axios.post(`${base_url}/admin/location/provinces`, formData, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit Province
export const editProvince = createAsyncThunk(
    "provinces/editProvince",
    async ({ provinceId, updatedData }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("name", JSON.stringify(updatedData.provinceName));
            formData.append("code", updatedData.provinceCode);
            formData.append("country_id", updatedData.countryId);
            formData.append("sort", 0);
            formData.append("id", provinceId);

            const response = await axios.post(`${base_url}/admin/location/provinces/update`, formData, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Delete Province
export const deleteProvince = createAsyncThunk(
    "provinces/deleteProvince",
    async (provinceId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${base_url}/admin/location/provinces/${provinceId}`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            return provinceId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const provinceSlice = createSlice({
    name: "provinces",
    initialState: {
        loading: false,
        provinces: [],
        selectedProvince: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProvinces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProvinces.fulfilled, (state, action) => {
                state.loading = false;
                state.provinces = action.payload;
            })
            .addCase(fetchProvinces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(showProvince.fulfilled, (state, action) => {
                state.selectedProvince = action.payload;
            })
            .addCase(addProvince.fulfilled, (state, action) => {
                state.provinces.push(action.payload);
            })
            .addCase(editProvince.fulfilled, (state, action) => {
                state.provinces = state.provinces.map((province) =>
                    province.id === action.payload.id ? action.payload : province
                );
            })
            .addCase(deleteProvince.fulfilled, (state, action) => {
                state.provinces = state.provinces.filter(
                    (province) => province.id !== action.payload
                );
            });
    },
});

export default provinceSlice.reducer;