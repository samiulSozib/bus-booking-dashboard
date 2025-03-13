// tripsActions.js
import axios from "axios";
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
import { base_url } from "../../utils/const";

const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};

// Fetch Trips
export const _fetchTrips = (searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_TRIPS_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/trips?search=${searchTag}`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const trips = response.data.body.items;
        dispatch({
            type: FETCH_TRIPS_SUCCESS,
            payload: { trips },
        });
    } catch (error) {
        dispatch({
            type: FETCH_TRIPS_FAIL,
            payload: error.message,
        });
    }
};

// Show Trip
export const _showTrip = (tripId) => async (dispatch) => {
    dispatch({ type: SHOW_TRIP_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/trips/${tripId}/show`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const trip = response.data.body.item;
        dispatch({
            type: SHOW_TRIP_SUCCESS,
            payload: trip,
        });
    } catch (error) {
        dispatch({
            type: SHOW_TRIP_FAIL,
            payload: error.message,
        });
    }
};

// Add Trip
export const _addTrip = (tripData, toast) => async (dispatch) => {
    dispatch({ type: ADD_TRIP_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('name', JSON.stringify({
            en: tripData.tripName.en || '',
            ps: tripData.tripName.ps || '',
            fa: tripData.tripName.fa || '',
        }));
        formData.append('code', tripData.tripCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/trips`, formData, {
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
            type: ADD_TRIP_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Trip added",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: ADD_TRIP_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to add trip",
            life: 3000,
        });
    }
};

// Edit Trip
export const _editTrip = (tripId, updatedData, toast) => async (dispatch) => {
    dispatch({ type: EDIT_TRIP_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('id', tripId);
        formData.append('name', JSON.stringify({
            en: updatedData.tripName.en || '',
            ps: updatedData.tripName.ps || '',
            fa: updatedData.tripName.fa || '',
        }));
        formData.append('code', updatedData.tripCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/trips/update`, formData, {
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
            type: EDIT_TRIP_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Trip edited",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: EDIT_TRIP_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to edit trip",
            life: 3000,
        });
    }
};

// Delete Trip
export const _deleteTrip = (tripId, toast) => async (dispatch) => {
    dispatch({ type: DELETE_TRIP_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${base_url}/admin/trips/${tripId}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        dispatch({
            type: DELETE_TRIP_SUCCESS,
            payload: tripId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Trip deleted",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: DELETE_TRIP_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete trip",
            life: 3000,
        });
    }
};