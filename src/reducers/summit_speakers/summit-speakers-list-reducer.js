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
import {
    INIT_SPEAKERS_LIST_PARAMS,
    REQUEST_SPEAKERS_BY_SUMMIT,
    RECEIVE_SPEAKERS_BY_SUMMIT,
    SELECT_SUMMIT_SPEAKER,
    UNSELECT_SUMMIT_SPEAKER,
    SELECT_ALL_SUMMIT_SPEAKERS,
    UNSELECT_ALL_SUMMIT_SPEAKERS,
    SEND_SPEAKERS_EMAILS,
    SET_SPEAKERS_CURRENT_FLOW_EVENT
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {REQUEST_SUMMIT, SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import {buildSpeakersSubmittersList} from "../utils/methods";

const DEFAULT_STATE = {
    items: [],
    term: null,
    order: 'full_name',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalItems: 0,
    selectedCount: 0,
    selectedItems: [],
    excludedItems: [],
    selectedAll: false,
    selectionPlanFilter: [],
    trackFilter: [],
    activityTypeFilter: [],
    selectionStatusFilter: [],
    currentFlowEvent: '',
    currentSummitId: null
};

const summitSpeakersListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER:
        case REQUEST_SUMMIT:
        case SET_CURRENT_SUMMIT:
        case INIT_SPEAKERS_LIST_PARAMS:
        {
            return DEFAULT_STATE;
        }
        case REQUEST_SPEAKERS_BY_SUMMIT: {
            let { order, orderDir, page, ...rest} = payload;

            if (order !== state.order || orderDir !== state.orderDir || page !== state.currentPage) {
                // if the change was in page or order, keep selection
                return {
                    ...state,
                    order,
                    orderDir,
                    currentPage: page,
                    ...rest
                }
            }

            return {
                ...state,
                order,
                orderDir,
                currentPage: page,
                items: [],
                selectedItems: [],
                excludedItems: [],
                selectedCount: 0,
                selectedAll: false,
                ...rest
            }
        }
        case RECEIVE_SPEAKERS_BY_SUMMIT: {
            let { current_page, total, last_page } = payload.response;

            const items = buildSpeakersSubmittersList(state, payload.response.data);


            return {
                ...state,
                items: markCheckedItems(items, state),
                currentPage: current_page,
                totalItems: total,
                lastPage: last_page,
            };
        }
        case SELECT_SUMMIT_SPEAKER: {
            let newState = {};

            if (state.selectedAll) {
                newState = { ...state, excludedItems: state.excludedItems.filter(it => it !== payload), selectedItems: [] }
            } else {
                newState = { ...state, selectedItems: [...state.selectedItems, payload], excludedItems: [] }
            }

            return {...newState, items: markCheckedItems(state.items, newState), selectedCount: state.selectedCount + 1}
        }
        case UNSELECT_SUMMIT_SPEAKER: {
            let newState = {};

            if (state.selectedAll) {
                newState = { ...state, excludedItems: [...state.excludedItems, payload], selectedItems: [] }
            } else {
                newState = { ...state, selectedItems: state.selectedItems.filter(it => it !== payload), excludedItems: [] }
            }

            return {...newState, items: markCheckedItems(state.items, newState), selectedCount: state.selectedCount - 1}
        }
        case SELECT_ALL_SUMMIT_SPEAKERS: {
            const newState = {...state, selectedAll: true, selectedItems: [], excludedItems: [] }
            return { ...newState, items: markCheckedItems(state.items, newState), selectedCount: state.totalItems }
        }
        case UNSELECT_ALL_SUMMIT_SPEAKERS: {
            const newState = {...state, selectedAll: false, selectedItems: [], excludedItems: [] }
            return { ...newState, items: markCheckedItems(state.items, newState), selectedCount: 0 }
        }
        case SEND_SPEAKERS_EMAILS: {
            const newState = {...state, selectedAll: false, selectedItems: [], excludedItems: [] }
            return { ...newState, items: markCheckedItems(state.items, newState), selectedCount: 0 }
        }
        case SET_SPEAKERS_CURRENT_FLOW_EVENT: {
            return { ...state, currentFlowEvent: payload };
        }
        default:
            return state;
    }
};

const markCheckedItems = (data, state) => {
    return data.map(it => {
        if (state.selectedAll) {
            it.checked = !state.excludedItems.includes(it.id);
        } else {
            it.checked = state.selectedItems.includes(it.id);
        }

        return it;
    });
}

export default summitSpeakersListReducer;
