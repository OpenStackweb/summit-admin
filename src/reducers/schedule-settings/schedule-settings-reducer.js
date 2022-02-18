/**
 * Copyright 2019 OpenStack Foundation
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
    RECEIVE_SCHEDULE_SETTINGS,
    RESET_SCHEDULE_SETTINGS_FORM,
    UPDATE_SCHEDULE_SETTINGS,
    SCHEDULE_SETTINGS_ADDED,
    FILTER_TYPES
} from '../../actions/schedule-settings-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_FILTERS = [
    { label:'Track', is_enabled: false, type: FILTER_TYPES.track },
    { label:'Date', is_enabled: false, type: FILTER_TYPES.date },
    { label:'Tags', is_enabled: false, type: FILTER_TYPES.tags },
    { label:'Track Groups', is_enabled: false, type: FILTER_TYPES.track_groups },
    { label:'Company', is_enabled: false, type: FILTER_TYPES.company },
    { label:'Level', is_enabled: false, type: FILTER_TYPES.level },
    { label:'Speakers', is_enabled: false, type: FILTER_TYPES.speakers },
    { label:'Venues', is_enabled: false, type: FILTER_TYPES.venues },
    { label:'Event Types', is_enabled: false, type: FILTER_TYPES.event_types },
    { label:'Title', is_enabled: false, type: FILTER_TYPES.title },
];

const DEFAULT_PRE_FILTERS = [
    { values: [], type: FILTER_TYPES.track },
    { values: [], type: FILTER_TYPES.tags },
    { values: [], type: FILTER_TYPES.track_groups },
    { values: [], type: FILTER_TYPES.company },
    { values: [], type: FILTER_TYPES.level },
    { values: [], type: FILTER_TYPES.speakers },
    { values: [], type: FILTER_TYPES.venues },
    { values: [], type: FILTER_TYPES.event_types },
];

export const DEFAULT_ENTITY = {
    id: 0,
    key: '',
    is_default: false,
    is_enabled: true,
    is_my_schedule: false,
    only_events_with_attendee_access: false,
    color_source: 'TRACK',
    filters: DEFAULT_FILTERS,
    pre_filters: DEFAULT_PRE_FILTERS,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const scheduleSettingsReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SCHEDULE_SETTINGS_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case UPDATE_SCHEDULE_SETTINGS: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        case SCHEDULE_SETTINGS_ADDED:
        case RECEIVE_SCHEDULE_SETTINGS: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }
};

export default scheduleSettingsReducer;
