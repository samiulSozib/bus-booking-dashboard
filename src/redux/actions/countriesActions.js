import axios from "axios";

import {
    FETCH_COUNTRIES_REQUEST,
    FETCH_COUNTRIES_SUCCESS,
    FETCH_COUNTRIES_FAIL,
    ADD_COUNTRY_REQUEST,
    ADD_COUNTRY_SUCCESS,
    ADD_COUNTRY_FAIL,
    EDIT_COUNTRY_REQUEST,
    EDIT_COUNTRY_SUCCESS,
    EDIT_COUNTRY_FAIL,
    DELETE_COUNTRY_REQUEST,
    DELETE_COUNTRY_SUCCESS,
    DELETE_COUNTRY_FAIL,
    SHOW_COUNTRY_REQUEST,
    SHOW_COUNTRY_SUCCESS,
    SHOW_COUNTRY_FAIL,
} from '../constants/countriesConstants';

const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};
const base_url=`https://api.milliekit.com/api/v1`
const token="191|SKDJAAPjkU4NK9dq4Bg47XV0xqaXu3nMq5NAQjxR623c4d5a"

// Fetch Countries
export const _fetchCountries = (searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });

    try {
        //const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/countries?search=${searchTag}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const countries=response.data.body.items
        dispatch({
            type: FETCH_COUNTRIES_SUCCESS,
            payload: {countries},
        });
    } catch (error) {
        console.log(error)
        dispatch({
            type: FETCH_COUNTRIES_FAIL,
            payload: error,
        });
    }
};


// show country
export const _showCountry = (countryId) => async (dispatch) => {
    dispatch({ type: SHOW_COUNTRY_REQUEST });

    try {
        //const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/location/countries/${countryId}/show`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(response)
        const country=response.data.body.item
        dispatch({
            type: SHOW_COUNTRY_SUCCESS,
            payload: country,
        });
    } catch (error) {
        console.log(error)
        dispatch({
            type: SHOW_COUNTRY_FAIL,
            payload: error,
        });
    }
};

// Add Country
export const _addCountry = (countryData,toast) => async (dispatch) => {
    dispatch({ type: ADD_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        console.log(countryData)
        //return
        const formData=new FormData()

        formData.append('name', JSON.stringify({
            en: countryData.countryName.en || '',
            ps: countryData.countryName.ps || '',
            fa: countryData.countryName.fa || ''
        }));
        formData.append('code',countryData.countryCode)
        formData.append("sort",0)

        // formData.forEach((value, key) => {
        //     console.log(`${key}: ${value}`);
        // });
        //return
        
        const response = await axios.post(`${base_url}/admin/location/countries`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(response)
        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        console.log(newData)
        dispatch({
            type: ADD_COUNTRY_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "Country added",
        //     life: 3000,
        //   });
    } catch (error) {
        console.log(error)
        dispatch({
            type: ADD_COUNTRY_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to add country",
        //     life: 3000,
        //   });
          //console.log(error)
    }
};

// Edit Country
export const _editCountry = (countryId, updatedData,toast) => async (dispatch) => {
    dispatch({ type: EDIT_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        const formData=new FormData()

        formData.append("id",countryId)
        formData.append('name', JSON.stringify({
            en: updatedData.countryName.en || '',
            ps: updatedData.countryName.ps || '',
            fa: updatedData.countryName.fa || ''
        }));
        formData.append('code',updatedData.countryCode)
        formData.append("sort",0)


        const response = await axios.post(`${base_url}/admin/location/countries/update`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        const newData={id:response.data.body.item.id,name:response.data.body.item.name.en,code:response.data.body.item.code}
        dispatch({
            type: EDIT_COUNTRY_SUCCESS,
            payload: newData,
        });
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Successful",
        //     detail: "Country edited",
        //     life: 3000,
        //   });
    } catch (error) {
        dispatch({
            type: EDIT_COUNTRY_FAIL,
            payload: error.message,
        });
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: "Failed to edit country",
        //     life: 3000,
        //   });
          //console.log(error)
    }
};

// Delete Country
export const _deleteCountry = (countryId,toast) => async () => {
    dispatch({ type: DELETE_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`https://api.milliekit.com/api/v1/admin/location/countries/${countryId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: DELETE_COUNTRY_SUCCESS,
            payload: countryId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Country deleted",
            life: 3000,
          });
    } catch (error) {
        dispatch({
            type: DELETE_COUNTRY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete country",
            life: 3000,
          });

    }
};
