import { LOADING, REQUEST_USER_INFO, RECEIVE_USER_INFO, RECEIVE_SUMMITS } from '../actions';
import { STOP_LOADING  } from "openstack-uicore-foundation";

const initialState = {
    loading: false,
}

const baseReducer = (state = initialState, action) => {
    switch(action.type){
        case LOADING:
        case REQUEST_USER_INFO:
            return {...state, loading: true };
            break;
        case STOP_LOADING:
        case RECEIVE_USER_INFO:
        case RECEIVE_SUMMITS:
            return {...state, loading: false };
            break;
        default:
            return state;
          break;
    }
}

export default baseReducer