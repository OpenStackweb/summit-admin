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
    RECEIVE_ADMIN_ACCESSES,
    REQUEST_ADMIN_ACCESSES,
    ADMIN_ACCESS_DELETED,
} from '../../actions/admin-access-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    admin_accesses  : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
};

const adminAccessListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ADMIN_ACCESSES: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_ADMIN_ACCESSES: {
            let {total, last_page, current_page} = payload.response;
            let admin_accesses = payload.response.data.map(aa => {
                return {
                    id: aa.id,
                    title: aa.title,
                    members: aa.members.map(m => `${m.first_name} ${m.last_name}`).join(', '),
                    summits: aa.summits.map(s => s.name).join(', '),
                };
            });

            return {...state, admin_accesses: admin_accesses, currentPage: current_page, lastPage: last_page };
        }
        case ADMIN_ACCESS_DELETED: {
            let {adminAccessId} = payload;
            return {...state, admin_accesses: state.admin_accesses.filter(aa => aa.id !== adminAccessId)};
        }
        default:
            return state;
    }
};

export default adminAccessListReducer;
