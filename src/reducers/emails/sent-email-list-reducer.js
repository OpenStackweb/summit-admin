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
    RECEIVE_EMAILS,
    REQUEST_EMAILS
} from '../../actions/email-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

const DEFAULT_STATE = {
    emails          : [],
    term            : '',
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalEmails     : 0,
};

const sentEmailListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_EMAILS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_EMAILS: {
            let {total, last_page, current_page, data} = payload.response;

            data = data.map( m => {
                let sent_date = m.sent_date ? epochToMoment(m.sent_date).format('MMMM Do YYYY, h:mm:ss a') : '';
                return {...m, template: m.template.identifier, sent_date: sent_date}
            });
            return {...state, emails: data, currentPage: current_page, totalEmails: total, lastPage: last_page };
        }
        default:
            return state;
    }
};

export default sentEmailListReducer;
