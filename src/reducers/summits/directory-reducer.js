import { RECEIVE_SUMMITS, SUMMIT_ADDED, SUMMIT_DELETED } from '../../actions/summit-actions';
import{ LOGOUT_USER } from '../../actions/auth-actions';

const DEFAULT_STATE = {
    items: []
}

const directoryReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_SUMMITS: {
            return {...state, items: action.payload.response.data};
        }
        break;
        case SUMMIT_ADDED: {
            let { response } = payload;

            return {...state, items: [...state.items, response]};
        }
        break;
        case SUMMIT_DELETED: {
            let {summitId} = payload;
            let items = state.items.filter(s => s.id != summitId);

            return {...state, items: [...items]};
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