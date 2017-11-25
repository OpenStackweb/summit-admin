import { RECEIVE_SUMMITS } from '../actions';

const initialState = {
    items: []
}

const directoryReducer = (state = initialState, action) => {
    if(action.type === RECEIVE_SUMMITS){
        return {...state, items: action.payload.response.data};
    }
    return state
}

export default directoryReducer