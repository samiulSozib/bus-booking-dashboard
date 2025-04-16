import { configureStore } from "@reduxjs/toolkit";
import countriesReducer from "./slices/countrySlice";
import authReducer from "./slices/authSlice"
import provinceReducer from "./slices/provinceSlice"
import cityReducer from "./slices/citySlice"
import routeReducer from "./slices/routeSlice"
import stationReducer from "./slices/stationSlice"
import tripReducer from "./slices/tripSlice"
import userReducer from "./slices/userSlice"
import busReducer from "./slices/busSlice"
import driverReducer from "./slices/driverSlice.js"
import discountReducer from "./slices/discountSlice.js"
import walletTransactionReducer from "./slices/walletTransactionSlice.js"
import statisticsReducer from "./slices/statisticsSlice.js"

const store = configureStore({
    reducer: {
        countries: countriesReducer,
        auth:authReducer,
        provinces:provinceReducer,
        cities:cityReducer,
        routes:routeReducer,
        stations:stationReducer,
        trips:tripReducer,
        users:userReducer,
        buses:busReducer,
        drivers:driverReducer,
        discounts:discountReducer,
        walletTransactions:walletTransactionReducer,
        statistics:statisticsReducer
    },
});

export default store;
