import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async ({ page = 1 }, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${base_url}/admin/settings?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.body;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSettingByKey = createAsyncThunk(
  'settings/fetchSettingByKey',
  async (key, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${base_url}/admin/settings/${key}/show`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOrUpdateSetting = createAsyncThunk(
  'settings/createOrUpdateSetting',
  async ({ key, value,scope }, { rejectWithValue }) => {
    const token = getAuthToken();
    const formData = new FormData();
    console.log(key)
    console.log(value)
    console.log(scope)
    //return
    formData.append('key', key);
    formData.append('scope',scope)
    formData.append('value', typeof value === 'object' ? JSON.stringify(value) : value);

    try {
      const response = await axios.post(
        `${base_url}/admin/settings`,
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
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const settingSlice = createSlice({
  name: 'settings',
  initialState: {
    loading: false,
    settings: [],
    currentSetting: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
  },
  reducers: {
    clearCurrentSetting: (state) => {
      state.currentSetting = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.items || [];
        state.pagination = action.payload.data || state.pagination;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSettingByKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettingByKey.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSetting = action.payload;
        state.error = null;
      })
      .addCase(fetchSettingByKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrUpdateSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateSetting.fulfilled, (state, action) => {
        state.loading = false;
        // Update existing setting or add new one
        const index = state.settings.findIndex(setting => setting.key === action.payload.key);
        if (index >= 0) {
          state.settings[index] = action.payload;
        } else {
          state.settings.unshift(action.payload);
          state.pagination.total += 1;
        }
        state.currentSetting = action.payload;
        state.error = null;
      })
      .addCase(createOrUpdateSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSetting } = settingSlice.actions;
export default settingSlice.reducer;