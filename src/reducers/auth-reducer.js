import { LOGOUT_USER , SET_LOGGED_USER, RECEIVE_USER_INFO} from '../actions/auth-actions';

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
    idToken: null,
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type) {
        case SET_LOGGED_USER: {
            let { accessToken, idToken } = action.payload;
            window.accessToken = accessToken;
            window.idToken = idToken;
            return {...state, isLoggedUser:true, accessToken, idToken };
        }
        case LOGOUT_USER : {
            window.accessToken = null;
            window.idToken = null;
            return DEFAULT_STATE
        }
        case RECEIVE_USER_INFO: {
            let { response } = action.payload;
            return {...state, member: response};
        }
        default:
            return state;
    }

}

export default loggedUserReducer
