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
import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import {
    getUnScheduleEventsPage,
    publishEvent,
    changeCurrentSelectedDay,
    changeCurrentSelectedLocation,
    getPublishedEventsBySummitDayLocation,
    changeCurrentEventType,
    changeCurrentTrack,
    changeCurrentPresentationSelectionStatus
} from '../../actions/summit-builder-actions';
import UnScheduleEventList from './unschedule-event-list';
import ScheduleEventList from './schedule-event-list';
import SummitEvent from '../../models/summit-event';
import { DefaultEventMinutesDuration, PixelsPerMinute } from '../../constants';
import ScheduleAdminDaySelector from './schedule-admin-day-selector';
import ScheduleAdminVenueSelector from './schedule-admin-venue-selector';
import ScheduleAdminEventTypeSelector from './schedule-admin-event-type-selector';
import ScheduleAdminTrackSelector from './schedule-admin-track-selector';
import ScheduleAdminPresentationSelectionStatusSelector from './schedule-admin-presentation-selection-status-selector';
import T from "i18n-react/dist/i18n-react";

import moment from 'moment-timezone';

class ScheduleAdminDashBoard extends React.Component {

    constructor(props){
        super(props);
        this.onScheduleEvent                      = this.onScheduleEvent.bind(this);
        this.onScheduleEventWithDuration          = this.onScheduleEventWithDuration.bind(this);
        this.onDayChanged                         = this.onDayChanged.bind(this);
        this.onVenueChanged                       = this.onVenueChanged.bind(this);
        this.onUnScheduleEventsPageChange         = this.onUnScheduleEventsPageChange.bind(this);
        this.onEventTypeChanged                   = this.onEventTypeChanged.bind(this);
        this.onTrackChanged                       = this.onTrackChanged.bind(this);
        this.onPresentationSelectionStatusChanged = this.onPresentationSelectionStatusChanged.bind(this);
    }

    componentDidMount(){
        let { summit, currentEventType, currentTrack, currentPresentationSelectionStatus } = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId     = currentTrack == null ? null : currentTrack.id;
        this.props.getUnScheduleEventsPage(summit.id, 1, 10, eventTypeId, trackId, currentPresentationSelectionStatus);
    }

    onScheduleEvent(event, currentDay, startDateTime){
        let eventModel = new SummitEvent(event, this.props.currentSummit);
        this.props.publishEvent(event, currentDay, startDateTime, eventModel.getMinutesDuration());
    }

    componentWillReceiveProps(nextProps){
        if(
            ( nextProps.currentDay != null && nextProps.currentDay != this.props.currentDay && nextProps.currentLocation != null && this.props.currentLocation != null )||
            ( nextProps.currentLocation != null && nextProps.currentLocation != this.props.currentLocation && nextProps.currentDay != null &&  this.props.currentDay != null)
        )
            this.props.getPublishedEventsBySummitDayLocation
            (
                this.props.currentSummit,
                nextProps.currentDay,
                nextProps.currentLocation
            );
    }

    onUnScheduleEventsPageChange(currentPage){
        let { summit } = this.props;
        this.props.getUnScheduleEventsPage(summit.id, currentPage);
    }

    onDayChanged(day){
        this.props.changeCurrentSelectedDay(day);
    }

    onVenueChanged(location){
        this.props.changeCurrentSelectedLocation(location);
    }

    onEventTypeChanged(eventType){
        let { summit, currentTrack, currentPresentationSelectionStatus } = this.props;
        let trackId = currentTrack == null ? null : currentTrack.id;
        let eventTypeId = eventType == null ? null : eventType.id;
        this.props.changeCurrentEventType(eventType);
        this.props.getUnScheduleEventsPage(summit.id, 1, 10, eventTypeId, trackId, currentPresentationSelectionStatus);
    }

