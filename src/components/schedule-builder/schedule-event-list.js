/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributschedule-event-list'ed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react';
import moment from 'moment-timezone'
import { DropTarget } from 'react-dnd';
import { DraggableItemTypes } from './draggable-items-types';
import ScheduleEvent from './schedule-event';
import ReactDOM  from 'react-dom';
import SummitEvent from '../../models/summit-event';

const TimeSlot = ({timeLabel, id}) => {
    return (
        <div id={id} className="row time-slot">
            <div className="col-md-12">
                <span>{timeLabel}</span>
            </div>
        </div>
    )
}

const timeSlotContainerTarget = {
    canDrop(props, monitor) {
        let {timeSlot, events, currentDay, currentSummit} = props;
        let eventModel = new SummitEvent(monitor.getItem(), currentSummit);
        return eventModel.canMove(events, currentDay, timeSlot);
    },
    drop(props, monitor, component) {
        props.onDroppedEvent(monitor.getItem(), props.timeSlot);
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

class TimeSlotContainer extends React.Component {

    renderOverlay(color) {
        return (
            <div style={{
                backgroundColor: color,
            }} className="time-slot-overlay"/>
        );
    }

    renderMinutesContainer(interval, pixelsPerMinute) {
        let minutesContainers = [];
        let container_count = interval / 5;
        let container_height = pixelsPerMinute * 5;

        for(var i=0; i < container_count ; i++){

            minutesContainers[i] = <div key={i} className="minute-container" style={{
                position: 'relative',
                width: '100%',
                height: `${container_height}px`
            }}/>;
        }

        return minutesContainers;
    }


    render(){
        const { connectDropTarget, isOver, canDrop, timeSlot, pixelsPerMinute, interval } = this.props;
        return connectDropTarget(
            <div
                id={"time_slot_container_"+timeSlot.format('HH_mm')}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}
                className="row time-slot-container">
                <div className="col-md-12">
                    {this.renderMinutesContainer(interval, pixelsPerMinute)}
                </div>
                {isOver && !canDrop && this.renderOverlay('red')}
                {!isOver && canDrop && this.renderOverlay('yellow')}
                {isOver && canDrop && this.renderOverlay('green')}
            </div>
        );
    }
}

TimeSlotContainer = DropTarget([
        DraggableItemTypes.UNSCHEDULEEVENT,
        DraggableItemTypes.SCHEDULEEVENT ],
    timeSlotContainerTarget,
    collect
)(TimeSlotContainer);

class ScheduleEventList extends React.Component
{
    constructor(props){
        super(props);
        this.onDroppedEvent    = this.onDroppedEvent.bind(this);
        this.canResize         = this.canResize.bind(this);
        this.onDroppedSubEvent = this.onDroppedSubEvent.bind(this);
        this.onResized         = this.onResized.bind(this);
        this.getMaxHeight      = this.getMaxHeight.bind(this);
        this.state = {
            resizing: false,
        };
    }

    componentDidMount() {
    }

    onDroppedEvent(event, startTime){
        this.props.onScheduleEvent(event, this.props.currentDay, startTime);
    }

    onDroppedSubEvent(subEvent, parentEvent, startTime, duration){
        this.props.onScheduleSubEvent(subEvent, parentEvent, this.props.currentDay, startTime, duration)
    }

    canResize(eventId, newTop, newHeight){
        let{ height } = this.getBoundingBox();
        if( height < (newTop+newHeight)){
            return false;
        }
        let { events, currentDay, startTime, pixelsPerMinute, currentSummit } = this.props;
        // try first to find events on main collection
        let event          = events.filter( evt => { return evt.id === eventId;}).shift();
        let eventModel     = new SummitEvent(event);

        let filteredEvents = events.filter( evt => { return evt.id !== eventId;});
        // calculate new event start date, end date
        let minutes        = Math.floor(newTop / pixelsPerMinute);
        let duration       = Math.floor(newHeight / pixelsPerMinute);
        let startDateTime  = moment.tz(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
        startDateTime      = startDateTime.add(minutes, 'minutes');
        let endDateTime    = moment.tz(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
        endDateTime        = endDateTime.add(minutes+duration, 'minutes');

        for (let auxEvent of filteredEvents) {
            let auxEventStartDateTime = moment(auxEvent.start_date * 1000).tz(currentSummit.time_zone.name);
            let auxEventEndDateTime   = moment(auxEvent.end_date * 1000).tz(currentSummit.time_zone.name);
            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        return true;
    }

    onResized(eventId, newTop, newHeight){
        let { events, currentDay, startTime, pixelsPerMinute, currentSummit } = this.props;

        let event            = events.filter( evt => { return evt.id === eventId;}).shift();
        let minutes          = Math.floor(newTop / pixelsPerMinute);
        let duration         = Math.floor(newHeight / pixelsPerMinute);
        let startDateTime    = moment.tz(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
        startDateTime        = startDateTime.add(minutes, 'minutes');

        this.props.onScheduleEventWithDuration(event, currentDay, moment(startDateTime.format('HH:mm'), 'HH:mm'), duration);
    }

    getMaxHeight(){
        return this.getBoundingBox().height;
    }

    getBoundingBox() {
        return ReactDOM.findDOMNode(this.scheduleEventContainer).getBoundingClientRect();
    }

    calculateInitialTop(event){
        let { currentDay, startTime, pixelsPerMinute, currentSummit} = this.props;
        let eventStartDateTime = moment(event.start_date * 1000).utc().tz(currentSummit.time_zone.name);
        let dayStartDateTime   = moment.tz(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
        let minutes            = eventStartDateTime.diff(dayStartDateTime, 'minutes');
        return minutes * pixelsPerMinute;
    }

    calculateInitialHeight(event){
        let { pixelsPerMinute, currentSummit } = this.props;
        let eventStartDateTime  = moment(event.start_date * 1000).tz(currentSummit.time_zone.name);
        let eventEndDateTime    = moment(event.end_date * 1000).tz(currentSummit.time_zone.name);
        let minutes             = eventEndDateTime.diff(eventStartDateTime, 'minutes');
        return minutes * pixelsPerMinute;
    }

    render(){
        let { events,
            startTime,
            endTime,
            interval,
            pixelsPerMinute,
            currentDay,
            currentSummit,
            onEditEvent,
            onUnPublishEvent,
            onClickSelected,
            selectedPublishedEvents } = this.props;

        let timeSlotsList = [];
        let done          = false;
        startTime         = moment.tz(startTime, 'HH:mm', currentSummit.time_zone.name);
        endTime           = moment.tz(endTime, 'HH:mm', currentSummit.time_zone.name);
        // create UI
        let slot = startTime;
        do
        {
            timeSlotsList.push(slot);
            slot = slot.clone();
            slot.add(interval, 'm');
            done = slot.isAfter(endTime);
        } while(!done);

        return (
            <div className="row outer-schedule-events-container">
                <div className="col-md-2 no-margin no-padding">
                    {
                        timeSlotsList.map((slot, idx) => (
                            <TimeSlot timeLabel={slot.format("HH:mm")} key={idx} id={slot.format("HH_mm")} />
                        ))
                    }
                </div>
                <div
                    className="schedule-events-container col-md-10 no-margin no-padding"
                    ref={(div) => { this.scheduleEventContainer = div; }} >
                    {
                        timeSlotsList.map((slot, idx) => (
                            <TimeSlotContainer
                                timeSlot={slot}
                                onDroppedEvent={this.onDroppedEvent}
                                key={idx}
                                events={events}
                                currentSummit={currentSummit}
                                interval={interval}
                                pixelsPerMinute={pixelsPerMinute}
                                currentDay={currentDay}>
                            </TimeSlotContainer>
                        ))
                    }
                    {
                        events.map((event, idx) => {
                            return (
                                <ScheduleEvent
                                    event={event}
                                    selectedPublishedEvents={selectedPublishedEvents}
                                    key={event.id}
                                    type={"MAIN"}
                                    step={pixelsPerMinute * 5}
                                    minHeight={(pixelsPerMinute * interval)}
                                    initialTop={this.calculateInitialTop(event)}
                                    initialHeight={this.calculateInitialHeight(event)}
                                    onDroppedSubEvent={this.onDroppedSubEvent}
                                    canResize={this.canResize}
                                    onResized={this.onResized}
                                    maxHeight={this.getMaxHeight}
                                    onUnPublishEvent={onUnPublishEvent}
                                    onEditEvent={onEditEvent}
                                    onClickSelected={onClickSelected}
                                    currentDay={currentDay}>
                                </ScheduleEvent>)
                        })
                    }
                </div>
            </div>
        );
    }
}

export default ScheduleEventList;
