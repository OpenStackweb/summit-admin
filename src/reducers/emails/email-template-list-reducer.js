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
    RECEIVE_TEMPLATES,
    REQUEST_TEMPLATES,
    TEMPLATE_DELETED,
} from '../../actions/email-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    templates       : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalTemplates   : 0,
};

const emailTemplateListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_TEMPLATES: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_TEMPLATES: {
            let {total, last_page, current_page} = payload.response;
            let templates = payload.response.data.map(s => {
                return {
                    id: s.id,
                    identifier: s.identifier,
                    subject: s.subject,
                    from_email: s.from_email,
                };
            });

            return {...state, templates: templates, currentPage: current_page, totalTemplates: total, lastPage: last_page };
        }
        case TEMPLATE_DELETED: {
            let {templateId} = payload;
            return {...state, templates: state.templates.filter(s => s.id !== templateId)};
        }
        default:
            return state;
    }
};

export default emailTemplateListReducer;
