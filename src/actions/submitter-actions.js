/**
 * Copyright 2023 OpenStack Foundation
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

import T from "i18n-react/dist/i18n-react";
import {
    getRequest,
    putRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    getCSV,
    authErrorHandler,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import {SpeakersSources as sources} from "../utils/constants";

export const INIT_SUBMITTERS_LIST_PARAMS       = 'INIT_SUBMITTERS_LIST_PARAMS';

export const REQUEST_SUBMITTERS_BY_SUMMIT      = 'REQUEST_SUBMITTERS_BY_SUMMIT';
export const RECEIVE_SUBMITTERS_BY_SUMMIT      = 'RECEIVE_SUBMITTERS_BY_SUMMIT';
export const SELECT_SUMMIT_SUBMITTER           = 'SELECT_SUMMIT_SUBMITTER';
export const UNSELECT_SUMMIT_SUBMITTER         = 'UNSELECT_SUMMIT_SUBMITTER';
export const SELECT_ALL_SUMMIT_SUBMITTERS      = 'SELECT_ALL_SUMMIT_SUBMITTERS';
export const UNSELECT_ALL_SUMMIT_SUBMITTERS    = 'UNSELECT_ALL_SUMMIT_SUBMITTERS';
export const SEND_SUBMITTERS_EMAILS            = 'SEND_SUBMITTERS_EMAILS';
export const SET_SUBMITTERS_CURRENT_FLOW_EVENT = 'SET_SUBMITTERS_CURRENT_FLOW_EVENT';

export const initSubmittersList = () => async (dispatch, getState) => {
    dispatch(createAction(INIT_SUBMITTERS_LIST_PARAMS)());
}

export const getSubmittersBySummit = (term = null, page = 1, perPage = 10, order = 'full_name', orderDir = 1, filters = {}, source = null) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    const filter = parseFilters(filters);

    if (source === sources.submitters_no_speakers) {
        filter.push('is_speaker==false');
    }

    dispatch(startLoading());

    if(term) {
        let filterTerm = buildTermFilter(term);

        filter.push(
            filterTerm.join(',')
        );
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'accepted_presentations,alternate_presentations,rejected_presentations',
        relations    : 'accepted_presentations,alternate_presentations,rejected_presentations',
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        if(order === '') order = 'full_name';
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_SUBMITTERS_BY_SUMMIT),
        createAction(RECEIVE_SUBMITTERS_BY_SUMMIT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submitters`,
        authErrorHandler,
        {order, orderDir, page, perPage, term, ...filters, currentSummitId: currentSummit.id}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const exportSummitSubmitters = (term = null, order = 'id', orderDir = 1, filters = {}, source = null) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Submitters.csv';
    const params = {
        access_token : accessToken
    };
    
    const filter = parseFilters(filters);

    if (source === sources.submitters_no_speakers) {
        filter.push('is_speaker==false');
    }

    if(term) {
        let filterTerm = buildTermFilter(term);

        filter.push(
            filterTerm.join(',')
        );
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submitters/csv`, params, filename));
}

/**
 * @param currentFlowEvent
 * @param selectedAll
 * @param selectedIds
 * @param testRecipient
 * @param excerptRecipient
 * @param shouldSendCopy2Submitter
 * @param term
 * @param filters
 * @param source
 * @returns {function(*=, *): *}
 */
