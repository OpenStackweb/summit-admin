import { LOADING, STOP_LOADING, RECEIVE_SUMMITS } from '../actions';

const initialState = {
    loading: false,
    items: []
}

const baseReducer = (state = initialState, action) => {
    if(action.type === LOADING){
        return {...state, loading: true };
    }
    if(action.type === STOP_LOADING){
        return {...state, loading: false };
    }
    if(action.type === RECEIVE_SUMMITS){
        return {...state, items: action.payload.response, loading: false };
    }
    return state
}

export default baseReducer