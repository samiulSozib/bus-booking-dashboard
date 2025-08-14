import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "../../utils/const";
import Swal from "sweetalert2";
import i18next from "i18next";

const getAuthToken = () => localStorage.getItem("token") || "";

const initialState = {
  loading: false,
  isAuthenticated: !!localStorage.getItem("token"),
  profile: JSON.parse(localStorage.getItem("profile")) || null,
  error: "",
  signUpSuccess: false,
  token: localStorage.getItem("token") || "",
};

// Async Thunk for Sign In
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (signInInfo, { rejectWithValue }) => {
    try {
      const login_url = `${base_url}/auth`;
      const formData = new FormData();
      formData.append("email_or_mobile", signInInfo.email_or_mobile);
      formData.append("password", signInInfo.password);

      const response = await axios.post(login_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { token, profile } = response.data.body;
      const userRole = profile[0]?.role;

      let effectiveRole = signInInfo.role;

      // If role is "user", treat it as vendor_user or vendor_branch_user
      if (signInInfo.role === "user") {
        if (userRole === "vendor_user" || userRole === "vendor_branch_user") {
          effectiveRole = userRole; // allow match
        }
      }

      if (userRole !== effectiveRole) {
        Swal.fire({
          icon: "error",
          title: i18next.t("LOGIN_FAIL"),
          text: "Permission Denied",
        });
        return rejectWithValue("Permission Denied");
      }

      localStorage.setItem("profile", JSON.stringify(profile[0]));
      localStorage.setItem("token", token);

      Swal.fire({
        title: i18next.t("GOOD_JOB"),
        text: i18next.t("LOGIN_SUCCESS"),
        icon: "success",
      });

      return { token, profile: profile[0] };
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.invalid || error.message;
      Swal.fire({
        icon: "error",
        title: i18next.t("LOGIN_FAIL"),
        text: errorMessage,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
    dispatch(authSlice.actions.resetAuthState());
    Swal.fire({
      title: i18next.t("GOOD_JOB"),
      text: i18next.t("LOGOUT_SUCCESS"),
      icon: "success",
    });
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.profile = null;
      state.token = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
        state.error = "";
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.profile = null;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.profile = null;
        state.token = "";
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
