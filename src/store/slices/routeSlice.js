// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { base_url } from "../../utils/const";
// import { userType } from '../../utils/utils';

// // Helper function to get token
// const getAuthToken = () => {
//     return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
// };

// // export function user_type(){
// //     // return JSON.parse(localStorage.getItem("profile")||"{}");
// //     const profile = localStorage.getItem("profile");
// //     return profile ? JSON.parse(profile) : null;
// //   }

// // Fetch Routes
// export const fetchRoutes = createAsyncThunk(
//     'routes/fetchRoutes',
//     async ({ searchTag = "", page = 1, filters = {} }, { rejectWithValue }) => {
//       const type = userType();
//       const token = getAuthToken();
  
//       // Convert filters to query string
//       const filterQuery = Object.entries(filters)
//         .filter(([_, value]) => value !== null && value !== undefined && value !== "")
//         .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
//         .join('&');
        
//         //console.log(filterQuery)
//       // Build full URL
//       const url = `${base_url}/${type.role}/routes/list?search=${searchTag}&page=${page}${filterQuery ? `&${filterQuery}` : ''}`;
  
//       try {
//         const response = await axios.get(url, {
//           headers: {
//             Authorization: `${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         //console.log(response)
//         return {
//           items: response.data.body.items,
//           pagination: response.data.body.data,
//         };
//       } catch (error) {
//         //console.log(error)
//         return rejectWithValue(error.message);
//       }
//     }
//   );
  

// // Show Route
// export const showRoute = createAsyncThunk(
//     'routes/showRoute',
//     async (routeId, { rejectWithValue }) => {
//         const token = getAuthToken();
//         try {
//             const response = await axios.get(`${base_url}/admin/routes/${routeId}/show`, {
//                 headers: {
//                     Authorization: `${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });
//             return response.data.body.item;
//         } catch (error) {
//             return rejectWithValue(error?.response?.statusText);
//         }
//     }
// );

// // Add Route
// export const addRoute = createAsyncThunk(
//     'routes/addRoute',
//     async (formData, { rejectWithValue }) => {
//         const token = getAuthToken();
//         const _formData = new FormData();
//         _formData.append("name",formData.name)
//         _formData.append("origin_city_id",formData.origin.cityId)
//         _formData.append("destination_city_id",formData.destination.cityId),
//         _formData.append("origin_station_id",formData.origin.stationId)
//         _formData.append("destination_station_id",formData.destination.stationId)
//         _formData.append("distance",formData.distance)

//         try {
//             const response = await axios.post(`${base_url}/admin/routes`, _formData, {
//                 headers: {
//                     Authorization: `${token}`,
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });
//             //console.log(response)
//             return response.data.body.item
            
//         } catch (error) {
//             //console.log(error)
//             return rejectWithValue(error?.response?.statusText);
//         }
//     }
// );

// // Edit Route
// export const editRoute = createAsyncThunk(
//     'routes/editRoute',
//     async ({ id, formData }, { rejectWithValue }) => {
//         const token = getAuthToken();

//         const _formData = new FormData();
//         _formData.append("id",id)
//         _formData.append("name",formData.name)
//         _formData.append("origin_city_id",formData.origin.cityId)
//         _formData.append("destination_city_id",formData.destination.cityId),
//         _formData.append("origin_station_id",formData.origin.stationId)
//         _formData.append("destination_station_id",formData.destination.stationId)
//         _formData.append("distance",formData.distance)

//         try {
//             const response = await axios.post(`${base_url}/admin/routes/update`, _formData, {
//                 headers: {
//                     Authorization: `${token}`,
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });
//             //console.log(response)
//             // return {
//             //     id: response.data.body.item.id,
//             //     name: response.data.body.item.name.en,
//             //     code: response.data.body.item.code,
//             // };
//             return response.data.body.item
//         } catch (error) {
//             //console.log(error)
//             return rejectWithValue(error?.response?.statusText);
//         }
//     }
// );

// // Delete Route
// export const deleteRoute = createAsyncThunk(
//     'routes/deleteRoute',
//     async (routeId, { rejectWithValue }) => {
//         const token = getAuthToken();
//         try {
//             await axios.delete(`${base_url}/admin/routes/${routeId}`, {
//                 headers: {
//                     Authorization: `${token}`,
//                 },
//             });
//             return routeId;
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// const routesSlice = createSlice({
//     name: 'routes',
//     initialState: {
//         loading: false,
//         routes: [],
//         selectedRoute: null,
//         error: null,
//         pagination: {
//             current_page: 1,
//             last_page: 1,
//             total: 0
//         }
//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         // Fetch Routes
//         builder.addCase(fetchRoutes.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//         });
//         builder.addCase(fetchRoutes.fulfilled, (state, action) => {
//             state.loading = false;
//             state.routes = action.payload.items;
//             state.pagination=action.payload.pagination
//             state.error = null;
//         });
//         builder.addCase(fetchRoutes.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload;
//         });

//         // Show Route
//         builder.addCase(showRoute.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//         });
//         builder.addCase(showRoute.fulfilled, (state, action) => {
//             state.loading = false;
//             state.selectedRoute = action.payload;
//             state.error = null;
//         });
//         builder.addCase(showRoute.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload;
//         });

//         // Add Route
//         builder.addCase(addRoute.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//         });
//         builder.addCase(addRoute.fulfilled, (state, action) => {
//             state.loading = false;
//             state.routes.push(action.payload);
//             state.error = null;
//             state.pagination.total += 1;
//         });
//         builder.addCase(addRoute.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload;
//         });

