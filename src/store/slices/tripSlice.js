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
    async ({searchTag="",page=1,filters={}}, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()
if(type.role==="vendor_user"){
                type.role="vendor"
            }
            const filterQuery = Object.entries(filters)
            .filter(([_, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

            //console.log(filterQuery)

            const response = await axios.get(`${base_url}/${type.role}/trips?search=${searchTag}&page=${page}${filterQuery ? `&${filterQuery}` : ''}`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return {items:response.data.body.items,pagination:response.data.body.data};
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch active Trips
export const fetchActiveTrips = createAsyncThunk(
    "trips/fetchActiveTrips",
    async ({searchTag="",page=1,filters={}}, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
            //console.log(filters)
            const filterQuery = Object.entries(filters)
            .filter(([_, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

            //console.log(filterQuery)

            const response = await axios.get(`${base_url}/${type.role}/trips/active?search=${searchTag}&page=${page}${filterQuery ? `&${filterQuery}` : ''}`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return {items:response.data.body.items,pagination:response.data.body.data};
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Show Trip
export const showTrip = createAsyncThunk(
    "trips/showTrip",
    async ({trip_id }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=user_type()
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
            const response = await axios.get(`${base_url}/${type.role}/trips/${trip_id }/show`, {
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
            //console.log(tripData)
            const token = getAuthToken();
            const type=user_type()
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
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
            formData.append('allow_partial_payment',tripData.allow_partial_payment)
            formData.append('min_partial_payment',parseFloat(tripData.min_partial_payment))
            formData.append('partial_payment_type',tripData.partial_payment_type)
            formData.append("ticket_price_per_seat",JSON.stringify(tripData.ticket_price_per_seat))

            const response = await axios.post(`${base_url}/${type.role}/trips`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            //console.log(response)
            return response.data.body.item;
        } catch (error) {
            //console.log(error)
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
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
            console.log(updatedData)
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
            formData.append("ticket_price_per_seat",JSON.stringify(updatedData.ticket_price_per_seat))
            formData.append("id",tripId)

            //console.log(updatedData)
            const response = await axios.post(`${base_url}/${type.role}/trips/update`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.body.item;
        } catch (error) {
            console.log(error)
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
            const type=user_type()
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
            const response=await axios.delete(`${base_url}/${type.role}/trips/${tripId}/delete`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            console.log(response)
            return tripId;
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.message);
        }
    }
);

// Update Trip Seat Prices
export const updateTripSeatPrices = createAsyncThunk(
    "trips/updateTripSeatPrices",
    async ({ trip_id, ticket_price_per_seat }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type = user_type();
            
            const formData = new FormData();
            formData.append('trip_id', trip_id);
            formData.append('ticket_price_per_seat', JSON.stringify(ticket_price_per_seat));

            const response = await axios.post(
                `${base_url}/${type.role}/trips/seat-prices`, 
                formData, 
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            //console.log(response)
            return { trip_id, updatedPrices: ticket_price_per_seat };
        } catch (error) {
            //console.log(error);
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

const tripsSlice = createSlice({
    name: "trips",
    initialState: {
        loading: false,
        trips: [],
        activeTrips:[],
        selectedTrip: null,
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
            .addCase(fetchTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload.items;
                state.pagination=action.payload.pagination
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchActiveTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.activeTrips = action.payload.items;
                state.pagination=action.payload.pagination
            })
            .addCase(fetchActiveTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(showTrip.fulfilled, (state, action) => {
                state.selectedTrip = action.payload;
            })
            .addCase(addTrip.fulfilled, (state, action) => {
                state.trips.push(action.payload);
                state.pagination.total += 1;
            })
            .addCase(editTrip.fulfilled, (state, action) => {
                state.trips = state.trips.map((trip) =>
                    trip.id === action.payload.id ? action.payload : trip
                );
            })
            .addCase(deleteTrip.fulfilled, (state, action) => {
                state.trips = state.trips.filter((trip) => trip.id !== action.payload);
            })
            .addCase(updateTripSeatPrices.fulfilled, (state, action) => {
                const { trip_id, updatedPrices } = action.payload;
                // Update the specific trip's seat prices in the state
                state.trips = state.trips.map(trip => {
                    if (trip.id === trip_id) {
                        return {
                            ...trip,
                            ticket_price_per_seat: updatedPrices
                        };
                    }
                    return trip;
                });
                
                // Also update the selectedTrip if it's the one being updated
                if (state.selectedTrip && state.selectedTrip.id === trip_id) {
                    state.selectedTrip = {
                        ...state.selectedTrip,
                        ticket_price_per_seat: updatedPrices
                    };
                }
            })
            .addCase(updateTripSeatPrices.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default tripsSlice.reducer;