const initialAuthState={
    loading:false,
    isAuthenticated:!!localStorage.getItem("token"),
    profile:JSON.parse(localStorage.getItem("profile"))||null,
    error:"",
    signUpSuccess:false,
    token:localStorage.getItem("token")||""
}

const authReducer=(state=initialAuthState,action)=>{
    switch(action.type){
        
        case "SIGN_IN_REQUEST":
            return {...state,loading:true}

        case "SIGN_IN_SUCCESS":
            localStorage.setItem("profile",JSON.stringify(action.payload.profile))
            localStorage.setItem("token",action.payload.token)
            return{
                ...state,
                loading:false,
                isAuthenticated:true,
                profile:action.payload.profile,
                token:action.payload.token,
                error:''
            }

        case "SIGN_IN_FAIL":
            return {
                ...state,
                loading:false,
                isAuthenticated:false,
                profile:null,
                error:action.payload
            }
        case "LOGOUT":
            return{
                ...state,
                isAuthenticated:false,
                profile:null,
                token:''
            }
        default:
            return state
    }
}

export default authReducer;