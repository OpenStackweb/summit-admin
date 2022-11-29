import{ VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import{ LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
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
    SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED,
    SELECTION_PLAN_RATING_TYPE_ADDED,
    SELECTION_PLAN_RATING_TYPE_REMOVED,
    SELECTION_PLAN_RATING_TYPE_UPDATED,
    SELECTION_PLAN_RATING_TYPE_ORDER_UPDATED,
    SELECTION_PLAN_ASSIGNED_EXTRA_QUESTION,
    RECEIVE_SELECTION_PLAN_PROGRESS_FLAGS,
    SELECTION_PLAN_ASSIGNED_PROGRESS_FLAG,
    SELECTION_PLAN_PROGRESS_FLAG_ORDER_UPDATED,
    SELECTION_PLAN_PROGRESS_FLAG_REMOVED,
    RECEIVE_ALLOWED_MEMBERS,
    ALLOWED_MEMBER_REMOVED,
    ALLOWED_MEMBER_ADDED,
} from '../../actions/selection-plan-actions';

export const DEFAULT_ALLOWED_QUESTIONS = [
  {label: 'What is expected to learn?', value: 'attendees_expected_learnt'},
  {label: 'Discuss with attending media?', value: 'attending_media'},
  {label: 'Social Summary', value: 'social_description'},
  {label: 'Level of difficulty', value: 'level'}
];

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
    submission_lock_down_presentation_status_date: 0,
    voting_begin_date: 0,
    voting_end_date: 0,
    track_groups: [],
    event_types: [],
    extra_questions:[],
    extraQuestionsOrder: 'order',
    extraQuestionsOrderDir : 1,
    allow_new_presentations: false,
    presentation_creator_notification_email_template: '',
    presentation_moderator_notification_email_template: '',
    presentation_speaker_notification_email_template: '',
    track_chair_rating_types: [],
    allowed_presentation_action_types: [],
    allowed_presentation_questions: DEFAULT_ALLOWED_QUESTIONS.map(q => q.value),
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    allowedMembers: {data: [], currentPage: 1, lastPage: 1},
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
        case SET_CURRENT_SUMMIT:
        case RESET_SELECTION_PLAN_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case UPDATE_SELECTION_PLAN: {
            return {...state,  entity: {...payload}, errors: {} };
        }
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
        case SELECTION_PLAN_UPDATED: {
            return state;
        }
        case RECEIVE_ALLOWED_MEMBERS: {
            const {data, current_page, last_page} = payload.response;
            const members = data.map(d => ({...d, name: `${d.first_name} ${d.last_name}`}));
            return {...state, allowedMembers: {data: members, currentPage: current_page, lastPage: last_page}};
        }
        case SELECTION_PLAN_ASSIGNED_EXTRA_QUESTION:{
            let question = {...payload.response};
            return {...state, entity: {...state.entity, extra_questions: [...state.entity.extra_questions, question]} };
        }
        case RECEIVE_SELECTION_PLAN_PROGRESS_FLAGS: {
            let progressFlags = payload.response.data.map(r => {
                return {
                    id: r.id,
                    label: r.label,
                    order: parseInt(r.order)
                };
            });
            return {...state, entity: {...state.entity, allowed_presentation_action_types: progressFlags}};
        }
        case SELECTION_PLAN_ASSIGNED_PROGRESS_FLAG: {
            let progressFlag = {...payload.response};
            return {...state, entity: {...state.entity, allowed_presentation_action_types: [...state.entity.allowed_presentation_action_types, progressFlag]} };
        }
        case SELECTION_PLAN_PROGRESS_FLAG_ORDER_UPDATED: {
            let progressFlags = payload.map(r => {
                return {
                    id: r.id,
                    label: r.label,
                    order: parseInt(r.order)
                };
            })
            return {...state, entity: {...state.entity, allowed_presentation_action_types : progressFlags}}
        }
        case SELECTION_PLAN_PROGRESS_FLAG_REMOVED: {
            let {progressFlagId} = payload;
            let allowedActionTypes = state.entity.allowed_presentation_action_types.filter(t => t.id !== progressFlagId);
            return {...state, entity: {...state.entity, allowed_presentation_action_types: allowedActionTypes} };
        }
        case TRACK_GROUP_REMOVED: {
            let {trackGroupId} = payload;
            let trackGroups = state.entity.track_groups.filter(t => t.id !== trackGroupId);
            return {...state, entity: {...state.entity, track_groups: trackGroups} };
        }
        case TRACK_GROUP_ADDED: {
            let trackGroup = {...payload.trackGroup};
            return {...state, entity: {...state.entity, track_groups: [...state.entity.track_groups, trackGroup]} };
        }
        case EVENT_TYPE_REMOVED: {
            let {eventTypeId} = payload;
            let eventTypes = state.entity.event_types.filter(t => t.id !== eventTypeId);
            return {...state, entity: {...state.entity, event_types: eventTypes} };
        }
        case EVENT_TYPE_ADDED: {
            let eventType = {...payload.eventType};
            return {...state, entity: {...state.entity, event_types: [...state.entity.event_types, eventType]} };
        }
        case SELECTION_PLAN_EXTRA_QUESTION_ADDED:{
            let question = {...payload.response};
            return {...state, entity: {...state.entity, extra_questions:[...state.entity.extra_questions, question]}}
        }
        case SELECTION_PLAN_EXTRA_QUESTION_DELETED:{
            let {questionId} = payload;
            return {...state, entity: {...state.entity, extra_questions:state.entity.extra_questions.filter(t => t.id !== questionId)}}
        }
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

        case SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED: {
            let extra_questions = payload.map((q, i) => {
                return {
                    id: q.id,
                    name: q.name,
                    label: q.label,
                    type: q.type,
                    order: i + 1
                };
            })

            return {...state, entity: {...state.entity, extra_questions : extra_questions}}
        }
        case SELECTION_PLAN_RATING_TYPE_REMOVED: {
            let {ratingTypeId} = payload;
            let ratingTypes = state.entity.track_chair_rating_types.filter(t => t.id !== ratingTypeId);
            return {...state, entity: {...state.entity, track_chair_rating_types: ratingTypes} };
        }
        case SELECTION_PLAN_RATING_TYPE_ADDED: {
            let ratingType = {...payload.response};
            return {...state, entity: {...state.entity, track_chair_rating_types: [...state.entity.track_chair_rating_types, ratingType]} };
        }
        case SELECTION_PLAN_RATING_TYPE_UPDATED: {
            let ratingType = {...payload.response};
            let ratingTypes = state.entity.track_chair_rating_types.filter(t => t.id !== ratingType.id);
            return {...state, entity: {...state.entity, track_chair_rating_types: [...ratingTypes, ratingType]} };
        }
        case SELECTION_PLAN_RATING_TYPE_ORDER_UPDATED: {
            let track_chair_rating_types = payload.map(r => {
                return {
                    id: r.id,
                    name: r.name,
                    weight: parseFloat(r.weight),
                    order: parseInt(r.order)
                };
            })
            return {...state, entity: {...state.entity, track_chair_rating_types : track_chair_rating_types}}
        }
        case ALLOWED_MEMBER_REMOVED: {
            let {memberId} = payload;
            let allowedMembers = state.allowedMembers.data.filter(t => t.id !== memberId);
            return {...state, allowedMembers: {...state.allowedMembers, data: allowedMembers} };
        }
        case ALLOWED_MEMBER_ADDED: {
            let member = {...payload.member, name: `${payload.member.first_name} ${payload.member.last_name}`};
            return {...state, allowedMembers: {...state.allowedMembers, data: [...state.allowedMembers.data, member]} };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }

}

export default selectionPlanReducer