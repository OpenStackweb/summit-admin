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
    RECEIVE_EVENT_CATEGORIES,
    REQUEST_EVENT_CATEGORIES,
    EVENT_CATEGORY_DELETED
} from '../../actions/event-category-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_STATE = {
    eventCategories : []
};

const eventCategoryListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_EVENT_CATEGORIES: {

            return {...state }
        }
        break;
        case RECEIVE_EVENT_CATEGORIES: {
            let eventCategories = payload.response.data.map(e => {
                return {
                    id: e.id,
                    name: e.name
                };
            })

            return {...state, eventCategories };
        }
        break;
        case EVENT_CATEGORY_DELETED: {
            let {eventCategoryId} = payload;
            return {...state, eventCategories: state.eventCategories.filter(c => c.id != eventCategoryId)};
        }
        break;
        default:
            return state;
    }
};

export default eventCategoryListReducer;