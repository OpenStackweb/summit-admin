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
    RECEIVE_RSVP_TEMPLATES,
    REQUEST_RSVP_TEMPLATES,
    RSVP_TEMPLATE_DELETED
} from '../../actions/rsvp-template-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    rsvpTemplates       : [],
    term                : null,
    order               : 'id',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalRsvpTemplates  : 0
};

const rsvpTemplateListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_RSVP_TEMPLATES: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_RSVP_TEMPLATES: {
            let {current_page, total, last_page} = payload.response;
            let rsvpTemplates = payload.response.data.map(r => {
                return {
                    id: r.id,
                    title: r.title
                };
            });

            return {...state, rsvpTemplates: rsvpTemplates, currentPage: current_page, totalRsvpTemplates: total, lastPage: last_page };
        }
        case RSVP_TEMPLATE_DELETED: {
            let {rsvpTemplateId} = payload;
            return {...state, rsvpTemplates: state.rsvpTemplates.filter(r => r.id !== rsvpTemplateId)};
        }
        default:
            return state;
    }
};

export default rsvpTemplateListReducer;
