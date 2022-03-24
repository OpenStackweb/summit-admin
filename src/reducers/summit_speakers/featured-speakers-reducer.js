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
    REQUEST_FEATURED_SPEAKERS,
    RECEIVE_FEATURED_SPEAKERS,
    FEATURED_SPEAKER_DELETED,
    FEATURED_SPEAKER_ADDED,
    FEATURED_SPEAKER_ORDER_UPDATED
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    speakers         : [],
    term                : null,
    order               : '',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalSpeakers    : 0
};

const featuredSpeakersReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_FEATURED_SPEAKERS: {
            let {order, orderDir, term} = payload;
            return {...state, order, orderDir, term};
        }
        break;
        case RECEIVE_FEATURED_SPEAKERS: {
            let {current_page, total, last_page} = payload.response;
            let speakers = payload.response.data.map(s => ({
                ...s,
                name: `${s.first_name} ${s.last_name}`,
                pic_bool: s.pic ? 'Yes' : 'No',
                big_pic_bool: s.big_pic ? 'Yes' : 'No',
            }));

            return {
                ...state,
                speakers: speakers,
                currentPage: current_page,
                totalSpeakers: total,
                lastPage: last_page,
            };
        }
        break;
        case FEATURED_SPEAKER_DELETED: {
            let {speakerId} = payload;
            return {...state, speakers: state.speakers.filter(a => a.id !== speakerId)};
        }
        break;
        case FEATURED_SPEAKER_ADDED: {
            let {speaker} = payload;
            speaker.name = `${speaker.first_name} ${speaker.last_name}`;
            speaker.pic_bool = speaker.pic ? 'Yes' : 'No';
            speaker.big_pic_bool = speaker.big_pic ? 'Yes' : 'No';

            return {...state, speakers: [...state.speakers, speaker]};
        }
        break;
        case FEATURED_SPEAKER_ORDER_UPDATED: {
            let speakers = payload.map(s => {
                return {
                    ...s,
                    order: parseInt(s.order)
                };
            })
            return {...state, speakers: speakers };
        }
        break;
        default:
            return state;
    }
};

export default featuredSpeakersReducer;
