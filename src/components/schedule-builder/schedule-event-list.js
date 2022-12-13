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
import React, {useEffect, useRef, useState} from 'react';
import moment from 'moment-timezone'
import {useDrop} from 'react-dnd'
import {DraggableItemTypes} from './draggable-items-types';
import ScheduleEvent from './schedule-event';
import ReactDOM from 'react-dom';
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

const TimeSlotContainer = ( props ) => {
  const {currentDay, currentSummit, events, timeSlot, pixelsPerMinute, interval, onDroppedEvent} = props;
  const divId = `time_slot_container_${timeSlot.format('HH_mm')}`;
  const [collectedProps, drop] = useDrop(() => ({
    accept: [DraggableItemTypes.UNSCHEDULEEVENT, DraggableItemTypes.SCHEDULEEVENT],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
    canDrop: (item, monitor) => {
      const eventModel = new SummitEvent(item, currentSummit);
      return eventModel.canMove(events, currentDay, timeSlot, interval);
    },
    drop: (item, monitor, component) => {
      onDroppedEvent(item, timeSlot);
    }
  }), [interval, timeSlot]);
  const {isOver, canDrop} = collectedProps;

  const renderOverlay = (color) => <div style={{backgroundColor: color}} className="time-slot-overlay"/>;

  const renderMinutesContainer = (interval, pixelsPerMinute) => {
    let minutesContainers = [];
    let container_count = 2;
    let container_height = pixelsPerMinute * 5;

    for (var i = 0; i < container_count; i++) {

      minutesContainers[i] = <div key={i} className="minute-container" style={{
        position: 'relative',
        width: '100%',
        height: `${container_height}px`
      }}/>;
    }

    return minutesContainers;
  };


  return (
    <div id={divId} ref={drop} className="row time-slot-container">
      <div className="col-md-12">
        {renderMinutesContainer(interval, pixelsPerMinute)}
      </div>
      {isOver && !canDrop && renderOverlay('red')}
      {!isOver && canDrop && renderOverlay('yellow')}
      {isOver && canDrop && renderOverlay('green')}
    </div>
  );
};






const ScheduleEventList = (props) => {
  const [timeSlotsList, setTimeSlotsList] = useState([]);
  const scheduleEventContainer = useRef(null);

  useEffect(() => {
    createSlots();
  }, [props.interval]);

  const onDroppedEvent = (event, startTime) => {
    props.onScheduleEvent(event, props.currentDay, startTime);
  }

  const canResize = (eventId, newTop, newHeight) => {
    const {events, currentDay, startTime, pixelsPerMinute, currentSummit} = props;
    const {height} = getBoundingBox();

    if (height < (newTop + newHeight)) {
      return false;
    }

    const filteredEvents = events.filter(evt => {
      return evt.id !== eventId;
    });
    // calculate new event start date, end date
    const minutes = Math.floor(newTop / (pixelsPerMinute * (10 / interval)));
    const duration = Math.floor(newHeight / (pixelsPerMinute * (10 / interval)));

    let startDateTime = moment.tz(currentDay + ' ' + startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
    startDateTime = startDateTime.add(minutes, 'minutes');
    let endDateTime = moment.tz(currentDay + ' ' + startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
    endDateTime = endDateTime.add(minutes + duration, 'minutes');

    for (const auxEvent of filteredEvents) {
      const auxEventStartDateTime = moment(auxEvent.start_date * 1000).tz(currentSummit.time_zone.name);
      const auxEventEndDateTime = moment(auxEvent.end_date * 1000).tz(currentSummit.time_zone.name);
      // if time segments overlap
      if (auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
        return false;
    }

    return true;
  }

  const onResized = (eventId, newTop, newHeight) => {
    const {events, currentDay, startTime, pixelsPerMinute, currentSummit} = props;
    const event = events.filter(evt => {
      return evt.id === eventId;
    }).shift();
    const minutes = Math.floor(newTop / (pixelsPerMinute * (10 / interval)));
    const duration = Math.floor(newHeight / (pixelsPerMinute * (10 / interval)));
    let startDateTime = moment.tz(currentDay + ' ' + startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
    startDateTime = startDateTime.add(minutes, 'minutes');

    props.onScheduleEventWithDuration(event, currentDay, moment(startDateTime.format('HH:mm'), 'HH:mm'), duration);
  }

  const getMaxHeight = () => {
    return getBoundingBox().height;
  }

  const getBoundingBox = () => {
    return ReactDOM.findDOMNode(scheduleEventContainer.current).getBoundingClientRect();
  }

  const calculateInitialTop = (event) => {
    const {currentDay, startTime, pixelsPerMinute, currentSummit} = props;
    const eventStartDateTime = moment(event.start_date * 1000).utc().tz(currentSummit.time_zone.name);
    const dayStartDateTime = moment.tz(currentDay + ' ' + startTime, 'YYYY-MM-DD HH:mm', currentSummit.time_zone.name);
    const minutes = eventStartDateTime.diff(dayStartDateTime, 'minutes');
    return minutes * pixelsPerMinute * (10 / interval);
  }

  const calculateInitialHeight = (event) => {
    const {pixelsPerMinute, currentSummit, interval} = props;
    const eventStartDateTime = moment(event.start_date * 1000).tz(currentSummit.time_zone.name);
    const eventEndDateTime = moment(event.end_date * 1000).tz(currentSummit.time_zone.name);
    const minutes = eventEndDateTime.diff(eventStartDateTime, 'minutes');
    return minutes * pixelsPerMinute * (10 / interval);
  }

  const createSlots = () => {
    const tmpList = [];
    let done = false;
    const startTimeTZ = moment.tz(startTime, 'HH:mm', currentSummit.time_zone.name);
    const endTimeTZ = moment.tz(endTime, 'HH:mm', currentSummit.time_zone.name);
    // create UI
    let slot = startTimeTZ;
    do {
      tmpList.push(slot);
      slot = slot.clone();
      slot.add(interval, 'm');
      done = slot.isAfter(endTimeTZ);
    } while (!done);

    setTimeSlotsList(tmpList);
  };

  const {
    events,
    startTime,
    endTime,
    interval,
    pixelsPerMinute,
    currentDay,
    currentSummit,
    onEditEvent,
    onUnPublishEvent,
    onClickSelected,
    selectedPublishedEvents
  } = props;

  return (
    <div className="row outer-schedule-events-container">
      <div className="col-md-2 no-margin no-padding">
        {
          timeSlotsList.map((slot, idx) => (
            <TimeSlot timeLabel={slot.format("HH:mm")} key={idx} id={slot.format("HH_mm")}/>
          ))
        }
      </div>
      <div
        className="schedule-events-container col-md-10 no-margin no-padding"
        ref={scheduleEventContainer}
      >
        {
          timeSlotsList.map((slot, idx) => (
            <TimeSlotContainer
              timeSlot={slot}
              onDroppedEvent={onDroppedEvent}
              key={`timeslot-${idx}`}
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
                key={`event-${event.id}-${event.start_date}-${event.end_date}-${interval}`}
                type={"MAIN"}
                step={pixelsPerMinute * 5}
                minHeight={(pixelsPerMinute * 10)}
                initialTop={calculateInitialTop(event)}
                initialHeight={calculateInitialHeight(event)}
                canResize={canResize}
                onResized={onResized}
                maxHeight={getMaxHeight}
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

export default ScheduleEventList;
