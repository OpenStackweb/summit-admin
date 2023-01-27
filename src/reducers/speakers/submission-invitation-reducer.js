/**
 * Copyright 2020 OpenStack Foundation
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
    RECEIVE_INVITATION,
    RESET_INVITATION_FORM,
    UPDATE_INVITATION,
    INVITATION_UPDATED,
    INVITATION_ADDED
} from '../../actions/submission-invitation-actions';

import {
    RECEIVE_EMAILS_BY_USER
} from '../../actions/email-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

export const DEFAULT_ENTITY = {
    id: 0,
    first_name : '',
    last_name : '',
    email : '',
    tags: []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
    emailActivity: [],
};

const submissionInvitationReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_INVITATION_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, emailActivity:[], errors: {} };
        }
            break;
        case UPDATE_INVITATION: {
            return {...state,  entity: {...payload}, errors: {} };
        }
            break;
        case INVITATION_ADDED:
        case RECEIVE_INVITATION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, emailActivity:[] };
        }
            break;
        case INVITATION_UPDATED: {
            return state;
        }
            break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
            break;
        case RECEIVE_EMAILS_BY_USER :{
            let data = payload.response.data;

            data = data.map( m => {
                let sent_date = m.sent_date ? epochToMoment(m.sent_date).format('MMMM Do YYYY, h:mm:ss a') : '';
                return {...m, template_identifier: m.template.identifier, sent_date: sent_date}
            });

            return {...state,  emailActivity: data };
        }
        break;
        default:
            return state;
    }
};

export default submissionInvitationReducer;
