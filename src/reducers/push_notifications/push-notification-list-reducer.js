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
    RECEIVE_PUSH_NOTIFICATIONS,
    REQUEST_PUSH_NOTIFICATIONS,
    PUSH_NOTIFICATION_DELETED
} from '../../actions/push-notification-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import moment from 'moment-timezone';


const DEFAULT_STATE = {
    pushNotifications         : [],
    order                     : 'created',
    orderDir                  : 1,
    page                      : 1,
    lastPage                  : 1,
    perPage                   : 10,
    totalpushNotifications    : 0
};

const pushNotificationListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_PUSH_NOTIFICATIONS: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_PUSH_NOTIFICATIONS: {
            let { total } = payload.response;
            let pushNotifications = payload.response.data.map(n => {
                let check = '<i class="fa fa-check" aria-hidden="true"></i>';
                let cross = '<i class="fa fa-times" aria-hidden="true"></i>';
                let created = (n.created ? moment(n.created * 1000).format('M/D h:mma') : 'No');
                let sent = (n.sent_date ? moment(n.sent_date * 1000).format('M/D h:mma') : 'No');

                return {
                    id: n.id,
                    created: created,
                    message: n.message,
                    approved: n.approved ? check : cross,
                    is_sent: n.is_sent ? check : cross,
                    sent_date: sent,
                    priority: n.priority,
                    channel: n.channel,
                };
            })

            return {...state, pushNotifications: pushNotifications, totalPushNotifications: total };
        }
        break;
        case PUSH_NOTIFICATION_DELETED: {
            let {pushNotificationId} = payload;
            return {...state, pushNotifications: state.pushNotifications.filter(t => t.id != pushNotificationId)};
        }
        break;
        default:
            return state;
    }
};

export default pushNotificationListReducer;
