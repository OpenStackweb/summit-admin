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

import T from 'i18n-react/dist/i18n-react'
import URI from "urijs";
import history from '../history'
import {BulkActionEdit, BulkActionUnPublish} from '../utils/constants';
import { getPublishedEventsBySummitDayLocation } from './summit-builder-actions';
import {
    getRequest,
    putRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showSuccessMessage,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';

export const UPDATE_LOCAL_EVENT               = 'UPDATE_LOCAL_EVENT';
export const RECEIVE_SELECTED_EVENTS          = 'REQUEST_SELECTED_EVENTS';
export const UPDATED_REMOTE_EVENTS            = 'UPDATED_REMOTE_EVENTS';
export const UPDATE_EVENT_SELECTED_STATE      = 'UPDATE_EVENT_SELECTED_STATE';
export const UPDATE_EVENT_SELECTED_STATE_BULK = 'UPDATE_EVENT_SELECTED_STATE_BULK';
export const UPDATE_VALIDATION_STATE          = 'UPDATE_VALIDATION_STATE';
export const UPDATE_LOCATION_BULK             = 'UPDATE_LOCATION_BULK';
export const UPDATE_TYPE_BULK                 = 'UPDATE_TYPE_BULK';
export const UPDATE_START_DATE_BULK           = 'UPDATE_START_DATE_BULK';
export const UPDATE_END_DATE_BULK             = 'UPDATE_END_DATE_BULK';

export const getSummitEventsById = (summitId, eventIds ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    dispatch(startLoading());
    let filter = '';
    for(let id of eventIds){
        if(filter!='') filter += ',';
        filter += `id==${id}`;
    }

    let params = {
        access_token : accessToken,
        filter: filter,
        page: 1,
        per_page: eventIds.length < 5 ? 5 : eventIds.length
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTED_EVENTS),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/events`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(createAction(UPDATE_VALIDATION_STATE)({currentSummit}));
        }
    );
};

export const updateEventLocationLocal = (event, location, isValid) => (dispatch) => {

    let mutator = (location, isValid) => event => ({...event, location_id :location.id, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(location, isValid) }))
};

export const updateEventStartDateLocal = (event, startDate, isValid) => (dispatch) => {

    let mutator = (startDate, isValid) => event => ({...event, start_date : startDate, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(startDate, isValid) }))
};

export const updateEventEndDateLocal = (event, endDate, isValid) => (dispatch) => {

    let mutator = (endDate, isValid) => event => ({...event, end_date : endDate, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(endDate, isValid) }))
};

export const updateEventTitleLocal = (event, title, isValid) => (dispatch) => {

    let mutator = ( title, isValid) => event => ({...event, title : title, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(title, isValid) }))
};

export const updateEvents = (summitId, events) =>  (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());

    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events: events.map((event) => ({
                id:event.id,
                title:event.title,
                location_id:event.location_id,
                type_id:event.type_id,
                start_date:event.start_date,
                end_date:event.end_date,
            }))
        },
        authErrorHandler
    )({})(dispatch)
        .then(
            () => {
                dispatch(stopLoading());
                dispatch(showSuccessMessage(T.translate("bulk_actions_page.messages.update_success")))
            }
        )
        .catch(()=> {
            console.log("ERROR");
        });
}

export const updateAndPublishEvents = (summitId, events) =>  (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());

    events = events.map((event) => ({
        id:event.id,
        title:event.title,
        location_id:event.location_id,
        type_id:event.type_id,
        start_date:event.start_date,
        end_date:event.end_date,
    }))
    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events
        },
        authErrorHandler
    )({})(dispatch)
        .then(
            () => {

                putRequest(
                    null,
                    createAction(UPDATED_REMOTE_EVENTS)({}),
                    `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/publish/?access_token=${accessToken}`,
                    {
                        events: events.map((event) => ({
                            id:event.id,
                            location_id:event.location_id,
                            start_date:event.start_date,
                            end_date:event.end_date,
                        }))
                    },
                    authErrorHandler
                )({})(dispatch)
                    .then(
                        () => {
                            dispatch(stopLoading());
                            dispatch(showSuccessMessage(T.translate("bulk_actions_page.messages.update_publish_success")))
                        }
                    );
            }
        );
}

export const setEventSelectedState = (event) => (dispatch) => {
    dispatch(createAction(UPDATE_EVENT_SELECTED_STATE)({event}));
}

export const setBulkEventSelectedState = (events, selectedState, published) => (dispatch) => {
    dispatch(createAction(UPDATE_EVENT_SELECTED_STATE_BULK)({events, selectedState, published} ));
}

export const performBulkAction = (eventsIds, bulkAction, published) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState,  currentScheduleBuilderState } = getState();
    let { accessToken }                         = loggedUserState;
    let { currentSummit }                       = currentSummitState;
    let { currentDay,  currentLocation }        = currentScheduleBuilderState;

    switch(bulkAction){
        case BulkActionEdit:{
            let url = URI(`/app/summits/${currentSummit.id}/events/bulk-actions`);
            url     = url.query({'id[]':eventsIds, 'published': published });
            history.push(url.toString());
        }
        break;
        case BulkActionUnPublish:{
            let params = {
                access_token: accessToken
            }
            dispatch(startLoading());
            deleteRequest(
                null,
                createAction(UPDATED_REMOTE_EVENTS)({}),
                `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/publish`,
                {
                    events : eventsIds
                },
                authErrorHandler
            )(params)(dispatch)
            .then(() => {
                    dispatch(stopLoading());
                    getPublishedEventsBySummitDayLocation(currentSummit, currentDay, currentLocation)(dispatch, getState);
                }
            );
        }
        break;
    }
}

export const updateEventsLocationLocal = (location) => (dispatch) => {
    dispatch(createAction(UPDATE_LOCATION_BULK)({location}));
}

export const updateEventsTypeLocal = (eventType) => (dispatch) => {
    dispatch(createAction(UPDATE_TYPE_BULK)({eventType}));
}

export const updateEventsStartDateLocal = (startDate) => (dispatch) => {
    dispatch(createAction(UPDATE_START_DATE_BULK)({start_date:startDate}));
}

export const updateEventsEndDateLocal = (endDate) => (dispatch) => {
    dispatch(createAction(UPDATE_END_DATE_BULK)({end_date:endDate}));
}
