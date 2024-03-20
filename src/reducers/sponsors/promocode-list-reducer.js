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
    REQUEST_SPONSOR_PROMOCODES,
    RECEIVE_SPONSOR_PROMOCODES,
    SELECT_SPONSOR_PROMOCODE,
    UNSELECT_SPONSOR_PROMOCODE,
    CLEAR_ALL_SELECTED_SPONSOR_PROMOCODES,
    SET_SPONSOR_PROMOCODES_CURRENT_FLOW_EVENT,
    SET_SELECTED_ALL_SPONSOR_PROMOCODES,
    SEND_SPONSOR_PROMOCODES_EMAILS,
    CHANGE_SPONSOR_PROMOCODES_SEARCH_TERM
} from "../../actions/sponsor-actions";
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

import moment from 'moment-timezone';

const DEFAULT_STATE = {
    promocodes      : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalPromocodes : 0,
    selectedCount   : 0,
    selectedIds     : [],
    excludedIds     : [],
    currentFlowEvent: '',
    selectedAll     : false,
    summitTz        : '',
};

const promocodeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_SPONSOR_PROMOCODES: {
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
                promocodes: [],
                currentPage: page,
                selectedIds: [],
                excludedIds: [],
                selectedCount: 0,
                selectedAll: false,
                ...rest
            }
        }
        case RECEIVE_SPONSOR_PROMOCODES: {
            const {current_page, total, last_page} = payload.response;

            const promocodes = payload.response.data.map(p => {
                const ticketTypes = p.allowed_ticket_types || p.ticket_types_rules?.map(ttr => ttr.ticket_type) || [];
                return {
                    ...p,
                    sponsor_company_name: p.sponsor?.company?.name,
                    tier_name: p.sponsor?.sponsorship?.type?.name,
                    quantity_available: p.quantity_available || '0',
                    quantity_used: p.quantity_used || '0',
                    email_sent: p.email_sent?.toString(),
                    feature_types: p.badge_features.map(bf => bf.name).join(', '),
                    ticket_types: ticketTypes.map(tt => tt.name).join(', ')
                };
            })

            return {...state, promocodes, currentPage: current_page, totalPromocodes: total, lastPage: last_page};
        }
        case SELECT_SPONSOR_PROMOCODE:{
            const {selectedAll, selectedIds, excludedIds, selectedCount, promocodes} = state;
            const promocodeId = payload;
            const promocode = promocodes.find(a => a.id === promocodeId);
            promocode.checked = true;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedIds: excludedIds.filter(it => it !== promocodeId), selectedIds: [] }
            } else {
                newState = { ...state, selectedIds: [...selectedIds, promocodeId], excludedIds: [] }
            }

            return {...newState, promocodes, selectedCount: selectedCount + 1}
        }
        case UNSELECT_SPONSOR_PROMOCODE:{
            const {selectedAll, selectedIds, excludedIds, selectedCount, promocodes} = state;
            const promocodeId = payload;
            const promocode = promocodes.find(a => a.id === promocodeId);
            promocode.checked = false;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedIds: [...excludedIds, promocodeId], selectedIds: [] }
            } else {
                newState = { ...state, selectedIds: selectedIds.filter(it => it !== promocodeId), excludedIds: [] }
            }

            return {...newState, promocodes, selectedCount: selectedCount - 1}
        }
        case CLEAR_ALL_SELECTED_SPONSOR_PROMOCODES:
        {
            return {...state, selectedIds: [], excludedIds: [], selectedCount: 0, selectedAll: false};
        }
        case SET_SPONSOR_PROMOCODES_CURRENT_FLOW_EVENT:{
            return {...state, currentFlowEvent : payload};
        }
        case SET_SELECTED_ALL_SPONSOR_PROMOCODES:{
            const selectedAll = payload;
            const promocodes = state.promocodes.map(p => ({...p, checked: selectedAll}));
            const selectedCount = selectedAll ? state.totalRealAttendees : 0

            return {...state, selectedAll, selectedIds: [], excludedIds: [], promocodes, selectedCount };
        }
        case SEND_SPONSOR_PROMOCODES_EMAILS:{
            const newState = {...state, selectedAll: false, selectedIds: [], excludedIds: [], selectedCount: 0 }
            newState.promocodes = newState.promocodes.map(p => ({...p, checked: false}));

            return { ...newState }
        }
        case CHANGE_SPONSOR_PROMOCODES_SEARCH_TERM: {
            let {term} = payload;
            return {...state, term};
        }        
        default:
            return state;
    }
};

export default promocodeListReducer;
