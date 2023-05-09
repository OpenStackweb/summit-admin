/**
 * Copyright 2022 OpenStack Foundation
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

import { SET_CURRENT_SUMMIT } from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {epochToMomentTimeZone} from "openstack-uicore-foundation/lib/utils/methods";
import {
    RECEIVE_SIGNAGE_EVENTS,
    REQUEST_SIGNAGE_EVENTS,
    REQUEST_SIGNAGE_BANNERS,
    RECEIVE_SIGNAGE_BANNERS,
    RECEIVE_SIGNAGE_LOCATIONS,
    RECEIVE_SIGNAGE_TEMPLATES,
    RECEIVE_SIGN,
    SIGN_UPDATED,
    SIGN_ADDED,
    SIGNAGE_BANNER_ADDED,
    SIGNAGE_BANNER_UPDATED,
    SIGNAGE_BANNER_DELETED,
    SIGNAGE_STATIC_BANNER_UPDATED
} from "../../actions/signage-actions";

const DEFAULT_STATE = {
    sign: null,
    events: [],
    banners: [],
    staticBanner: {content: ''},
    locations: [],
    locationId: null,
    term: '',
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    order: 'start_date',
    orderDir: 1,
    totalEntries: 0,
    summitTz: ''
};

const signageReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case RECEIVE_SIGN: {
            const { data } = payload.response;
            const sign = data.length > 0 ? data[0] : null;
            return {...state, sign: sign}
        }
        case SIGN_ADDED:
        case SIGN_UPDATED: {
            const sign = payload.response;
            return {...state, sign}
        }
        case REQUEST_SIGNAGE_EVENTS: {
            const {order, orderDir, term, locationId, summitTz} = payload;
            return {...state, order, orderDir, term, locationId, summitTz}
        }
        case RECEIVE_SIGNAGE_EVENTS: {
            const { current_page, total, last_page, data, summit_tz } = payload.response;
            const events = data.map(ev => {
                const start_date_str = epochToMomentTimeZone(ev.start_date, state.summitTz).format('M/D h:mm a');
                const end_date_str = epochToMomentTimeZone(ev.end_date, state.summitTz).format('M/D h:mm a');
                
                return ({
                    id: ev.id,
                    title: ev.title,
                    speakers_str: ev.speakers.map(sp => `${sp.first_name} ${sp.last_name}`).join(', '),
                    floor_loc: ev.location.floor ? `${ev.location.floor?.name} / ${ev.location.name}` : ev.location.name,
                    start_date_str,
                    end_date_str,
                    start_date: ev.start_date,
                    end_date: ev.end_date,
                })
            });
            return {...state, events, totalEntries: total, currentPage: current_page, lastPage: last_page };
        }
        case REQUEST_SIGNAGE_BANNERS: {
            const {order, orderDir, term, locationId, summitTz} = payload;
            return {...state, order, orderDir, term, locationId, summitTz}
        }
        case RECEIVE_SIGNAGE_BANNERS: {
            const { current_page, total, last_page, data } = payload.response;
            const staticBanner = data.find(ban => ban.class_name === 'SummitLocationBanner') || {content: ''};
            const rawBanners = data.filter(ban => ban.class_name === 'ScheduledSummitLocationBanner');
            const banners = rawBanners.map(ban => mapBanner(ban,state.summitTz));
            
            return {...state, banners, staticBanner, totalEntries: rawBanners.length, currentPage: current_page, lastPage: last_page };
        }
        case RECEIVE_SIGNAGE_LOCATIONS: {
            const { data } = payload.response;
            return {...state, locations: data };
        }
        case RECEIVE_SIGNAGE_TEMPLATES: {
            const { templates } = payload;
            return {...state, templates };
        }
        case SIGNAGE_BANNER_ADDED: {
            const { response } = payload;
            const newBanner = mapBanner(response, state.summitTz);
            return {...state, banners: [...state.banners, newBanner]};
        }
        case SIGNAGE_BANNER_UPDATED: {
            const { response } = payload;
            const newBanners = state.banners.map(ban => {
                if (ban.id === response.id) {
                    return mapBanner(response, state.summitTz);
                }
                return ban;
            });
            return {...state, banners: newBanners};
        }
        case SIGNAGE_BANNER_DELETED: {
            const {bannerId} = payload;
            return {...state, banners: state.banners.filter(ban => ban.id !== bannerId)};
        }
        case SIGNAGE_STATIC_BANNER_UPDATED: {
            const staticBanner = payload.response;
            return {...state, staticBanner};
        }
        default:
            return state;
    }
};

const mapBanner = (ban, summitTz) => {
    const start_date_str = epochToMomentTimeZone(ban.start_date, summitTz).format('M/D h:mm a');
    const end_date_str = epochToMomentTimeZone(ban.end_date, summitTz).format('M/D h:mm a');
    
    return ({
        id: ban.id,
        class_name: ban.class_name,
        title: ban.title,
        content: ban.content,
        type: ban.type,
        floor_loc: ban.location.floor ? `${ban.location.floor?.name} / ${ban.location.name}` : ban.location.name,
        start_date: ban.start_date,
        end_date: ban.end_date,
        start_date_str,
        end_date_str
    })
}

export default signageReducer;