    onTrackChanged(track){
        let { summit, currentEventType , currentPresentationSelectionStatus} = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId     = track == null ? null : track.id;
        this.props.changeCurrentTrack(track);
        this.props.getUnScheduleEventsPage(summit.id, 1, 10, eventTypeId, trackId, currentPresentationSelectionStatus);
    }

    onPresentationSelectionStatusChanged(presentationSelectionStatus){
        let { summit, currentEventType, currentTrack } = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId = currentTrack == null ? null : currentTrack.id;
        this.props.changeCurrentPresentationSelectionStatus(presentationSelectionStatus);
        this.props.getUnScheduleEventsPage(summit.id, 1, 10, eventTypeId, trackId, presentationSelectionStatus);
    }

    onScheduleEventWithDuration(event, currentDay, startTime, duration){
        this.props.publishEvent
        (
            event,
            currentDay,
            startTime,
            duration
        );
    }

    render(){
        let {
            scheduleEvents,
            unScheduleEvents,
            childScheduleEvents,
            currentSummit,
            currentDay,
            currentLocation,
            unScheduleEventsCurrentPage,
            unScheduleEventsLasPage,
            currentEventType,
            currentTrack,
            currentPresentationSelectionStatus,
            unScheduleEventsCurrentOrder
        } = this.props;
        // parse summits dates
        let days = [];

        let summitLocalStartDate     = moment(currentSummit.start_date * 1000).tz(currentSummit.time_zone.name);
        let summitLocalEndDate       = moment(currentSummit.end_date * 1000).tz(currentSummit.time_zone.name);
        let currentAuxDay            = summitLocalStartDate.clone();
        let currentDaySelectorItem   = null;
        let currentVenueSelectorItem = null;
        let currentTrackSelectorItem = null;
        let currentEventTypeSelectorItem = null;

        do{
            let option = { value: currentAuxDay.format("YYYY-MM-DD") , label: currentAuxDay.format('MMMM Do YYYY') };
            if(currentDay != null && currentAuxDay.format("YYYY-MM-DD") == currentDay)
                currentDaySelectorItem = option;
            days.push(option);
            currentAuxDay = currentAuxDay.clone();
            currentAuxDay.add(1, 'day');
        } while(!currentAuxDay.isAfter(summitLocalEndDate));


        // parse summit venues
        let venues = [];
        for(let i = 0; i < currentSummit.locations.length; i++) {
            let location = currentSummit.locations[i];
            if (location.class_name != "SummitVenue") continue;
            let option = { value : location, label: location.name };
            if(currentLocation != null && location.id == currentLocation.id)
                currentVenueSelectorItem = option;
            venues.push(option);
            for(let j = 0; j < location.rooms.length ; j++){
                let subOption = { value : location.rooms[j] , label: location.rooms[j].name};
                if(currentLocation != null && location.rooms[j].id == currentLocation.id)
                    currentVenueSelectorItem = subOption;
                venues.push(subOption);
            }
        }

        // parse event types

        let eventTypes = [];

        for(let i = 0; i < currentSummit.event_types.length; i++) {
            let event_type = currentSummit.event_types[i];
            let option = { value : event_type, label: event_type.name };
            if(currentEventType != null && currentEventType.id == event_type.id)
                currentEventTypeSelectorItem = option;
            eventTypes.push(option);
        }

        // parse tracks

        let tracks = [];

        for(let i = 0; i < currentSummit.tracks.length; i++) {
            let track = currentSummit.tracks[i];
            let option = { value : track, label: track.name };
            if(currentTrack != null && currentTrack.id == track.id)
                currentTrackSelectorItem = option;
            tracks.push(option);
        }

        // presentation selection status

        let presentationSelectionStatus = [
            { value : 'selected', label: 'Selected' },
            { value : 'accepted', label:  'Accepted' },
            { value : 'alternate', label: 'Alternate'},
            { value : 'lightning-accepted', label: 'Lightning Accepted' },
            { value : 'lightning-alternate', label: 'Lightning Alternate' },
        ];

        return(
            <div className="row schedule-app-container no-margin">
                <div className="col-md-6 published-container">
                    <ScheduleAdminDaySelector onDayChanged={this.onDayChanged} days={days} currentValue={ currentDaySelectorItem }/>
                    <ScheduleAdminVenueSelector onVenueChanged={this.onVenueChanged} venues={venues} currentValue={ currentVenueSelectorItem } />
                    { currentDay != null && currentLocation != null &&
                        <ScheduleEventList
                        startTime={"07:00"}
                        endTime={"22:00"}
                        currentSummit={currentSummit}
                        interval={DefaultEventMinutesDuration}
                        currentDay={currentDay}
                        pixelsPerMinute={PixelsPerMinute}
                        onScheduleEvent={this.onScheduleEvent}
                        onScheduleEventWithDuration={this.onScheduleEventWithDuration}
                        events={scheduleEvents}
                        childEvents={childScheduleEvents}/>
                    }
                    { (currentDay == null || currentLocation == null) &&
                    <p className="empty-list-message">{T.translate("errors.empty_list_schedule_events")}</p>
                    }
                </div>
                <div className="col-md-6 unpublished-container">
                    <ScheduleAdminEventTypeSelector
                        onEventTypeChanged={this.onEventTypeChanged}
                        eventTypes={eventTypes}
                        currentValue={currentEventTypeSelectorItem}
                    />
                    <ScheduleAdminTrackSelector
                        onTrackChanged={this.onTrackChanged}
                        tracks={tracks}
                        currentValue={currentTrackSelectorItem}
                        />
                    { currentEventType != null && currentEventType.class_name == "PresentationType" &&

                        <ScheduleAdminPresentationSelectionStatusSelector
                            presentationSelectionStatus={presentationSelectionStatus}
                            onPresentationSelectionStatusChanged={this.onPresentationSelectionStatusChanged}
                            currentValue={currentPresentationSelectionStatus}
                        />
                    }
                    <UnScheduleEventList
                        events={ unScheduleEvents }
                        currentPage={ unScheduleEventsCurrentPage }
                        lastPage={ unScheduleEventsLasPage }
                        onPageChange={this.onUnScheduleEventsPageChange}/>
                </div>
            </div>
        );
    }
}

