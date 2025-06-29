import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useFormik } from "formik";
import { signIn } from "../../store/slices/authSlice";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("admin"); // Default login type
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();

  

  // Formik for handling form submission and validation
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required!"),
      password: Yup.string()
        .min(6, "Password must be 6 characters long")
        .required("Password is required!"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Include loginType in the sign-in request
        await dispatch(
          signIn({
            email_or_mobile: values.email,
            password: values.password,
            role: loginType, // Pass the selected role to the backend
          })
        );
        navigate("/");
      } catch (e) {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("SIGN_IN")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("ENTER_YOUR_EMAIL_AND_PASSWORD_TO_SIGN_IN")}
            </p>
            
          </div>
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* Login Type Dropdown */}
              <div>
                <Label>{t("LOGIN_AS")} <span className="text-error-500">*</span></Label>
                <select
                  value={loginType}
                  onChange={(e) => setLoginType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="vendor_user">Vendor User</option>
                  {/* <option value="bus_driver">Bus Driver</option>
                  <option value="agent">Agent</option> */}
                </select>
              </div>

              {/* Email Field */}
              <div>
                <Label>{t("EMAIL")} <span className="text-error-500">*</span></Label>
                <Input
                  name="email"
                  placeholder={t("ENTER_YOUR_EMAIL")}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label>{t("PASSWORD")} <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("ENTER_YOUR_PASSWORD")}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    {t("KEEP_ME_LOGGED_IN")}
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("FORGOT_PASSWORD")}
                </Link>
              </div> */}

              {/* Sign In Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? t("SIGNING_IN") : t("SIGN_IN")}
                </Button>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("DONT_HAVE_AN_ACCOUNT")}{" "}
              <Link
                to="/sign-up"
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("SIGN_UP")}
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}