export const sendSubmitterEmails = (currentFlowEvent,
                           selectedAll = false ,
                           selectedIds = [],
                           testRecipient = '',
                           excerptRecipient= '',
                           // not used only left to keep the signature
                           shouldSendCopy2Submitter = false,
                           term = '',
                           filters = {},
                           source = null
                           ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    const filter = parseFilters(filters);

    if (source && source === sources.submitters_no_speakers) {
        filter.push('is_speaker==false');
    }

    if(term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(
            [
                `full_name@@${escapedTerm}`,
                `email=@${escapedTerm}`,
                `presentations_title=@${escapedTerm}`,
                `presentations_abstract=@${escapedTerm}`
            ].join(',')
        );
    }

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent,
    };

    if(!selectedAll && selectedIds.length > 0){
        payload['submitter_ids'] = selectedIds;
    }

    if(testRecipient) {
        payload['test_email_recipient'] = testRecipient;
    }

    if(excerptRecipient){
        payload['outcome_email_recipient'] = excerptRecipient
    }

    dispatch(startLoading());

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("summit_submitters_list.resend_done"),
        type: 'success'
    };

    return putRequest(
        null,
        createAction(SEND_SUBMITTERS_EMAILS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submitters/all/send`,
        payload,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
            ));
            dispatch(stopLoading());
            return payload;
        });
};

export const selectSummitSubmitter = (submitterId) => (dispatch) => {
    dispatch(createAction(SELECT_SUMMIT_SUBMITTER)(submitterId));
};

export const unselectSummitSubmitter = (submitterId) => (dispatch) => {
    dispatch(createAction(UNSELECT_SUMMIT_SUBMITTER)(submitterId));
};

export const selectAllSummitSubmitters = () => (dispatch) => {
    dispatch(createAction(SELECT_ALL_SUMMIT_SUBMITTERS)());
}

export const unselectAllSummitSubmitters = () => (dispatch) => {
    dispatch(createAction(UNSELECT_ALL_SUMMIT_SUBMITTERS)());
}

export const setCurrentSubmitterFlowEvent = (value) => (dispatch) => {
    dispatch(createAction(SET_SUBMITTERS_CURRENT_FLOW_EVENT)(value));
};

const parseFilters = (filters) => {

    const filter = [];

    if(filters.hasOwnProperty('selectionPlanFilter') && Array.isArray(filters.selectionPlanFilter)
        && filters.selectionPlanFilter.length > 0){
        filter.push('presentations_selection_plan_id=='+filters.selectionPlanFilter.reduce(
            (accumulator, sp) => accumulator +(accumulator !== '' ? '||':'') +`${sp}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('trackFilter') && Array.isArray(filters.trackFilter)
        && filters.trackFilter.length > 0){
        filter.push('presentations_track_id=='+filters.trackFilter.reduce(
            (accumulator, t) => accumulator +(accumulator !== '' ? '||':'') +`${t}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('activityTypeFilter') && Array.isArray(filters.activityTypeFilter)
        && filters.activityTypeFilter.length > 0){
        filter.push('presentations_type_id=='+filters.activityTypeFilter.reduce(
            (accumulator, at) => accumulator +(accumulator !== '' ? '||':'') +`${at}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('selectionStatusFilter')
        && Array.isArray(filters.selectionStatusFilter)
        && filters.selectionStatusFilter.length > 0 ) {

        // exclusive filters
        if(filters.selectionStatusFilter.includes('only_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('only_accepted')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('only_alternate')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==true');
        }
        else if(filters.selectionStatusFilter.includes('accepted_alternate')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==true');
        }
        else if(filters.selectionStatusFilter.includes('accepted_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('alternate_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==true');
        }
        else {
           filter.push(filters.selectionStatusFilter.reduce(
               (accumulator, at) => accumulator + (accumulator !== '' ? ',' : '') + `has_${at}_presentations==true`,
               ''
           ));
       }
    }

    return filter;
}

const buildTermFilter = (term) => {
    const escapedTerm = escapeFilterValue(term);
       
    let termFilter =  [
        `full_name=@${escapedTerm}`,
        `first_name=@${escapedTerm}`,
        `last_name=@${escapedTerm}`,
        `email=@${escapedTerm}`,
        `presentations_title=@${escapedTerm}`,
        `presentations_abstract=@${escapedTerm}`
    ]

    if (parseInt(escapedTerm)) {
        const filterTermId = parseInt(escapedTerm)
        termFilter = [...termFilter, ...[`id==${filterTermId}`,
            `member_id==${filterTermId}`,
            `member_user_external_id==${filterTermId}`]];
    }

    return termFilter;
}