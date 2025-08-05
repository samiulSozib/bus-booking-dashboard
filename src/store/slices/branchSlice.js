import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Branches
export const fetchBranches = createAsyncThunk(
  "branches/fetch",
  async ({ search = "", page = 1, perPage = 10,vendor_id }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      
      let url=`${base_url}/${type.role}/branches?search=${search}&page=${page}&per_page=${perPage}`
      if(vendor_id){
        url+=`&vendor-id=${vendor_id}`
      }
      const response = await axios.get(
        url,
        {
          headers: { Authorization: `${token}` },
        }
      );
      console.log(response)
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Show Branch
export const showBranch = createAsyncThunk(
  "branches/show",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const response = await axios.get(
        `${base_url}/${type.role}/branches/${userId}/show`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Branch
export const addBranch = createAsyncThunk(
  "branches/add",
  async (branchData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(branchData).forEach((key) => {
        if (branchData[key] !== null && branchData[key] !== undefined) {
          formData.append(key, branchData[key]);
        }
      });

      const response = await axios.post(
        `${base_url}/${type.role}/branches`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.body.item;
    } catch (error) {
      console.log(error)
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);



// Update Branch
export const updateBranch = createAsyncThunk(
  "branches/update",
  async ({ id, branchData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      if (type.role === "vendor_user") {
        type.role = "vendor";
      }
      const formData = new FormData();

      // Append branch data
      Object.keys(branchData).forEach((key) => {
        if (branchData[key] !== null && branchData[key] !== undefined) {
          formData.append(key, branchData[key]);
        }
      });
      formData.append("id", id);

      const response = await axios.post(
        `${base_url}/${type.role}/branches/update`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Create Slice
const branchSlice = createSlice({
  name: "branches",
  initialState: {
    loading: false,
    branches: [],
    selectedBranch: null,
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
      // Fetch Branches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show Branch
      .addCase(showBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBranch = action.payload;
      })
      .addCase(showBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Branch
      .addCase(addBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload);
      })
      .addCase(addBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Update Branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.map((branch) =>
          branch.id === action.payload.id ? action.payload : branch
        );
        state.selectedBranch = action.payload;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchSlice.reducer;
