import{ LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import {
    RECEIVE_SELECTION_PLAN,
    RESET_SELECTION_PLAN_FORM,
    UPDATE_SELECTION_PLAN,
    SELECTION_PLAN_UPDATED,
    SELECTION_PLAN_ADDED,
    TRACK_GROUP_REMOVED,
    TRACK_GROUP_ADDED,
    EVENT_TYPE_ADDED,
    EVENT_TYPE_REMOVED,
    SELECTION_PLAN_EXTRA_QUESTION_ADDED,
    SELECTION_PLAN_EXTRA_QUESTION_DELETED,
    SELECTION_PLAN_EXTRA_QUESTION_UPDATED,
    SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED
} from '../../actions/selection-plan-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    submission_period_disclaimer: '',
    is_enabled: false,
    max_submission_allowed_per_user: 0,
    selection_begin_date: 0,
    selection_end_date: 0,
    submission_begin_date: 0,
    submission_end_date: 0,
    voting_begin_date: 0,
    voting_end_date: 0,
    track_groups: [],
    event_types: [],
    extra_questions:[],
    extraQuestionsOrder: 'order',
    extraQuestionsOrderDir : 1,
    allow_new_presentations: false,
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
            let trackGroups = state.entity.track_groups.filter(t => t.id !== trackGroupId);
            return {...state, entity: {...state.entity, track_groups: trackGroups} };
        }
        break;
        case TRACK_GROUP_ADDED: {
            let trackGroup = {...payload.trackGroup};
            return {...state, entity: {...state.entity, track_groups: [...state.entity.track_groups, trackGroup]} };
        }
        break;
        case EVENT_TYPE_REMOVED: {
            let {eventTypeId} = payload;
            let eventTypes = state.entity.event_types.filter(t => t.id !== eventTypeId);
            return {...state, entity: {...state.entity, event_types: eventTypes} };
        }
        break;
        case EVENT_TYPE_ADDED: {
            let eventType = {...payload.eventType};
            return {...state, entity: {...state.entity, event_types: [...state.entity.event_types, eventType]} };
        }
        break;
        case SELECTION_PLAN_EXTRA_QUESTION_ADDED:{
            let question = {...payload.response};
            return {...state, entity: {...state.entity, extra_questions:[...state.entity.extra_questions, question]}}
        }
        break
        case SELECTION_PLAN_EXTRA_QUESTION_DELETED:{
            let {questionId} = payload;
            return {...state, entity: {...state.entity, extra_questions:state.entity.extra_questions.filter(t => t.id !== questionId)}}
        }
        break
        case SELECTION_PLAN_EXTRA_QUESTION_UPDATED:
        {
            let question = {...payload.response};
            let extra_questions = state.entity.extra_questions.map((q) => {
                if (q.id !== question.id) {
                    return q
                }
                return {
                    ...q,
                    ...question
                }
            });
            return {...state, entity: {...state.entity, extra_questions : extra_questions}}
        }
        break;

        case SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED: {
            let extra_questions = payload.map(q => {
                return {
                    id: q.id,
                    name: q.name,
                    label: q.label,
                    type: q.type,
                    order: parseInt(q.order)
                };
            })

            return {...state, entity: {...state.entity, extra_questions : extra_questions}}
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }

}

export default selectionPlanReducer