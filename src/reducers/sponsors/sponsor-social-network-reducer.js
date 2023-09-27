/**
 * Copyright 2019 OpenStack Foundation
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
    RECEIVE_SPONSOR_SOCIAL_NETWORK,
    SPONSOR_SOCIAL_NETWORK_UPDATED,
    RESET_SPONSOR_SOCIAL_NETWORK_FORM,
    SPONSOR_SOCIAL_NETWORK_ADDED,
    UPDATE_SPONSOR_SOCIAL_NETWORK,
} from '../../actions/sponsor-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0, 
    link: '',
    icon_css_class: '',
    is_enabled: false
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const sponsorSocialNetworkReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
            }
        }
            break;
        case SET_CURRENT_SUMMIT:
        case RESET_SPONSOR_SOCIAL_NETWORK_FORM: {
            return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
        }
            break;
        case SPONSOR_SOCIAL_NETWORK_ADDED:
        case SPONSOR_SOCIAL_NETWORK_UPDATED:
        case RECEIVE_SPONSOR_SOCIAL_NETWORK: {
            let entity = { ...payload.response };

            for (var key in entity) {
                if (entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key];
                }
            }

            return { ...state, entity: { ...state.entity, ...entity } };
        }
            break;
        case VALIDATE: {
            return { ...state, errors: payload.errors };
        }
            break;
        default:
            return state;
    }
};

export default sponsorSocialNetworkReducer;
