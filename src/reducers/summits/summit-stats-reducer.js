import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/security/actions';
import { REQUEST_SUMMIT } from '../../actions/summit-actions';
import {RECEIVE_REGISTRATION_STATS} from '../../actions/summit-stats-actions'

const DEFAULT_STATE = {
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
  total_tickets_per_badge_feature: []
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
    case RECEIVE_REGISTRATION_STATS: {
      const stats = payload.response;
      return {...state, ...stats};
    }
    default:
      return state;
  }

}

export default summitStatsReducer
