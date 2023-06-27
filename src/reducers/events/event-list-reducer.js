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

import moment from 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

import
{
    RECEIVE_EVENTS,
    REQUEST_EVENTS,
    EVENT_DELETED,
    CHANGE_SEARCH_TERM
} from '../../actions/event-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    events          : {},
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalEvents     : 0,
    summitTZ        : '',
    filters         : {},
    extraColumns    : []
};

const formatDuration = (duration) => {
    let d = moment.duration(duration, 'seconds');
    return d.format('mm:ss') !== '00' ? d.format('mm:ss') : 'TBD';
}

const eventListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_EVENTS: {
            let {order, orderDir, term, summitTZ, filters, extraColumns} = payload;

            return {...state, order, orderDir, term, summitTZ, filters, extraColumns}
        }
        case RECEIVE_EVENTS: {
            let {current_page, total, last_page} = payload.response;
            let events = payload.response.data.map(e => {
                let published_date = (e.is_published ? moment(e.published_date * 1000).tz(state.summitTZ).format('MMMM Do YYYY, h:mm a') : 'No');
                
                let speakers_companies = e.speakers && e.speakers.length > 0 ? e.speakers.map(e => e.company) : [];                
                speakers_companies = speakers_companies.length > 0 ? speakers_companies.filter((item,index) => item !== '' && speakers_companies.indexOf(item) === index) : []; 

                const event_type_capacity = [];

                if (e.type.allows_location) event_type_capacity.push('Allows Location');
                if (e.type.allows_attendee_vote) event_type_capacity.push('Allows Attendee Vote');
                if (e.type.allows_publishing_dates) event_type_capacity.push('Allows Publishing Dates');

                return {
                    id: e.id,
                    event_type: e.type.name,
                    title: e.title,
                    status: e.status ?? 'Not Submitted',
                    selection_status: e.selection_status === 'unaccepted' && e.is_published === true ? 'accepted' : e.selection_status,
                    published_date: published_date,
                    created_by_fullname: e.hasOwnProperty('created_by') ? `${e.created_by.first_name} ${e.created_by.last_name} (${e.created_by.email})`:'TBD',
                    submitter_company: e.hasOwnProperty('created_by') ? e.created_by.company : 'N/A',
                    speakers: (e.speakers) ? e.speakers.map(s => s.first_name + ' ' + s.last_name).join(', ') : 'N/A',
                    speaker_company: (speakers_companies.length > 0) ? speakers_companies.reduce((accumulator, company) => accumulator + (accumulator !== '' ? ', ' : '') + company, '') : 'N/A',
                    duration: e.type.allows_publishing_dates ?
                        formatDuration(e.duration) : 'N/A',
                    speakers_count: e.type.use_speakers ? (e.speakers && e.speakers.length > 0) ? e.speakers.length : '0' : 'N/A',
                    event_type_capacity: event_type_capacity.reduce((accumulator, capacity) => accumulator + (accumulator !== '' ? ', ' : '') + capacity, ''),
                    track: e?.track?.name ? e?.track?.name : 'TBD',
                    level: e.level ? e.level : 'N/A',
                    tags: e.tags && e.tags.length > 0 ? e.tags.reduce((accumulator, t) => accumulator + (accumulator !== '' ? ', ' : '') + t.tag, '') : 'N/A',
                    selection_plan: e.selection_plan?.name ? e.selection_plan?.name : 'N/A',
                    location: e.location?.name ? e.location?.name : 'N/A',
                    streaming_url: e.streaming_url ? e.streaming_url : 'N/A',
                    meeting_url: e.meeting_url ? e.meeting_url : 'N/A',
                    etherpad_link: e.etherpad_link ? e.etherpad_link : 'N/A',
                    streaming_type: e.streaming_type ? e.streaming_type : 'N/A',
                    start_date: e.start_date ? moment(e.start_date * 1000).tz(state.summitTZ).format('MMMM Do YYYY, h:mm a') : 'TBD',
                    end_date: e.end_date ? moment(e.end_date * 1000).tz(state.summitTZ).format('MMMM Do YYYY, h:mm a') : 'TBD',
                    sponsor: (e.sponsors) ? e.sponsors.map(s => s.name).join(', ') : 'N/A',
                };
            });

            return {...state, events: events, currentPage: current_page, totalEvents: total, lastPage: last_page };
        }
        case EVENT_DELETED: {
            let {eventId} = payload;
            return {...state, events: state.events.filter(e => e.id !== eventId)};
        }
        case CHANGE_SEARCH_TERM: {
            let {term} = payload;
            return {...state, term};
        }
        default:
            return state;
    }
};

export default eventListReducer;
