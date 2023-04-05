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

import moment from "moment-timezone";
import { ScheduleEventsSearchResultMaxPage } from '../utils/constants';
import { checkProximityEvents } from './event-actions';
import {
    createAction,
    getRequest,
    putRequest,
    startLoading,
    stopLoading,
    deleteRequest,
    authErrorHandler,
    escapeFilterValue
} from "openstack-uicore-foundation/lib/utils/actions";
import {SummitEvent} from "openstack-uicore-foundation/lib/models";
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_UNSCHEDULE_EVENTS_PAGE               = 'REQUEST_UNSCHEDULE_EVENTS_PAGE';
export const RECEIVE_UNSCHEDULE_EVENTS_PAGE               = 'RECEIVE_UNSCHEDULE_EVENTS_PAGE';
export const REQUEST_SCHEDULE_EVENTS_PAGE                 = 'REQUEST_SCHEDULE_EVENTS_PAGE';
export const RECEIVE_SCHEDULE_EVENTS_PAGE                 = 'RECEIVE_SCHEDULE_EVENTS_PAGE';
export const REQUEST_PROPOSED_SCHEDULE                 = 'REQUEST_PROPOSED_SCHEDULE';
export const RECEIVE_PROPOSED_SCHEDULE                 = 'RECEIVE_PROPOSED_SCHEDULE';
export const REQUEST_PUBLISH_EVENT                        = 'REQUEST_PUBLISH_EVENT';
export const ERROR_PUBLISH_EVENT                          = 'ERROR_PUBLISH_EVENT';
export const CHANGE_CURRENT_DAY                           = 'CHANGE_CURRENT_DAY';
export const CHANGE_CURRENT_LOCATION                      = 'CHANGE_CURRENT_LOCATION';
export const CHANGE_CURRENT_EVENT_TYPE                    = 'CHANGE_CURRENT_EVENT_TYPE';
export const CHANGE_CURRENT_TRACK                         = 'CHANGE_CURRENT_TRACK';
export const CHANGE_CURRENT_DURATION                      = 'CHANGE_CURRENT_DURATION';
export const CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS = 'CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS';
export const CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN   = 'CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN';
export const CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM        = 'CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM';
export const CHANGE_CURRENT_SCHEDULE_SEARCH_TERM          = 'CHANGE_CURRENT_SCHEDULE_SEARCH_TERM';
export const CHANGE_CURRENT_ORDER_BY                      = 'CHANGE_CURRENT_ORDER_BY';
export const UNPUBLISHED_EVENT                            = 'UNPUBLISHED_EVENT';
export const RECEIVE_SCHEDULE_EVENTS_SEARCH_PAGE          = 'RECEIVE_SCHEDULE_EVENTS_SEARCH_PAGE';
export const RECEIVE_EMPTY_SPOTS                          = 'RECEIVE_EMPTY_SPOTS';
export const CLEAR_EMPTY_SPOTS                            = 'CLEAR_EMPTY_SPOTS';
export const CLEAR_PUBLISHED_EVENTS                       = 'CLEAR_PUBLISHED_EVENTS';
export const CLEAR_PROPOSED_EVENTS                       = 'CLEAR_PROPOSED_EVENTS';
export const CHANGE_SUMMIT_BUILDER_FILTERS                = 'CHANGE_SUMMIT_BUILDER_FILTERS';
export const SET_SLOT_SIZE                                = 'SET_SLOT_SIZE';
export const SET_SOURCE                                = 'SET_SOURCE';
export const PROPOSED_EVENTS_PUBLISHED                 = 'PROPOSED_EVENTS_PUBLISHED';

export const getUnScheduleEventsPage =
    (
        summitId,
        page             = 1,
        per_page         = 20,
        event_type_id    = null,
        track_id         = null,
        selection_status = null,
        selection_plan   = null,
        term             = null,
        order            = null,
        duration         = null
    ) =>
    async (dispatch, getState) => {
        const accessToken = await getAccessTokenSafely();
        dispatch(startLoading());
        // filters
        const filter = [];

        if(event_type_id != null){
            filter.push(`event_type_id==${event_type_id}`);
        }

        if(track_id != null){
            filter.push(`track_id==${track_id}`);
        }

        if(selection_status != null){
            filter.push(`selection_status==${selection_status}`);
        }

        if(selection_plan != null){
            filter.push(`selection_plan_id==${selection_plan}`);
        }

        if(duration != null){
            if(Array.isArray(duration)) {
                filter.push(`duration>=${duration[0] * 60}`);
                filter.push(`duration<=${duration[1] * 60}`);
            } else {
                filter.push(`duration${duration.replace(/\d/g, '')}${duration.replace(/\D/g, '')*60}`)
            }
        }

        if(term){
            const escapedTerm = escapeFilterValue(term);
            let searchString = `title=@${escapedTerm},abstract=@${escapedTerm},tags=@${escapedTerm},speaker=@${escapedTerm},speaker_email=@${escapedTerm}`;

            if (parseInt(term)) {
                searchString += `,id==${parseInt(term)}`;
            }

            filter.push(searchString);
        }

        const params = {
            page         : page,
            per_page     : per_page,
            access_token : accessToken,
        };

        if(filter.length > 0){
            params['filter[]']= filter;
        }

        // order

        if(order != null){
            params['order']= `+${order}`;
        }

        return getRequest(
            createAction(REQUEST_UNSCHEDULE_EVENTS_PAGE),
            createAction(RECEIVE_UNSCHEDULE_EVENTS_PAGE),
            `${window.API_BASE_URL}/api/v1/summits/${summitId}/events/unpublished`,
            authErrorHandler
        )(params)(dispatch).then(() => {
                dispatch(stopLoading());
            }
        );
    };

