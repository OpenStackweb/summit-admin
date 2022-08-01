/**
 * Copyright 2022 OpenStack Foundation
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
import {LOGOUT_USER} from "openstack-uicore-foundation/lib/actions";
import {
    RECEIVE_ATTENDEES_VOTES,
    RECEIVE_PRESENTATION_VOTES,
    REQUEST_ATTENDEES_VOTES,
    REQUEST_PRESENTATION_VOTES,
    CLEAR_VOTES
} from "../../actions/presentation-votes-actions";
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    items   : {},
    order           : null,
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalItems : 0,
    summitId: 0,
};

const presentationVotesReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_PRESENTATION_VOTES:
        case REQUEST_ATTENDEES_VOTES:
        {
            let {order, orderDir, summitId} = payload;

            return {...state, order, orderDir, summitId}
        }
        case RECEIVE_PRESENTATION_VOTES:{
            let {current_page, total, last_page, data} = payload.response;
            return {...state, items: data.map( p => ({...p, id:`<a href="/app/summits/${state.summitId}/events/${p.id}">${p.id}</a>` })), currentPage: current_page, totalItems: total, lastPage: last_page };
        }
        case RECEIVE_ATTENDEES_VOTES:{
            let {current_page, total, last_page, data} = payload.response;
            return {...state, items: data.map( a => ({...a, presentations: a.presentation_votes.reduce((prevVal,currVal,idx) => {
                let p = currVal.presentation;
                let res = `<a href="/app/summits/${state.summitId}/events/${p.id}">${p.title}</a>`;
                return idx === 0 ? res : prevVal + ', ' + res;
            },"" )})), currentPage: current_page, totalItems: total, lastPage: last_page };

        }
        case CLEAR_VOTES:{
            const {summitId} = state;
            return {...DEFAULT_STATE, summitId};
        }
        default:
            return state;
    }
}

export default presentationVotesReducer;