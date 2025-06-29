import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Vendor Users
export const fetchVendorUsers = createAsyncThunk(
  "vendorUsers/fetchVendorUsers",
  async ({ searchTag = "", page = 1, per_page = 10 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/users?search=${searchTag}&page=${page}&per_page=${per_page}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Show Vendor User
export const showVendorUser = createAsyncThunk(
  "vendorUsers/showVendorUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/users/${userId}/show`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Vendor User
export const addVendorUser = createAsyncThunk(
  "vendorUsers/addVendorUser",
  async (userData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("first_name", userData.first_name);
      formData.append("last_name", userData.last_name);
      formData.append("email", userData.email || "");
      formData.append("mobile", userData.mobile);
      formData.append("password", userData.password);
      formData.append("status", userData.status);

      const response = await axios.post(`${base_url}/vendor/users`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.body.item;
    } catch (error) {
      if (error.response?.data?.errors) {
        // Return the entire error response data
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Update Vendor User
export const updateVendorUser = createAsyncThunk(
  "vendorUsers/updateVendorUser",
  async ({ userId, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("id", userId);
      formData.append("first_name", updatedData.first_name);
      formData.append("last_name", updatedData.last_name);
      formData.append("email", updatedData.email || "");
      formData.append("mobile", updatedData.mobile);
      formData.append("password", updatedData.password);
      formData.append("status", updatedData.status);

      const response = await axios.post(
        `${base_url}/vendor/users/update`,
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
        // Return the entire error response data
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Permissions
export const fetchPermissions = createAsyncThunk(
  "vendorUsers/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/vendor/users/permissions`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.body.items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch User Permissions
export const fetchUserPermissions = createAsyncThunk(
  "vendorUsers/fetchUserPermissions",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/users/${userId}/permissions`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        userId,
        permissions: response.data.body.items,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update User Permissions
export const updateUserPermissions = createAsyncThunk(
  "vendorUsers/updateUserPermissions",
  async ({ userId, permissions }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("permissions", JSON.stringify(permissions));

      const response = await axios.post(
        `${base_url}/vendor/users/permissions`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      //console.log(response)
      return {
        userId,
        permissions: response.data.body.items,
      };
    } catch (error) {
      //console.log(error)
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

const vendorUsersSlice = createSlice({
  name: "vendorUsers",
  initialState: {
    loading: false,
    users: [],
    selectedUser: null,
    permissions: [],
    userPermissions: [],
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
      // Fetch Users
      .addCase(fetchVendorUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show User
      .addCase(showVendorUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      // Add User
      .addCase(addVendorUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(addVendorUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update User
      .addCase(updateVendorUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateVendorUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Permissions
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })

      // Fetch User Permissions
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.userPermissions = action.payload.permissions;
      })

      // Update User Permissions
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.userPermissions = action.payload.permissions;
      });
  },
});

export default vendorUsersSlice.reducer;
