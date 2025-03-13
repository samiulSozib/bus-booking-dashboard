// routesReducer.js
import {
    FETCH_ROUTES_REQUEST,
    FETCH_ROUTES_SUCCESS,
    FETCH_ROUTES_FAIL,
    ADD_ROUTE_REQUEST,
    ADD_ROUTE_SUCCESS,
    ADD_ROUTE_FAIL,
    EDIT_ROUTE_REQUEST,
    EDIT_ROUTE_SUCCESS,
    EDIT_ROUTE_FAIL,
    DELETE_ROUTE_REQUEST,
    DELETE_ROUTE_SUCCESS,
    DELETE_ROUTE_FAIL,
    SHOW_ROUTE_REQUEST,
    SHOW_ROUTE_SUCCESS,
    SHOW_ROUTE_FAIL,
} from '../constants/routesConstants';

const initialState = {
    loading: false,
    routes: [],
    selectedRoute: null,
    error: null,
};

export const routesReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ROUTES_REQUEST:
        case ADD_ROUTE_REQUEST:
        case EDIT_ROUTE_REQUEST:
        case DELETE_ROUTE_REQUEST:
        case SHOW_ROUTE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_ROUTES_SUCCESS:
            return {
                ...state,
                loading: false,
                routes: action.payload.routes,
                error: null,
            };

        case ADD_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                routes: [...state.routes, action.payload],
                error: null,
            };

        case EDIT_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                routes: state.routes.map((route) =>
                    route.id === action.payload.id ? action.payload : route
                ),
                error: null,
            };

        case DELETE_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                routes: state.routes.filter((route) => route.id !== action.payload),
                error: null,
            };

        case SHOW_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedRoute: action.payload,
                error: null,
            };

        case FETCH_ROUTES_FAIL:
        case ADD_ROUTE_FAIL:
        case EDIT_ROUTE_FAIL:
        case DELETE_ROUTE_FAIL:
        case SHOW_ROUTE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};