import { LOGOUT_USER , SET_LOGGED_USER, RECEIVE_USER_INFO} from '../actions';

const initialState = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
}

const loggedUserReducer = (state = initialState, action) => {

    if (action.type === SET_LOGGED_USER) {
        let {accessToken } = action.payload;
        console.log(`got access token ${accessToken}`);
        return {...state, isLoggedUser:true, accessToken };
    }
    if(action.type === LOGOUT_USER){
        console.log('log out ...');
        return {...state, isLoggedUser:false, accessToken: null };
    }
    if(action.type === RECEIVE_USER_INFO){
        let { response } = action.payload;
        return {...state, member: response};
    }
    return state
}

export default loggedUserReducer