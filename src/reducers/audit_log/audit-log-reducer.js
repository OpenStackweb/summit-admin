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

import moment from 'moment-timezone';
import
{
    CLEAR_LOG_PARAMS,
    REQUEST_LOG,
    RECEIVE_LOG,
} from '../../actions/audit-log-actions';

import { SET_CURRENT_SUMMIT } from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    logEntries              : [],
    currentPage             : 1,
    lastPage                : 1,
    perPage                 : 10,
    order                   : 'created',
    orderDir                : 1,
    totalLogEntries         : 0
};

const auditLogReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case CLEAR_LOG_PARAMS:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_LOG: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        case RECEIVE_LOG: {
            let { current_page, total, last_page } = payload.response;

            let logEntries = payload.response.data.map(e => {
                return {
                    ...e,
                    event: e.event_id,
                    user: `${e.user.first_name} ${e.user.last_name} (${e.user.id})`,
                    created: moment(e.created * 1000).format('MMMM Do YYYY, h:mm a'),
                };
            });

            return {...state, logEntries: logEntries, totalLogEntries: total, currentPage: current_page, lastPage: last_page };
        }
        default:
            return state;
    }
};

export default auditLogReducer;
