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
    RECEIVE_PROGRESS_FLAGS,
    PROGRESS_FLAG_ADDED,
    PROGRESS_FLAG_DELETED,
    PROGRESS_FLAG_UPDATED,
    PROGRESS_FLAG_REORDERED
} from '../../actions/track-chair-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    progressFlags : [],
};

const progressFlagsReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        case RECEIVE_PROGRESS_FLAGS: {
            const {data} = payload.response;

            return {...state, progressFlags: data };
        }
        case PROGRESS_FLAG_ADDED: {
            const newFlag = payload.response;

            return {...state, progressFlags: [...state.progressFlags, newFlag]};
        }
        case PROGRESS_FLAG_UPDATED: {
            const editedFlag = payload.response;

            const progressFlags = state.progressFlags.map(f => {
                if (f.id === editedFlag.id) {
                    return editedFlag;
                }

                return f;
            }).sort((a,b) => a.order - b.order);

            return {...state, progressFlags};
        }
        case PROGRESS_FLAG_REORDERED: {
            return {...state, progressFlags: payload };
        }
        case PROGRESS_FLAG_DELETED: {
            const {progressFlagId} = payload;

            return {...state, progressFlags: state.progressFlags.filter(f => f.id !== progressFlagId)};
        }
        default:
            return state;
    }
};

export default progressFlagsReducer;
