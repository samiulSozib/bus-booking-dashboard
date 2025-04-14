import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";
export function user_type(){
    // return JSON.parse(localStorage.getItem("profile")||"{}");
    const profile = localStorage.getItem("profile");
    return profile ? JSON.parse(profile) : null;
  }

// Fetch Trips
export const fetchTrips = createAsyncThunk(
    "trips/fetchTrips",
    async ({searchTag=""}, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()

            const response = await axios.get(`${base_url}/${type.role}/trips?search=${searchTag}`, {
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

// Show Trip
export const showTrip = createAsyncThunk(
    "trips/showTrip",
    async (tripId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()
            const response = await axios.get(`${base_url}/${type.role}/trips/${tripId}/show`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Add Trip
export const addTrip = createAsyncThunk(
    "trips/addTrip",
    async (tripData, { rejectWithValue }) => {
        try {
            console.log(tripData)
            const token = getAuthToken();
            const type=user_type()
            const formData = new FormData();
            if(tripData.vendor_id){
                formData.append('vendor_id', tripData.vendor_id);
            }
            formData.append('route_id', tripData.route_id);
            formData.append('bus_id', tripData.bus_id);
            formData.append('total_seats', tripData.total_seats);
            formData.append('ticket_price', tripData.ticket_price);
            formData.append('departure_time', tripData.departure_time);
            formData.append('arrival_time', tripData.arrival_time);
            formData.append('booking_deadline',tripData.booking_deadline)
            formData.append('status', tripData.status);
            formData.append('allow_partial_payment',true)
            formData.append('min_partial_payment',parseFloat(tripData.min_partial_payment))
            formData.append('partial_payment_type',tripData.partial_payment_type)

            const response = await axios.post(`${base_url}/${type.role}/trips`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response)
            return response.data.body.item;
        } catch (error) {
            console.log(error)
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit Trip
export const editTrip = createAsyncThunk(
    "trips/editTrip",
    async ({ tripId, updatedData }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()
            const formData = new FormData();
            if(updatedData.vendor_id){
                formData.append('vendor_id', updatedData.vendor_id);
            }
            formData.append('route_id', updatedData.route_id);
            formData.append('bus_id', updatedData.bus_id);
            formData.append('total_seats', updatedData.total_seats);
            formData.append('ticket_price', updatedData.ticket_price);
            formData.append('departure_time', updatedData.departure_time);
            formData.append('arrival_time', updatedData.arrival_time);
            formData.append('booking_deadline',updatedData.booking_deadline)
            formData.append('status', updatedData.status);
            formData.append('allow_partial_payment',updatedData.allow_partial_payment)
            formData.append('min_partial_payment',updatedData.min_partial_payment)
            formData.append('partial_payment_type',updatedData.partial_payment_type)

            const response = await axios.post(`${base_url}/${type.role}/trips/${tripId}/update`, formData, {
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

// Delete Trip
export const deleteTrip = createAsyncThunk(
    "trips/deleteTrip",
    async (tripId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${base_url}/vendor/trips/${tripId}`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            return tripId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const tripsSlice = createSlice({
    name: "trips",
    initialState: {
        loading: false,
        trips: [],
        selectedTrip: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(showTrip.fulfilled, (state, action) => {
                state.selectedTrip = action.payload;
            })
            .addCase(addTrip.fulfilled, (state, action) => {
                state.trips.push(action.payload);
            })
            .addCase(editTrip.fulfilled, (state, action) => {
                state.trips = state.trips.map((trip) =>
                    trip.id === action.payload.id ? action.payload : trip
                );
            })
            .addCase(deleteTrip.fulfilled, (state, action) => {
                state.trips = state.trips.filter((trip) => trip.id !== action.payload);
            });
    },
});

export default tripsSlice.reducer;