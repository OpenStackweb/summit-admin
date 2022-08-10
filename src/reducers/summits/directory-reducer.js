import {RECEIVE_ALL_SUMMITS, RECEIVE_SUMMITS, SUMMIT_ADDED, SUMMIT_DELETED} from '../../actions/summit-actions';
import{ LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    summits      : [],
    allSummits      : [],
    currentPage  : 1,
    lastPage     : 1,
    perPage      : 10,
    totalSummits : 1
};

const directoryReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_SUMMITS: {
            let { current_page, total, last_page, data } = payload.response;
            return {...state, summits: data, currentPage: current_page, lastPage: last_page, totalSummits: total};
        }
        break;
        case RECEIVE_ALL_SUMMITS: {
            let { data } = payload.response;
            return {...state, allSummits: data};
        }
        break;
        case SUMMIT_ADDED: {
            let { response } = payload;

            return {...state, summits: [...state.summits, response]};
        }
        break;
        case SUMMIT_DELETED: {
            let {summitId} = payload;
            let summits = state.summits.filter(s => s.id !== summitId);

            return {...state, summits: [...summits]};
        }
        break;
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        default:
            return state;
    }
}

export default directoryReducer
