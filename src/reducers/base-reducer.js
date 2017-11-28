import { START_LOADING, STOP_LOADING  } from "openstack-uicore-foundation";

const DEFAULT_STATE = {
    loading: false,
}

const baseReducer = (state = DEFAULT_STATE, action) => {
    switch(action.type){
        case START_LOADING:
            return {...state, loading: true };
            break;
        case STOP_LOADING:
            return {...state, loading: false };
            break;
        default:
            return state;
          break;
    }
}

export default baseReducer