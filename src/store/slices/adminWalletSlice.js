import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Wallets
export const fetchWallets = createAsyncThunk(
  "wallets/fetchWallets",
  async ({ userId = "", page = 1, perPage = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/wallets?page=${page}`, {
        params: {
          "user-id": userId,
          page,
          per_page: perPage,
        },
        headers: {
          Authorization: `${token}`,
        },
      });

      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.statusText || error.message);
    }
  }
);

// Show Single Wallet
export const showWallet = createAsyncThunk(
  "wallets/showWallet",
  async (walletId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/wallets/${walletId}/show`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error?.response?.statusText || error.message);
    }
  }
);

const adminWalletSlice = createSlice({
  name: "wallets",
  initialState: {
    loading: false,
    wallets: [],
    selectedWallet: null,
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
      // Fetch Wallets
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show Wallet
      .addCase(showWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWallet = action.payload;
      })
      .addCase(showWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminWalletSlice.reducer;
