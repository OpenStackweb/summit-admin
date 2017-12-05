import { LOGOUT_USER , SET_LOGGED_USER, RECEIVE_USER_INFO} from '../actions/auth-actions';

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {

    if (action.type === SET_LOGGED_USER) {
        let {accessToken } = action.payload;
        return {...state, isLoggedUser:true, accessToken };
    }
    if(action.type === LOGOUT_USER){
         return DEFAULT_STATE
    }
    if(action.type === RECEIVE_USER_INFO){
        let { response } = action.payload;
        return {...state, member: response};
    }
    return state
}

export default loggedUserReducer