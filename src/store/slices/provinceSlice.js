import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Provinces
export const fetchProvinces = createAsyncThunk(
  "provinces/fetchProvinces",
  async ({ countryId, searchTag = "", page = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      // Build the query string manually
      let query = `?search=${encodeURIComponent(searchTag)}&page=${page}`;
      if (countryId) {
        query += `&country=${countryId}`;
      }
      console.log(countryId);
      const response = await axios.get(
        `${base_url}/web/location/provinces${query}`,
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

// Web Province List (No Pagination)
export const fetchWebProvincesList = createAsyncThunk(
  "provinces/fetchWebProvincesList",
  async ({ searchTag, page = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        `${base_url}/admin/location/af/provinces/list?searchTag=${searchTag}&page=${page}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
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
      const response = await axios.get(
        `${base_url}/admin/location/provinces/${provinceId}/show`,
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

      const response = await axios.post(
        `${base_url}/admin/location/provinces`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newData = {
        id: response.data.body.item.id,
        name: response.data.body.item.name.en,
        code: response.data.body.item.code,
      };
      return newData;
    } catch (error) {
      console.log(error);
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

      const response = await axios.post(
        `${base_url}/admin/location/provinces/update`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newData = {
        id: response.data.body.item.id,
        name: response.data.body.item.name.en,
        code: response.data.body.item.code,
      };
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
      const response = await axios.delete(
        `${base_url}/admin/location/provinces/${provinceId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      console.log(response);
      return provinceId;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);

const provinceSlice = createSlice({
  name: "provinces",
  initialState: {
    loading: false,
    provinces: [],
    webProvinces: [],
    selectedProvince: null,
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
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchWebProvincesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebProvincesList.fulfilled, (state, action) => {
        state.loading = false;
        state.webProvinces = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWebProvincesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(showProvince.fulfilled, (state, action) => {
        state.selectedProvince = action.payload;
      })
      .addCase(addProvince.fulfilled, (state, action) => {
        state.provinces.unshift(action.payload); // add to start
        if (state.provinces.length > 20) {
          state.provinces.pop(); // remove last
        }

        state.pagination.total += 1;
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
