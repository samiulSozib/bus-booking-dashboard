// store/districtReducer.ts

import {
    FETCH_CITIES_REQUEST,
    FETCH_CITIES_SUCCESS,
    FETCH_CITIES_FAIL,
    ADD_CITY_REQUEST,
    ADD_CITY_SUCCESS,
    ADD_CITY_FAIL,
    EDIT_CITY_REQUEST,
    EDIT_CITY_SUCCESS,
    EDIT_CITY_FAIL,
    DELETE_CITY_REQUEST,
    DELETE_CITY_SUCCESS,
    DELETE_CITY_FAIL,
    SHOW_CITY_REQUEST,
    SHOW_CITY_SUCCESS,
    SHOW_CITY_FAIL
    
} from '../constants/citiesConstants';



const initialState = {
    loading: false,
    cities: [],
    selectedCity: null,
    error: null,
};



export const cityReducer = (state = initialState,action) => {
    switch (action.type) {
        case FETCH_CITIES_REQUEST:
        case ADD_CITY_REQUEST:
        case EDIT_CITY_REQUEST:
        case DELETE_CITY_REQUEST:
        case SHOW_CITY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_CITIES_SUCCESS:
            return {
                ...state,
                loading: false,
                cities: action.payload.cities,
                error: null,
            };
        
        case SHOW_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedCity: action.payload,
                error: null,
            };

        case FETCH_CITIES_FAIL:
        case SHOW_CITY_FAIL:
        case ADD_CITY_FAIL:
        case EDIT_CITY_FAIL:
        case DELETE_CITY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                cities: [...state.cities, action.payload],
                error: null,
            };

        case EDIT_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                cities: state.cities.map((district) =>
                    district.id === action.payload.id ? action.payload : district
                ),
                error: null,
            };

        case DELETE_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                cities: state.cities.filter((district) => district.id !== action.payload),
                error: null,
            };

        default:
            return state;
    }
};
