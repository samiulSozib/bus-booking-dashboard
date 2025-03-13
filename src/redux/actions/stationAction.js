// stationsActions.js
import axios from "axios";
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
import { base_url } from "../../utils/const";

const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};

// Fetch Stations
export const _fetchStations = (searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_STATIONS_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/stations?search=${searchTag}`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const stations = response.data.body.items;
        dispatch({
            type: FETCH_STATIONS_SUCCESS,
            payload: { stations },
        });
    } catch (error) {
        dispatch({
            type: FETCH_STATIONS_FAIL,
            payload: error.message,
        });
    }
};

// Show Station
export const _showStation = (stationId) => async (dispatch) => {
    dispatch({ type: SHOW_STATION_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/stations/${stationId}/show`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const station = response.data.body.item;
        dispatch({
            type: SHOW_STATION_SUCCESS,
            payload: station,
        });
    } catch (error) {
        dispatch({
            type: SHOW_STATION_FAIL,
            payload: error.message,
        });
    }
};

// Add Station
export const _addStation = (stationData, toast) => async (dispatch) => {
    dispatch({ type: ADD_STATION_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('name', JSON.stringify({
            en: stationData.stationName.en || '',
            ps: stationData.stationName.ps || '',
            fa: stationData.stationName.fa || '',
        }));
        formData.append('code', stationData.stationCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/stations`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData = {
            id: response.data.body.item.id,
            name: response.data.body.item.name.en,
            code: response.data.body.item.code,
        };
        dispatch({
            type: ADD_STATION_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Station added",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: ADD_STATION_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to add station",
            life: 3000,
        });
    }
};

// Edit Station
export const _editStation = (stationId, updatedData, toast) => async (dispatch) => {
    dispatch({ type: EDIT_STATION_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('id', stationId);
        formData.append('name', JSON.stringify({
            en: updatedData.stationName.en || '',
            ps: updatedData.stationName.ps || '',
            fa: updatedData.stationName.fa || '',
        }));
        formData.append('code', updatedData.stationCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/stations/update`, formData, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData = {
            id: response.data.body.item.id,
            name: response.data.body.item.name.en,
            code: response.data.body.item.code,
        };
        dispatch({
            type: EDIT_STATION_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Station edited",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: EDIT_STATION_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to edit station",
            life: 3000,
        });
    }
};

// Delete Station
export const _deleteStation = (stationId, toast) => async (dispatch) => {
    dispatch({ type: DELETE_STATION_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${base_url}/admin/stations/${stationId}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        dispatch({
            type: DELETE_STATION_SUCCESS,
            payload: stationId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Station deleted",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: DELETE_STATION_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete station",
            life: 3000,
        });
    }
};