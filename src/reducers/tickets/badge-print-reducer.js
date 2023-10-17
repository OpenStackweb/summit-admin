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
    REQUEST_BADGE_PRINTS,
    RECEIVE_BADGE_PRINTS
} from '../../actions/badge-actions'
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

const DEFAULT_STATE = {
    badgePrints: [],
    order: 'id',
    orderDir: 1,
    totalBadgePrints: 0,
    term: '',
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
};

const badgePrintReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {        
        case REQUEST_BADGE_PRINTS: {
            let {order, orderDir, term} = payload;
            return {...state, order, term, orderDir };
        }
        break;
        case RECEIVE_BADGE_PRINTS: {            
            const { data, current_page, last_page, total } = payload.response;

            const prints = data.map(p => {
                const created = p.created ? epochToMoment(p.created).format('MMMM Do YYYY, h:mm:ss a') : '';
                const print_date = p.print_date ? epochToMoment(p.print_date).format('MMMM Do YYYY, h:mm:ss a') : '';
                const requestor_full_name = p.requestor ? `${p.requestor.first_name} ${p.requestor.last_name}` : 'N/A';                
                const requestor_email = p.requestor ? p.requestor.email : 'N/A';

                return {...p, created, print_date, requestor_full_name, requestor_email}
            });

            return {...state, badgePrints: prints, currentPage: current_page, lastPage: last_page, totalBadgePrints: total};
        }
        default:
            return state;
    }
};

export default badgePrintReducer;
