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

import {
    RECEIVE_EVENT_CATEGORY_GROUPS,
    REQUEST_EVENT_CATEGORY_GROUPS,
    EVENT_CATEGORY_GROUP_DELETED
} from '../../actions/event-category-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    eventCategoryGroups : []
};

const eventCategoryGroupListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_EVENT_CATEGORY_GROUPS: {

            return {...state }
        }
        case RECEIVE_EVENT_CATEGORY_GROUPS: {
            let eventCategoryGroups = payload.response.data.map(e => {
                return {
                    id: e.id,
                    name: e.name,
                    color: `<div style="background-color: ${e.color}">&nbsp;</div>`,
                    type: (e.class_name === 'PresentationCategoryGroup') ? 'Public' : 'Private',
                    categories: e.tracks.map(c => c.name).join(', ')
                };
            })

            return {...state, eventCategoryGroups };
        }
        case EVENT_CATEGORY_GROUP_DELETED: {
            let {groupId} = payload;
            return {...state, eventCategoryGroups: state.eventCategoryGroups.filter(g => g.id !== groupId)};
        }
        default:
            return state;
    }
};

export default eventCategoryGroupListReducer;
