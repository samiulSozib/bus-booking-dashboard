import axios from "axios";
import { LOGOUT, SIGN_IN_FAIL, SIGN_IN_REQUEST, SIGN_IN_SUCCESS } from "../constants/authConstant";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import i18next from "i18next";

const login_url = `https://api.milliekit.com/api/v1/auth`;

export const signIn = (signInInfo) => {
    return async (dispatch) => {
        dispatch({ type: SIGN_IN_REQUEST });
        try {
            const role = signInInfo.role;
            const formData = new FormData();
            formData.append("email_or_mobile", signInInfo.email_or_mobile);
            formData.append("password", signInInfo.password);

            const response = await axios.post(login_url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log(response);
            const { token, profile } = response.data.body;
            const userRole = profile[0]?.role;

            if (userRole !== role) {
                Swal.fire({
                  icon: "error",
                  title: i18next.t("LOGIN_FAIL"),
                  text: "Permission Denied",
              });
                return;
            }

            dispatch({ type: SIGN_IN_SUCCESS, payload: { token, profile: profile[0] } });
            Swal.fire({
                title: i18next.t("GOOD_JOB"),
                text: i18next.t("LOGIN_SUCCESS"),
                icon: "success",
            });

        } catch (error) {
            console.log(error);
            const errorMessage = error.response?.data?.errors || error.message;

            dispatch({ type: SIGN_IN_FAIL, payload: errorMessage });
            Swal.fire({
                icon: "error",
                title: i18next.t("LOGIN_FAIL"),
                text: errorMessage,
            });
        }
    };
};

export const logout = () => {
    return (dispatch) => {
        localStorage.removeItem("user_info");
        localStorage.removeItem("token");
        dispatch({ type: LOGOUT });
        Swal.fire({
            title: i18next.t("GOOD_JOB"),
            text: i18next.t("LOGOUT_SUCCESS"),
            icon: "success",
        });
    };
};
