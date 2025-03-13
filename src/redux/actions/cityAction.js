import axios from "axios";

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
    SHOW_CITY_SUCCESS
    
} from '../constants/citiesConstants';
import { SHOW_COUNTRY_FAIL } from "../constants/countriesConstants";
import { base_url } from "../../utils/const";


const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
};



// Fetch Cities
export const _fetchCities = (provinceId,searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_CITIES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/${provinceId}/cities/list?search=${searchTag}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        console.log(response)
        const cities=response.data.body.items
        dispatch({
            type: FETCH_CITIES_SUCCESS,
            payload: {cities},
        });
    } catch (error) {
        dispatch({
            type: FETCH_CITIES_FAIL,
            payload: error.message,
        });
    }
};

// show City
export const _showCity = (cityId) => async (dispatch) => {
    dispatch({ type: SHOW_CITY_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/cities/${cityId}/show`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        console.log(response)
        const province=response.data.body.item
        dispatch({
            type: SHOW_CITY_SUCCESS,
            payload: province,
        });
    } catch (error) {
        dispatch({
            type: SHOW_COUNTRY_FAIL,
            payload: error.message,
        });
    }
};

// Add District
export const _addCity = (cityData, toast) => async (dispatch) => {
    dispatch({ type: ADD_CITY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('province_id',cityData.provinceId)
        formData.append('name', JSON.stringify({
            en: cityData.cityName.en || '',
            ps: cityData.cityName.ps || '',
            fa: cityData.cityName.fa || ''
        }));
        formData.append('code',cityData.cityCode)
        formData.append("sort",0)

        const response = await axios.post(`${base_url}/admin/location/cities`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response)

        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        dispatch({
            type: ADD_CITY_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "District added",
        //     life: 3000,
        // });
    } catch (error) {
        dispatch({
            type: ADD_CITY_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to add district",
        //     life: 3000,
        // });
    }
};

// Edit District
export const _editCity = (cityId, updatedData, toast) => async (dispatch) => {
    dispatch({ type: EDIT_CITY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append("id",cityId)
        formData.append('province_id',updatedData.provinceId)
        formData.append('name', JSON.stringify({
            en: updatedData.cityName.en || '',
            ps: updatedData.cityName.ps || '',
            fa: updatedData.cityName.fa || ''
        }));
        formData.append('code',updatedData.cityCode)
        formData.append("sort",0)

        const response = await axios.post(`${base_url}/admin/location/cities/update`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response)

        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        dispatch({
            type: EDIT_CITY_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "District edited",
        //     life: 3000,
        // });
    } catch (error) {
        console.log(error)
        dispatch({
            type: EDIT_CITY_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to edit district",
        //     life: 3000,
        // });
    }
};

// Delete District
export const _deleteCity = (districtId, toast) => async (dispatch) => {
    dispatch({ type: DELETE_CITY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${base_url}/admin/location/cities/${districtId}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        dispatch({
            type: DELETE_CITY_SUCCESS,
            payload: districtId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "District deleted",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: DELETE_CITY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete district",
            life: 3000,
        });
    }
};