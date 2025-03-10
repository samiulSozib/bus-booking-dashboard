import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.jsx";
import { AppWrapper } from "./components/common/PageMeta.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import "./i18n"; // i18next ইম্পোর্ট করুন
import { I18nextProvider } from "react-i18next";





createRoot(document.getElementById("root")).render(
  
  <Provider store={store}>
    <StrictMode>
      <ThemeProvider>
        <AppWrapper>
          <I18nextProvider>
          <App />
          </I18nextProvider>
        </AppWrapper>
      </ThemeProvider>
    </StrictMode>
  </Provider>
);
