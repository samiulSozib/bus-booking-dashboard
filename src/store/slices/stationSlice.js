// stationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";

// Helper function to get the auth token
const getAuthToken = () => localStorage.getItem("token") || "";

// Async thunks for station actions
export const fetchStations = createAsyncThunk(
  'stations/fetchStations',
  async ({cityId,searchTag=""}) => {
    console.log(cityId)
    const token = getAuthToken();
    const response = await axios.get(`${base_url}/admin/stations?city-id=${cityId}&search=${searchTag}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
    return response.data.body.items;
  }
);

export const showStation = createAsyncThunk(
  'stations/showStation',
  async (stationId) => {
    const token = getAuthToken();
    const response = await axios.get(`${base_url}/admin/stations/${stationId}/show`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
    return response.data.body.item;
  }
);

export const addStation = createAsyncThunk(
  'stations/addStation',
  async (stationData, { rejectWithValue }) => {
    const token = getAuthToken();
    const formData = new FormData();

    formData.append("city_id",stationData.cityId)
    formData.append('name', JSON.stringify({
      en: stationData.stationName.en || '',
      ps: stationData.stationName.ps || '',
      fa: stationData.stationName.fa || '',
    }));
    formData.append('latitude', stationData.stationLat);
    formData.append('longitude', stationData.stationLong);

    try {
      const response = await axios.post(`${base_url}/admin/stations`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editStation = createAsyncThunk(
  'stations/editStation',
  async ({ id, stationData }, { rejectWithValue }) => {
    const token = getAuthToken();
    const formData = new FormData();

    formData.append('id', id);
    formData.append("city_id",stationData.cityId)
    formData.append('name', JSON.stringify({
      en: stationData.stationName.en || '',
      ps: stationData.stationName.ps || '',
      fa: stationData.stationName.fa || '',
    }));
    formData.append('latitude', stationData.stationLat);
    formData.append('longitude', stationData.stationLong);

    try {
      const response = await axios.post(`${base_url}/admin/stations/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStation = createAsyncThunk(
  'stations/deleteStation',
  async (stationId, { rejectWithValue }) => {
    const token = getAuthToken();
    try {
      await axios.delete(`${base_url}/admin/stations/${stationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return stationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const stationSlice = createSlice({
  name: 'stations',
  initialState: {
    loading: false,
    stations: [],
    selectedStation: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetch stations
    builder
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = action.payload;
        state.error = null;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle show station
      .addCase(showStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showStation.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStation = action.payload;
        state.error = null;
      })
      .addCase(showStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle add station
      .addCase(addStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStation.fulfilled, (state, action) => {
        state.loading = false;
        state.stations.push(action.payload);
        state.error = null;
      })
      .addCase(addStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle edit station
      .addCase(editStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editStation.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = state.stations.map((station) =>
          station.id === action.payload.id ? action.payload : station
        );
        state.error = null;
      })
      .addCase(editStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle delete station
      .addCase(deleteStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStation.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = state.stations.filter((station) => station.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default stationSlice.reducer;
