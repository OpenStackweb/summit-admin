/**
 * Copyright 2018 OpenStack Foundation
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
    RECEIVE_TAG_GROUPS,
    TAG_GROUP_ORDER_UPDATED,
    REQUEST_TAG_GROUPS,
    TAG_GROUP_DELETED,
    TAG_GROUPS_SEEDED
} from '../../actions/tag-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    tagGroups      : []
};

const tagGroupListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_TAG_GROUPS: {

            return {...state }
        }
        case RECEIVE_TAG_GROUPS: {
            let tagGroups = [...payload.response.data];

            return {...state, tagGroups };
        }
        case TAG_GROUP_ORDER_UPDATED: {
            let tagGroups = [...payload];
            return {...state, tagGroups: tagGroups}
        }
        case TAG_GROUP_DELETED: {
            let {tagGroupId} = payload;
            return {...state, tagGroups: state.tagGroups.filter(tg => tg.id !== tagGroupId)};
        }
        case TAG_GROUPS_SEEDED: {
            let tagGroupsAdded = payload.response.data;
            if (tagGroupsAdded.length > 0) {
                return {...state, tagGroups: [...state.tagGroups, ...tagGroupsAdded]};
            } else {
                return state;
            }
        }
        default:
            return state;
    }
};

export default tagGroupListReducer;
