import {
    LOGOUT_USER, SET_LOGGED_USER, RECEIVE_USER_INFO, START_SESSION_STATE_CHECK,
    END_SESSION_STATE_CHECK
} from '../actions/auth-actions';

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
    idToken: null,
    sessionState: null,
    backUrl : null,
    checkingSessionState: false,
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type) {
        case SET_LOGGED_USER: {
            let { accessToken, idToken, sessionState } = action.payload;
            window.accessToken = accessToken;
            window.idToken = idToken;
            window.sessionState = sessionState;
            return {...state, isLoggedUser:true, accessToken, idToken, sessionState, backUrl : null };
        }
        case LOGOUT_USER : {
            window.accessToken = null;
            window.idToken = null;
            window.sessionState = null;
            return {...DEFAULT_STATE, backUrl: payload.backUrl};
        }
        case RECEIVE_USER_INFO: {
            let { response } = action.payload;
            return {...state, member: response};
        }
        case START_SESSION_STATE_CHECK:{
            return {...state, checkingSessionState: true };
        }
        case END_SESSION_STATE_CHECK:{
            return {...state, checkingSessionState: false };
        }
        default:
            return state;
    }

}

export default loggedUserReducer
