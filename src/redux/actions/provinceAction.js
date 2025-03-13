import axios from "axios";

import {
    FETCH_PROVINCES_REQUEST,
    FETCH_PROVINCES_SUCCESS,
    FETCH_PROVINCES_FAIL,
    ADD_PROVINCE_REQUEST,
    ADD_PROVINCE_SUCCESS,
    ADD_PROVINCE_FAIL,
    EDIT_PROVINCE_REQUEST,
    EDIT_PROVINCE_SUCCESS,
    EDIT_PROVINCE_FAIL,
    DELETE_PROVINCE_REQUEST,
    DELETE_PROVINCE_SUCCESS,
    DELETE_PROVINCE_FAIL,
    SHOW_PROVINCE_SUCCESS,
    SHOW_PROVINCE_REQUEST,
    SHOW_PROVINCE_FAIL,
} from '../constants/provinceConstants';
import { base_url } from "../../utils/const";

const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};



// Fetch Provinces
export const _fetchProvinces = (countryId,searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_PROVINCES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/${countryId}/provinces?search=${searchTag}`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type':'application/json'
            },
        });
        //console.log(response)
        const provinces=response.data.body.items
        dispatch({
            type: FETCH_PROVINCES_SUCCESS,
            payload: {provinces},
        });
    } catch (error) {
        dispatch({
            type: FETCH_PROVINCES_FAIL,
            payload: error.message,
        });
    }
};

// show province
export const _showProvince = (provinceId) => async (dispatch) => {
    dispatch({ type: SHOW_PROVINCE_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/provinces/${provinceId}/show`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type':'application/json'
            },
        });
        console.log(response)
        const province=response.data.body.item
        console.log(province)
        dispatch({
            type: SHOW_PROVINCE_SUCCESS,
            payload: province,
        });
    } catch (error) {
        dispatch({
            type: SHOW_PROVINCE_FAIL,
            payload: error.message,
        });
    }
};

// Add Province
export const _addProvince = (provinceData, toast) => async (dispatch) => {
    dispatch({ type: ADD_PROVINCE_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('name', JSON.stringify({
            en: provinceData.provinceName.en || '',
            ps: provinceData.provinceName.ps || '',
            fa: provinceData.provinceName.fa || ''
        }));
        formData.append('code', provinceData.provinceCode);
        formData.append('country_id', provinceData.countryId); 
        formData.append("sort",0)

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
        //return
        const response = await axios.post(`${base_url}/admin/location/provinces`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response)
        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        console.log(newData)
        dispatch({
            type: ADD_PROVINCE_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "Province added",
        //     life: 3000,
        // });
    } catch (error) {
        console.log(error)
        dispatch({
            type: ADD_PROVINCE_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to add province",
        //     life: 3000,
        // });
    }
};

// Edit Province
export const _editProvince = (provinceId, updatedData, toast) => async (dispatch) => {
    dispatch({ type: EDIT_PROVINCE_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('name', JSON.stringify({
            en: updatedData.provinceName.en || '',
            ps: updatedData.provinceName.ps || '',
            fa: updatedData.provinceName.fa || ''
        }));
        formData.append('code', updatedData.provinceCode);
        formData.append('country_id', updatedData.countryId); 
        formData.append("sort",0)
        formData.append("id",provinceId)

        const response = await axios.post(`${base_url}/admin/location/provinces/update`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        dispatch({
            type: EDIT_PROVINCE_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "Province edited",
        //     life: 3000,
        // });
    } catch (error) {
        dispatch({
            type: EDIT_PROVINCE_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to edit province",
        //     life: 3000,
        // });
    }
};

// Delete Province
export const _deleteProvince = (provinceId, toast) => async (dispatch) => {
    dispatch({ type: DELETE_PROVINCE_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${base_url}/admin/location/provinces/${provinceId}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        dispatch({
            type: DELETE_PROVINCE_SUCCESS,
            payload: provinceId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Province deleted",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: DELETE_PROVINCE_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete province",
            life: 3000,
        });
    }
};