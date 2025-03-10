import {combineReducers} from 'redux'
import authReducer from './authReducer'
import { countriesReducer } from './countriesReducer'
import { provinceReducer } from './provinceReducer'
import { cityReducer } from './cityReducer'



const rootReducer=combineReducers({
    auth:authReducer,
    countriesReducer:countriesReducer,
    provinceReducer:provinceReducer,
    cityReducer:cityReducer
})

export default rootReducer