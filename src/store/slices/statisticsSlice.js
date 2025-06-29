import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch data
export const fetchDashboardData = createAsyncThunk(
    "statistics/fetch",
    async ({},{ rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const type=userType()
            if(type.role==="vendor_user"){
                type.role="vendor"
            }
            const response = await axios.get(`${base_url}/${type.role}/statistics`, {
                headers: { Authorization: `${token}` },
            });
            //console.log(response.data.body.item)
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);



// Create Slice
const statisticsSlice = createSlice({
    name: "statistics",
    initialState: { loading: false, data: {},  error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    },
});

export default statisticsSlice.reducer;