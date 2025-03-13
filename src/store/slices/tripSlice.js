// tripsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from '../../utils/const';

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || ''; // Get the token or return an empty string if not found
};

// Fetch Trips - Async Thunk
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (searchTag, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/trips?search=${searchTag}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.body.items; // Return the trips data
    } catch (error) {
      return rejectWithValue(error.message); // Return error message if something fails
    }
  }
);

// Show Trip - Async Thunk
export const showTrip = createAsyncThunk(
  'trips/showTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/trips/${tripId}/show`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.body.item; // Return the trip data
    } catch (error) {
      return rejectWithValue(error.message); // Return error message if something fails
    }
  }
);

// Add Trip - Async Thunk
export const addTrip = createAsyncThunk(
  'trips/addTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append('name', JSON.stringify({
        en: tripData.tripName.en || '',
        ps: tripData.tripName.ps || '',
        fa: tripData.tripName.fa || '',
      }));
      formData.append('code', tripData.tripCode);
      formData.append('sort', 0);

      const response = await axios.post(`${base_url}/admin/trips`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newData = {
        id: response.data.body.item.id,
        name: response.data.body.item.name.en,
        code: response.data.body.item.code,
      };
      return newData; // Return the new trip data
    } catch (error) {
      return rejectWithValue(error.message); // Return error message if something fails
    }
  }
);

// Edit Trip - Async Thunk
export const editTrip = createAsyncThunk(
  'trips/editTrip',
  async ({ tripId, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append('id', tripId);
      formData.append('name', JSON.stringify({
        en: updatedData.tripName.en || '',
        ps: updatedData.tripName.ps || '',
        fa: updatedData.tripName.fa || '',
      }));
      formData.append('code', updatedData.tripCode);
      formData.append('sort', 0);

      const response = await axios.post(`${base_url}/admin/trips/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newData = {
        id: response.data.body.item.id,
        name: response.data.body.item.name.en,
        code: response.data.body.item.code,
      };
      return newData; // Return the updated trip data
    } catch (error) {
      return rejectWithValue(error.message); // Return error message if something fails
    }
  }
);

// Delete Trip - Async Thunk
export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${base_url}/admin/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return tripId; // Return the deleted trip ID
    } catch (error) {
      return rejectWithValue(error.message); // Return error message if something fails
    }
  }
);

// Create Slice
const tripsSlice = createSlice({
  name: 'trips',
  initialState: {
    loading: false,
    trips: [],
    selectedTrip: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Trips
    builder.addCase(fetchTrips.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = action.payload;
      state.error = null;
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Show Trip
    builder.addCase(showTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(showTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTrip = action.payload;
      state.error = null;
    });
    builder.addCase(showTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Add Trip
    builder.addCase(addTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.trips.push(action.payload);
      state.error = null;
    });
    builder.addCase(addTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Edit Trip
    builder.addCase(editTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(editTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = state.trips.map((trip) =>
        trip.id === action.payload.id ? action.payload : trip
      );
      state.error = null;
    });
    builder.addCase(editTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Trip
    builder.addCase(deleteTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = state.trips.filter((trip) => trip.id !== action.payload);
      state.error = null;
    });
    builder.addCase(deleteTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default tripsSlice.reducer;
