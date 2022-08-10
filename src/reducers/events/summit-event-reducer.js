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
    UPDATE_EVENT,
    EVENT_UPDATED,
    EVENT_ADDED,
    EVENT_PUBLISHED,
    IMAGE_ATTACHED,
    IMAGE_DELETED
} from '../../actions/event-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import { UNPUBLISHED_EVENT } from '../../actions/summit-builder-actions';
import { EVENT_MATERIAL_ADDED, EVENT_MATERIAL_UPDATED, EVENT_MATERIAL_DELETED} from "../../actions/event-material-actions";
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
}

const DEFAULT_STATE = {
    levelOptions: ['N/A', 'Beginner', 'Intermediate', 'Advanced' ],
    extraQuestions: [],
    entity: DEFAULT_ENTITY,
    errors: {}
};

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
        break;
        case UPDATE_EVENT: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case EVENT_ADDED:
        case RECEIVE_EVENT: {
            const entity = payload.response;
            const links = entity.slides || [];
            const videos = entity.videos || [];
            const slides = entity.links || [];
            const extraQuestionAnswers = entity.extra_questions || [];
            const extraQuestions = entity.hasOwnProperty("selection_plan") && entity.selection_plan.extra_questions ? entity.selection_plan.extra_questions : [];
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

            if (extraQuestionAnswers.length) {
                entity.extra_questions = extraQuestionAnswers.map
                (q => ({question_id: q.question_id, answer: q.value}))
            }
            entity.selection_plan_id = entity.selection_plan?.id || null;

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {}, extraQuestions };
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
            return state;
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
        default:
            return state;
    }
};

export default summitEventReducer;
