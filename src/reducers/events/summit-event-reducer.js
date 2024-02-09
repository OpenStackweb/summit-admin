/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import
{
    RECEIVE_EVENT,
    RESET_EVENT_FORM,
    EVENT_UPDATED,
    EVENT_ADDED,
    EVENT_PUBLISHED,
    IMAGE_ATTACHED,
    IMAGE_DELETED,
    REQUEST_EVENT_FEEDBACK,
    RECEIVE_EVENT_FEEDBACK,
    EVENT_FEEDBACK_DELETED,
    REQUEST_EVENT_COMMENTS,
    RECEIVE_EVENT_COMMENTS,
    RECEIVE_ACTION_TYPES,
    FLAG_CHANGED,
} from '../../actions/event-actions';
import moment from 'moment-timezone';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import { UNPUBLISHED_EVENT } from '../../actions/summit-builder-actions';
import { EVENT_MATERIAL_ADDED, EVENT_MATERIAL_UPDATED, EVENT_MATERIAL_DELETED} from "../../actions/event-material-actions";
import { EVENT_COMMENT_DELETED } from "../../actions/event-comment-actions";
import {RECEIVE_QA_USERS_BY_SUMMIT_EVENT} from '../../actions/user-chat-roles-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    type_id: null,
    title: '',
    creator: null,
    description: '',
    social_description: '',
    attendees_expected_learnt: '',
    head_count: 0,
    rsvp_link: '',
    location_id: 0,
    start_date: '',
    end_date: '',
    duration: 0,
    level: 'N/A',
    allow_feedback: false,
    to_record: false,
    attending_media: false,
    tags: [],
    sponsors: [],
    speakers: [],
    moderator: null,
    discussion_leader: 0,
    groups: [],
    attachment: '',
    occupancy: 'EMPTY',
    materials: [],
    image: null,
    qa_users:[],
    extra_questions: [],
    disclaimer_accepted: false,
    disclaimer_accepted_date: null,
    created_by: null,
    custom_order: 0,
    actions: [],
    allowed_ticket_types: [],
}

const DEFAULT_STATE_FEEDBACK_STATE = {
    items          : [],
    term            : null,
    order           : 'created',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    total           : 0,
    summitTZ        : ''
};

const DEFAULT_STATE_COMMENT_STATE = {
    comments        : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalComments   : 0,
    filters         : { is_activity: null, is_public: null }
};

const DEFAULT_STATE = {
    levelOptions: ['N/A', 'Beginner', 'Intermediate', 'Advanced' ],
    entity: DEFAULT_ENTITY,
    errors: {},
    feedbackState: DEFAULT_STATE_FEEDBACK_STATE,
    commentState: DEFAULT_STATE_COMMENT_STATE,
    actionTypes: []
};

const normalizeEventResponse = (entity) => {
    const links = entity.slides || [];
    const videos = entity.videos || [];
    const slides = entity.links || [];
    let media_uploads = entity.media_uploads || [];

    for(var key in entity) {
        if(entity.hasOwnProperty(key)) {
            entity[key] = (entity[key] == null) ? '' : entity[key] ;
        }
    }

    if (!entity.rsvp_external) entity.rsvp_link = null;
    media_uploads = media_uploads.map((m) => (
        {...m,
            media_upload_type_id: m.media_upload_type.id
        }
    ));
    entity.materials = [...media_uploads, ...links, ...videos, ...slides];
    entity.type_id = entity.type ? entity.type.id : null;

    entity.materials = [...entity.materials.map((m) => (
        {
            ...m,
            display_on_site_label:m.display_on_site ? 'Yes' : 'No',
        }
    ))];
    entity.selection_plan_id = entity.selection_plan?.id || null;
    return entity;
}

const summitEventReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_FORM: {
            return DEFAULT_STATE;
        }
        break;;
        case EVENT_ADDED:
        case RECEIVE_EVENT: {
            const entity = normalizeEventResponse(payload.response);

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {} };
        }
        break;
        case EVENT_PUBLISHED: {
            return {...state, entity: {...state.entity, is_published: true}, errors: {} };
        }
        break;
        case UNPUBLISHED_EVENT: {
            return {...state, entity: {...state.entity, is_published: false}, errors: {} };
        }
        break;
        case EVENT_UPDATED: {
            const entity = normalizeEventResponse(payload.response);
            return {...state,  entity: entity, errors: {} };
        }
        break;
        case EVENT_MATERIAL_DELETED: {
            let eventMaterialId = payload.eventMaterialId;
            let materials = state.entity.materials.filter(m => m.id !== eventMaterialId);

            return {...state, entity: {...state.entity, materials: materials}, errors: {} };
        }
        break;
        case EVENT_MATERIAL_ADDED: {
            let newMaterial = {...payload.response};

            newMaterial.display_on_site_label = (newMaterial.display_on_site) ? 'Yes' : 'No';

            let materials = [...state.entity.materials, newMaterial];

            return {...state, entity: {...state.entity, materials: materials}, errors: {} };
        }
        break;
        case EVENT_MATERIAL_UPDATED: {
            let newMaterial = {...payload.response};
            let oldMaterials = state.entity.materials.filter(m => m.id !== newMaterial.id);

            newMaterial.display_on_site_label = (newMaterial.display_on_site) ? 'Yes' : 'No';

            let materials = [...oldMaterials, newMaterial];

            return {...state, entity: {...state.entity, materials: materials}, errors: {} };
        }
        break;
        case IMAGE_ATTACHED: {
            let image = {...payload.response};
            //let image = {...state.entity.image, url:  state.entity.image.url + '?' + new Date().getTime()};
            return {...state, entity: {...state.entity, image: image.url} };
        }
        break;
        case IMAGE_DELETED: {
            return {...state, entity: {...state.entity, image: null} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case RECEIVE_QA_USERS_BY_SUMMIT_EVENT:{
            let qaUsers = payload.response;
            return {...state, entity: {...state.entity, qa_users: qaUsers} }
        }
        break;
        case REQUEST_EVENT_FEEDBACK: {
            let {order, orderDir, term, summitTZ} = payload;
            return {...state, feedbackState: {...state.feedbackState, order, orderDir, term, summitTZ}};
        }
        case RECEIVE_EVENT_FEEDBACK: {
            let {current_page, total, last_page} = payload.response;

            let items = payload.response.data.map(e => {
                return {
                    ...e,
                    owner_full_name: `${e.owner.first_name} ${e.owner.last_name}`,
                    created : moment(e.created_date * 1000).tz(state.feedbackState.summitTZ).format('MMMM Do YYYY, h:mm a'),
                };
            });

            return {...state, feedbackState: {...state.feedbackState, items:items , currentPage: current_page, totalEvents: total, lastPage: last_page }};
        }
        case EVENT_FEEDBACK_DELETED:{
            let { feedbackId } = payload;
            return {...state, feedbackState: {...state.feedbackState, items: state.feedbackState.items.filter(e => e.id !== feedbackId)}};
        }
        case REQUEST_EVENT_COMMENTS: {
            let {order, orderDir, summitTZ} = payload;
            return {...state, commentState: {...state.commentState, order, orderDir, summitTZ }};
        }
        case RECEIVE_EVENT_COMMENTS: {
            let {current_page, total, last_page} = payload.response;

            let items = payload.response.data.map(e => {
                return {
                    ...e,
                    owner_full_name: `${e.creator.first_name} ${e.creator.last_name}`,
                    created : moment(e.created * 1000).tz(state.commentState.summitTZ).format('MMMM Do YYYY, h:mm a'),
                    last_edited : moment(e.last_edited * 1000).tz(state.commentState.summitTZ).format('MMMM Do YYYY, h:mm a'),
                    is_activity: e.is_activity === null ? 'N/A' : e.is_activity === true ? 'Yes' : 'No',
                    is_public: e.is_public === null ? 'N/A' : e.is_public === true ? 'Yes' : 'No',
                };
            });

            return {...state, commentState: {...state.commentState, comments:items , currentPage: current_page, totalComments: total, lastPage: last_page }};
        }
        case EVENT_COMMENT_DELETED: {
            let { commentId } = payload;
            return {...state, commentState: {...state.commentState, comments: state.commentState.comments.filter(e => e.id !== commentId)}};
        }
        case RECEIVE_ACTION_TYPES: {
            const {data} = payload.response;
            return {...state, actionTypes: data};
        }
        case FLAG_CHANGED: {
            const {entity} = state;
            const action = payload.response;

            // remove action if present
            const tmpActions = entity.actions.filter(ac => ac.type_id !== action.type_id);

            if (action.is_completed) {
                tmpActions.push(action);
            }

            return {...state, entity: {...entity, actions: tmpActions}};
        }
        default:
            return state;
    }
};

export default summitEventReducer;
