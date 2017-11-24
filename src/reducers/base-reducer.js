import { REQUEST_USER_INFO, RECEIVE_USER_INFO} from '../actions';
import { STOP_LOADING } from "openstack-uicore-foundation";
const initialState = {
   loading: false
}

const baseReducer = (state = initialState, action) => {
    if (action.type === REQUEST_USER_INFO) {
        return {...state, loading:true };
    }
    if(action.type === RECEIVE_USER_INFO){
        return {...state, loading: false };
    }
    if(action.type === STOP_LOADING){
        return {...state, loading: false };
    }
    return state
}

export default baseReducer