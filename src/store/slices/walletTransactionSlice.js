import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Async thunks
export const fetchWalletTransactions = createAsyncThunk(
  'walletTransactions/fetchWalletTransactions',
  async ({searchTag="",page=1}, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/admin/wallet-transactions?page=${page}&search=${searchTag}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log(response)
      return {items:response.data.body.items,pagination:response.data.body.data};
    } catch (error) {
      //console.log(error)
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createWalletTransaction = createAsyncThunk(
  'walletTransactions/createWalletTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      // Append all required fields
      formData.append('user_id', transactionData.user_id);
      formData.append('total', transactionData.total);
      formData.append('amount', transactionData.amount);
      formData.append('fee', transactionData.fee);
      formData.append('status', transactionData.status);
      formData.append('type', transactionData.type);
      
      // Stringify the data object if it exists
      if (transactionData.data) {
        formData.append('data', JSON.stringify(transactionData.data));
      }

      const response = await axios.post(
        `${base_url}/admin/wallet-transactions`,
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

export const updateWalletTransaction = createAsyncThunk(
  'walletTransactions/updateWalletTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append("id",id)
      // Append only the fields that are being updated
      if (transactionData.user_id !== undefined) {
        formData.append('user_id', transactionData.user_id);
      }
      if (transactionData.total !== undefined) {
        formData.append('total', transactionData.total);
      }
      if (transactionData.amount !== undefined) {
        formData.append('amount', transactionData.amount);
      }
      if (transactionData.fee !== undefined) {
        formData.append('fee', transactionData.fee);
      }
      if (transactionData.status !== undefined) {
        formData.append('status', transactionData.status);
      }
      if (transactionData.type !== undefined) {
        formData.append('type', transactionData.type);
      }
      if (transactionData.data !== undefined) {
        formData.append('data', JSON.stringify(transactionData.data));
      }

      const response = await axios.post(
        `${base_url}/admin/wallet-transactions/update`,
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

export const deleteWalletTransaction = createAsyncThunk(
  'walletTransactions/deleteWalletTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${base_url}/admin/wallet-transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const walletTransactionSlice = createSlice({
  name: 'walletTransactions',
  initialState: {
    loading: false,
    transactions: [],
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
      // Fetch Transactions
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.items;
        state.pagination=action.payload.pagination
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Transaction
      .addCase(createWalletTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(createWalletTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createWalletTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Transaction
      .addCase(updateWalletTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateWalletTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        );
      })
      .addCase(updateWalletTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Transaction
      .addCase(deleteWalletTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteWalletTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        );
      })
      .addCase(deleteWalletTransaction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default walletTransactionSlice.reducer;