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
    REQUEST_SPEAKERS,
    RECEIVE_SPEAKERS,
    SPEAKER_DELETED
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    speakers        : {},
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalSpeakers   : 0
};

const speakerListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_SPEAKERS: {
            let {order, orderDir, term, page} = payload;
            return {...state, order, orderDir, term, currentPage: page};
        }
        break;
        case RECEIVE_SPEAKERS: {
            let {current_page, total, last_page} = payload.response;
            let speakers = payload.response.data.map(s => ({
                ...s,
                name: s.first_name + ' ' + s.last_name
            }))

            return {...state, speakers: speakers, currentPage: current_page, totalSpeakers: total, lastPage: last_page };
        }
        break;
        case SPEAKER_DELETED: {
            let {speakerId} = payload;
            return {...state, speakers: state.speakers.filter(s => s.id !== speakerId)};
        }
        break;
        default:
            return state;
    }
};

export default speakerListReducer;
