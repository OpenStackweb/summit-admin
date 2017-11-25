import { LOADING, STOP_LOADING, REQUEST_USER_INFO, RECEIVE_USER_INFO, RECEIVE_SUMMITS } from '../actions';

const initialState = {
    loading: false,
    items: []
}

const baseReducer = (state = initialState, action) => {
    if(action.type === LOADING || action.type === REQUEST_USER_INFO ){
        return {...state, loading: true };
    }
    if(action.type === STOP_LOADING || action.type === RECEIVE_USER_INFO ){
        return {...state, loading: false };
    }
    if(action.type === RECEIVE_SUMMITS){
        return {...state, items: action.payload.response, loading: false };
    }
    return state
}

export default baseReducer