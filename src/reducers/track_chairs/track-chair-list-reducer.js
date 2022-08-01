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
    RECEIVE_TRACK_CHAIRS,
    REQUEST_TRACK_CHAIRS,
    TRACK_CHAIR_ADDED,
    TRACK_CHAIR_DELETED,
    TRACK_CHAIR_UPDATED,
} from '../../actions/track-chair-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    trackChairs         : [],
    trackId             : null,
    term                : '',
    order               : 'id',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalTrackChairs    : 0,
};

const trackChairListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_TRACK_CHAIRS: {
            const {order, orderDir, term, trackId} = payload;

            return {...state, order, orderDir, term, trackId }
        }
        case RECEIVE_TRACK_CHAIRS: {
            const {total, last_page, current_page, data} = payload.response;

            const trackChairs = data.map(tc => ({
                ...tc,
                name: `${tc.member.first_name} ${tc.member.last_name} (${tc.member.email})`,
                trackNames: tc.categories.map(c => c.name).join(', ')
            }));

            return {...state, trackChairs: trackChairs, currentPage: current_page, totalTrackChairs: total, lastPage: last_page };
        }
        case TRACK_CHAIR_ADDED: {
            const newTrackChair = payload.response;
            newTrackChair.trackNames = newTrackChair.categories.map(c => c.name).join(', ');
            newTrackChair.name = `${newTrackChair.member.first_name} ${newTrackChair.member.last_name}`;

            return {...state, trackChairs: [...state.trackChairs, newTrackChair]};
        }
        case TRACK_CHAIR_UPDATED: {
            const editedTrackChair = payload.response;
            const trackChairs = state.trackChairs.map(tc => {
                if (tc.id === editedTrackChair.id) {
                    return {
                        ...tc,
                        trackNames: editedTrackChair.categories.map(c => c.name).join(', '),
                        categories: editedTrackChair.categories,
                    };
                }

                return tc;
            });

            return {...state, trackChairs: [...trackChairs]};
        }
        case TRACK_CHAIR_DELETED: {
            const {trackChairId} = payload;

            return {...state, trackChairs: state.trackChairs.filter(tc => tc.id !== trackChairId)};
        }
        default:
            return state;
    }
};

export default trackChairListReducer;
