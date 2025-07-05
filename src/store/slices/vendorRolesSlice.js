import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";

const getAuthToken = () => localStorage.getItem("token") || "";

// Fetch Roles
export const fetchRoles = createAsyncThunk(
  "vendorRoles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${base_url}/vendor/users/roles`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Role
export const addRole = createAsyncThunk(
  "vendorRoles/addRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("title", roleData.title);
      formData.append("name", roleData.name);
      formData.append("description", roleData.description || "");
      formData.append("permissions", JSON.stringify(roleData.permissions));

      const response = await axios.post(
        `${base_url}/vendor/users/roles`,
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

// Show Role
export const showRole = createAsyncThunk(
  "vendorRoles/showRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${base_url}/vendor/users/roles/${roleId}/show`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      //console.log(response)
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Role
export const updateRole = createAsyncThunk(
  "vendorRoles/updateRole",
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", roleData.title);
      formData.append("name", roleData.name);
      formData.append("description", roleData.description || "");
      formData.append("permissions", JSON.stringify(roleData.permissions));

      const response = await axios.post(
        `${base_url}/vendor/users/roles/update`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      //console.log(response)
      return response.data.body.item;
    } catch (error) {
      //console.log(error)
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Delete Role
export const deleteRole = createAsyncThunk(
  "vendorRoles/deleteRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(
        `${base_url}/vendor/users/roles/${roleId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { roleId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const vendorRolesSlice = createSlice({
  name: "vendorRoles",
  initialState: {
    loading: false,
    roles: [],
    selectedRole: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
  },
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Role
      .addCase(addRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.unshift(action.payload);
      })
      .addCase(addRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Show Role
      .addCase(showRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(showRole.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(showRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter(
          (role) => role.id !== action.payload.roleId
        );
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRole } = vendorRolesSlice.actions;
export default vendorRolesSlice.reducer;