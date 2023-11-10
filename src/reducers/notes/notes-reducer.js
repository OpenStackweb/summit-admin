/**
 * Copyright 2022 OpenStack Foundation
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

import moment from 'moment-timezone';
import
{
    CLEAR_NOTES_PARAMS,
    REQUEST_NOTES,
    RECEIVE_NOTES,
    NOTE_ADDED,
    NOTE_DELETED
} from '../../actions/notes-actions';

import {RECEIVE_SUMMIT, SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { parseSpeakerAuditLog } from '../../utils/methods';

const DEFAULT_STATE = {
    summitId                : null,
    notes                   : [],
    currentPage             : 1,
    lastPage                : 1,
    perPage                 : 10,
    order                   : 'created',
    orderDir                : -1,
    totalNotes              : 0
};

const notesReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_SUMMIT:
        case SET_CURRENT_SUMMIT: {
            const summitId = payload.response.id;
            return {...DEFAULT_STATE, summitId };
        }
        case CLEAR_NOTES_PARAMS:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_NOTES: {
            const {order, orderDir} = payload;
            return {...state, order, orderDir }
        }
        case RECEIVE_NOTES: {
            const { current_page, total, last_page } = payload.response;
            const notes = payload.response.data.map(note => formatNote(note, state.summitId));

            return {...state, notes, totalNotes: total, currentPage: current_page, lastPage: last_page };
        }
        case NOTE_DELETED: {
            const {noteId} = payload;
            return {...state, notes: state.notes.filter(n => n.id !== noteId)};
        }
        case NOTE_ADDED: {
            return {...state, notes: [formatNote(payload.response, state.summitId), ...state.notes ]};
        }
        default:
            return state;
    }
};

const formatNote = (note, summitId) => {
    return {
        ...note,
        author_fullname: `${note.author?.first_name} ${note.author?.last_name}`,
        author_email: note.author?.email,
        created: moment(note.created * 1000).format('MMMM Do YYYY, h:mm a'),
        ticket_link: note.ticket ? `<a href="/app/summits/${summitId}/purchase-orders/${note.ticket.order_id}/tickets/${note.ticket.id}">${note.ticket.id}</a>` : '-',
        ticket_id: note.ticket?.id
    };
}

export default notesReducer;
