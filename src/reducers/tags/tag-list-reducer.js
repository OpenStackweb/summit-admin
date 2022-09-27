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
    REQUEST_TAGS,
    RECEIVE_TAGS,
    TAG_DELETED
} from '../../actions/tag-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

const DEFAULT_STATE = {
    tags            : {},
    term            : '',
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalTags       : 0
};

const tagListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_TAGS: {
            let {order, orderDir, term, page} = payload;
            return {...state, order, orderDir, term, currentPage: page};
        }
        case RECEIVE_TAGS: {
            let {current_page, total, last_page} = payload.response;
            let tags = payload.response.data.map(t => ({
                ...t,
                created: epochToMoment(t.created).format('MMMM Do YYYY, h:mm:ss a'),
                updated: epochToMoment(t.last_edited).format('MMMM Do YYYY, h:mm:ss a')
            }));

            return {...state, tags: tags, currentPage: current_page, totalTags: total, lastPage: last_page };
        }
        case TAG_DELETED: {
            let {tagId} = payload;
            return {...state, tags: state.tags.filter(s => s.id !== tagId)};
        }
        default:
            return state;
    }
};

export default tagListReducer;
