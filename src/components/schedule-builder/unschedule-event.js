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
import {DraggableItemTypes} from './draggable-items-types';
import {useDrag} from 'react-dnd';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import {RawHTML} from 'openstack-uicore-foundation/lib/components';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'


const UnScheduleEvent = ({event, onEditEvent, onClickSelected, selectedUnPublishedEvents}) => {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: DraggableItemTypes.UNSCHEDULEEVENT,
    item: {id: event.id, title: event.title, is_published: event.is_published, start_date: event.start_date, end_date: event.end_date, duration: event.duration},
    collect: (monitor, props) => ({isDragging: monitor.isDragging()})
  }), [event.id, event.duration, event.start_date, event.end_date]);
  const isSelected = selectedUnPublishedEvents.includes(event.id);
  const title = event.title.slice(0, 75) + (event.title.length > 75 ? '...' : '');
  const rank = event.rank ?
    <span className={`rank-status ${event.selection_status}`}> #{event.rank} - {event.selection_status}</span> :
    <span/>;
  const opacity = collected.isDragging ? 0.5 : 1;
  const cursor = collected.isDragging ? 'move' : '-webkit-grab';

  const formatSpeakers = (speakers) => {
    let formatedSpeakers = '';
    if (speakers && speakers.length > 0) {
      speakers.forEach((speaker, index) => {
        formatedSpeakers += `${speaker.first_name} ${speaker.last_name}`;
        if (speakers.length > index + 2) formatedSpeakers += ', ';
        if (speakers.length - 2 === index) formatedSpeakers += ' & ';
      });
    }    
    return formatedSpeakers;
  }

  const speakers = formatSpeakers(event.speakers).slice(0, 30) + (event.title.length > 30 ? '...' : '');

  const popoverHoverFocus = () => {
    return (
      <Popover id="popover-trigger-focus" title={event.title}>
        <RawHTML>{event.description}</RawHTML>
      </Popover>
    )
  };

  return (
    <div className='row unschedule-event' style={{opacity, cursor}} ref={drag}>
      <div className="row">
        <div className="col-md-12">
          <div className="event-select-wrapper">
            <input
              className="select-event-btn"
              id={`selected_event_${event.id}`}
              type="checkbox"
              checked={isSelected}
              onChange={() => onClickSelected(event)}/>
          </div>
          <div className="event-container">
            <div className="event-content">
              <OverlayTrigger trigger={['hover']} placement="bottom" overlay={popoverHoverFocus()}>
                                <span className="event-title">
                                    {`${event.id} - ${title} ${speakers? ` - ${speakers}` : ''} ${event.duration ? ` - ${event.duration/60} minutes`:''}`}
                                  {rank}
                                </span>
              </OverlayTrigger>
            </div>
          </div>
          <div className="event-actions">
            <i className="fa fa-pencil-square-o edit-unpublished-event-btn" title="edit event" aria-hidden="true"
               onClick={() => onEditEvent(event)}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnScheduleEvent;
