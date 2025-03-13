// stationsReducer.js
import {
    FETCH_STATIONS_REQUEST,
    FETCH_STATIONS_SUCCESS,
    FETCH_STATIONS_FAIL,
    ADD_STATION_REQUEST,
    ADD_STATION_SUCCESS,
    ADD_STATION_FAIL,
    EDIT_STATION_REQUEST,
    EDIT_STATION_SUCCESS,
    EDIT_STATION_FAIL,
    DELETE_STATION_REQUEST,
    DELETE_STATION_SUCCESS,
    DELETE_STATION_FAIL,
    SHOW_STATION_REQUEST,
    SHOW_STATION_SUCCESS,
    SHOW_STATION_FAIL,
} from '../constants/stationsConstants';

const initialState = {
    loading: false,
    stations: [],
    selectedStation: null,
    error: null,
};

export const stationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_STATIONS_REQUEST:
        case ADD_STATION_REQUEST:
        case EDIT_STATION_REQUEST:
        case DELETE_STATION_REQUEST:
        case SHOW_STATION_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_STATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                stations: action.payload.stations,
                error: null,
            };

        case ADD_STATION_SUCCESS:
            return {
                ...state,
                loading: false,
                stations: [...state.stations, action.payload],
                error: null,
            };

        case EDIT_STATION_SUCCESS:
            return {
                ...state,
                loading: false,
                stations: state.stations.map((station) =>
                    station.id === action.payload.id ? action.payload : station
                ),
                error: null,
            };

        case DELETE_STATION_SUCCESS:
            return {
                ...state,
                loading: false,
                stations: state.stations.filter((station) => station.id !== action.payload),
                error: null,
            };

        case SHOW_STATION_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedStation: action.payload,
                error: null,
            };

        case FETCH_STATIONS_FAIL:
        case ADD_STATION_FAIL:
        case EDIT_STATION_FAIL:
        case DELETE_STATION_FAIL:
        case SHOW_STATION_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};