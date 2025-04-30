import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Countries
export const fetchCountries = createAsyncThunk(
    "countries/fetchCountries",
    async ({searchTag="",page=1}, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${base_url}/web/location/countries?search=${searchTag}&page=${page}`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                items: response.data.body.items,
                pagination: response.data.body.data
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Show Country
export const showCountry = createAsyncThunk(
    "countries/showCountry",
    async (countryId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${base_url}/admin/location/countries/${countryId}/show`, {
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

// Add Country
export const addCountry = createAsyncThunk(
    "countries/addCountry",
    async (countryData, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('name', JSON.stringify(countryData.countryName));
            formData.append('code', countryData.countryCode);
            formData.append("sort", 0);

            const response = await axios.post(`${base_url}/admin/location/countries`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            //console.log(error)
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit Country
export const editCountry = createAsyncThunk(
    "countries/editCountry",
    async ({ countryId, updatedData }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("id", countryId);
            formData.append('name', JSON.stringify(updatedData.countryName));
            formData.append('code', updatedData.countryCode);
            formData.append("sort", 0);

            const response = await axios.post(`${base_url}/admin/location/countries/update`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
            return newData;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Delete Country
export const deleteCountry = createAsyncThunk(
    "countries/deleteCountry",
    async (countryId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${base_url}/admin/location/countries/${countryId}`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            return countryId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const countriesSlice = createSlice({
    name: "countries",
    initialState: {
        loading: false,
        countries: [],
        selectedCountry: null,
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
            .addCase(fetchCountries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCountries.fulfilled, (state, action) => {
                state.loading = false;
                state.countries = action.payload.items;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchCountries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(showCountry.fulfilled, (state, action) => {
                state.selectedCountry = action.payload;
            })
            .addCase(addCountry.fulfilled, (state, action) => {
                state.countries.unshift(action.payload); // Add new country at the beginning
                state.pagination.total += 1; // Increment total count
            })
            .addCase(editCountry.fulfilled, (state, action) => {
                state.countries = state.countries.map((country) =>
                    country.id === action.payload.id ? action.payload : country
                );
            })
            .addCase(deleteCountry.fulfilled, (state, action) => {
                state.countries = state.countries.filter((country) => country.id !== action.payload);
                state.pagination.total -= 1; // Decrement total count
            });
    },
});

export default countriesSlice.reducer;