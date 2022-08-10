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
    RECEIVE_TEMPLATE,
    RESET_TEMPLATE_FORM,
    UPDATE_TEMPLATE,
    TEMPLATE_ADDED,
    RECEIVE_EMAIL_CLIENTS,
    TEMPLATE_RENDER_RECEIVED,
    VALIDATE_RENDER
} from '../../actions/email-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    identifier      : '',
    html_content    : '',
    plain_content   : '',
    from_email      : '',
    subject         : '',
    // default values
    max_retries     : 1,
    is_active       : true,
    allowed_clients : [],
    parent          : null,

};

const DEFAULT_STATE = {
    entity          : DEFAULT_ENTITY,
    clients         : null,
    preview         : null,
    errors          : {},
    render_errors   : []
};

const emailTemplateReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_TEMPLATE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_TEMPLATE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case TEMPLATE_ADDED:
        case RECEIVE_TEMPLATE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, preview: null };
        }
        break;
        case RECEIVE_EMAIL_CLIENTS: {
            return {...state, clients: payload.response.data };
        }
        break;
        case TEMPLATE_RENDER_RECEIVED: {
            return {...state, preview: payload.response.html_content, render_errors: [] };
        }
        break;
        case VALIDATE_RENDER: {
            return {...state,  render_errors: payload.errors };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default emailTemplateReducer;
