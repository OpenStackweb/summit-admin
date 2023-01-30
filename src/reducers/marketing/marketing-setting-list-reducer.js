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
    RECEIVE_SETTINGS,
    REQUEST_SETTINGS,
    SETTING_DELETED,
} from '../../actions/marketing-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    settings        : [],
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalSettings   : 0,
};

const marketingSettingListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_SETTINGS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_SETTINGS: {
            let {total, last_page, current_page} = payload.response;
            let settings = payload.response.data.map(s => {
                return {
                    id: s.id,
                    key: s.key,
                    type: s.type,
                    value: s.value,
                    selection_plan_id: s.selection_plan_id ? s.selection_plan_id : "N/A"
                };
            });

            return {...state, settings: settings, currentPage: current_page, totalSettings: total, lastPage: last_page };
        }
        case SETTING_DELETED: {
            let {settingId} = payload;
            return {...state, settings: state.settings.filter(s => s.id !== settingId)};
        }
        default:
            return state;
    }
};

export default marketingSettingListReducer;
