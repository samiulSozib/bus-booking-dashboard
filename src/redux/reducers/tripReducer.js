// tripsReducer.js
import {
    FETCH_TRIPS_REQUEST,
    FETCH_TRIPS_SUCCESS,
    FETCH_TRIPS_FAIL,
    ADD_TRIP_REQUEST,
    ADD_TRIP_SUCCESS,
    ADD_TRIP_FAIL,
    EDIT_TRIP_REQUEST,
    EDIT_TRIP_SUCCESS,
    EDIT_TRIP_FAIL,
    DELETE_TRIP_REQUEST,
    DELETE_TRIP_SUCCESS,
    DELETE_TRIP_FAIL,
    SHOW_TRIP_REQUEST,
    SHOW_TRIP_SUCCESS,
    SHOW_TRIP_FAIL,
} from '../constants/tripsConstants';

const initialState = {
    loading: false,
    trips: [],
    selectedTrip: null,
    error: null,
};

export const tripsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_TRIPS_REQUEST:
        case ADD_TRIP_REQUEST:
        case EDIT_TRIP_REQUEST:
        case DELETE_TRIP_REQUEST:
        case SHOW_TRIP_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_TRIPS_SUCCESS:
            return {
                ...state,
                loading: false,
                trips: action.payload.trips,
                error: null,
            };

        case ADD_TRIP_SUCCESS:
            return {
                ...state,
                loading: false,
                trips: [...state.trips, action.payload],
                error: null,
            };

        case EDIT_TRIP_SUCCESS:
            return {
                ...state,
                loading: false,
                trips: state.trips.map((trip) =>
                    trip.id === action.payload.id ? action.payload : trip
                ),
                error: null,
            };

        case DELETE_TRIP_SUCCESS:
            return {
                ...state,
                loading: false,
                trips: state.trips.filter((trip) => trip.id !== action.payload),
                error: null,
            };

        case SHOW_TRIP_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedTrip: action.payload,
                error: null,
            };

        case FETCH_TRIPS_FAIL:
        case ADD_TRIP_FAIL:
        case EDIT_TRIP_FAIL:
        case DELETE_TRIP_FAIL:
        case SHOW_TRIP_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};