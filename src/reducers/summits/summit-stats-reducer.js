import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/utils/actions';
import {
  REQUEST_SUMMIT,
  SUMMIT_ADDED,
  RECEIVE_SUMMIT
} from '../../actions/summit-actions';

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
    case RECEIVE_SUMMIT: {
      const summit = payload.response;
      const {
        total_active_tickets,
        total_inactive_tickets,
        total_orders,
        total_active_assigned_tickets,
        total_payment_amount_collected,
        total_refund_amount_emitted,
        total_tickets_per_type,
        total_badges_per_type,
        total_checked_in_attendees,
        total_non_checked_in_attendees,
        total_virtual_attendees,
        total_tickets_per_badge_feature
      } = summit;

      return {
        ...state,
        total_active_tickets,
        total_inactive_tickets,
        total_orders,
        total_active_assigned_tickets,
        total_payment_amount_collected,
        total_refund_amount_emitted,
        total_tickets_per_type,
        total_badges_per_type,
        total_checked_in_attendees,
        total_non_checked_in_attendees,
        total_virtual_attendees,
        total_tickets_per_badge_feature}
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
