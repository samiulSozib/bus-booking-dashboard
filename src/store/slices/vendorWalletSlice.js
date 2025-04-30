import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Wallets
export const fetchWallets = createAsyncThunk(
  "wallets/fetchWallets",
  async ( { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      //console.log(token)
      const response = await axios.get(`${base_url}/vendor/wallets/balance`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return {
        balance: response.data.body.balance,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.statusText || error.message);
    }
  }
);



const vendorWalletSlice = createSlice({
  name: "wallets",
  initialState: {
    loading: false,
    balance: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Wallets
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default vendorWalletSlice.reducer;
