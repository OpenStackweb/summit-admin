import { SET_CURRENT_SUMMIT } from '../actions/actions';
import{ LOGOUT_USER } from '../actions/auth-actions';

const DEFAULT_STATE = {
    currentSummit: null
}

const currentSummitReducer = (state = DEFAULT_STATE, action) => {
    if(action.type === SET_CURRENT_SUMMIT){
        return {...state, currentSummit: action.payload};
    }
    if(action.type === LOGOUT_USER){
        return DEFAULT_STATE
    }
    return state
}

export default currentSummitReducer