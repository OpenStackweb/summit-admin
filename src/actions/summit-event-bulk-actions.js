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
import {BulkActionEdit, BulkActionUnPublish} from 'openstack-uicore-foundation/lib/components/schedule-builder-constants';
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
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import { normalizeEvent } from './event-actions';

export const UPDATE_LOCAL_EVENT               = 'UPDATE_LOCAL_EVENT';
export const REQUEST_SELECTED_EVENTS          = 'REQUEST_SELECTED_EVENTS';
export const RECEIVE_SELECTED_EVENTS          = 'RECEIVE_SELECTED_EVENTS';
export const UPDATED_REMOTE_EVENTS            = 'UPDATED_REMOTE_EVENTS';
export const UPDATE_EVENT_SELECTED_STATE      = 'UPDATE_EVENT_SELECTED_STATE';
export const UPDATE_EVENT_SELECTED_STATE_BULK = 'UPDATE_EVENT_SELECTED_STATE_BULK';
export const UPDATE_VALIDATION_STATE          = 'UPDATE_VALIDATION_STATE';
export const UPDATE_LOCATION_BULK             = 'UPDATE_LOCATION_BULK';
export const UPDATE_TYPE_BULK                 = 'UPDATE_TYPE_BULK';
export const UPDATE_START_DATE_BULK           = 'UPDATE_START_DATE_BULK';
export const UPDATE_END_DATE_BULK             = 'UPDATE_END_DATE_BULK';
export const UPDATE_SELECTION_PLAN_BULK       = 'UPDATE_SELECTION_PLAN_BULK';
export const UPDATE_ACTIVITY_TYPE_BULK        = 'UPDATE_ACTIVITY_TYPE_BULK';
export const UPDATE_ACTIVITY_CATEGORY_BULK    = 'UPDATE_ACTIVITY_CATEGORY_BULK';
export const UPDATE_DURATION_BULK             = 'UPDATE_DURATION_BULK';
export const UPDATE_STREAMING_URL_BULK        = 'UPDATE_STREAMING_URL_BULK';
export const UPDATE_STREAMING_TYPE_BULK       = 'UPDATE_STREAMING_TYPE_BULK';
export const UPDATE_MEETING_URL_BULK          = 'UPDATE_MEETING_URL_BULK';
export const UPDATE_ETHERPAD_URL_BULK         = 'UPDATE_ETHERPAD_URL_BULK';

export const getSummitEventsById = (events) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [`id==${events.join('||')}`]

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        'filter[]': filter,
        page: 1,
        per_page: 200
    };

    return getRequest(
      createAction(REQUEST_SELECTED_EVENTS),
      createAction(RECEIVE_SELECTED_EVENTS),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
      authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
        dispatch(createAction(UPDATE_VALIDATION_STATE)({currentSummit}));
    })
};

export const getSummitEventsByFilters = () => async (dispatch, getState) => {
    const { currentSummitState, summitEventsBulkActionsState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const {
        selectedAllUnPublished, selectedUnPublishedEvents, excludedUnPublishedEvents, unPublishedFilter, totalUnPublished
    } = summitEventsBulkActionsState
    const pageSize = 50;

    dispatch(startLoading());

    let lastPage = Math.ceil(totalUnPublished / pageSize);
    const filter = [...unPublishedFilter, `published==0`];

    if (!selectedAllUnPublished && selectedUnPublishedEvents.length > 0) {
        // we don't need the filter criteria, we have the ids
        filter.push(`id==${selectedUnPublishedEvents.join('||')}`);
        lastPage = Math.ceil(selectedUnPublishedEvents.length / pageSize);
    } else if (selectedAllUnPublished && excludedUnPublishedEvents.length > 0) {
        filter.push(`not_id==${excludedUnPublishedEvents.join('||')}`);
        lastPage = Math.ceil((totalUnPublished - excludedUnPublishedEvents.length) / pageSize);
    }

    const params = {
        access_token : accessToken,
        'filter[]': filter,
        page: 1,
        per_page: pageSize
    };

    const promises = [];

    await dispatch(createAction(REQUEST_SELECTED_EVENTS)({}));

    for (let i = 1; i <= lastPage; i++) {
        params.page = i;
        const promise = getRequest(
          null,
          createAction(RECEIVE_SELECTED_EVENTS),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
          authErrorHandler
        )(params)(dispatch);

        promises.push(promise);
    }

    return Promise.all(promises).then(() => {
        dispatch(stopLoading());
        dispatch(createAction(UPDATE_VALIDATION_STATE)({currentSummit}));
    })
};

export const updateEventLocationLocal = (event, location, isValid) => (dispatch) => {

    let mutator = (location, isValid) => event => ({...event, location_id :location.id, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(location, isValid) }))
};

export const updateEventSelectionPlanLocal = (event, selectionPlan, isValid) => (dispatch) => {

    let mutator = (selectionPlan, isValid) => event => ({...event, selection_plan_id :selectionPlan.id, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(selectionPlan, isValid) }))
}

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

