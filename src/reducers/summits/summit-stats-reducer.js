import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/security/actions';
import {RECEIVE_SUMMIT, REQUEST_SUMMIT} from '../../actions/summit-actions';

import {
  RECEIVE_ATTENDEE_CHECK_INS,
  RECEIVE_REGISTRATION_STATS,
  REGISTRATION_DATA_LOADED,
  REGISTRATION_DATA_REQUESTED,
  REQUEST_ATTENDEE_CHECK_INS,
} from '../../actions/summit-stats-actions'

const DEFAULT_STATE = {
  summitTZ: 'UTC',
  loadingData: false,
  total_active_tickets: 0,
  total_inactive_tickets: 0,
  total_orders: 0,
  total_active_assigned_tickets: 0,
  total_payment_amount_collected: 0,
  total_refund_amount_emitted: 0,
  total_tickets_per_type: [],
  total_badges_per_type: [],
  total_checked_in_attendees: 0,
  total_non_checked_in_attendees: 0,
  total_virtual_attendees: 0,
  total_virtual_non_checked_in_attendees: 0,
  total_tickets_per_badge_feature: [],
  attendee_checkins: [],
  timeUnit: 'Day'
};

const summitStatsReducer = (state = DEFAULT_STATE, action) => {
  const {type, payload} = action
  switch (type) {
    case LOGOUT_USER: {
      return DEFAULT_STATE
    }
    case REQUEST_SUMMIT: {
      return DEFAULT_STATE
    }
    case RECEIVE_SUMMIT: {
      let entity = {...payload.response};
      return {...state, summitTZ: entity.time_zone_id}
    }
    case REGISTRATION_DATA_REQUESTED: {
      return {...state, loadingData: true, attendees: []};
    }
    case RECEIVE_REGISTRATION_STATS: {
      const stats = payload.response;
      return {...state, ...stats};
    }
    case REQUEST_ATTENDEE_CHECK_INS: {
      return {...state, timeUnit: payload.timeUnit, loadingData: true}
    }
    case RECEIVE_ATTENDEE_CHECK_INS: {
      const {data, current_page, last_page} = payload.response;
      const attendee_checkins = current_page === 1 ? data : [...state.attendee_checkins, ...data];
      const loadingData = current_page < last_page;
      return {...state, attendee_checkins, loadingData};
    }
    case REGISTRATION_DATA_LOADED: {
      return {...state, loadingData: false}
    }
    default:
      return state;
  }

}

export default summitStatsReducer
