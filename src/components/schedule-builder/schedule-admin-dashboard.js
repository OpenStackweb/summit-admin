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
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    getUnScheduleEventsPage,
    publishEvent,
    changeCurrentSelectedDay,
    changeCurrentSelectedLocation,
    getPublishedEventsBySummitDayLocation,
    changeCurrentEventType,
    changeCurrentTrack,
    changeCurrentPresentationSelectionStatus,
    changeCurrentPresentationSelectionPlan,
    changeCurrentUnscheduleSearchTerm,
    unPublishEvent,
    changeCurrentScheduleSearchTerm,
    searchScheduleEvents,
    changeCurrentUnScheduleOrderBy,
    getEmptySpots,
    clearEmptySpots,
    clearPublishedEvents,
} from '../../actions/summit-builder-actions';

import { setEventSelectedState, setBulkEventSelectedState, performBulkAction } from '../../actions/summit-event-bulk-actions';
import UnScheduleEventList from './unschedule-event-list';
import ScheduleEventList from './schedule-event-list';
import SummitEvent from '../../models/summit-event';
import {
    BulkActionEdit, BulkActionUnPublish, DefaultEventMinutesDuration, PixelsPerMinute,
    TBALocation
} from '../../utils/constants';
import ScheduleAdminDaySelector from './schedule-admin-day-selector';
import ScheduleAdminVenueSelector from './schedule-admin-venue-selector';
import ScheduleAdminEventTypeSelector from './schedule-admin-event-type-selector';
import ScheduleAdminTrackSelector from './schedule-admin-track-selector';
import ScheduleAdminPresentationSelectionStatusSelector from './schedule-admin-presentation-selection-status-selector';
import ScheduleAdminPresentationSelectionPlanSelector from './schedule-admin-presentation-selection-plan-selector';
import ScheduleAdminSearchFreeTextUnScheduleEvents from './schedule-admin-search-free-text-unschedule-events';
import ScheduleAdminSearchFreeTextScheduleEvents from './schedule-admin-search-free-text-schedule-events';
import ScheduleAdminScheduleEventsSearchResults from './schedule-admin-schedule-events-search-results';
import ScheduleAdminOrderSelector from './schedule-admin-order-selector';
import { withRouter } from 'react-router';
import T from "i18n-react/dist/i18n-react";
import moment from 'moment-timezone';
import FragmentParser from '../../utils/fragmen-parser';
import * as Scroll from 'react-scroll';
import Swal from "sweetalert2";
import ScheduleAdminEmptySpotsModal from './schedule-admin-empty-spots-modal';
import ScheduleAdminEmptySpotsList from './schedule-admin-empty-spots-list';
import ScheduleAdminsBulkActionsSelector from './bulk-actions/schedule-admin-bulk-actions-selector'

class ScheduleAdminDashBoard extends React.Component {

    constructor(props) {
        super(props);

        this.onScheduleEvent                      = this.onScheduleEvent.bind(this);
        this.onScheduleEventWithDuration          = this.onScheduleEventWithDuration.bind(this);
        this.onDayChanged                         = this.onDayChanged.bind(this);
        this.onVenueChanged                       = this.onVenueChanged.bind(this);
        this.onUnScheduleEventsPageChange         = this.onUnScheduleEventsPageChange.bind(this);
        this.onEventTypeChanged                   = this.onEventTypeChanged.bind(this);
        this.onTrackChanged                       = this.onTrackChanged.bind(this);
        this.onPresentationSelectionStatusChanged = this.onPresentationSelectionStatusChanged.bind(this);
        this.onPresentationSelectionPlanChanged   = this.onPresentationSelectionPlanChanged.bind(this);
        this.onUnscheduledEventsFilterTextChanged = this.onUnscheduledEventsFilterTextChanged.bind(this);
        this.onUnPublishEvent                     = this.onUnPublishEvent.bind(this);
        this.onScheduledEventsFilterTextChanged   = this.onScheduledEventsFilterTextChanged.bind(this);
        this.onEditEvent                          = this.onEditEvent.bind(this);
        this.onOrderByChanged                     = this.onOrderByChanged.bind(this);
        this.onFindEmptyClick                     = this.onFindEmptyClick.bind(this);
        this.onCloseModal                         = this.onCloseModal.bind(this);
        this.onFindEmptySpots                     = this.onFindEmptySpots.bind(this);
        this.onClearClick                         = this.onClearClick.bind(this);
        this.onClickSpot                          = this.onClickSpot.bind(this);
        this.onClickSelected                      = this.onClickSelected.bind(this);
        this.onSelectAllPublished                 = this.onSelectAllPublished.bind(this);
        this.onSelectedBulkActionPublished        = this.onSelectedBulkActionPublished.bind(this);
        this.onSelectedBulkActionUnPublished      = this.onSelectedBulkActionUnPublished.bind(this);
        this.onSelectAllUnPublished               = this.onSelectAllUnPublished.bind(this);

        this.fragmentParser     = new FragmentParser();
        this.filters            = this.parseFilterFromFragment();
        this.timeoutHandler     = null;
        this.shouldTestDeepLink = true;
        this.byPassHashRefresh  = false;
        this.state = {
            showModal : false
        }
    }

