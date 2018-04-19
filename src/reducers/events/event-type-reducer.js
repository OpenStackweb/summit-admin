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
    RECEIVE_EVENT_TYPE,
    RESET_EVENT_TYPE_FORM,
    UPDATE_EVENT_TYPE,
    EVENT_TYPE_ADDED
} from '../../actions/event-type-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                          : 0,
    name                        : '',
    class_name                  : '',
    color                       : '',
    black_out_times             : false,
    use_sponsors                : false,
    are_sponsors_mandatory      : false,
    should_be_available_on_cfp  : false,
    use_speakers                : false,
    are_speakers_mandatory      : false,
    min_speakers                : 0,
    max_speakers                : 0,
    use_moderator               : false,
    is_moderator_mandatory      : false,
    moderator_label             : '',
    min_moderators              : 0,
    max_moderators              : 0,
    allows_attachment           : false,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const eventTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_EVENT_TYPE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case EVENT_TYPE_ADDED:
        case RECEIVE_EVENT_TYPE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            switch (entity.class_name) {
                case 'SummitEventType':
                    entity.class_name = 'EVENT_TYPE';
                    break;
                case 'PresentationType':
                    entity.class_name = 'PRESENTATION_TYPE';
                    break;
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
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

export default eventTypeReducer;
