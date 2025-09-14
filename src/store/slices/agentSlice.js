import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Determine API base path based on user type
const getAgentBasePath = () => {
  const type = userType();
  return type.role === "vendor" ? `${base_url}/vendor` : `${base_url}/branch`;
};

// Fetch Agents
export const fetchAgents = createAsyncThunk(
  "agents/fetch",
  async (
    { search = "", branch_id = "", page = 1, per_page = 10 },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      
      let url = `${basePath}/agents?page=${page}&per_page=${per_page}`;
      
      if (search) {
        url += `&search=${search}`;
      }
      
      if (branch_id) {
        url += `&branch-id=${branch_id}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return {
        items: response.data.body.items,
        pagination: response.data.body.pagination || response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Show Agent
export const showAgent = createAsyncThunk(
  "agents/show",
  async (user_id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      
      const response = await axios.get(
        `${basePath}/agents/${user_id}/show`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create Agent
export const createAgent = createAsyncThunk(
  "agents/create",
  async (agentData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(agentData).forEach((key) => {
        if (agentData[key] !== null && agentData[key] !== undefined) {
          formData.append(key, agentData[key]);
        }
      });

      const response = await axios.post(
        `${basePath}/agents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data.body.item;
    } catch (error) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update Agent Details
export const updateAgent = createAsyncThunk(
  "agents/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      });
      
      formData.append("id", id);

      const response = await axios.post(
        `${basePath}/agents/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data.body.item;
    } catch (error) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update Agent User Details
export const updateAgentUser = createAsyncThunk(
  "agents/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      });
      
      formData.append("id", id);

      const response = await axios.post(
        `${basePath}/agents/user/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data.body.item;
    } catch (error) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete Agent
export const deleteAgent = createAsyncThunk(
  "agents/delete",
  async (agentId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const basePath = getAgentBasePath();
      
      await axios.delete(`${basePath}/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return agentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create Slice
const agentSlice = createSlice({
  name: "agents",
  initialState: {
    loading: false,
    agents: [],
    selectedAgent: null,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 10,
    },
  },
  reducers: {
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Agents
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Show Agent
      .addCase(showAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAgent = action.payload;
      })
      .addCase(showAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Agent
      .addCase(createAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents.unshift(action.payload);
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Agent
      .addCase(updateAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.map((agent) =>
          agent.id === action.payload.id ? action.payload : agent
        );
        
        if (state.selectedAgent && state.selectedAgent.id === action.payload.id) {
          state.selectedAgent = action.payload;
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Agent User
      .addCase(updateAgentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.map((agent) =>
          agent.id === action.payload.id ? action.payload : agent
        );
        
        if (state.selectedAgent && state.selectedAgent.id === action.payload.id) {
          state.selectedAgent = action.payload;
        }
      })
      .addCase(updateAgentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Agent
      .addCase(deleteAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.filter((agent) => agent.id !== action.payload);
        
        if (state.selectedAgent && state.selectedAgent.id === action.payload) {
          state.selectedAgent = null;
        }
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAgent, clearError } = agentSlice.actions;
export default agentSlice.reducer;