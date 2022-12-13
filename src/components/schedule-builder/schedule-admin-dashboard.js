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
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {Modal} from 'react-bootstrap';
import {connect} from 'react-redux';
import {
  getUnScheduleEventsPage,
  publishEvent,
  changeCurrentSelectedDay,
  changeCurrentSelectedLocation,
  getPublishedEventsBySummitDayLocation,
  changeCurrentEventType,
  changeCurrentTrack,
  changeCurrentDuration,
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
  changeSummitBuilderFilters,
  changeSlotSize
} from '../../actions/summit-builder-actions';

import {
  setEventSelectedState,
  setBulkEventSelectedState,
  performBulkAction
} from '../../actions/summit-event-bulk-actions';
import UnScheduleEventList from './unschedule-event-list';
import ScheduleEventList from './schedule-event-list';
import SummitEvent from '../../models/summit-event';
import {
  BulkActionEdit, BulkActionUnPublish, DefaultEventMinutesDuration, PixelsPerMinute, TBALocation, SlotSizeOptions
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
import T from "i18n-react/dist/i18n-react";
import moment from 'moment-timezone';
import FragmentParser from '../../utils/fragmen-parser';
import * as Scroll from 'react-scroll';
import Swal from "sweetalert2";
import ScheduleAdminEmptySpotsModal from './schedule-admin-empty-spots-modal';
import ScheduleAdminEmptySpotsList from './schedule-admin-empty-spots-list';
import ScheduleAdminsBulkActionsSelector from './bulk-actions/schedule-admin-bulk-actions-selector';
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/utils/methods';
import {Dropdown, OperatorInput} from 'openstack-uicore-foundation/lib/components';
import SteppedSelect from '../inputs/stepped-select/index.jsx';

class ScheduleAdminDashBoard extends React.Component {

  constructor(props) {
    super(props);

    this.onScheduleEvent = this.onScheduleEvent.bind(this);
    this.onScheduleEventWithDuration = this.onScheduleEventWithDuration.bind(this);
    this.onDayChanged = this.onDayChanged.bind(this);
    this.onVenueChanged = this.onVenueChanged.bind(this);
    this.onUnScheduleEventsPageChange = this.onUnScheduleEventsPageChange.bind(this);
    this.onEventTypeChanged = this.onEventTypeChanged.bind(this);
    this.onTrackChanged = this.onTrackChanged.bind(this);
    this.onPresentationSelectionStatusChanged = this.onPresentationSelectionStatusChanged.bind(this);
    this.onPresentationSelectionPlanChanged = this.onPresentationSelectionPlanChanged.bind(this);
    this.onUnscheduledEventsFilterTextChanged = this.onUnscheduledEventsFilterTextChanged.bind(this);
    this.onUnPublishEvent = this.onUnPublishEvent.bind(this);
    this.onScheduledEventsFilterTextChanged = this.onScheduledEventsFilterTextChanged.bind(this);
    this.onEditEvent = this.onEditEvent.bind(this);
    this.onOrderByChanged = this.onOrderByChanged.bind(this);
    this.onFindEmptyClick = this.onFindEmptyClick.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onFindEmptySpots = this.onFindEmptySpots.bind(this);
    this.onClearClick = this.onClearClick.bind(this);
    this.onClickSpot = this.onClickSpot.bind(this);
    this.onClickSelected = this.onClickSelected.bind(this);
    this.onSelectAllPublished = this.onSelectAllPublished.bind(this);
    this.onSelectedBulkActionPublished = this.onSelectedBulkActionPublished.bind(this);
    this.onSelectedBulkActionUnPublished = this.onSelectedBulkActionUnPublished.bind(this);
    this.onSelectAllUnPublished = this.onSelectAllUnPublished.bind(this);
    this.onDurationFilterApplied = this.onDurationFilterApplied.bind(this);
    this.handleDurationFilter = this.handleDurationFilter.bind(this);
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.onSlotSizeChange = this.onSlotSizeChange.bind(this);

    this.fragmentParser = new FragmentParser();
    this.filters = this.parseFilterFromFragment();
    this.timeoutHandler = null;
    this.shouldTestDeepLink = true;
    this.byPassHashRefresh = false;
    this.state = {
      showModal: false,
      durationFilter: props.currentDuration || '',
    }
  }

  parseFilterFromFragment() {
    const {currentSummit} = this.props;
    const hash = this.fragmentParser.getParams();
    const filters = {};

    if (!currentSummit) return;

    for (let key in hash) {
      let value = hash[key];
      switch (key) {
        case 'day':
          filters.currentDay = value;
          break;
        case 'location_id':
          const location = currentSummit.locations.filter(l => l.id === parseInt(value)).shift();
          if (location) {
            filters.currentLocation = location;
          }
          if (value === 0) { //special case TBD location
            filters.currentLocation = {id: 0, name: 'TBD'};
          }
          break;
        case 'event':
          filters.currentEvent = value;
          break;
        case 'time':
          filters.currentTime = value;
          break;
        case 'q':
          filters.currentScheduleEventsSearchTerm = decodeURIComponent(value.replace(/\+/g, '%20'));
          break;
      }
    }
    return filters;
  }

  componentDidMount() {
    const {
      currentSummit,
      currentEventType,
      currentTrack,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      currentDay,
      currentLocation,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    const eventTypeId = currentEventType === null ? null : currentEventType.id;
    const trackId = currentTrack === null ? null : currentTrack.id;

    if (!currentSummit) return;

    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, '', currentUnScheduleOrderBy, currentDuration);

    if (window.location.hash === '' && currentDay && currentLocation) {
      this.byPassHashRefresh = true;
      this.fragmentParser.setParam('day', currentDay);
      this.fragmentParser.setParam('location_id', currentLocation.id);
      window.location.hash = this.fragmentParser.serialize();
    }

    this.filters = this.parseFilterFromFragment();

    this.updateFilters();

    this.updatePublishedList(this.filters.currentDay, this.filters.currentLocation);

    window.onhashchange = (event) => {
      if (this.byPassHashRefresh) {
        this.byPassHashRefresh = false;
        return;
      }

      this.filters = this.parseFilterFromFragment();
      this.shouldTestDeepLink = true;
      this.updateFilters();
      this.updatePublishedList(currentDay, currentLocation);

    };
  }

  updateFilters() {
    if (this.filters.hasOwnProperty('currentScheduleEventsSearchTerm')) {
      this.onScheduledEventsFilterTextChanged(this.filters.currentScheduleEventsSearchTerm);
      return;
    }

    if (this.filters.hasOwnProperty('currentDay')) {
      this.props.changeCurrentSelectedDay(this.filters.currentDay);
    }

    if (this.filters.hasOwnProperty('currentLocation')) {
      this.props.changeCurrentSelectedLocation(this.filters.currentLocation);
    }
  }

  updatePublishedList(day, location) {
    const {currentSummit} = this.props;
    if (day == null || location == null) {
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

  onScheduleEvent(event, currentDay, startDateTime) {
    let eventModel = new SummitEvent(event, this.props.currentSummit);
    this.props.publishEvent(event, currentDay, startDateTime, eventModel.getMinutesDuration(this.props.slotSize));
  }

  onDayChanged(day) {
    let {currentLocation} = this.props;
    this.props.changeCurrentSelectedDay(day);
    let locationId = currentLocation != null ? currentLocation.id : null;
    this.buildFragment(locationId, day);
    this.filters = this.parseFilterFromFragment();
    this.byPassHashRefresh = true;
    this.updatePublishedList(day, currentLocation);
  }

  onVenueChanged(location) {
    let {currentDay} = this.props;
    this.props.changeCurrentSelectedLocation(location);
    this.buildFragment(location.id, currentDay);
    this.filters = this.parseFilterFromFragment();
    this.byPassHashRefresh = true;
    this.updatePublishedList(currentDay, location);
  }

  onUnScheduleEventsPageChange(currentPage) {
    const {
      currentSummit,
      currentTrack,
      currentEventType,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      unScheduleEventsCurrentSearchTerm,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    let trackId = currentTrack == null ? null : currentTrack.id;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    this.props.getUnScheduleEventsPage(currentSummit.id, currentPage, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy, currentDuration);
  }

  onEventTypeChanged(eventType) {
    const {
      currentSummit,
      currentTrack,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      unScheduleEventsCurrentSearchTerm,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    let trackId = currentTrack == null ? null : currentTrack.id;
    let eventTypeId = eventType == null ? null : eventType.id;
    let selectionStatus = currentPresentationSelectionStatus;
    let order = currentUnScheduleOrderBy;
    if (!eventType || eventType.class_name !== "PresentationType") {
      selectionStatus = null;
      order = 'id';
      this.props.changeCurrentPresentationSelectionStatus(selectionStatus);
      this.props.changeCurrentUnScheduleOrderBy(order);
    }
    this.props.changeCurrentEventType(eventType);
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, selectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order, currentDuration);
  }

  onTrackChanged(track) {
    const {
      currentSummit,
      currentEventType,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      unScheduleEventsCurrentSearchTerm,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = track == null ? null : track.id;
    this.props.changeCurrentTrack(track);
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy, currentDuration);
  }

  onPresentationSelectionStatusChanged(presentationSelectionStatus) {
    const {
      currentSummit,
      currentEventType,
      currentTrack,
      unScheduleEventsCurrentSearchTerm,
      currentPresentationSelectionPlan,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = currentTrack == null ? null : currentTrack.id;
    let order = currentUnScheduleOrderBy;

    if (!presentationSelectionStatus) {
      order = 'id';
      this.props.changeCurrentUnScheduleOrderBy(order);
    } else {
      order = 'trackchairsel';
      this.props.changeCurrentUnScheduleOrderBy(order);
    }

    this.props.changeCurrentPresentationSelectionStatus(presentationSelectionStatus);
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, presentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order, currentDuration);
  }

  onPresentationSelectionPlanChanged(presentationSelectionPlan) {
    const {
      currentSummit,
      currentEventType,
      currentTrack,
      currentPresentationSelectionStatus,
      unScheduleEventsCurrentSearchTerm,
      currentUnScheduleOrderBy,
      currentDuration
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = currentTrack == null ? null : currentTrack.id;
    let order = currentUnScheduleOrderBy;

    this.props.changeCurrentPresentationSelectionPlan(presentationSelectionPlan);
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, presentationSelectionPlan, unScheduleEventsCurrentSearchTerm, order, currentDuration);
  }

  onUnscheduledEventsFilterTextChanged(term) {
    const {
      currentSummit,
      currentEventType,
      currentTrack,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      currentDuration
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = currentTrack == null ? null : currentTrack.id;
    this.props.changeCurrentUnscheduleSearchTerm(term)
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, term, 'id', currentDuration);
  }

  onScheduledEventsFilterTextChanged(term) {
    this.props.changeCurrentScheduleSearchTerm(term);
    this.props.searchScheduleEvents(term);
    this.props.changeCurrentSelectedDay(null);
    this.props.changeCurrentSelectedLocation(null);
    this.buildFragment(null, null, term);
  }

  onScheduleEventWithDuration(event, currentDay, startTime, duration) {
    this.props.publishEvent
    (
      event,
      currentDay,
      startTime,
      duration
    );
  }

  buildFragment(locationId = null, day = null, searchTerm = null) {

    this.fragmentParser.setParam('q', '');
    this.fragmentParser.setParam('day', '');
    this.fragmentParser.setParam('location_id', '');
    this.fragmentParser.setParam('event', '');
    this.fragmentParser.setParam('time', '');

    if (locationId != null) {
      this.fragmentParser.setParam('location_id', locationId)
    }

    if (day != null) {
      this.fragmentParser.setParam('day', day)
    }

    if (searchTerm != null) {
      this.fragmentParser.setParam('q', searchTerm)
    }

    window.location.hash = this.fragmentParser.serialize();
  }

  componentDidUpdate() {
    if (!this.shouldTestDeepLink) return;
    this.testDeepLinks();
    this.shouldTestDeepLink = false;
  }

  testDeepLinks() {
    if (this.timeoutHandler != null) {
      window.clearTimeout(this.timeoutHandler)
    }

    this.timeoutHandler = window.setTimeout(() => {
      if (this.filters.hasOwnProperty('currentTime')) {
        this.scrollToElement(this.filters.currentTime);
        this.fragmentParser.deleteParam('time');
        this.byPassHashRefresh = true;
        window.location.hash = this.fragmentParser.serialize();
        this.filters = this.parseFilterFromFragment();
      }

      if (this.filters.hasOwnProperty('currentEvent')) {
        this.scrollToElement(`event_${this.filters.currentEvent}`);
        this.fragmentParser.deleteParam('event');
        this.byPassHashRefresh = true;
        window.location.hash = this.fragmentParser.serialize();
        this.filters = this.parseFilterFromFragment();

      }
    }, 1500);
  }

  scrollToElement(elementId) {

    var el = document.getElementById(elementId);
    if (!el) return;
    let yPos = el.getClientRects()[0].top;
    var scroll = Scroll.animateScroll;

    scroll.scrollTo(yPos, {
      duration: 1500,
      delay: 100,
      smooth: "easeInOutQuint",
    });
  }

  onEditEvent(event) {
    let {history, currentSummit} = this.props;
    history.push(`/app/summits/${currentSummit.id}/events/${event.id}`);
  }

  onClickSelected(event) {
    this.props.setEventSelectedState(event);
  }

  onUnPublishEvent(event) {
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

  onOrderByChanged(orderBy) {
    let {
      currentSummit,
      currentEventType,
      currentTrack,
      currentDuration,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      unScheduleEventsCurrentSearchTerm,
      unScheduleEventsCurrentPage
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = currentTrack == null ? null : currentTrack.id;

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
      orderBy,
      currentDuration
    );
  }

  onFindEmptyClick() {
    this.setState({...this.state, showModal: true})
  }

  onCloseModal() {
    this.setState({...this.state, showModal: false})
  }

  onFindEmptySpots({
                     currentLocation,
                     dateFrom,
                     dateTo,
                     gapSize,
                   }) {
    this.setState({...this.state, showModal: false})
    this.props.getEmptySpots(currentLocation, dateFrom, dateTo, gapSize);
  }

  onClearClick() {
    this.props.clearEmptySpots();
  }

  onClickSpot(spot) {
    const {currentSummit} = this.props;
    let start_date = moment.tz(spot.start_date * 1000, currentSummit.time_zone.name);
    this.fragmentParser.setParam('q', '');
    this.fragmentParser.setParam('event', '');
    this.fragmentParser.setParam('day', start_date.format('YYYY-MM-DD'));
    this.fragmentParser.setParam('location_id', spot.location_id);
    // round minutes to upper limit

    let minute = start_date.minute();
    minute = Math.ceil(minute / 5) * 5;
    start_date.minute(minute);
    this.fragmentParser.setParam('time', start_date.format('hh_mm'));
    window.location.hash = this.fragmentParser.serialize();
    this.props.clearEmptySpots();
    this.shouldTestDeepLink = true;
  }

  onSelectAllPublished(evt) {
    let {scheduleEvents, setBulkEventSelectedState} = this.props;
    setBulkEventSelectedState(scheduleEvents, evt.target.checked, true);
  }

  onSelectAllUnPublished(evt) {
    let {unScheduleEvents, setBulkEventSelectedState} = this.props;
    setBulkEventSelectedState(unScheduleEvents, evt.target.checked, false);
  }

  onSelectedBulkActionPublished(bulkAction) {
    let {selectedPublishedEvents, performBulkAction} = this.props;
    if (selectedPublishedEvents.length === 0) return;
    if (bulkAction === BulkActionUnPublish) {
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

  onSelectedBulkActionUnPublished(bulkAction) {
    let {selectedUnPublishedEvents, performBulkAction} = this.props;
    if (selectedUnPublishedEvents.length === 0) return;
    performBulkAction(selectedUnPublishedEvents, bulkAction, false);
  }

  onDurationFilterApplied(ev) {
    const {
      currentSummit,
      currentEventType,
      currentTrack,
      currentPresentationSelectionStatus,
      currentPresentationSelectionPlan,
      unScheduleEventsCurrentSearchTerm,
      currentUnScheduleOrderBy
    } = this.props;
    let eventTypeId = currentEventType == null ? null : currentEventType.id;
    let trackId = currentTrack == null ? null : currentTrack.id;
    const {durationFilter} = this.state;
    this.props.changeCurrentDuration(durationFilter);
    this.props.getUnScheduleEventsPage(currentSummit.id, 1, 20, eventTypeId, trackId, currentPresentationSelectionStatus, currentPresentationSelectionPlan, unScheduleEventsCurrentSearchTerm, currentUnScheduleOrderBy, durationFilter);
  }

  handleDurationFilter(ev) {
    let {value, type, id} = ev.target;
    if (type === 'operatorinput') {
      value = Array.isArray(value) ? value : `${ev.target.operator}${ev.target.value}`;
    }
    this.setState({...this.state, durationFilter: value});
  }

  handleFiltersChange(ev) {
    const {value} = ev.target;
    const {selectedFilters} = this.props;
    // resetting filters when they're removed from the ddl
    if (value.length < selectedFilters.length) {
      const removedFilter = selectedFilters.filter(e => !value.includes(e))[0];
      switch (removedFilter) {
        case 'activity_type_filter': {
          this.onEventTypeChanged(null);
          break;
        }
        case 'activity_category_filter': {
          this.onTrackChanged(null);
          break;
        }
        case 'selection_plan_id_filter': {
          this.onPresentationSelectionPlanChanged(null);
          break;
        }
        case 'selection_status_filter': {
          this.onPresentationSelectionStatusChanged(null);
          break;
        }
        case 'duration_filter': {
          this.setState({...this.state, durationFilter: null}, () => this.onDurationFilterApplied());
          break;
        }
        default:
          break;
      }
    }
    this.props.changeSummitBuilderFilters(value);
  }

  onSlotSizeChange(value) {
    this.props.changeSlotSize(value);
  }

  render() {

    let {
      scheduleEvents,
      unScheduleEvents,
      childScheduleEvents,
      currentSummit,
      currentDay,
      currentLocation,
      currentDuration,
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
      selectedFilters,
      slotSize
    } = this.props;

    const {durationFilter} = this.state;

    if (!currentSummit.id) return (<div/>);


    // parse summits dates
    const days = [];
    const summitLocalStartDate = epochToMomentTimeZone(currentSummit.start_date, currentSummit.time_zone_id);
    const summitLocalEndDate = epochToMomentTimeZone(currentSummit.end_date, currentSummit.time_zone_id);
    let currentAuxDay = summitLocalStartDate.clone();
    let currentVenueSelectorItem = null;
    let currentTrackSelectorItem = null;
    let currentEventTypeSelectorItem = null;
    const isNotSearchOrEmpty = !scheduleEventsCurrentSearchTerm && emptySpots.length === 0;

    do {
      const option = {value: currentAuxDay.format("YYYY-MM-DD"), label: currentAuxDay.format('dddd Do , MMMM YYYY')};
      days.push(option);
      currentAuxDay = currentAuxDay.clone();
      currentAuxDay.add(1, 'day');
    } while (!currentAuxDay.isAfter(summitLocalEndDate));

    // parse summit venues
    // TBD location

    let tbdOption = {
      value: TBALocation,
      label: TBALocation.name,
    };

    let venues = [
      tbdOption
    ];

    if (currentLocation != null && TBALocation.id === currentLocation.id) {
      currentVenueSelectorItem = tbdOption;
    }


    for (let i = 0; i < currentSummit.locations.length; i++) {
      let location = currentSummit.locations[i];
      if (location.class_name !== "SummitVenue") continue;
      let option = {value: location, label: location.name};
      if (currentLocation != null && location.id === currentLocation.id)
        currentVenueSelectorItem = option;
      venues.push(option);
      if (!location.hasOwnProperty('rooms')) continue;
      for (let j = 0; j < location.rooms.length; j++) {
        let subOption = {value: location.rooms[j], label: location.rooms[j].name};
        if (currentLocation != null && location.rooms[j].id === currentLocation.id)
          currentVenueSelectorItem = subOption;
        venues.push(subOption);
      }
    }

    // parse event types

    let eventTypes = [];

    for (let i = 0; i < currentSummit.event_types.length; i++) {
      let event_type = currentSummit.event_types[i];
      let option = {value: event_type, label: event_type.name};
      if (currentEventType != null && currentEventType.id === event_type.id)
        currentEventTypeSelectorItem = option;
      eventTypes.push(option);
    }

    // parse tracks

    let tracks = [];

    for (let i = 0; i < currentSummit.tracks.length; i++) {
      let track = currentSummit.tracks[i];
      let option = {value: track, label: track.name};
      if (currentTrack != null && currentTrack.id === track.id)
        currentTrackSelectorItem = option;
      tracks.push(option);
    }

    // presentation selection status

    let presentationSelectionStatusOptions = [
      {value: 'selected', label: 'Selected'},
      {value: 'accepted', label: 'Accepted'},
      {value: 'rejected', label: 'Rejected'},
      {value: 'alternate', label: 'Alternate'}
    ];

    // selection plan options

    let presentationSelectionPlanOptions = currentSummit.selection_plans.map(sp => ({value: sp.id, label: sp.name}));

    // sort options

    let orderByOptions = [
      {value: 'title', label: 'Title'},
      {value: 'id', label: 'Id'},
      {value: 'start_date', label: 'Start Date'},
      {value: 'trackchairsel', label: 'Track Chair Sel.'},
    ];

    // bulk options published

    let bulkOptionsPublished = [
      {value: BulkActionEdit, label: T.translate("published_bulk_actions_selector.options.edit")},
      {value: BulkActionUnPublish, label: T.translate("published_bulk_actions_selector.options.unpublish")},
    ];

    let bulkOptionsUnPublished = [
      {value: BulkActionEdit, label: T.translate("published_bulk_actions_selector.options.edit")},
    ];

    // filters ddl
    const filters_ddl = [
      {label: 'Activity Type', value: 'activity_type_filter'},
      {label: 'Activity Category', value: 'activity_category_filter'},
      {label: 'Selection Plan', value: 'selection_plan_id_filter'},
      {label: 'Selection Status', value: 'selection_status_filter'},
      {label: 'Duration (minutes)', value: 'duration_filter'},
    ];

    const slotSizeOptions = SlotSizeOptions.map(op => ({value: op, label: `${op} min.`}))

    return (
      <DndProvider backend={HTML5Backend}>
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
            {emptySpots.length === 0 && searchingEmpty &&
            <Modal show={true} onHide={this.onClearClick}>
              <Modal.Header closeButton>
                <Modal.Title>{T.translate("empty_spots_modal.find_empty_spots")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {T.translate("schedule.no_empty_spots")}
              </Modal.Body>
            </Modal>
            }

            {isNotSearchOrEmpty &&
            <ScheduleAdminDaySelector
              onDayChanged={this.onDayChanged}
              days={days}
              currentValue={currentDay}
            />
            }
            {isNotSearchOrEmpty &&
            <div className="row">
              <div className="col-md-8">
                <ScheduleAdminVenueSelector
                  onVenueChanged={this.onVenueChanged}
                  venues={venues}
                  currentValue={currentVenueSelectorItem}
                />
              </div>
              <div className="col-md-4">
                <span>Slot size: </span>
                <SteppedSelect
                  value={slotSize}
                  onChange={this.onSlotSizeChange}
                  options={slotSizeOptions}
                  style={{display: 'inline-block', marginLeft: 10}}
                />
              </div>
            </div>

            }
            {isNotSearchOrEmpty && scheduleEvents.length > 0 &&
            <ScheduleAdminsBulkActionsSelector
              bulkOptions={bulkOptionsPublished}
              onSelectAll={this.onSelectAllPublished}
              onSelectedBulkAction={this.onSelectedBulkActionPublished}
            />
            }
            {isNotSearchOrEmpty && currentDay && currentLocation &&
            <ScheduleEventList
              startTime={"00:00"}
              endTime={"23:50"}
              currentSummit={currentSummit}
              interval={slotSize}
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
            {isNotSearchOrEmpty && (!currentDay || !currentLocation) &&
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
              <div className="col-md-12">
                <Dropdown
                  id="selected_filters"
                  placeholder={T.translate("schedule.placeholders.selected_filters")}
                  value={selectedFilters}
                  onChange={this.handleFiltersChange}
                  options={filters_ddl}
                  isClearable={true}
                  isMulti={true}
                />
              </div>
            </div>
            <div className='row' style={{marginTop: 10}}>
              {selectedFilters.includes('activity_type_filter') &&
              <div className="col-md-6">
                <ScheduleAdminEventTypeSelector
                  onEventTypeChanged={this.onEventTypeChanged}
                  eventTypes={eventTypes}
                  currentValue={currentEventTypeSelectorItem}
                />
              </div>
              }
              {selectedFilters.includes('activity_category_filter') &&
              <div className="col-md-6">
                <ScheduleAdminTrackSelector
                  onTrackChanged={this.onTrackChanged}
                  tracks={tracks}
                  currentValue={currentTrackSelectorItem}
                />
              </div>
              }
              {selectedFilters.includes('selection_status_filter') &&
              <div className="col-md-6">
                <ScheduleAdminPresentationSelectionStatusSelector
                  presentationSelectionStatus={presentationSelectionStatusOptions}
                  onPresentationSelectionStatusChanged={this.onPresentationSelectionStatusChanged}
                  currentValue={currentPresentationSelectionStatus}
                />
              </div>
              }
              {selectedFilters.includes('selection_plan_id_filter') &&
              <div className="col-md-6">
                <ScheduleAdminPresentationSelectionPlanSelector
                  presentationSelectionPlans={presentationSelectionPlanOptions}
                  onPresentationSelectionPlanChanged={this.onPresentationSelectionPlanChanged}
                  currentValue={currentPresentationSelectionPlan}
                />
              </div>
              }
              {selectedFilters.includes('duration_filter') &&
              <>
                <div className="col-md-10">
                  <OperatorInput
                    id="duration_filter"
                    label={T.translate("schedule.duration")}
                    value={durationFilter}
                    onChange={this.handleDurationFilter}/>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary right-space" onClick={this.onDurationFilterApplied}>
                    {T.translate("schedule.apply_duration")}
                  </button>
                </div>
              </>
              }
            </div>

            <div className="row">
              <div className="col-md-12">
                {unScheduleEvents.length > 0 &&
                <ScheduleAdminsBulkActionsSelector
                  bulkOptions={bulkOptionsUnPublished}
                  onSelectAll={this.onSelectAllUnPublished}
                  onSelectedBulkAction={this.onSelectedBulkActionUnPublished}
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
      </DndProvider>
    );
  }

}

function mapStateToProps({currentScheduleBuilderState, currentSummitState, summitEventsBulkActionsState}) {
  return {
    scheduleEvents: currentScheduleBuilderState.scheduleEvents,
    unScheduleEvents: currentScheduleBuilderState.unScheduleEvents,
    childScheduleEvents: currentScheduleBuilderState.childScheduleEvents,
    currentSummit: currentSummitState.currentSummit,
    currentDay: currentScheduleBuilderState.currentDay,
    currentLocation: currentScheduleBuilderState.currentLocation,
    currentEventType: currentScheduleBuilderState.currentEventType,
    currentTrack: currentScheduleBuilderState.currentTrack,
    unScheduleEventsCurrentPage: currentScheduleBuilderState.unScheduleEventsCurrentPage,
    unScheduleEventsLasPage: currentScheduleBuilderState.unScheduleEventsLasPage,
    currentPresentationSelectionStatus: currentScheduleBuilderState.currentPresentationSelectionStatus,
    currentPresentationSelectionPlan: currentScheduleBuilderState.currentPresentationSelectionPlan,
    unScheduleEventsCurrentSearchTerm: currentScheduleBuilderState.unScheduleEventsCurrentSearchTerm,
    scheduleEventsCurrentSearchTerm: currentScheduleBuilderState.scheduleEventsCurrentSearchTerm,
    scheduleEventsSearch: currentScheduleBuilderState.scheduleEventsSearch,
    currentUnScheduleOrderBy: currentScheduleBuilderState.currentUnScheduleOrderBy,
    emptySpots: currentScheduleBuilderState.emptySpots,
    searchingEmpty: currentScheduleBuilderState.searchingEmpty,
    selectedPublishedEvents: summitEventsBulkActionsState.selectedPublishedEvents,
    selectedUnPublishedEvents: summitEventsBulkActionsState.selectedUnPublishedEvents,
    currentDuration: currentScheduleBuilderState.currentDuration,
    selectedFilters: currentScheduleBuilderState.selectedFilters,
    slotSize: currentScheduleBuilderState.slotSize,
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
  changeCurrentDuration,
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
  clearPublishedEvents,
  changeSummitBuilderFilters,
  changeSlotSize
})(ScheduleAdminDashBoard);
