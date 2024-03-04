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

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import { RECEIVE_EMAIL_SETTINGS } from '../../actions/email-actions';

const DEFAULT_EMAIL_MARKETING_SETTINGS = {
    EMAIL_TEMPLATE_GENERIC_BANNER: { id: 0, value: '', type: 'FILE', file_preview: '', file: null },
    EMAIL_TEMPLATE_GENERIC_SPEAKER_BANNER: { id: 0, value: '', type: 'FILE', file_preview: '', file: null },
    EMAIL_TEMPLATE_TICKET_TOP_GRAPHIC: { id: 0, value: '', type: 'FILE', file_preview: '', file: null },
    EMAIL_TEMPLATE_TICKET_BOTTOM_GRAPHIC: { id: 0, value: '', type: 'FILE', file_preview: '', file: null },
    EMAIL_TEMPLATE_GENERIC_FROM: { id: 0, value: '', type: 'TEXT' },
    EMAIL_TEMPLATE_SPEAKERS_FROM: { id: 0, value: '', type: 'TEXT' },
    EMAIL_TEMPLATE_PRIMARY_COLOR: { id: 0, value: '', type: 'HEX_COLOR' },
    EMAIL_TEMPLATE_SECONDARY_COLOR: { id: 0, value: '', type: 'HEX_COLOR' },
};

const DEFAULT_STATE = {
    email_marketing_settings: DEFAULT_EMAIL_MARKETING_SETTINGS,
    errors: {}
};

const emailFlowEventSettingsReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return { ...state, email_marketing_settings: { ...DEFAULT_EMAIL_MARKETING_SETTINGS }, errors: {} };
            }
        }
            break;
        case SET_CURRENT_SUMMIT: {
            return { ...state, email_marketing_settings: { ...DEFAULT_EMAIL_MARKETING_SETTINGS }, errors: {} };
        }
            break;
        case RECEIVE_EMAIL_SETTINGS: {
            let reducerSettings = { ...DEFAULT_EMAIL_MARKETING_SETTINGS,};
            if (payload.response.data.length > 0) {
                payload.response.data.forEach(apiValue => {
                    const key = apiValue.key;
                    if (reducerSettings[key]) {
                        reducerSettings[key] = apiValue;
                    }
                });
            }
            return { ...state, email_marketing_settings: { ...reducerSettings } }
        }
        case VALIDATE: {
            return { ...state, errors: payload.errors };
        }
            break;
        default:
            return state;
    }
};

export default emailFlowEventSettingsReducer;
