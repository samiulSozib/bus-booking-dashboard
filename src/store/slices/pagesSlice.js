import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import { userType } from "../../utils/utils";

const getAuthToken = () => localStorage.getItem("token") || "";

// Async Thunks

// Fetch all pages
export const fetchPages = createAsyncThunk(
  "page/fetchPages",
  async ({ search = "", per_page = 10, page = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();

      const response = await axios.get(
        `${base_url}/${type.role}/pages?search=${search}&per_page=${per_page}&page=${page}`,
        { headers: { Authorization: `${token}` } }
      );
      
      return {
        items: response.data.body.items,
        pagination: response.data.body.data,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Fetch a single page by ID
export const fetchPageById = createAsyncThunk(
  "page/fetchPageById",
  async (pageId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();

      const response = await axios.get(
        `${base_url}/${type.role}/pages/${pageId}/show`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Create a new page
export const createPage = createAsyncThunk(
  "page/createPage",
  async ({ pageData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();

      const formData = new FormData();

      // Append all fields to formData
      Object.keys(pageData).forEach((key) => {
        if (key === "image") {
          formData.append(key, pageData[key]); // Append image file
        } else {
          formData.append(key, pageData[key]); // Append other fields
        }
      });

      const response = await axios.post(
        `${base_url}/${type.role}/pages`,
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
      return rejectWithValue(error?.response?.statusText);
    }
  }
);

// Update a page
export const updatePage = createAsyncThunk(
  "page/updatePage",
  async ({ pageId, pageData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();

      const formData = new FormData();

      // Append basic fields
      formData.append("id", pageId);
      formData.append("name", pageData.name);
      formData.append("title", pageData.title);
      formData.append("subtitle", pageData.subtitle || "");
      formData.append("content", pageData.content || "");
      formData.append("locale", pageData.locale);
      formData.append("status", pageData.status);

      // Handle image removal and upload
      const isNewImage = pageData.image instanceof File;
      formData.append("remove_image", isNewImage ? "1" : "0");

      if (isNewImage) {
        formData.append("image", pageData.image);
      }

      const response = await axios.post(
        `${base_url}/${type.role}/pages/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `${token}`,
          },
        }
      );

      return response.data.body.item;
    } catch (error) {
      return rejectWithValue(error?.response?.statusText || "Request failed");
    }
  }
);

// Delete a page
export const deletePage = createAsyncThunk(
  "page/deletePage",
  async (pageId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const type = userType();
      
      const response = await axios.delete(
        `${base_url}/${type.role}/pages/${pageId}/delete`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return pageId; // Return the ID of the deleted page
    } catch (error) {
      return rejectWithValue(
        error?.response?.statusText || "Failed to delete page"
      );
    }
  }
);

// Initial State
const initialState = {
  pages: [], // Array of all pages
  page: null, // Currently selected page for editing/viewing
  loading: false, // Loading state
  error: null, // Error state
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
};

// Page Slice
const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    // Clear the currently selected page
    clearPage: (state) => {
      state.page = null;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pages
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Page by ID
      .addCase(fetchPageById.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.page = action.payload;
      })
      .addCase(fetchPageById.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Page
      .addCase(createPage.pending, (state) => {
        state.error = null;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.push(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Page
      .addCase(updatePage.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        const index = state.pages.findIndex(
          (page) => page.id === action.payload.id
        );
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        // Also update the current page if it's the one being edited
        if (state.page && state.page.id === action.payload.id) {
          state.page = action.payload;
        }
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Page
      .addCase(deletePage.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((page) => page.id !== action.payload);
        state.pagination.total -= 1;
        // Clear current page if it was deleted
        if (state.page && state.page.id === action.payload) {
          state.page = null;
        }
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearPage, clearError } = pageSlice.actions;

// Export reducer
export default pageSlice.reducer;