export const publishEvent = (event, day, startTime, minutes) =>
    async (dispatch, getState) => {
        const { currentSummitState, currentScheduleBuilderState } = getState();
        const accessToken = await getAccessTokenSafely();
        const { currentSummit }   = currentSummitState;
        const { currentLocation } = currentScheduleBuilderState;

        const eventModel          = new SummitEvent(event, currentSummit);
        eventModel._event.duration = minutes * 60;
        const [eventStarDateTime, eventEndDateTime ] = eventModel.calculateNewDates(day, startTime, minutes);

        dispatch(startLoading());
        putRequest(
            null,
            createAction(REQUEST_PUBLISH_EVENT)(
                {
                    currentSummit,
                    currentLocation,
                    event,
                    day,
                    startTime,
                    minutes,
                }
            ),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${event.id}/publish?access_token=${accessToken}`,
            {
                location_id : currentLocation.id,
                start_date  : eventStarDateTime.valueOf()/1000,
                end_date    : eventEndDateTime.valueOf()/1000,
                duration    : eventModel._event.duration
            },
            authErrorHandler
        )({})(dispatch)
        .then(
            () => {
                dispatch(checkProximityEvents(event, false));
            }
        )
        .catch(() => {

                if(event.is_published)
                    dispatch(createAction(ERROR_PUBLISH_EVENT)({event}));
                dispatch(stopLoading());
        });

}

export const changeCurrentSelectedDay = (currentSelectedDay) => (dispatch, getState) => {
    dispatch(createAction(CHANGE_CURRENT_DAY)(
        {
            day: currentSelectedDay
        }
    ));
}

export const changeCurrentSelectedLocation = (currentSelectedLocation) => (dispatch, getState) => {
    dispatch(createAction(CHANGE_CURRENT_LOCATION)(
        {
            location: currentSelectedLocation
        }
    ));
}

export const changeSlotSize = (slotSize) => (dispatch) => {
    dispatch(createAction(SET_SLOT_SIZE)({slotSize}));
}

export const changeSource = (selectedSource) => (dispatch) => {
    dispatch(createAction(SET_SOURCE)({selectedSource}));
}

export const getPublishedEventsBySummitDayLocation = (currentSummit, currentDay, currentLocation) => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();
    //currentDay            = moment(currentDay, 'YYYY-MM-DD').tz(currentSummit.time_zone.name);
    currentDay              = moment.tz(currentDay, currentSummit.time_zone.name);
    const startDate           = ( currentDay.clone().hours(0).minutes(0).seconds(0).valueOf()) / 1000;
    const endDate             = ( currentDay.clone().hours(23).minutes(59).seconds(59).valueOf()) /1000;

    dispatch(startLoading());
    const page       = 1;
    const per_page   = 100;
    const locationId = currentLocation.id === 0 ? 'tbd': currentLocation.id;
    return getRequest(
        createAction(REQUEST_SCHEDULE_EVENTS_PAGE),
        createAction(RECEIVE_SCHEDULE_EVENTS_PAGE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/events/published?access_token=${accessToken}&filter[]=start_date>=${startDate}&filter[]=end_date<=${endDate}&page=${page}&per_page=${per_page}`,
        authErrorHandler
    )({})(dispatch)
        .then(() =>
            dispatch(stopLoading())
        );
}

const refreshPublishedList = () => async (dispatch, getState) => {
    const {currentSummitState, currentScheduleBuilderState} = getState();
    const { currentSummit }   = currentSummitState;
    const { currentLocation, currentDay } = currentScheduleBuilderState;
    return getPublishedEventsBySummitDayLocation(currentSummit, currentDay, currentLocation)(dispatch, getState);
}