ScheduleAdminDashBoard = DragDropContext(HTML5Backend)(ScheduleAdminDashBoard);

function mapStateToProps({ currentScheduleBuilderState, currentSummitState  }) {
    return {
        scheduleEvents                     : currentScheduleBuilderState.scheduleEvents,
        unScheduleEvents                   : currentScheduleBuilderState.unScheduleEvents,
        childScheduleEvents                : currentScheduleBuilderState.childScheduleEvents,
        currentSummit                      : currentSummitState.currentSummit,
        currentDay                         : currentScheduleBuilderState.currentDay,
        currentLocation                    : currentScheduleBuilderState.currentLocation,
        currentEventType                   : currentScheduleBuilderState.currentEventType,
        currentTrack                       : currentScheduleBuilderState.currentTrack,
        unScheduleEventsCurrentPage        : currentScheduleBuilderState.unScheduleEventsCurrentPage,
        unScheduleEventsLasPage            : currentScheduleBuilderState.unScheduleEventsLasPage,
        unScheduleEventsCurrentOrder       : currentScheduleBuilderState.unScheduleEventsCurrentOrder,
        currentPresentationSelectionStatus : currentScheduleBuilderState.currentPresentationSelectionStatus
    }
}

export default connect(mapStateToProps, {
    getUnScheduleEventsPage,
    publishEvent,
    changeCurrentSelectedDay,
    changeCurrentSelectedLocation,
    getPublishedEventsBySummitDayLocation,
    changeCurrentEventType,
    changeCurrentTrack,
    changeCurrentPresentationSelectionStatus
})(ScheduleAdminDashBoard);