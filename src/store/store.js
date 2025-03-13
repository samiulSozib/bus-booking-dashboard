import { configureStore } from "@reduxjs/toolkit";
import countriesReducer from "./slices/countrySlice";
import authReducer from "./slices/authSlice"
import provinceReducer from "./slices/provinceSlice"
import cityReducer from "./slices/citySlice"
import routeReducer from "./slices/routeSlice"
import stationReducer from "./slices/stationSlice"
import tripReducer from "./slices/tripSlice"
import userReducer from "./slices/userSlice"

const store = configureStore({
    reducer: {
        countries: countriesReducer,
        auth:authReducer,
        provinces:provinceReducer,
        cities:cityReducer,
        routes:routeReducer,
        stations:stationReducer,
        trips:tripReducer,
        users:userReducer
    },
});

export default store;