export const getProposedEvents = (summit, proposedSchedDay, proposedSchedLocation, proposedSchedTrack) => async (dispatch, getState) => {
    if (!summit || !proposedSchedDay || !proposedSchedLocation) {
        dispatch(createAction(CLEAR_PROPOSED_EVENTS)({proposedSchedDay, proposedSchedLocation, proposedSchedTrack}));
        return;
    }
    
    const accessToken = await getAccessTokenSafely();
    const proposedSchedDayMoment = moment.tz(proposedSchedDay, summit.time_zone.name);
    const startDate = ( proposedSchedDayMoment.clone().hours(0).minutes(0).seconds(0).valueOf()) / 1000;
    const endDate = ( proposedSchedDayMoment.clone().hours(23).minutes(59).seconds(59).valueOf()) /1000;
    const proposedSchedLocationId = proposedSchedLocation.id === 0 ? 'tbd': proposedSchedLocation.id;
    const filter = [];
    const params = {
        expand: 'summit_event',
        page: 1,
        per_page: 100,
        access_token: accessToken,
    };
    
    filter.push(`start_date>=${startDate}`);
    filter.push(`end_date<=${endDate}`);
    filter.push(`location_id==${proposedSchedLocationId}`);
    
    if(proposedSchedTrack){
        filter.push(`track_id==${proposedSchedTrack.id}`);
    }
    
    if(filter.length > 0){
        params['filter[]']= filter;
    }
    
    dispatch(startLoading());
    
    
    return getRequest(
      createAction(REQUEST_PROPOSED_SCHEDULE),
      createAction(RECEIVE_PROPOSED_SCHEDULE),
      `${window.API_BASE_URL}/api/v1/summits/${summit.id}/proposed-schedules/track-chairs/presentations`,
      authErrorHandler,
      {proposedSchedDay, proposedSchedLocation, proposedSchedTrack}
    )(params)(dispatch)
      .then(() =>
        dispatch(stopLoading())
      );
}

export const publishAllProposed = (eventIds) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const params = { access_token : accessToken };
    dispatch(startLoading());
    
    putRequest(
      null,
      createAction(PROPOSED_EVENTS_PUBLISHED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/proposed-schedules/track-chairs/presentations/all/publish`,
      {event_ids : eventIds},
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
          dispatch(refreshPublishedList());
      });
}

export const changeCurrentEventType = (currentEventType) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_EVENT_TYPE)(
        {
            eventType: currentEventType
        }
    ));
}

export const changeCurrentTrack = (currentTrack) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_TRACK)(
        {
            track: currentTrack
        }
    ));
}


export const changeCurrentDuration = (currentDuration) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_DURATION)(
        {
            duration: currentDuration
        }
    ));
}

export const changeCurrentPresentationSelectionStatus = (currentPresentationSelectionStatus) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS)(
        {
            presentationSelectionStatus: currentPresentationSelectionStatus
        }
    ));
}

export const changeCurrentPresentationSelectionPlan = (currentPresentationSelectionPlan) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN)(
        {
            presentationSelectionPlan: currentPresentationSelectionPlan
        }
    ));
}

export const changeCurrentUnScheduleOrderBy = (orderBy) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_ORDER_BY)(
        {
            orderBy: orderBy
        }
    ));
}

export const changeCurrentUnscheduleSearchTerm = (term) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM)(
        {
            term
        }
    ));
}

export const changeCurrentScheduleSearchTerm = (term) => (dispatch, getState) => {

    dispatch(createAction(CHANGE_CURRENT_SCHEDULE_SEARCH_TERM)(
        {
            term
        }
    ));
}

export const unPublishEvent = (event) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());
    deleteRequest(
        null,
        createAction(UNPUBLISHED_EVENT)(
            {
                event
            }
        ),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${event.id}/publish?access_token=${accessToken}`,
        {},
        authErrorHandler
    )({})(dispatch)
        .then(
            () => {
                dispatch(stopLoading())
            }
        );

}

export const searchScheduleEvents = (term) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState
    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        let searchString = `title=@${escapedTerm},abstract=@${escapedTerm},social_summary=@${term},tags=@${escapedTerm},speaker=@${escapedTerm},speaker_email=@${escapedTerm}`;

        if (parseInt(term)) {
            searchString += `,id==${parseInt(term)}`;
        }

        filter.push(searchString);
    }

    const params = {
        page         : 1,
        per_page     : ScheduleEventsSearchResultMaxPage,
        access_token : accessToken,
        order:'+title,+id'
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    return getRequest(
        null,
        createAction(RECEIVE_SCHEDULE_EVENTS_SEARCH_PAGE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/published`,
        authErrorHandler
    )(params)(dispatch)
        .then(() =>
            dispatch(stopLoading())
        );
}

export const getEmptySpots = (location, fromDate, toDate, gapSize) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        'filter[]': [
            `location_id==${location.id}`,
            `start_date>=${fromDate}`,
            `end_date<=${toDate}`,
            `gap>=${gapSize}`,
        ]
    };

    return getRequest(
        null,
        createAction(RECEIVE_EMPTY_SPOTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/published/empty-spots`,
        authErrorHandler
    )(params)(dispatch)
        .then(() =>
            dispatch(stopLoading())
        );
}

export const clearEmptySpots = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_EMPTY_SPOTS)());
}

export const clearPublishedEvents = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_PUBLISHED_EVENTS)());
}

export const changeSummitBuilderFilters = (filters) => (dispatch, getState) => {
    dispatch(createAction(CHANGE_SUMMIT_BUILDER_FILTERS)(filters))
}
