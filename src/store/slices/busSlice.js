import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from '../../utils/const';

const getAuthToken = () => localStorage.getItem("token") || "";


// Async Thunks

// Add a new bus
export const addBus = createAsyncThunk(
  'bus/addBus',
  async ({busData}, { rejectWithValue }) => {
    try {
      
      const token = getAuthToken();
      const formData = new FormData();
      
      Object.keys(busData).forEach((key) => {
        if (key === 'seats') {
          formData.append(key, JSON.stringify(busData[key])); // Append seats as JSON
        }else if(key==="facilities"){
          formData.append(key,JSON.stringify(busData[key]))
        }
         else if (key === 'image') {
          formData.append(key, busData[key]); // Append image file
        } else {
          formData.append(key, busData[key]); // Append other fields
        }
      });

      formData.forEach((value,key)=>{
        console.log(key,value)
      })

      const response = await axios.post(`${base_url}/vendor/buses`, formData, {
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

// Edit a bus 
export const editBus = createAsyncThunk(
  'bus/editBus',
  async ({ busId, busData }, { rejectWithValue }) => {
    try {
      console.log("Bus Data:", busData);

      const token = getAuthToken();
      const formData = new FormData();

      // Append basic fields
      formData.append("id", busId);
      formData.append("driver_id", busData.driver_id);
      formData.append("name", busData.name);
      formData.append("bus_number", busData.bus_number);
      formData.append("ticket_price", busData.ticket_price);
      formData.append("status", busData.status);
      formData.append("facilities", JSON.stringify(busData.facilities));

      // Check if a new image file is uploaded
      const isNewImage = busData.image instanceof File;

      // Append remove_image conditionally
      formData.append("remove_image", isNewImage ? true : false);

      // Handle image upload
      if (isNewImage) {
        formData.append("image", busData.image);
      }

      

      // Debugging FormData output
      console.log("FormData Contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // API Request
      const response = await axios.post(`${base_url}/vendor/buses/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        },
      });

      console.log("Response:", response.data);
      return response.data.body.item;
    } catch (error) {
      console.error("Error:", error);
      return rejectWithValue(error?.response?.statusText || "Request failed");
    }
  }
);



// Add seats to a bus
export const addSeats = createAsyncThunk(
  'bus/addSeats',
  async ({ busId, seats }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/buses/${busId}/seats`, { seats });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a seat
export const updateSeat = createAsyncThunk(
  'bus/updateSeat',
  async ({ busId, busData }, { rejectWithValue }) => {
    try {
      const token=getAuthToken()
      const formData=new FormData()
      console.log(busData)
      formData.append("bus_id",busId)
      formData.append("rows",busData.rows)
      formData.append("columns",busData.columns)
      formData.append("seats",JSON.stringify(busData.seats))
      formData.append("berth_type",busData.berth_type)

      const response = await axios.post(`${base_url}/vendor/buses/seat`, formData,{
        headers:{
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        }
      });
      console.log(response)
      return response.data.body.item;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Fetch all buses
export const fetchBuses = createAsyncThunk(
  'bus/fetchBuses',
  async (searchTag="", { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/vendor/buses?search=${searchTag}`,{headers:{Authorization: `${token}`}});
      return response.data.body.items;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Fetch a single bus by ID
export const fetchBusById = createAsyncThunk(
  'bus/fetchBusById',
  async (busId, { rejectWithValue }) => {
    try {
      const token=getAuthToken()
      const response = await axios.get(`${base_url}/vendor/buses/${busId}/show`,{
        headers:{
          Authorization: `${token}`
        }
      });
      console.log(response)
      return response.data.body.item;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Initial State
const initialState = {
  buses: [], // Array of all buses
  bus: null, // Currently selected bus for editing/viewing
  loading: false, // Loading state
  error: null, // Error state
};

// Bus Slice
const busSlice = createSlice({
  name: 'bus',
  initialState,
  reducers: {
    // Clear the currently selected bus
    clearBus: (state) => {
      state.bus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Bus
      .addCase(addBus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBus.fulfilled, (state, action) => {
        state.loading = false;
        state.buses.push(action.payload); // Add the new bus to the list
      })
      .addCase(addBus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Bus
      .addCase(editBus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.buses.findIndex((bus) => bus.id === action.payload.id);
        if (index !== -1) {
          // Update the bus data
          state.buses[index] = action.payload;

          // If updated seats are provided, update the seats in the bus
          if (action.payload.seats) {
            state.buses[index].seats = action.payload.seats;
          }
        }
      })
      .addCase(editBus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Seats
      .addCase(addSeats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSeats.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.buses.findIndex((bus) => bus.id === action.payload.busId);
        if (index !== -1) {
          state.buses[index].seats = action.payload.seats; // Update seats in the bus
        }
      })
      .addCase(addSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Seat
      .addCase(updateSeat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeat.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.buses.findIndex((bus) => bus.id === action.payload.busId);
        if (index !== -1) {
          const seatIndex = state.buses[index].seats.findIndex(
            (seat) => seat.id === action.payload.seatId
          );
          if (seatIndex !== -1) {
            state.buses[index].seats[seatIndex] = action.payload.seatData; // Update the seat
          }
        }
      })
      .addCase(updateSeat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Buses
      .addCase(fetchBuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.loading = false;
        state.buses = action.payload; // Set the list of buses
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Bus by ID
      .addCase(fetchBusById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusById.fulfilled, (state, action) => {
        state.loading = false;
        state.bus = action.payload; // Set the current bus
      })
      .addCase(fetchBusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearBus } = busSlice.actions;

// Export reducer
export default busSlice.reducer;