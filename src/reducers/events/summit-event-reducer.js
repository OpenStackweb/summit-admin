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
    EVENT_PUBLISHED
} from '../../actions/event-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import { UNPUBLISHED_EVENT } from '../../actions/summit-builder-actions';
import { EVENT_MATERIAL_ADDED, EVENT_MATERIAL_UPDATED, EVENT_MATERIAL_DELETED} from "../../actions/event-material-actions";

export const DEFAULT_ENTITY = {
    id: 0,
    title: '',
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
    materials: []
}

const DEFAULT_STATE = {
    levelOptions: ['N/A', 'Beginner', 'Intermediate', 'Advanced' ],
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
            let entity = payload.response;
            let links = [];
            let videos = [];
            let slides = [];

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (!entity.rsvp_external) entity.rsvp_link = null;

            if (entity.links) {
                links = entity.links.map(l => ({...l, name: l.name ? l.name : l.link, display_on_site_label: l.display_on_site ? 'Yes' : 'No'}));
            }
            if (entity.videos) {
                videos = entity.videos.map(v => ({...v, display_on_site_label: v.display_on_site ? 'Yes' : 'No'}));
            }
            if (entity.slides) {
                slides = entity.slides.map(s => ({...s, display_on_site_label: s.display_on_site ? 'Yes' : 'No'}));
            }

            entity.materials = [...links, ...videos, ...slides];

            return {...state, entity: {...state.entity, ...entity}, errors: {} };
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
            let materials = state.entity.materials.filter(m => m.id != eventMaterialId);

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
            let oldMaterials = state.entity.materials.filter(m => m.id != newMaterial.id);
            let materials = [...oldMaterials, newMaterial];

            return {...state, entity: {...state.entity, materials: materials}, errors: {} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default summitEventReducer;
