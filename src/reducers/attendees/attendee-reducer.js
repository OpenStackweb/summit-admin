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
    RSVP_DELETED
} from '../../actions/attendee-actions';

import {AFFILIATION_ADDED, AFFILIATION_DELETED, AFFILIATION_SAVED} from "../../actions/member-actions";

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    member: null,
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    admin_notes: '',
    shared_contact_info: 0,
    summit_hall_checked_in: 0,
    summit_hall_checked_in_date: '',
    tickets: [],
    extra_question_answers: []
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
        case RECEIVE_ATTENDEE: {
            let entity = {...payload.response};


            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.extra_questions) {
                entity.extra_questions = entity.extra_questions.map(q => ({question_id: q.question_id, answer: q.value}))
            }

            return {...state,  entity: {...DEFAULT_ENTITY, ...entity}, errors: {} };
        }
        break;
        case ATTENDEE_UPDATED: {
            return state;
        }
        break;
        case CHANGE_MEMBER: {
            return {...state };
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
        case AFFILIATION_ADDED: {
            let affiliation = {...payload.response};

            if (state.entity.member && state.entity.member.hasOwnProperty('affiliations')) {
                return {
                    ...state,
                    entity: {
                        ...state.entity,
                        member: {
                            ...state.entity.member,
                            affiliations: [...state.entity.member.affiliations, affiliation]
                        }
                    }
                };
            } else {
                return state;
            }

        }
        break;
        case AFFILIATION_DELETED: {
            let {affiliationId} = payload;
            if (state.entity.member && state.entity.member.hasOwnProperty('affiliations')) {
                let affiliations = state.entity.member.affiliations.filter(a => a.id != affiliationId);

                return {
                    ...state,
                    entity: {
                        ...state.entity,
                        member: {
                            ...state.entity.member,
                            affiliations: affiliations
                        }
                    }
                };
            } else {
                return state;
            }

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