//         // Edit Route
//         builder.addCase(editRoute.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//         });
//         builder.addCase(editRoute.fulfilled, (state, action) => {
//             state.loading = false;
//             state.routes = state.routes.map((route) =>
//                 route.id === action.payload.id ? action.payload : route
//             );
//             state.error = null;
//         });
//         builder.addCase(editRoute.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload;
//         });

//         // Delete Route
//         builder.addCase(deleteRoute.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//         });
//         builder.addCase(deleteRoute.fulfilled, (state, action) => {
//             state.loading = false;
//             state.routes = state.routes.filter((route) => route.id !== action.payload);
//             state.error = null;
//         });
//         builder.addCase(deleteRoute.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload;
//         });
//     },
// });

// export default routesSlice.reducer;


// 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../../utils/const";
import { userType } from '../../utils/utils';

// Helper function to get token
const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Get the token or return an empty string if not found
};

// export function user_type(){
//     // return JSON.parse(localStorage.getItem("profile")||"{}");
//     const profile = localStorage.getItem("profile");
//     return profile ? JSON.parse(profile) : null;
//   }

// Fetch Routes
export const fetchRoutes = createAsyncThunk(
    'routes/fetchRoutes',
    async ({ searchTag = "", page = 1, filters = {} }, { rejectWithValue }) => {
      const type = userType();
      const token = getAuthToken();
  
      // Convert filters to query string
      const filterQuery = Object.entries(filters)
        .filter(([_, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        
        //console.log(filterQuery)
      // Build full URL
      const url = `${base_url}/${type.role}/routes/list?search=${searchTag}&page=${page}${filterQuery ? `&${filterQuery}` : ''}`;
  
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        });
        //console.log(response)
        return {
          items: response.data.body.items,
          pagination: response.data.body.data,
        };
      } catch (error) {
        //console.log(error)
        return rejectWithValue(error.message);
      }
    }
  );
  

// Show Route
export const showRoute = createAsyncThunk(
    'routes/showRoute',
    async (routeId, { rejectWithValue }) => {
        const token = getAuthToken();
        try {
            const response = await axios.get(`${base_url}/admin/routes/${routeId}/show`, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.body.item;
        } catch (error) {
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Add Route
export const addRoute = createAsyncThunk(
    'routes/addRoute',
    async (formData, { rejectWithValue }) => {
        const token = getAuthToken();
        const _formData = new FormData();
        _formData.append("name",formData.name)
        _formData.append("origin_city_id",formData.origin.cityId)
        _formData.append("destination_city_id",formData.destination.cityId),
        _formData.append("origin_station_id",formData.origin.stationId)
        _formData.append("destination_station_id",formData.destination.stationId)
        _formData.append("distance",formData.distance)

        try {
            const response = await axios.post(`${base_url}/admin/routes`, _formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            //console.log(response)
            return response.data.body.item
            
        } catch (error) {
            //console.log(error)
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Edit Route
export const editRoute = createAsyncThunk(
    'routes/editRoute',
    async ({ id, formData }, { rejectWithValue }) => {
        const token = getAuthToken();

        const _formData = new FormData();
        _formData.append("id",id)
        _formData.append("name",formData.name)
        _formData.append("origin_city_id",formData.origin.cityId)
        _formData.append("destination_city_id",formData.destination.cityId),
        _formData.append("origin_station_id",formData.origin.stationId)
        _formData.append("destination_station_id",formData.destination.stationId)
        _formData.append("distance",formData.distance)

        try {
            const response = await axios.post(`${base_url}/admin/routes/update`, _formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            //console.log(response)
            // return {
            //     id: response.data.body.item.id,
            //     name: response.data.body.item.name.en,
            //     code: response.data.body.item.code,
            // };
            return response.data.body.item
        } catch (error) {
            //console.log(error)
            return rejectWithValue(error?.response?.statusText);
        }
    }
);

// Delete Route
export const deleteRoute = createAsyncThunk(
    'routes/deleteRoute',
    async (routeId, { rejectWithValue }) => {
        const token = getAuthToken();
        try {
            await axios.delete(`${base_url}/admin/routes/${routeId}`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            return routeId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const routesSlice = createSlice({
    name: 'routes',
    initialState: {
        loading: false,
        routes: [],
        selectedRoute: null,
        error: null,
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Routes
        builder.addCase(fetchRoutes.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRoutes.fulfilled, (state, action) => {
            state.loading = false;
            state.routes = action.payload.items;
            state.pagination=action.payload.pagination
            state.error = null;
        });
        builder.addCase(fetchRoutes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Show Route
        builder.addCase(showRoute.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(showRoute.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedRoute = action.payload;
            state.error = null;
        });
        builder.addCase(showRoute.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Add Route
        builder.addCase(addRoute.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addRoute.fulfilled, (state, action) => {
            state.loading = false;
            state.routes.push(action.payload);
            state.error = null;
            state.pagination.total += 1;
        });
        builder.addCase(addRoute.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Edit Route
        builder.addCase(editRoute.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(editRoute.fulfilled, (state, action) => {
            state.loading = false;
            state.routes = state.routes.map((route) =>
                route.id === action.payload.id ? action.payload : route
            );
            state.error = null;
        });
        builder.addCase(editRoute.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Delete Route
        builder.addCase(deleteRoute.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteRoute.fulfilled, (state, action) => {
            state.loading = false;
            state.routes = state.routes.filter((route) => route.id !== action.payload);
            state.error = null;
        });
        builder.addCase(deleteRoute.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default routesSlice.reducer;
