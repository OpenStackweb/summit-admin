import { SET_CURRENT_SUMMIT } from '../actions';

const initialState = {
    currentSummit: null
}

const currentSummitReducer = (state = initialState, action) => {
    if(action.type === SET_CURRENT_SUMMIT){
        return {...state, currentSummit: action.payload};
    }
    return state
}

export default currentSummitReducer