import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Users
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (
    { searchTag = "", role = "", page = 1, vendorId = "", branch_id },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();

      let url = `${base_url}/admin/users?search=${searchTag}&role=${role}&page=${page}`;
      if (role === "driver" && vendorId) {
        url += `&vendor-id=${vendorId}`;
      }

      if (branch_id) {
        url += `&branch-id=${branch_id}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `${token}` },
      });
      //console.log(response)
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
        role,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Show User
export const showUser = createAsyncThunk(
  "users/show",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/admin/users/${userId}/show`,
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

// Add User
export const addUser = createAsyncThunk(
  "users/add",
  async (userData, { rejectWithValue }) => {
    try {
      //console.log("user_data"+userData)
      const token = getAuthToken();
      const formData = new FormData();

      // // Extract role from userData
      // const { role } = userData;

      // // Append common fields
      // const commonFields = [
      //     "first_name", "last_name", "email", "mobile", "role",
      //     "password", "status"
      // ];

      // commonFields.forEach((field) => {
      //     if (userData[field] !== undefined && userData[field] !== "") {
      //         formData.append(field, userData[field]);
      //     }
      // });

      // // Role-based additional fields
      // if (role === "agent") {
      //     formData.append("name", userData.name || "");
      //     formData.append("phone", userData.phone || "");
      //     formData.append("code", userData.code || "");
      //     formData.append("comission_amount", userData.comission_amount || 0);
      //     formData.append("comission_type", userData.comission_type || "fixed");
      // } else if (role === "vendor") {
      //     formData.append("name", userData.name || "");
      //     formData.append("phone", userData.phone || "");
      //     formData.append("registration_number", userData.registration_number || "");
      //     formData.append("license_number", userData.license_number || "");
      //     formData.append("rating", userData.rating || 0);
      //     formData.append("admin_comission_amount", userData.admin_comission_amount || 0);
      //     formData.append("admin_comission_type", userData.admin_comission_type || "fixed");
      //     formData.append("agent_comission_amount", userData.agent_comission_amount || 0);
      //     formData.append("agent_comission_type", userData.agent_comission_type || "fixed");
      //     formData.append("description", userData.description || "");

      //     if (userData.logo instanceof File) {
      //         formData.append("logo", userData.logo);
      //     }
      // } else if (role === "driver") {
      //     formData.append("vendor_id", userData.vendor_id || "");
      // }

      // Debug FormData before sending
      for (let [key, value] of formData.entries()) {
        //console.log(`${key}:`, value);
      }

      Object.keys(userData).forEach((key) => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      // Send request
      const response = await axios.post(`${base_url}/admin/users`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      //console.log(response);
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

// Edit User
export const editUser = createAsyncThunk(
  "users/edit",
  async ({ userId, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      //console.log(updatedData)

      // Append all fields to formData
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      });
      formData.append("id", userId);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        `${base_url}/admin/users/update`,
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
      //console.log(error)
      if (error.response?.data?.errors) {
        // Return the entire error response data
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Edit vendor
export const editVendor = createAsyncThunk(
  "users/editVendor",
  async ({ vendorId, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      //console.log(updatedData)

      // Append all fields to formData
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      });
      formData.append("id", vendorId);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        `${base_url}/admin/users/vendors/update`,
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
      //console.log(error)
      if (error.response?.data?.errors) {
        // Return the entire error response data
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Delete User
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${base_url}/admin/users/${userId}`, {
        headers: { Authorization: `${token}` },
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create Slice
const userSlice = createSlice({
  name: "users",
  initialState: {
    loading: false,
    users: [],
    vendorList: [],
    driverList: [],
    selectedUser: null,
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
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { items, pagination, role } = action.payload;

        if (role === "vendor") {
          state.vendorList = items;
          state.users = items;
        } else if (role === "driver") {
          state.driverList = items;
          state.users = items;
        } else {
          state.users = items; // for all users
        }

        state.pagination = pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(showUser.pending, (state) => {
        state.error = null;
      })
      .addCase(showUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(showUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addUser.pending, (state) => {
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(editUser.pending, (state) => {
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(editUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // vendor update
      .addCase(editVendor.pending, (state) => {
        state.error = null;
      })
      .addCase(editVendor.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
        state.vendorList = state.vendorList.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })

      .addCase(editVendor.rejected, (state, action) => {
        state.error = action.payload;
      })
      //

      .addCase(deleteUser.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
