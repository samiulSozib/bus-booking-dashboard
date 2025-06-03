import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { base_url } from "./src/utils/const";


const getAuthToken=localStorage.getItem('token')||''
export const fetchCountries=createAsyncThunk(
    'countries/fetchCountries',
    async({searchTag="",page=1},{rejectWithValue})=>{
        try {
            const token=getAuthToken()
            const response=await axios.get(`${base_url}/admin/web/location/countries?search=${searchTag}&page=${page}`,{
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json'
                }
            })
            return response.data.data.items;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const addCountry=createAsyncThunk(
    'countries/addCountry',
    async(countryData,{rejectWithValue})=>{
        try {
            const token=getAuthToken()
            const formData=new FormData()
            formData.append('country_name',countryData.country_name)
            formData.append('country_code',formData.country_code)

            const response=await axios.post(`${base_url}/admin/web/location/countries`,formData,{
                headers:{
                    "Authorization":`Bearer ${token}`,
                    'Content-Type':'multipart/form-data'
                }
            })
            return response.data.data.country
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


const countrySlice=createSlice({
    name:'countries',
    initialState:{
        loading:false,
        countries:[],
        selectedCountry:null,
        error:null,
        pagination:{
            current_page:1,
            last_page:1,
            total:0
        }
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchCountries.pending,(state)=>{
                state.loading=true,
                error=null
            })
            .addCase(fetchCountries.fulfilled,(state,action)=>{
                state.loading=false,
                state.countries=action.payload
                state.error=null
            })
            .addCase(fetchCountries.rejected,(state,action)=>{
                state.loading=false,
                state.error=action.payload
            })
            .addCase(addCountry.fulfilled,(state,action)=>{
                state.countries.unshift(action.payload)
                state.pagination.total+=1
            })
    }
})

export default countrySlice.reducer