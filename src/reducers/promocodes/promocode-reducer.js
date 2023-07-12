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
    RECEIVE_PROMOCODE,
    RECEIVE_PROMOCODE_META,
    RESET_PROMOCODE_FORM,
    UPDATE_PROMOCODE,
    PROMOCODE_UPDATED,
    PROMOCODE_ADDED,
    EMAIL_SENT,
    DISCOUNT_TICKET_ADDED,
    DISCOUNT_TICKET_DELETED,
    SPEAKER_ASSIGNED_LOCALLY,
    SPEAKER_UNASSIGNED,
    SPEAKER_UNASSIGNED_LOCALLY,
    GET_ASSIGNED_SPEAKERS_LOCALLY,
    RECEIVE_ASSIGNED_SPEAKERS,
    REQUEST_ASSIGNED_SPEAKERS
} from '../../actions/promocode-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_SPEAKERS_ASSIGNMENT_STATE = {
    term          : null,
    speakers_list : [],
    filtered_speakers_list : [],
    order         : 'id',
    orderDir      : 1,
    currentPage   : 1,
    lastPage      : 1,
    perPage       : 10,
    totalSpeakers : 0
};

export const DEFAULT_ENTITY = {
    id                      : 0,
    owner                   : null,
    speaker                 : null,
    speakers                : DEFAULT_SPEAKERS_ASSIGNMENT_STATE,
    sponsor                 : null,
    first_name              : '',
    last_name               : '',
    email                   : '',
    type                    : '',
    class_name              : null,
    code                    : '',
    email_sent              : false,
    redeemed                : false,
    quantity_available      : '',
    quantity_used           : 0,
    valid_since_date        : '',
    valid_until_date        : '',
    badge_features          : [],
    allowed_ticket_types    : [],
    ticket_types_rules      : [],
    apply_to_all_tix        : true,
    badge_features_apply_to_all_tix_retroactively: false,
    amount                  : '',
    rate                    : '',
    description             : '',
    tags                    : []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
    allTypes    : [],
    allClasses  : []
};

const pageList = (list, page, perPage) => {
    const totalItems = list.length;
    const lastPage = Math.ceil(totalItems / perPage);
    return {pagedList: list.slice((page - 1) * perPage, perPage + page - 1), lastPage};
};

const promocodeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_PROMOCODE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY, speakers: {...DEFAULT_SPEAKERS_ASSIGNMENT_STATE}}, errors: {} };
        }
        break;
        case RECEIVE_PROMOCODE_META: {
            let types = [...DEFAULT_STATE.allTypes];
            
            let allClasses = [...payload.response];

            allClasses.map(t => {
                types = types.concat(t.type)
            });

            let unique_types = [...new Set( types )];

            return {...state, allTypes: unique_types, allClasses: allClasses }
        }
        break;
        case UPDATE_PROMOCODE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case PROMOCODE_ADDED:
        case RECEIVE_PROMOCODE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.owner = {
                email: entity.email,
                first_name: entity.first_name,
                last_name: entity.last_name,
            };
            entity.speakers = state.entity.speakers

            const discount_classes = ['SPEAKER_DISCOUNT_CODE', 'SPONSOR_DISCOUNT_CODE', 'MEMBER_DISCOUNT_CODE', 'SUMMIT_DISCOUNT_CODE', 'SPEAKERS_DISCOUNT_CODE'];
            
            if (discount_classes.includes(entity.class_name)){
                entity.apply_to_all_tix = entity.ticket_types_rules.length === 0;
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case PROMOCODE_UPDATED: {
            return {...state, entity: {...state.entity, badge_features_apply_to_all_tix_retroactively: false}};
        }
        break;
        case DISCOUNT_TICKET_ADDED: {
            let ticket = {...payload.response};
            return {...state, entity: {...state.entity, ticket_types_rules: ticket.ticket_types_rules, apply_to_all_tix: false, badge_features_apply_to_all_tix_retroactively: false} };
        }
        break;
        case DISCOUNT_TICKET_DELETED: {
            let {ticketId} = payload;
            let ticket_types_rules = state.entity.ticket_types_rules.filter(tr => tr.id !== ticketId);
            return {...state, entity: {...state.entity, ticket_types_rules, apply_to_all_tix: false, badge_features_apply_to_all_tix_retroactively: false } };
        }
        break;
        case EMAIL_SENT: {
            return {...state, entity: {...state.entity, email_sent: true}};
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case SPEAKER_ASSIGNED_LOCALLY: {
            const {entity} = payload;
            const {speaker, speakers} = entity;
            const {currentPage, perPage} = speakers;

            const assignment = {
                id: speaker.id,
                full_name: `${speaker.first_name} ${speaker.last_name}`,
                email: speaker.email,
                email_sent: false,
                redeemed: false
            };
            let speakersList = [...speakers.speakers_list.filter(s => s.id !== assignment.id), assignment]; 
            const {pagedList, lastPage} = pageList(speakersList, currentPage, perPage);

            const qtyAvailable = state.entity.quantity_available ? parseInt(state.entity.quantity_available) + 1 : 1;

            return {...state, entity: {...entity, speaker: null, quantity_available: qtyAvailable,
                speakers: {...speakers, speakers_list: speakersList, filtered_speakers_list: pagedList, lastPage} } };
        }
        case GET_ASSIGNED_SPEAKERS_LOCALLY: {
            let {promoCodeClassName, term, page, perPage, order, orderDir} = payload;
            
            let speakersList = state.entity.speakers.speakers_list;

            if (term) speakersList = speakersList.filter(s => s.full_name.toUpperCase().startsWith(term.toUpperCase()) || s.email.toUpperCase().startsWith(term.toUpperCase()));

            speakersList = speakersList.sort((a, b) => {
                const itemA = a[order];
                const itemB = b[order];
                if (itemA < itemB) return orderDir * -1;
                if (itemA > itemB) return orderDir * 1;
                return 0;
            });

            const {pagedList, lastPage} = pageList(speakersList, page, perPage);

            const speakersInfo = {
                ...state.entity.speakers,
                filtered_speakers_list : pagedList,
                order,
                orderDir,
                currentPage : page,
                perPage,
                lastPage,
                term
            }
            return {...state, entity: {...state.entity, class_name: promoCodeClassName, speakers: speakersInfo } };
        }
        case SPEAKER_UNASSIGNED:
        case SPEAKER_UNASSIGNED_LOCALLY: {
            let {speakerId} = payload;
            const {currentPage, perPage} = state.entity.speakers;

            let speakersList = state.entity.speakers.speakers_list.filter(s => s.id !== speakerId);

            const {pagedList, lastPage} = pageList(speakersList, currentPage, perPage);

            const qtyAvailable = state.entity.quantity_available ? parseInt(state.entity.quantity_available) - 1 : 0;

            return {...state, entity: {...state.entity, speaker: null, quantity_available: qtyAvailable, 
                speakers: {...state.entity.speakers, speakers_list: speakersList, filtered_speakers_list: pagedList, lastPage} } };
        }
        case REQUEST_ASSIGNED_SPEAKERS: {
            return {...state, entity: {...payload.entity} };
        }
        case RECEIVE_ASSIGNED_SPEAKERS: {
            let {current_page, data, last_page, per_page, total} = {...payload.response};

            const speakersList =  data.map(assigment => {return {
                ...assigment.speaker, 
                email_sent: assigment.sent, 
                redeemed: assigment.redeemed,
                full_name: `${assigment.speaker.first_name} ${assigment.speaker.last_name}`}
            });

            const speakersInfo = {
                speakers_list : speakersList,
                filtered_speakers_list : speakersList,
                currentPage   : current_page,
                lastPage      : last_page,
                perPage       : per_page,
                totalSpeakers : total
            }

            return {...state, entity: {...state.entity, speaker: null, quantity_available: total, speakers: speakersInfo} };
        }
        default:
            return state;
    }
};

export default promocodeReducer;