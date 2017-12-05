import { RECEIVE_SUMMITS } from '../actions/actions';
import{ LOGOUT_USER } from '../actions/auth-actions';

const DEFAULT_STATE = {
    items: []
}

const directoryReducer = (state = DEFAULT_STATE, action) => {
    if(action.type === RECEIVE_SUMMITS){
        return {...state, items: action.payload.response.data};
    }
    if(action.type === LOGOUT_USER){
        return DEFAULT_STATE
    }
    return state
}

export default directoryReducer