export const updateEventActivityTypeLocal = (event, activityType, isValid) => (dispatch) => {

    let mutator = (activityType, isValid) => event => ({...event, type_id: activityType, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(activityType, isValid)}));
}
export const updateEventActivityCategoryLocal = (event, activityCategory, isValid) => (dispatch) => {

    let mutator = (activityCategory, isValid) => event => ({...event, track_id: activityCategory, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(activityCategory, isValid)}));
}
export const updateEventDurationLocal = (event, duration, isValid) => (dispatch) => {

    let mutator = (duration, isValid) => event => ({...event, duration: duration, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(duration, isValid)}));
}
export const updateEventStreamingURLLocal = (event, streamingURL, isValid) => (dispatch) => {

    let mutator = (streamingURL, isValid) => event => ({...event, streaming_url: streamingURL, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(streamingURL, isValid)}));
}
export const updateEventStreamingTypeLocal = (event, streamingType, isValid) => (dispatch) => {

    let mutator = (streamingType, isValid) => event => ({...event, streaming_type: streamingType, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(streamingType, isValid)}));
}
export const updateEventMeetingURLLocal = (event, meetingURL, isValid) => (dispatch) => {

    let mutator = (meetingURL, isValid) => event => ({...event, meeting_url: meetingURL, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(meetingURL, isValid)}));
}
export const updateEventEtherpadURLLocal = (event, etherpadURL, isValid) => (dispatch) => {

    let mutator = (etherpadURL, isValid) => event => ({...event, etherpad_link: etherpadURL, is_valid: isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(etherpadURL, isValid)}));
}

export const updateEvents = (summitId, events) =>  async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    dispatch(startLoading());

    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events: normalizeBulkEvents(events.map((event) => normalizeEvent(event, currentSummit.event_types.find(et => et.id === event.type_id))))
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

export const updateAndPublishEvents = (summitId, events) =>  async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();
    const { currentSummitState: { currentSummit } } = getState();
    dispatch(startLoading());

    events = events.map((event) => normalizeEvent(event, currentSummit.event_types.find(et => et.id === event.type_id)));
    const normalizedEvents = normalizeBulkEvents(events);
    dispatch(stopLoading());
    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events: normalizedEvents
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
                        events: normalizedEvents.map((event) => ({
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

export const setEventSelectedState = (event, selected) => (dispatch) => {
    dispatch(createAction(UPDATE_EVENT_SELECTED_STATE)({event, selected}));
}

export const setBulkEventSelectedState = (selectedState) => (dispatch) => {
    dispatch(createAction(UPDATE_EVENT_SELECTED_STATE_BULK)({selectedState} ));
}

export const editBulkAction = (events) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const { currentSummit } = currentSummitState;

    const query = {events};

    let url = URI(`/app/summits/${currentSummit.id}/events/bulk-actions`);
    url     = url.query(query);
    history.push(url.toString());
}

export const unPublishBulkAction = (eventIds) => async (dispatch, getState) => {
    const { currentSummitState,  currentScheduleBuilderState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }                       = currentSummitState;
    const { currentDay,  currentLocation }        = currentScheduleBuilderState;

    const params = {
        access_token: accessToken
    }
    dispatch(startLoading());

    deleteRequest(
      null,
      createAction(UPDATED_REMOTE_EVENTS)({}),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/publish`,
      { events : eventIds},
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
            dispatch(stopLoading());
            getPublishedEventsBySummitDayLocation(currentSummit, currentDay, currentLocation)(dispatch, getState);
        }
      );
}

export const updateEventsLocationLocal = (location) => (dispatch) => {
    dispatch(createAction(UPDATE_LOCATION_BULK)({location}));
}

export const updateEventsSelectionPlanLocal =  (selectionPlan) => (dispatch) => {
    dispatch(createAction(UPDATE_SELECTION_PLAN_BULK)({selectionPlan}));
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

export const updateEventsActivityTypeLocal = (activityType) => (dispatch) => {
    dispatch(createAction(UPDATE_ACTIVITY_TYPE_BULK)({activityType}));
}
export const updateEventsActivityCategoryLocal = (activityCategory) => (dispatch) => {
    dispatch(createAction(UPDATE_ACTIVITY_CATEGORY_BULK)({activityCategory}));
}
export const updateEventsDurationLocal = (duration) => (dispatch) => {
    dispatch(createAction(UPDATE_DURATION_BULK)({duration}));
}
export const updateEventsStreamingURLLocal = (streamingURL) => (dispatch) => {
    dispatch(createAction(UPDATE_STREAMING_URL_BULK)({streamingURL}));
}
export const updateEventsStreamingTypeLocal = (streamingType) => (dispatch) => {
    dispatch(createAction(UPDATE_STREAMING_TYPE_BULK)({streamingType}));
}
export const updateEventsMeetingURLLocal = (meetingURL) => (dispatch) => {
    dispatch(createAction(UPDATE_MEETING_URL_BULK)({meetingURL}));
}
export const updateEventsEtherpadURLLocal = (etherpadURL) => (dispatch) => {
    dispatch(createAction(UPDATE_ETHERPAD_URL_BULK)({etherpadURL}));
}

const normalizeBulkEvents = (entity) => {
    const normalizedEntity = entity.map(e => {
        const normalizedEvent = {
            id: e.id,
            title: e.title,
            selection_plan_id: e.selection_plan_id,
            location_id: e.location_id,
            start_date: e.start_date,
            end_date: e.end_date,
            type_id: e.type_id,
            track_id: e.track_id,
            duration: e.duration,
            streaming_url: e.streaming_url,
            streaming_type: e.streaming_type,
            meeting_url: e.meeting_url,
            etherpad_link: e.etherpad_link   
        }
        for (let property in normalizedEvent) {
            if (normalizedEvent[property] === undefined || normalizedEvent[property] === null) {
                delete normalizedEvent[property];
            }
        }
        return normalizedEvent;
    });
    return normalizedEntity;
}