import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Cities
export const fetchCities = createAsyncThunk(
    "cities/fetch",
    async ({ provinceId, searchTag="" }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            if (!provinceId) return rejectWithValue("Invalid provinceId");
            const response = await axios.get(
                `${base_url}/admin/location/${provinceId}/cities/list?search=${searchTag}`,
                { headers: { Authorization: `${token}` } }
            );
            return response.data.body.items;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Show City
export const showCity = createAsyncThunk(
    "cities/show",
    async (cityId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${base_url}/admin/location/cities/${cityId}/show`,
                { headers: { Authorization: `${token}` } }
            );
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Add City
export const addCity = createAsyncThunk(
    "cities/add",
    async (cityData, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("province_id", cityData.provinceId);
            formData.append("name", JSON.stringify(cityData.cityName));
            formData.append("code", cityData.cityCode);
            formData.append("sort", "0");

            const response = await axios.post(`${base_url}/admin/location/cities`, formData, {
                headers: { Authorization: `${token}`, "Content-Type": "multipart/form-data" }
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit City
export const editCity = createAsyncThunk(
    "cities/edit",
    async ({ cityId, updatedData }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("id", cityId);
            formData.append("province_id", updatedData.provinceId);
            formData.append("name", JSON.stringify(updatedData.cityName));
            formData.append("code", updatedData.cityCode);
            formData.append("sort", "0");

            const response = await axios.post(`${base_url}/admin/location/cities/update`, formData, {
                headers: { Authorization: `${token}`, "Content-Type": "multipart/form-data" }
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Delete City
export const deleteCity = createAsyncThunk(
    "cities/delete",
    async (cityId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${base_url}/admin/location/cities/${cityId}`, {
                headers: { Authorization: `${token}` }
            });
            return cityId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Create Slice
const citySlice = createSlice({
    name: "cities",
    initialState: { loading: false, cities: [], selectedCity: null, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCities.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCities.fulfilled, (state, action) => { state.loading = false; state.cities = action.payload; })
            .addCase(fetchCities.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            .addCase(showCity.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(showCity.fulfilled, (state, action) => { state.loading = false; state.selectedCity = action.payload; })
            .addCase(showCity.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(addCity.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addCity.fulfilled, (state, action) => { state.loading = false; state.cities.push(action.payload); })
            .addCase(addCity.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(editCity.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(editCity.fulfilled, (state, action) => {
                state.loading = false;
                state.cities = state.cities.map(city => city.id === action.payload.id ? action.payload : city);
            })
            .addCase(editCity.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(deleteCity.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteCity.fulfilled, (state, action) => {
                state.loading = false;
                state.cities = state.cities.filter(city => city.id !== action.payload);
            })
            .addCase(deleteCity.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export default citySlice.reducer;