    parseFilterFromFragment(){
        // read url hash and redirect to event
        let { currentSummit } = this.props;
        if(!currentSummit.id) return;
        var hash    = this.fragmentParser.getParams();
        var filters = {};
        for(let key in hash) {
            let value = hash[key];
            switch(key) {
                case 'day':
                    filters['currentDay'] = value;
                    break;
                case 'location_id':
                    let location = currentSummit.locations.filter((location) => location.id == value).shift()
                    if(location) {
                        filters['currentLocation'] = location;
                    }
                    if(value == 0){ //special case TBD location
                        filters['currentLocation'] = {id : 0, name : 'TBD'};
                    }
                    break;
                case 'event':
                        filters['currentEvent'] = value;
                    break;
                case 'time':
                    filters['currentTime'] = value;
                    break;
                case 'q':
                    filters['currentScheduleEventsSearchTerm'] = decodeURIComponent(value.replace(/\+/g, '%20'));
                    break;
            }
        }
        return filters;
    }

    componentDidMount(){

        let { currentSummit, currentEventType, currentTrack, currentPresentationSelectionStatus, currentPresentationSelectionPlan, currentDay, currentLocation, scheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy } = this.props;
        if(!currentSummit.id) return;

        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId     = currentTrack == null ? null : currentTrack.id;
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan,'', currentUnScheduleOrderBy);

        if(this.filters.hasOwnProperty('currentScheduleEventsSearchTerm')) {
            scheduleEventsCurrentSearchTerm = this.filters['currentScheduleEventsSearchTerm'];
            this.onScheduledEventsFilterTextChanged(scheduleEventsCurrentSearchTerm);
            return;
        }

        if(this.filters.hasOwnProperty('currentDay')) {
            currentDay = this.filters['currentDay'];
            this.props.changeCurrentSelectedDay(currentDay);
        }

        if(this.filters.hasOwnProperty('currentLocation')) {
            currentLocation = this.filters['currentLocation'];
            this.props.changeCurrentSelectedLocation(currentLocation);
        }


        if(window.location.hash == '' && currentDay != null && currentLocation != null){
            this.byPassHashRefresh = true;
            this.fragmentParser.setParam('day', currentDay);
            this.fragmentParser.setParam('location_id', currentLocation.id);
            window.location.hash   = this.fragmentParser.serialize();
        }

        this.updatePublishedList(currentDay, currentLocation);

