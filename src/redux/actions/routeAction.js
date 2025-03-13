// routesActions.js
import axios from "axios";
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
import { base_url } from "../../utils/const";

const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};

// Fetch Routes
export const _fetchRoutes = (searchTag) => async (dispatch) => {
    dispatch({ type: FETCH_ROUTES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/routes?search=${searchTag}`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const routes = response.data.body.items;
        dispatch({
            type: FETCH_ROUTES_SUCCESS,
            payload: { routes },
        });
    } catch (error) {
        dispatch({
            type: FETCH_ROUTES_FAIL,
            payload: error.message,
        });
    }
};

// Show Route
export const _showRoute = (routeId) => async (dispatch) => {
    dispatch({ type: SHOW_ROUTE_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${base_url}/admin/routes/${routeId}/show`, {
            headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            },
        });
        const route = response.data.body.item;
        dispatch({
            type: SHOW_ROUTE_SUCCESS,
            payload: route,
        });
    } catch (error) {
        dispatch({
            type: SHOW_ROUTE_FAIL,
            payload: error.message,
        });
    }
};

// Add Route
export const _addRoute = (routeData, toast) => async (dispatch) => {
    dispatch({ type: ADD_ROUTE_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('name', JSON.stringify({
            en: routeData.routeName.en || '',
            ps: routeData.routeName.ps || '',
            fa: routeData.routeName.fa || '',
        }));
        formData.append('code', routeData.routeCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/routes`, formData, {
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
            type: ADD_ROUTE_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Route added",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: ADD_ROUTE_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to add route",
            life: 3000,
        });
    }
};

// Edit Route
export const _editRoute = (routeId, updatedData, toast) => async (dispatch) => {
    dispatch({ type: EDIT_ROUTE_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();

        formData.append('id', routeId);
        formData.append('name', JSON.stringify({
            en: updatedData.routeName.en || '',
            ps: updatedData.routeName.ps || '',
            fa: updatedData.routeName.fa || '',
        }));
        formData.append('code', updatedData.routeCode);
        formData.append('sort', 0);

        const response = await axios.post(`${base_url}/admin/routes/update`, formData, {
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
            type: EDIT_ROUTE_SUCCESS,
            payload: newData,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Route edited",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: EDIT_ROUTE_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to edit route",
            life: 3000,
        });
    }
};

// Delete Route
export const _deleteRoute = (routeId, toast) => async (dispatch) => {
    dispatch({ type: DELETE_ROUTE_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${base_url}/admin/routes/${routeId}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        dispatch({
            type: DELETE_ROUTE_SUCCESS,
            payload: routeId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Route deleted",
            life: 3000,
        });
    } catch (error) {
        dispatch({
            type: DELETE_ROUTE_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete route",
            life: 3000,
        });
    }
};