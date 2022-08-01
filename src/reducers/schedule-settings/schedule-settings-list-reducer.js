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

import
{
    REQUEST_ALL_SCHEDULE_SETTINGS,
    RECEIVE_ALL_SCHEDULE_SETTINGS,
    SCHEDULE_SETTING_DELETED,
    DEFAULT_SCHEDULE_SETTINGS_SEEDED
} from '../../actions/schedule-settings-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {boolToStr} from "../../utils/methods";
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    scheduleSettings        : [],
    order                   : 'key',
    orderDir                : 1,
    totalScheduleSettings   : 0
};

const scheduleSettingsListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ALL_SCHEDULE_SETTINGS: {
            const {order, orderDir} = payload;

            return {...state, order, orderDir, scheduleSettings: [] };
        }
        case DEFAULT_SCHEDULE_SETTINGS_SEEDED:
        case RECEIVE_ALL_SCHEDULE_SETTINGS: {
            const { total } = payload.response;
            const scheduleSettings = payload.response.data;

            scheduleSettings.forEach(ss => {
                ss.is_enabled_str = boolToStr(ss.is_enabled);
                ss.is_my_schedule_str = boolToStr(ss.is_my_schedule);
                ss.is_access_level_str = boolToStr(ss.only_events_with_attendee_access);
            });

            return {...state, scheduleSettings: [...scheduleSettings, ...state.scheduleSettings], totalScheduleSettings: total };
        }
        case SCHEDULE_SETTING_DELETED: {
            const {scheduleSettingId} = payload;
            return {...state, scheduleSettings: state.scheduleSettings.filter(ss => ss.id !== scheduleSettingId), totalScheduleSettings: (state.totalScheduleSettings - 1)};
        }
        default:
            return state;
    }
};

export default scheduleSettingsListReducer;