        window.onhashchange = (event) =>
        {
            if(this.byPassHashRefresh){
                this.byPassHashRefresh = false;
                return;
            }

            this.filters = this.parseFilterFromFragment();
            this.shouldTestDeepLink = true;
            if(this.filters.hasOwnProperty('currentScheduleEventsSearchTerm')) {
                scheduleEventsCurrentSearchTerm = this.filters['currentScheduleEventsSearchTerm'];
                this.onScheduledEventsFilterTextChanged(scheduleEventsCurrentSearchTerm);
                return;
            }

            if(this.filters.hasOwnProperty('currentDay')) {
                currentDay = this.filters['currentDay'];
                this.props.changeCurrentSelectedDay(currentDay);
            }

            if(this.filters.hasOwnProperty('currentLocation')) {
                currentLocation = this.filters['currentLocation'];
                this.props.changeCurrentSelectedLocation(currentLocation);
            }
            this.updatePublishedList(currentDay, currentLocation);

        };

    }

    updatePublishedList(day, location){
        let { currentSummit } = this.props;
        if( day == null || location == null)
        {
            this.props.clearPublishedEvents();
            return;
        }
        this.props.getPublishedEventsBySummitDayLocation
        (
            currentSummit,
            day,
            location
        );
    }

    onScheduleEvent(event, currentDay, startDateTime){
        let eventModel = new SummitEvent(event, this.props.currentSummit);
        this.props.publishEvent(event, currentDay, startDateTime, eventModel.getMinutesDuration());
    }

    onDayChanged(day){
        let { currentLocation } = this.props;
        this.props.changeCurrentSelectedDay(day);
        let locationId = currentLocation != null ? currentLocation.id: null;
        this.buildFragment(locationId, day);
        this.filters           = this.parseFilterFromFragment();
        this.byPassHashRefresh = true;
        this.updatePublishedList(day, currentLocation);
    }

    onVenueChanged(location){
        let { currentDay } = this.props;
        this.props.changeCurrentSelectedLocation(location);
        this.buildFragment(location.id, currentDay);
        this.filters           = this.parseFilterFromFragment();
        this.byPassHashRefresh = true;
        this.updatePublishedList(currentDay, location);
    }

    onUnScheduleEventsPageChange(currentPage){
        let { currentSummit, currentTrack, currentEventType , currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy} = this.props;
        let trackId = currentTrack == null ? null : currentTrack.id;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        this.props.getUnScheduleEventsPage(currentSummit.id, currentPage, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy);
    }

    onEventTypeChanged(eventType){
        let { currentSummit, currentTrack, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy} = this.props;
        let trackId = currentTrack == null ? null : currentTrack.id;
        let eventTypeId = eventType == null ? null : eventType.id;
        let selectionStatus = currentPresentationSelectionStatus;
        let order = currentUnScheduleOrderBy;
        if (!eventType || eventType.class_name != "PresentationType") {
            selectionStatus = null;
            order = 'id';
            this.props.changeCurrentPresentationSelectionStatus(selectionStatus);
            this.props.changeCurrentUnScheduleOrderBy(order);
        }
        this.props.changeCurrentEventType(eventType);
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, selectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order);
    }

    onTrackChanged(track){
        let { currentSummit, currentEventType , currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy} = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId     = track == null ? null : track.id;
        this.props.changeCurrentTrack(track);
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy);
    }

    onPresentationSelectionStatusChanged(presentationSelectionStatus){
        let { currentSummit, currentEventType, currentTrack, unScheduleEventsCurrentSearchTerm, currentPresentationSelectionPlan, currentUnScheduleOrderBy } = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId = currentTrack == null ? null : currentTrack.id;
        let order = currentUnScheduleOrderBy;

        if(!presentationSelectionStatus) {
            order = 'id';
            this.props.changeCurrentUnScheduleOrderBy(order);
        }

        this.props.changeCurrentPresentationSelectionStatus(presentationSelectionStatus);
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, presentationSelectionStatus, presentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order);
    }

    onPresentationSelectionPlanChanged(presentationSelectionPlan){
        let { currentSummit, currentEventType, currentTrack, currentPresentationSelectionStatus, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy } = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId = currentTrack == null ? null : currentTrack.id;
        let order = currentUnScheduleOrderBy;

        this.props.changeCurrentPresentationSelectionPlan(presentationSelectionPlan);
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, presentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order);
    }

    onUnscheduledEventsFilterTextChanged(term){
        let { currentSummit, currentEventType, currentTrack, currentPresentationSelectionStatus, currentPresentationSelectionPlan} = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId    = currentTrack == null ? null : currentTrack.id;
        this.props.changeCurrentUnscheduleSearchTerm(term)
        this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, term, 'id');
    }

    onScheduledEventsFilterTextChanged(term){
        this.props.changeCurrentScheduleSearchTerm(term);
        this.props.searchScheduleEvents(term);
        this.props.changeCurrentSelectedDay(null);
        this.props.changeCurrentSelectedLocation(null);
        this.buildFragment(null, null, term);
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

    buildFragment(locationId = null, day = null, searchTerm = null) {

        this.fragmentParser.setParam('q','');
        this.fragmentParser.setParam('day','');
        this.fragmentParser.setParam('location_id','');
        this.fragmentParser.setParam('event','');
        this.fragmentParser.setParam('time','');

        if(locationId != null ){
            this.fragmentParser.setParam('location_id', locationId)
        }

        if(day != null ){
            this.fragmentParser.setParam('day', day)
        }

        if(searchTerm != null ){
            this.fragmentParser.setParam('q', searchTerm)
        }

        window.location.hash = this.fragmentParser.serialize();
    }

    componentDidUpdate() {
        if (!this.shouldTestDeepLink) return;
        this.testDeepLinks();
        this.shouldTestDeepLink = false;
    }

    testDeepLinks(){
        if(this.timeoutHandler != null){
            window.clearTimeout(this.timeoutHandler)
        }
        this.timeoutHandler =  window.setTimeout(() => {
            if (this.filters.hasOwnProperty('currentTime')) {
                let time = this.filters['currentTime'];
                // clear param
                this.fragmentParser.deleteParam('time');
                this.byPassHashRefresh = true;
                window.location.hash = this.fragmentParser.serialize();
                this.filters = this.parseFilterFromFragment();
                this.scrollToElement(time);
            }

            if (this.filters.hasOwnProperty('currentEvent')) {
                let eventId = this.filters['currentEvent'];
                this.fragmentParser.deleteParam('event');
                this.byPassHashRefresh = true;
                window.location.hash = this.fragmentParser.serialize();
                this.filters = this.parseFilterFromFragment();
                this.scrollToElement(`event_${eventId}`);
            }
        }, 1500);
    }

    scrollToElement(elementId) {

        var el = document.getElementById(elementId);
        if(!el) return;
        let yPos = el.getClientRects()[0].top;
        var scroll = Scroll.animateScroll;

        scroll.scrollTo(yPos, {
            duration: 1500,
            delay: 100,
            smooth: "easeInOutQuint",
        });
    }

    onEditEvent(event){
        let { history, currentSummit } = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${event.id}`);
    }

    onClickSelected(event){
        this.props.setEventSelectedState(event);
    }

    onUnPublishEvent(event){
        Swal.fire({
            title: T.translate("schedule_builder_page.titles.unpublish_confirmation"),
            text: T.translate("schedule_builder_page.messages.unpublish_confirmation"),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: T.translate("schedule_builder_page.buttons.unpublish_confirmation"),
        }).then((result) => {
            if (result.value) {
                this.props.unPublishEvent(event);
            }
        })
    }

    onOrderByChanged(orderBy){
        let {
            currentSummit,
            currentEventType,
            currentTrack,
            currentPresentationSelectionStatus,
            currentPresentationSelectionPlan,
            unScheduleEventsCurrentSearchTerm,
            unScheduleEventsCurrentPage
        } = this.props;
        let eventTypeId = currentEventType == null ? null : currentEventType.id;
        let trackId    = currentTrack == null ? null : currentTrack.id;

        this.props.changeCurrentUnScheduleOrderBy(orderBy);
        this.props.getUnScheduleEventsPage
        (
            currentSummit.id,
            unScheduleEventsCurrentPage,
            20,
            eventTypeId,
            trackId,
            currentPresentationSelectionStatus,
            currentPresentationSelectionPlan,
            unScheduleEventsCurrentSearchTerm,
            orderBy
        );
    }

    onFindEmptyClick(){
        this.setState({ ... this.state, showModal: true})
    }

    onCloseModal(){
        this.setState({ ... this.state, showModal: false})
    }

    onFindEmptySpots({
        currentLocation,
        dateFrom,
        dateTo,
        gapSize,
    })
    {
        this.setState({ ... this.state, showModal: false})
        this.props.getEmptySpots(currentLocation, dateFrom, dateTo, gapSize);
    }

    onClearClick(){
        this.props.clearEmptySpots();
    }

    onClickSpot(spot){
        let { currentSummit } = this.props;
        let start_date = moment.tz(spot.start_date * 1000, currentSummit.time_zone.name);
        this.fragmentParser.setParam('q','');
        this.fragmentParser.setParam('event','');
        this.fragmentParser.setParam('day', start_date.format('YYYY-MM-DD'));
        this.fragmentParser.setParam('location_id', spot.location_id);
        // round minutes to upper limit

        let minute = start_date.minute();
        minute     = Math.ceil(minute/5)*5;
        start_date.minute(minute);
        this.fragmentParser.setParam('time', start_date.format('hh_mm'));
        window.location.hash = this.fragmentParser.serialize();
        this.props.clearEmptySpots();
        this.shouldTestDeepLink = true;
    }

    onSelectAllPublished(evt){
        let {scheduleEvents, setBulkEventSelectedState} = this.props;
        setBulkEventSelectedState(scheduleEvents, evt.target.checked, true);
    }

    onSelectAllUnPublished(evt){
        let {unScheduleEvents, setBulkEventSelectedState} = this.props;
        setBulkEventSelectedState(unScheduleEvents, evt.target.checked, false);
    }

    onSelectedBulkActionPublished(bulkAction){
        let {selectedPublishedEvents, performBulkAction} = this.props;
        if(selectedPublishedEvents.length == 0) return;
        if(bulkAction == BulkActionUnPublish){
            Swal.fire({
                title: T.translate("schedule_builder_page.titles.bulk_unpublish_confirmation"),
                text: T.translate("schedule_builder_page.messages.bulk_unpublish_confirmation"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: T.translate("schedule_builder_page.buttons.bulk_unpublish_confirmation"),
            }).then((result) => {
                if (result.value) {
                    performBulkAction(selectedPublishedEvents, bulkAction, true);
                }
            })
            return;
        }

        performBulkAction(selectedPublishedEvents, bulkAction, true);
    }

    onSelectedBulkActionUnPublished(bulkAction){
        let {selectedUnPublishedEvents, performBulkAction} = this.props;
        if(selectedUnPublishedEvents.length == 0) return;
        performBulkAction(selectedUnPublishedEvents, bulkAction, false);
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
            currentPresentationSelectionPlan,
            unScheduleEventsCurrentSearchTerm,
            scheduleEventsCurrentSearchTerm,
            scheduleEventsSearch,
            currentUnScheduleOrderBy,
            emptySpots,
            searchingEmpty,
            selectedPublishedEvents,
            selectedUnPublishedEvents,
        } = this.props;

        if(!currentSummit.id) return(<div></div>);


        // parse summits dates
        let days = [];

        let summitLocalStartDate         = moment(currentSummit.start_date * 1000).tz(currentSummit.time_zone.name);
        let summitLocalEndDate           = moment(currentSummit.end_date * 1000).tz(currentSummit.time_zone.name);
        let currentAuxDay                = summitLocalStartDate.clone();
        let currentDaySelectorItem       = null;
        let currentVenueSelectorItem     = null;
        let currentTrackSelectorItem     = null;
        let currentEventTypeSelectorItem = null;

        do{
            let option = { value: currentAuxDay.format("YYYY-MM-DD") , label: currentAuxDay.format('dddd Do , MMMM YYYY') };
            if(currentDay != null && currentAuxDay.format("YYYY-MM-DD") == currentDay)
                currentDaySelectorItem = option;
            days.push(option);
            currentAuxDay = currentAuxDay.clone();
            currentAuxDay.add(1, 'day');
        } while(!currentAuxDay.isAfter(summitLocalEndDate));


        // parse summit venues
        // TBD location

        let tbdOption   = {
            value: TBALocation,
            label: TBALocation.name,
        };

        let venues = [
            tbdOption
        ];

        if(currentLocation != null && TBALocation.id == currentLocation.id){
            currentVenueSelectorItem = tbdOption;
        }

        for(let i = 0; i < currentSummit.locations.length; i++) {
            let location = currentSummit.locations[i];
            if (location.class_name != "SummitVenue") continue;
            let option = { value : location, label: location.name };
            if(currentLocation != null && location.id == currentLocation.id)
                currentVenueSelectorItem = option;
            venues.push(option);
            if(!location.hasOwnProperty('rooms')) continue;
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

        let presentationSelectionStatusOptions = [
            { value : 'selected',            label: 'Selected'            },
            { value : 'accepted',            label: 'Accepted'            },
            { value : 'alternate',           label: 'Alternate'           }
        ];

        // selection plan options

        let presentationSelectionPlanOptions = currentSummit.selection_plans.map(sp => ({value: sp.id, label: sp.name}));

            // sort options

        let orderByOptions = [
            { value : 'title', label: 'Title' },
            { value : 'id', label: 'Id' },
            { value : 'start_date', label: 'Start Date' },
            { value : 'trackchairsel', label: 'Track Chair Sel.' },
        ]

        // bulk options published

        let bulkOptionsPublished = [
            { value : BulkActionEdit, label:T.translate("published_bulk_actions_selector.options.edit")},
            { value : BulkActionUnPublish, label:T.translate("published_bulk_actions_selector.options.unpublish")},
        ];

        let bulkOptionsUnPublished = [
            { value : BulkActionEdit, label:T.translate("published_bulk_actions_selector.options.edit")},
        ]

        return(

            <div className="row schedule-app-container no-margin">
                <ScheduleAdminEmptySpotsModal
                    currentSummit={currentSummit}
                    showModal={this.state.showModal}
                    onCloseModal={this.onCloseModal}
                    onFindEmptySpots={this.onFindEmptySpots}
                    initialGapSize={20}
                />
                <div className="col-md-6 published-container">
                    <ScheduleAdminSearchFreeTextScheduleEvents
                            onFilterTextChange={this.onScheduledEventsFilterTextChanged}
                            currentValue={scheduleEventsCurrentSearchTerm}
                            onFindEmptyClick={this.onFindEmptyClick}
                            onClearClick={this.onClearClick}
                    />
                    {emptySpots.length > 0 &&
                        <ScheduleAdminEmptySpotsList
                            emptySpots={emptySpots}
                            currentSummit={currentSummit}
                            onClickSpot={this.onClickSpot}
                        />
                    }
                    {emptySpots.length == 0 && searchingEmpty &&
                        <Modal show={true} onHide={this.onClearClick}>
                            <Modal.Header closeButton>
                                <Modal.Title>{T.translate("empty_spots_modal.find_empty_spots")}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {T.translate("schedule.no_empty_spots")}
                            </Modal.Body>
                        </Modal>
                    }

                    {
                        ( scheduleEventsCurrentSearchTerm == null || scheduleEventsCurrentSearchTerm == '' ) &&
                        (emptySpots.length == 0 ) &&
                        <ScheduleAdminDaySelector onDayChanged={this.onDayChanged} days={days}
                                                  currentValue={currentDaySelectorItem}/>
                    }
                    { ( scheduleEventsCurrentSearchTerm == null || scheduleEventsCurrentSearchTerm == '' ) &&
                        ( emptySpots.length == 0 ) &&
                        <ScheduleAdminVenueSelector onVenueChanged={this.onVenueChanged}
                                                    venues={venues} currentValue={currentVenueSelectorItem} />
                    }
                    { ( scheduleEventsCurrentSearchTerm == null || scheduleEventsCurrentSearchTerm == '' )
                      && ( emptySpots.length == 0 )
                      && ( scheduleEvents.length > 0)
                      && <ScheduleAdminsBulkActionsSelector
                            bulkOptions={bulkOptionsPublished}
                            onSelectAll={this.onSelectAllPublished}
                            onSelectedBulkAction={this.onSelectedBulkActionPublished}
                         >
                         </ScheduleAdminsBulkActionsSelector>
                    }
                    { ( scheduleEventsCurrentSearchTerm == null || scheduleEventsCurrentSearchTerm == '' )
                        && currentDay != null
                        && currentLocation != null
                        && (emptySpots.length == 0 )
                        &&
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
                            childEvents={childScheduleEvents}
                            onUnPublishEvent={this.onUnPublishEvent}
                            onEditEvent={this.onEditEvent}
                            onClickSelected={this.onClickSelected}
                            selectedPublishedEvents={selectedPublishedEvents}
                        />
                    }

                    <ScheduleAdminScheduleEventsSearchResults
                        events={scheduleEventsSearch}
                        searchTerm={scheduleEventsCurrentSearchTerm}
                        onEditEvent={this.onEditEvent}
                    />
                    {
                        ( scheduleEventsCurrentSearchTerm == null || scheduleEventsCurrentSearchTerm == '' ) &&
                        (currentDay == null || currentLocation == null) &&
                        (emptySpots.length == 0 ) &&
                        <p className="empty-list-message">{T.translate("errors.empty_list_schedule_events")}</p>
                    }
                </div>
                <div className="col-md-6 unpublished-container">
                    <ScheduleAdminSearchFreeTextUnScheduleEvents
                        onFilterTextChange={this.onUnscheduledEventsFilterTextChanged}
                        currentValue={unScheduleEventsCurrentSearchTerm}
                    />
                    <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-6">
                                    <ScheduleAdminEventTypeSelector
                                        onEventTypeChanged={this.onEventTypeChanged}
                                        eventTypes={eventTypes}
                                        currentValue={currentEventTypeSelectorItem}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <ScheduleAdminOrderSelector
                                        onOrderByChanged={this.onOrderByChanged}
                                        sortOptions={orderByOptions}
                                        currentValue={currentUnScheduleOrderBy}
                                        disableTrackOrder={currentPresentationSelectionStatus == null}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <ScheduleAdminTrackSelector
                                onTrackChanged={this.onTrackChanged}
                                tracks={tracks}
                                currentValue={currentTrackSelectorItem}
                            />
                        </div>
                        <div className="col-md-6">
                            { currentEventType != null && currentEventType.class_name == "PresentationType" &&
                            <ScheduleAdminPresentationSelectionStatusSelector
                                presentationSelectionStatus={presentationSelectionStatusOptions}
                                onPresentationSelectionStatusChanged={this.onPresentationSelectionStatusChanged}
                                currentValue={currentPresentationSelectionStatus}
                            />
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            {unScheduleEvents.length > 0 &&
                            <ScheduleAdminsBulkActionsSelector
                                bulkOptions={bulkOptionsUnPublished}
                                onSelectAll={this.onSelectAllUnPublished}
                                onSelectedBulkAction={this.onSelectedBulkActionUnPublished}
                            />
                            }
                        </div>
                        <div className="col-md-6">
                            { currentEventType != null && currentEventType.class_name == "PresentationType" &&
                            <ScheduleAdminPresentationSelectionPlanSelector
                                presentationSelectionPlans={presentationSelectionPlanOptions}
                                onPresentationSelectionPlanChanged={this.onPresentationSelectionPlanChanged}
                                currentValue={currentPresentationSelectionPlan}
                            />
                            }
                        </div>
                    </div>

                    <UnScheduleEventList
                            events={unScheduleEvents}
                            currentPage={unScheduleEventsCurrentPage}
                            lastPage={unScheduleEventsLasPage}
                            onEditEvent={this.onEditEvent}
                            onPageChange={this.onUnScheduleEventsPageChange}
                            onClickSelected={this.onClickSelected}
                            selectedUnPublishedEvents={selectedUnPublishedEvents}
                   />
                </div>
            </div>
        );
    }

}

ScheduleAdminDashBoard = DragDropContext(HTML5Backend)(ScheduleAdminDashBoard);

function mapStateToProps({ currentScheduleBuilderState, currentSummitState, summitEventsBulkActionsState  }) {
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
        currentPresentationSelectionStatus : currentScheduleBuilderState.currentPresentationSelectionStatus,
        unScheduleEventsCurrentSearchTerm  : currentScheduleBuilderState.unScheduleEventsCurrentSearchTerm,
        scheduleEventsCurrentSearchTerm    : currentScheduleBuilderState.scheduleEventsCurrentSearchTerm,
        scheduleEventsSearch               : currentScheduleBuilderState.scheduleEventsSearch,
        currentUnScheduleOrderBy           : currentScheduleBuilderState.currentUnScheduleOrderBy,
        emptySpots                         : currentScheduleBuilderState.emptySpots,
        searchingEmpty                     : currentScheduleBuilderState.searchingEmpty,
        selectedPublishedEvents            : summitEventsBulkActionsState.selectedPublishedEvents,
        selectedUnPublishedEvents          : summitEventsBulkActionsState.selectedUnPublishedEvents,
    }
}

export default connect(mapStateToProps, {
    getUnScheduleEventsPage,
    publishEvent,
    unPublishEvent,
    changeCurrentSelectedDay,
    changeCurrentSelectedLocation,
    getPublishedEventsBySummitDayLocation,
    changeCurrentEventType,
    changeCurrentTrack,
    changeCurrentPresentationSelectionStatus,
    changeCurrentPresentationSelectionPlan,
    changeCurrentUnscheduleSearchTerm,
    changeCurrentScheduleSearchTerm,
    searchScheduleEvents,
    changeCurrentUnScheduleOrderBy,
    getEmptySpots,
    clearEmptySpots,
    setEventSelectedState,
    setBulkEventSelectedState,
    performBulkAction,
    clearPublishedEvents
})(ScheduleAdminDashBoard);
