/**
 * Copyright 2021 OpenStack Foundation
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

import {
    RECEIVE_SCHEDULE_SETTINGS,
    SCHEDULE_SETTING_UPDATED,
    SCHEDULE_SETTING_ADDED,
    RECEIVE_SCHEDULE_EVENT_COLOR_ORIGIN,
    SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED
} from "../../actions/schedule-settings-actions";

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {RECEIVE_ALL_SUMMITS, SET_CURRENT_SUMMIT} from '../../actions/summit-actions';
const SCHEDULE_EVENT_COLOR_ORIGIN_KEY = 'SCHEDULE_EVENT_COLOR_ORIGIN';

const ENTRIES_MAPPING = {
    // DATE
    SCHEDULE_FILTER_BY_DATE_ENABLED: "SCHEDULE_FILTER_BY_DATE",
    SCHEDULE_FILTER_BY_DATE_LABEL: "SCHEDULE_FILTER_BY_DATE",
    // LEVEL
    SCHEDULE_FILTER_BY_LEVEL_ENABLED: "SCHEDULE_FILTER_BY_LEVEL",
    SCHEDULE_FILTER_BY_LEVEL_LABEL: "SCHEDULE_FILTER_BY_LEVEL",
    // TRACK
    SCHEDULE_FILTER_BY_TRACK_ENABLED: "SCHEDULE_FILTER_BY_TRACK",
    SCHEDULE_FILTER_BY_TRACK_LABEL: "SCHEDULE_FILTER_BY_TRACK",
    // SPEAKERS
    SCHEDULE_FILTER_BY_SPEAKERS_ENABLED: "SCHEDULE_FILTER_BY_SPEAKERS",
    SCHEDULE_FILTER_BY_SPEAKERS_LABEL: "SCHEDULE_FILTER_BY_SPEAKERS",
    // TAGS
    SCHEDULE_FILTER_BY_TAGS_ENABLED: "SCHEDULE_FILTER_BY_TAGS",
    SCHEDULE_FILTER_BY_TAGS_LABEL: "SCHEDULE_FILTER_BY_TAGS",
    // VENUES
    SCHEDULE_FILTER_BY_VENUES_ENABLED: "SCHEDULE_FILTER_BY_VENUES",
    SCHEDULE_FILTER_BY_VENUES_LABEL: "SCHEDULE_FILTER_BY_VENUES",
    // TRACK GROUPS
    SCHEDULE_FILTER_BY_TRACK_GROUPS_ENABLED: "SCHEDULE_FILTER_BY_TRACK_GROUPS",
    SCHEDULE_FILTER_BY_TRACK_GROUPS_LABEL: "SCHEDULE_FILTER_BY_TRACK_GROUPS",
    // EVENT TYPES
    SCHEDULE_FILTER_BY_EVENT_TYPES_ENABLED: "SCHEDULE_FILTER_BY_EVENT_TYPES",
    SCHEDULE_FILTER_BY_EVENT_TYPES_LABEL: "SCHEDULE_FILTER_BY_EVENT_TYPES",
};

const VALUE_KEY = 'value';
const CHECKED_KEY = 'checked';

const SCHEDULE_FILTER_BY_DATE_DEFAULT_VALUE = 'Date';
const SCHEDULE_FILTER_BY_LEVEL_DEFAULT_VALUE = 'Level';
const SCHEDULE_FILTER_BY_TRACK_DEFAULT_VALUE = 'Categories';
const SCHEDULE_FILTER_BY_SPEAKERS_DEFAULT_VALUE = 'Speakers';
const SCHEDULE_FILTER_BY_TAGS_DEFAULT_VALUE = 'Tags';
const SCHEDULE_FILTER_BY_VENUES_DEFAULT_VALUE = 'Venues';
const SCHEDULE_FILTER_BY_TRACK_GROUPS_DEFAULT_VALUE = 'Categories Groups';
const SCHEDULE_FILTER_BY_EVENT_TYPES_DEFAULT_VALUE = 'Activity Types';

const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_FILTERS = {
    SCHEDULE_FILTER_BY_DATE: {
        value: SCHEDULE_FILTER_BY_DATE_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_LEVEL: {
        value: SCHEDULE_FILTER_BY_LEVEL_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_TRACK: {
        value: SCHEDULE_FILTER_BY_TRACK_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_SPEAKERS: {
        value: SCHEDULE_FILTER_BY_SPEAKERS_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_TAGS: {
        value: SCHEDULE_FILTER_BY_TAGS_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_VENUES: {
        value: SCHEDULE_FILTER_BY_VENUES_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_TRACK_GROUPS: {
        value: SCHEDULE_FILTER_BY_TRACK_GROUPS_DEFAULT_VALUE,
        checked: false
    },
    SCHEDULE_FILTER_BY_EVENT_TYPES: {
        value: SCHEDULE_FILTER_BY_EVENT_TYPES_DEFAULT_VALUE,
        checked: false
    }
};

const DEFAULT_EVENT_COLOR_ORIGIN = {
    key: SCHEDULE_EVENT_COLOR_ORIGIN_KEY,
    value: null,
    id: 0,
};

const DEFAULT_STATE = {
    filters: deepClone(DEFAULT_FILTERS),
    errors: {},
    eventColorOrigins:[
        {label:SCHEDULE_FILTER_BY_EVENT_TYPES_DEFAULT_VALUE, value:'EVENT_TYPE'},
        {label:SCHEDULE_FILTER_BY_TRACK_DEFAULT_VALUE, value:'TRACK'},
        {label:SCHEDULE_FILTER_BY_TRACK_GROUPS_DEFAULT_VALUE, value:'TRACK_GROUP'},
    ],
    eventColorOrigin: deepClone(DEFAULT_EVENT_COLOR_ORIGIN),
};

const scheduleSettingsReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action
    switch (type) {
        case LOGOUT_USER:
        case SET_CURRENT_SUMMIT:
        {
            return {...state,  filters: deepClone(DEFAULT_FILTERS), errors: {}, eventColorOrigin: deepClone(DEFAULT_EVENT_COLOR_ORIGIN) };
        }
        case RECEIVE_SCHEDULE_EVENT_COLOR_ORIGIN: {
            let { data } = payload.response;
            let value = null;
            let id = 0;
            if(data.length > 0){
                value = data[0].value;
                id = data[0].id;
            }
            return {...state, eventColorOrigin: {...state.eventColorOrigin, value: value, id: id}};
        }
        case RECEIVE_SCHEDULE_SETTINGS: {
            let newFilters = deepClone(DEFAULT_FILTERS);
            // process received payload
            payload.response.data.forEach(entry => {
                let {key, value, id } = entry;
                // short-circuit if the received data does not belong to our expected filters
                if (!ENTRIES_MAPPING.hasOwnProperty(key))
                    return;
                let filterKey = ENTRIES_MAPPING[key];
                if (!newFilters.hasOwnProperty(filterKey))
                    newFilters[filterKey] = {
                        value: "",
                        checked: false
                    };
                // check the type of the setting ( label or flag )
                let subKey = key.endsWith("_ENABLED") ? CHECKED_KEY : VALUE_KEY;
                // if the setting is flag, convert to boolean
                if (subKey == CHECKED_KEY)
                    value = value == "1" ? true : false;
                // set new setting value and store the setting id so we could process it later
                newFilters[filterKey][subKey] = value;
                newFilters[filterKey][subKey+'_id'] = id;
            });

            return {...state, filters: {...newFilters}};
        }
        case SCHEDULE_SETTING_ADDED:
        case SCHEDULE_SETTING_UPDATED:{
            let entity = {...payload.response};
            let {value, id} = entity;
            let filterKey = ENTRIES_MAPPING[entity.key];
            let subKey = entity.key.endsWith("_ENABLED") ? CHECKED_KEY : VALUE_KEY;
            if (subKey == CHECKED_KEY)
                value = value == "1" ? true : false;

            let newFilters = {};

            newFilters[subKey] = value;
            newFilters[subKey+'_id'] = id;
            // @see https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns#updating-nested-objects
            return {...state, filters: { ... state.filters, [filterKey] : {
                        ...state.filters[filterKey], ...newFilters
                    }}};
        }
        case SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED:
        {
            let entity = {...payload.response};
            let {value, id} = entity;
            return {...state, eventColorOrigin: {...state.eventColorOrigin, value: value, id: id}};
        }
        default:
            return state;
    }
};

export default scheduleSettingsReducer;
