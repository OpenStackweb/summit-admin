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
    RECEIVE_MEDIA_FILE_TYPES,
    REQUEST_MEDIA_FILE_TYPES,
    MEDIA_FILE_TYPE_DELETED,
} from '../../actions/media-file-type-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    media_file_types  : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
};

const mediaFileTypeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_MEDIA_FILE_TYPES: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_MEDIA_FILE_TYPES: {
            let {total, last_page, current_page} = payload.response;
            let media_file_types = payload.response.data.map(mft => {
                return {
                    id: mft.id,
                    name: mft.name,
                    description: mft.description,
                    allowed_extensions: mft.allowed_extensions,
                };
            });

            return {...state, media_file_types: media_file_types, currentPage: current_page, lastPage: last_page };
        }
        case MEDIA_FILE_TYPE_DELETED: {
            let {mediaFileTypeId} = payload;
            return {...state, media_file_types: state.media_file_types.filter(mft => mft.id !== mediaFileTypeId)};
        }
        default:
            return state;
    }
};

export default mediaFileTypeListReducer;
