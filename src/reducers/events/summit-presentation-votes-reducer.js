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
import {RECEIVE_PRESENTATION_VOTES, REQUEST_PRESENTATION_VOTES} from "../../actions/presentation-votes-actions";

const DEFAULT_STATE = {
    presentations   : {},
    order           : 'votes_count',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalPresentations : 0,
    summitId: 0,
};

const presentationVotesReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        case REQUEST_PRESENTATION_VOTES:{
            let {order, orderDir, summitId} = payload;

            return {...state, order, orderDir, summitId}
        }
        case RECEIVE_PRESENTATION_VOTES:{
            let {current_page, total, last_page, data} = payload.response;

            return {...state, presentations: data.map( p => ({...p, id:`<a href="/app/summits/${state.summitId}/events/${p.id}">${p.id}</a>`, voters : p.voters.reduce((prevVal,currVal,idx) => {
                        let res = `<a href="/app/summits/${state.summitId}/attendees/${currVal.id}">${currVal.first_name} ${currVal.last_name} (${currVal.email})</a>`;
                        return idx === 0 ? res : prevVal + ', ' + res;
                    },"" )}) ), currentPage: current_page, totalPresentations: total, lastPage: last_page };
        }
        default:
            return state;
    }
}

export default presentationVotesReducer;