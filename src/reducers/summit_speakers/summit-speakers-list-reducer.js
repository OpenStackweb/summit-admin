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
import React from "react";

import {
    REQUEST_SPEAKERS_BY_SUMMIT,
    RECEIVE_SPEAKERS_BY_SUMMIT,
    SELECT_SUMMIT_SPEAKER,
    UNSELECT_SUMMIT_SPEAKER,
    SELECT_ALL_SUMMIT_SPEAKERS,
    UNSELECT_ALL_SUMMIT_SPEAKERS,
    SEND_SPEAKERS_EMAILS,
    SET_SPEAKERS_CURRENT_FLOW_EVENT
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import ReactTooltip from "react-tooltip";

const DEFAULT_STATE = {
    speakers: [],
    term: null,
    order: 'full_name',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalSpeakers: 0,
    selectedSpeakers: [],
    selectedAll: false,
    selectionPlanFilter: [],
    trackFilter: [],
    activityTypeFilter: [],
    selectionStatusFilter: [],
    currentFlowEvent: '',
    currentSummitId: null
};

const summitSpeakersListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
            break;
        case REQUEST_SPEAKERS_BY_SUMMIT: {
            let { order, orderDir, term, page, perPage, ...rest } = payload;
            return { ...state, order, orderDir, term, currentPage: page, perPage, ...rest }
        }
            break;
        case RECEIVE_SPEAKERS_BY_SUMMIT: {
            let { current_page, total, last_page } = payload.response;

            let speakers = payload.response.data.map(s => {

                const acceptedPresentationsToolTip = s.accepted_presentations.reduce(
                    (ac, ap) => ac +(ac !== '' ? '<br>':'') + `<a href="/app/summits/${state.currentSummitId}/events/${ap.id}">${ap.title}</a>`, ''
                );

                const rejectedPresentationsToolTip = s.rejected_presentations.reduce(
                    (ac, ap) => ac +(ac !== '' ? '<br>':'') + `<a href="/app/summits/${state.currentSummitId}/events/${ap.id}">${ap.title}</a>`, ''
                );

                const alternatePresentationsToolTip = s.alternate_presentations.reduce(
                    (ac, ap) => ac +(ac !== '' ? '<br>':'') + `<a href="/app/summits/${state.currentSummitId}/events/${ap.id}">${ap.title}</a>`, ''
                );

                return {
                ...s,
                    full_name: `${s.first_name} ${s.last_name}`,
                    accepted_presentations_count : s.accepted_presentations.length > 0 ?
                    <a data-tip={acceptedPresentationsToolTip} data-for={`accepted_${s.id}`}
                       onClick={ev => { ev.stopPropagation()}}
                       href="#">{s.accepted_presentations.length}
                        <ReactTooltip
                            id={`accepted_${s.id}`}
                            multiline={true}
                            clickable={true}
                            border={true}
                            getContent={(dataTip) =>
                                <div className="tooltip-popover"
                                     dangerouslySetInnerHTML={{__html: dataTip}}
                                />
                            }
                            place='bottom'
                            type='light'
                            effect='solid'
                        />
                    </a>
                    : 'N/A',
                alternate_presentations_count :
                    s.alternate_presentations.length > 0 ?
                        <a data-tip={alternatePresentationsToolTip} data-for={`alternate_${s.id}`}
                           onClick={ev => { ev.stopPropagation()}}
                           href="#">{s.alternate_presentations.length}
                            <ReactTooltip
                                id={`alternate_${s.id}`}
                                multiline={true}
                                clickable={true}
                                border={true}
                                getContent={(dataTip) =>
                                    <div className="tooltip-popover"
                                         dangerouslySetInnerHTML={{__html: dataTip}}
                                    />
                                }
                                place='bottom'
                                type='light'
                                effect='solid'
                            />
                        </a>
                        : 'N/A',
                rejected_presentations_count : s.rejected_presentations.length > 0 ?
                    <a data-tip={rejectedPresentationsToolTip} data-for={`rejected_${s.id}`}
                       onClick={ev => { ev.stopPropagation()}}
                       href="#">{s.rejected_presentations.length}
                        <ReactTooltip
                            id={`rejected_${s.id}`}
                            multiline={true}
                            clickable={true}
                            border={true}
                            getContent={(dataTip) =>
                                <div className="tooltip-popover"
                                     dangerouslySetInnerHTML={{__html: dataTip}}
                                />
                            }
                            place='bottom'
                            type='light'
                            effect='solid'
                        /></a>
            : 'N/A'
            }});

            return {
                ...state,
                speakers: speakers,
                currentPage: current_page,
                totalSpeakers: total,
                lastPage: last_page,
            };
        }
            break;
        case SELECT_SUMMIT_SPEAKER: {
            return { ...state, selectedSpeakers: [...state.selectedSpeakers, payload], selectedAll: false }
        }
            break;
        case UNSELECT_SUMMIT_SPEAKER: {
            return { ...state, selectedSpeakers: state.selectedSpeakers.filter(e => e !== payload), selectedAll: false }
        }
            break;
        case SELECT_ALL_SUMMIT_SPEAKERS: {
            return { ...state, selectedAll: true, selectedSpeakers:[] }
        }
            break;
        case UNSELECT_ALL_SUMMIT_SPEAKERS: {
            return { ...state, selectedAll: false, selectedSpeakers:[]  }
        }
            break;
        case SEND_SPEAKERS_EMAILS: {
            return {
                ...state,
                selectedSpeakers: [],
                currentFlowEvent: '',
                selectedAll: false
            }
        }
            break;
        case SET_SPEAKERS_CURRENT_FLOW_EVENT: {
            return { ...state, currentFlowEvent: payload };
        }
            break;
        default:
            return state;
    }
};

export default summitSpeakersListReducer;
