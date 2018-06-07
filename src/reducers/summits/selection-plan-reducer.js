import{ LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import {
    RECEIVE_SELECTION_PLAN,
    RESET_SELECTION_PLAN_FORM,
    UPDATE_SELECTION_PLAN,
    SELECTION_PLAN_UPDATED,
    SELECTION_PLAN_ADDED,
    TRACK_GROUP_REMOVED,
    TRACK_GROUP_ADDED
} from '../../actions/selection-plan-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    is_enabled: false,
    selection_begin_date: 0,
    selection_end_date: 0,
    submission_begin_date: 0,
    submission_end_date: 0,
    voting_begin_date: 0,
    voting_end_date: 0,
    track_groups: []
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
}

const selectionPlanReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_SELECTION_PLAN_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_SELECTION_PLAN: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case SELECTION_PLAN_ADDED:
        case RECEIVE_SELECTION_PLAN: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case SELECTION_PLAN_UPDATED: {
            return state;
        }
        break;
        case TRACK_GROUP_REMOVED: {
            let {trackGroupId} = payload;
            let trackGroups = state.entity.track_groups.filter(t => t.id != trackGroupId);
            return {...state, entity: {...state.entity, track_groups: trackGroups} };
        }
        break;
        case TRACK_GROUP_ADDED: {
            let trackGroup = {...payload.trackGroup};
            return {...state, entity: {...state.entity, track_groups: [...state.entity.track_groups, trackGroup]} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }

}

export default selectionPlanReducer