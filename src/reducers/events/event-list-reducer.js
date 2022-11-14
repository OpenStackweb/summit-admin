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
    EVENT_DELETED
} from '../../actions/event-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

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
    return d.format('mm:ss');
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

                return {
                    id: e.id,
                    type: e.type.name,
                    title: e.title,
                    status: e.status,
                    selection_status: e.selection_status,
                    published_date: published_date,
                    created_by_fullname: e.hasOwnProperty('created_by') ? `${e.created_by.first_name} ${e.created_by.last_name}`:'TBD',
                    speakers: (e.speakers) ? e.speakers.map(s => s.first_name + ' ' + s.last_name).join(',') : '',
                    duration: e.type.allows_publishing_dates ?
                        formatDuration(e.duration) : 'N/A',
                    speaker_count: (e.speakers) ? e.speakers.length : '',
                    track: e.track.name,
                    start_date: e.start_date ? moment(e.start_date * 1000).tz(state.summitTZ).format('MMMM Do YYYY, h:mm a') : 'TBD',
                    end_date: e.end_date ? moment(e.end_date * 1000).tz(state.summitTZ).format('MMMM Do YYYY, h:mm a') : 'TBD',
                };
            });

            return {...state, events: events, currentPage: current_page, totalEvents: total, lastPage: last_page };
        }
        case EVENT_DELETED: {
            let {eventId} = payload;
            return {...state, events: state.events.filter(e => e.id !== eventId)};
        }
        default:
            return state;
    }
};

export default eventListReducer;
