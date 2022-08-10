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
    RECEIVE_SPEAKER,
    REQUEST_SPEAKER,
    RESET_SPEAKER_FORM,
    MERGE_SPEAKERS,
    SPEAKER_MERGED
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_STATE = {
    speakerCol: '',
    speakers: [null, null],
    selectedFields: {
        title: 1,
        first_name: 1,
        last_name: 1,
        reg_email: 1,
        twitter: 1,
        irc: 1,
        bio: 1,
        pic: 1
    }
};

const speakerMergeReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch (type) {
        case LOGOUT_USER: {
            return { ...DEFAULT_STATE };
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_SPEAKER_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case RECEIVE_SPEAKER: {
            let entity = {...payload.response};
            let speakers = [...state.speakers];

            speakers[state.speakerCol] = entity;

            return {...state, speakers};
        }
        break;
        case REQUEST_SPEAKER: {
            return { ...state, speakerCol: payload.speakerCol };
        }
        break;
        case MERGE_SPEAKERS: {
            return state;
        }
        case SPEAKER_MERGED: {
            return state;
        }
        break;
        default:
            return state;
    }
};

export default speakerMergeReducer;
