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
    RECEIVE_ATTENDEE,
    CHANGE_MEMBER,
    RESET_ATTENDEE_FORM,
    UPDATE_ATTENDEE,
    ATTENDEE_UPDATED,
    ATTENDEE_ADDED,
    TICKET_ADDED,
    TICKET_DELETED,
    RSVP_DELETED,
    AFFILIATION_UPDATED,
} from '../../actions/attendee-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    member: null,
    speaker: null,
    shared_contact_info: 0,
    summit_hall_checked_in: 0,
    summit_hall_checked_in_date: '',
    affiliation_id: 0,
    affiliation_owner_id: 0,
    affiliation_title: '',
    affiliation_organization_name: '',
    affiliation_organization_id: 0,
    affiliation_start_date: '',
    affiliation_end_date: '',
    affiliation_current: '',
    tickets: []
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const attendeeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_ATTENDEE_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_ATTENDEE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case ATTENDEE_ADDED:
        case RECEIVE_ATTENDEE: {
            let entity = {...payload.response};


            if (entity.member.hasOwnProperty('affiliations') && entity.member.affiliations.length) {
                let last_affiliation = {...entity.member.affiliations.slice(-1)[0]};

                for(var key in last_affiliation) {
                    if(last_affiliation.hasOwnProperty(key)) {
                        last_affiliation[key] = (last_affiliation[key] == null) ? '' : last_affiliation[key] ;
                    }
                }

                entity.affiliation_id = last_affiliation.id;
                entity.affiliation_owner_id = last_affiliation.owner_id;
                entity.affiliation_title = last_affiliation.job_title;
                entity.affiliation_organization_id = last_affiliation.organization.id;
                entity.affiliation_organization_name = last_affiliation.organization.name;
                entity.affiliation_start_date = last_affiliation.start_date;
                entity.affiliation_end_date = last_affiliation.end_date;
                entity.affiliation_current = last_affiliation.is_current;
            }

            return {...state,  entity: {...entity}, errors: {} };
        }
        break;
        case ATTENDEE_UPDATED: {
            return state;
        }
        break;
        case CHANGE_MEMBER: {
            let {member} = payload;
            let entity = {...state.entity}

            entity.member = {...member};

            if (member.hasOwnProperty('affiliations') && member.affiliations.length) {
                let last_affiliation = {...member.affiliations.slice(-1)[0]};

                for(var key in last_affiliation) {
                    if(last_affiliation.hasOwnProperty(key)) {
                        last_affiliation[key] = (last_affiliation[key] == null) ? '' : last_affiliation[key] ;
                    }
                }

                entity.affiliation_id = last_affiliation.id;
                entity.affiliation_owner_id = last_affiliation.owner_id;
                entity.affiliation_title = last_affiliation.job_title;
                entity.affiliation_organization_id = last_affiliation.organization.id;
                entity.affiliation_organization_name = last_affiliation.organization.name;
                entity.affiliation_start_date = last_affiliation.start_date;
                entity.affiliation_end_date = last_affiliation.end_date;
                entity.affiliation_current = last_affiliation.is_current;
            }

            return {...state,  entity: {...entity} };
        }
        break;
        case TICKET_ADDED: {
            let newTicket = payload.response;
            return {...state, entity: {...state.entity, tickets: [...state.entity.tickets, newTicket] }};
        }
        break;
        case TICKET_DELETED: {
            let {ticketId} = payload;
            return {...state, entity: {...state.entity, tickets: state.entity.tickets.filter(t => t.id != ticketId)}};
        }
        break;
        case RSVP_DELETED: {
            let {rsvpId} = payload;
            return {
                ...state,
                entity: {
                    ...state.entity,
                    member: {
                        ...state.entity.member,
                        rsvp: state.entity.member.rsvp.filter(r => r.id != rsvpId)
                    }
                }
            };
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

export default attendeeReducer;
