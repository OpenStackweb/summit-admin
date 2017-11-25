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
import PropTypes from 'prop-types';
import moment from 'moment';
import { DropTarget } from 'react-dnd';
import { DraggableItemTypes } from './draggable-items-types';
import ScheduleEvent from './schedule-event';
import ReactDOM  from 'react-dom';
import SummitEvent from '../../models/summit-event';

const TimeSlot = ({timeLabel}) => {
    return (
        <div className="row time-slot">
            <div className="col-md-12">
                <span>{timeLabel}</span>
            </div>
        </div>
    )
}

const timeSlotContainerTarget = {
    canDrop(props, monitor) {
        let eventModel = new SummitEvent(monitor.getItem());
        let {timeSlot, events, currentDay} = props;
        return eventModel.canMoveMain(events, currentDay, timeSlot);
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

    render(){
        const { connectDropTarget, isOver, canDrop, timeSlot } = this.props;
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
        this.boundingBox = null;
    }

    componentDidMount() {
        console.log('componentDidMount');
        this.boundingBox = this.getBoundingBox();
    }

    onDroppedEvent(event, startTime){
        this.props.onScheduleEvent(event, this.props.currentDay, startTime);
    }

    onDroppedSubEvent(subEvent, parentEvent, startTime, duration){
        this.props.onScheduleSubEvent(subEvent, parentEvent, this.props.currentDay, startTime, duration)
    }

    canResize(eventId, newTop, newHeight){
        let { events, currentDay, startTime, pixelsPerMinute, childEvents } = this.props;
        // try first to find events on main collection
        let event          = events.filter( evt => { return evt.id === eventId;}).shift();

        if(!event) // if not look for child ones
            event = childEvents.filter( evt => { return evt.id === eventId;}).shift();

        let eventModel = new SummitEvent(event);

        let filteredEvents = events.filter( evt => { return evt.id !== eventId;});
        // calculate new event start date, end date
        let minutes        = Math.floor(newTop / pixelsPerMinute);
        let duration       = Math.floor(newHeight / pixelsPerMinute);
        let startDateTime  = moment(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm');
        let upperLimitDate = null, lowerLimitDate = null;
        if(eventModel.isChildEvent()) { // its child event
            let parentEvent         = events.filter( evt => { return evt.id === event.parentId;}).shift();
            let parentStartDateTime = moment(parentEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let parentEndDateTime   = moment(parentEvent.end_datetime, 'YYYY-MM-DD HH:mm');
            upperLimitDate          = parentStartDateTime.clone();
            lowerLimitDate          = parentEndDateTime.clone();
            startTime               = parentStartDateTime.format('HH:mm');
            filteredEvents          = parentEvent.subEvents.filter( evt => { return evt.id !== eventId;});
            let deltaMinutes        = moment.duration( parentStartDateTime.diff(startDateTime)).asMinutes();
            startDateTime           = parentStartDateTime;
            minutes                 = minutes - deltaMinutes;
        }

        startDateTime   = startDateTime.add(minutes, 'minutes');
        let endDateTime = moment(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm');
        endDateTime     = endDateTime.add(minutes+duration, 'minutes');

        // its a child and we should respect parent bounds ...
        if(upperLimitDate !== null && startDateTime.isBefore(upperLimitDate)) return false;

        if(lowerLimitDate !== null && endDateTime.isAfter(lowerLimitDate)) return false;

        for (let auxEvent of filteredEvents) {
            let auxEventStartDateTime = moment(auxEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let auxEventEndDateTime   = moment(auxEvent.end_datetime, 'YYYY-MM-DD HH:mm');
            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        // has childs

        if(eventModel.hasChilds()){
            let minStarDateTime = null, maxEndDateTime = null;
            for(let subEvent of event.subEvents){
                let subEventStartDateTime = moment(subEvent.start_datetime, 'YYYY-MM-DD HH:mm');
                let subEventEndDateTime   = moment(subEvent.end_datetime, 'YYYY-MM-DD HH:mm');
                if(minStarDateTime === null || minStarDateTime.isAfter(subEventStartDateTime))
                    minStarDateTime = subEventStartDateTime;
                if(maxEndDateTime === null || maxEndDateTime.isBefore(subEventEndDateTime))
                    maxEndDateTime = subEventEndDateTime;
            }

            if(endDateTime.isBefore(maxEndDateTime)) return false;

            if(startDateTime.isAfter(minStarDateTime)) return false;
        }

        return true;
    }

    onResized(eventId, newTop, newHeight){
        let { events, currentDay, startTime, pixelsPerMinute, childEvents } = this.props;

        let event            = events.filter( evt => { return evt.id === eventId;}).shift();
        if(!event)
            event = childEvents.filter( evt => { return evt.id === eventId;}).shift();

        let minutes          = Math.floor(newTop / pixelsPerMinute);
        let duration         = Math.floor(newHeight / pixelsPerMinute);
        let startDateTime    = moment(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm');

        if(event.parentId > 0) { // child event
            let parentEvent         = events.filter( evt => { return evt.id === event.parentId;}).shift();
            let parentStartDateTime = moment(parentEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let deltaMinutes      = moment.duration( parentStartDateTime.diff(startDateTime)).asMinutes();
            startDateTime         = parentStartDateTime;
            minutes               = minutes - deltaMinutes;
        }

        startDateTime = startDateTime.add(minutes, 'minutes');

        this.props.onScheduleEventWithDuration(event, currentDay, moment(startDateTime.format('HH:mm'), 'HH:mm'), duration);
    }

    getMaxHeight(){
        return this.getBoundingBox().bottom;
    }

    getBoundingBox() {
        return ReactDOM.findDOMNode(this.scheduleEventContainer).getBoundingClientRect();
    }

    calculateInitialTop(event){
        let { currentDay, startTime, pixelsPerMinute} = this.props;
        let eventStartDateTime = moment(event.start_datetime, 'YYYY-MM-DD HH:mm');
        let dayStartDateTime   = moment(currentDay+' '+ startTime, 'YYYY-MM-DD HH:mm');
        let minutes            = eventStartDateTime.diff(dayStartDateTime, 'minutes');
        return minutes * pixelsPerMinute;
    }

    calculateInitialHeight(event){
        let { pixelsPerMinute } = this.props;
        let eventStartDateTime  = moment(event.start_datetime, 'YYYY-MM-DD HH:mm');
        let eventEndDateTime    = moment(event.end_datetime, 'YYYY-MM-DD HH:mm');
        let minutes             = eventEndDateTime.diff(eventStartDateTime, 'minutes');

        return minutes * pixelsPerMinute;
    }

    render(){
        let { events, startTime, endTime, interval, pixelsPerMinute, currentDay } = this.props;

        let timeSlotsList = [];
        let done          = false;
        startTime         = moment(startTime, 'HH:mm');
        endTime           = moment(endTime, 'HH:mm');
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
            <div className="row">
                <div className="col-md-2 no-margin no-padding">
                    {
                        timeSlotsList.map((slot, idx) => (
                            <TimeSlot timeLabel={slot.format("hh:mm A")} key={idx}></TimeSlot>
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
                                currentDay={currentDay}>
                            </TimeSlotContainer>
                        ))
                    }
                    {
                        events.map((event, idx) => {
                            return (
                                <ScheduleEvent
                                    event={event}
                                    key={event.id + idx}
                                    type={"MAIN"}
                                    step={pixelsPerMinute}
                                    minHeight={(pixelsPerMinute * interval)}
                                    initialTop={this.calculateInitialTop(event)}
                                    initialHeight={this.calculateInitialHeight(event)}
                                    onDroppedSubEvent={this.onDroppedSubEvent}
                                    canResize={this.canResize}
                                    onResized={this.onResized}
                                    maxHeight={this.getMaxHeight}
                                    currentDay={currentDay}
                                >
                                </ScheduleEvent>)
                        })
                    }

                    {
                        events.map((event2, idx2) => {
                            return event2.subEvents.map((subEvent, idx3) => {
                                return (
                                    <ScheduleEvent
                                        event={subEvent}
                                        key={subEvent.id + idx3 + idx2 + event2.id}
                                        type={"CHILD"}
                                        step={pixelsPerMinute}
                                        minHeight={(pixelsPerMinute * interval)}
                                        initialTop={this.calculateInitialTop(subEvent)}
                                        initialHeight={this.calculateInitialHeight(subEvent)}
                                        canResize={this.canResize}
                                        onResized={this.onResized}
                                        maxHeight={this.calculateInitialHeight(event2)}
                                        currentDay={currentDay}
                                    >
                                    </ScheduleEvent>
                                )
                            })
                        })
                    }

                </div>
            </div>
        );
    }
}

export default ScheduleEventList;