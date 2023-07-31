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
    EVENT_CATEGORY_DELETED,
    EVENT_CATEGORIES_SEEDED,
    EVENT_CATEGORY_ORDER_UPDATED
} from '../../actions/event-category-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    eventCategories : []
};

const eventCategoryListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_EVENT_CATEGORIES: {

            return {...state }
        }
        case RECEIVE_EVENT_CATEGORIES: {
            return {...state, eventCategories: payload.response.data.map(e => {
                    return {
                        id: e.id,
                        name: e.name,
                        code: e.code,
                        color: `<div style="background-color: ${e.color}">&nbsp;</div>`,
                        order: e.order,
                    };
                }) };
        }
        case EVENT_CATEGORY_ORDER_UPDATED: {
            const tracks = payload.map(t => {
                return {
                    id: t.id,
                    name: t.name,
                    code: t.code,
                    color: t.color,
                    order: parseInt(t.order)
                };
            });

            return {...state, eventCategories: tracks };
        }
        case EVENT_CATEGORIES_SEEDED: {
            let eventCategoriesAdded = payload.response.data.map(e => {
                return {
                    id: e.id,
                    name: e.name
                };
            })

            if (eventCategoriesAdded.length > 0) {
                return {...state, eventCategories: [...state.eventCategories, ...eventCategoriesAdded] };
            } else {
                return state;
            }
        }
        case EVENT_CATEGORY_DELETED: {
            let {categoryId} = payload;
            return {...state, eventCategories: state.eventCategories.filter(c => c.id !== categoryId)};
        }
        default:
            return state;
    }
};

export default eventCategoryListReducer;
