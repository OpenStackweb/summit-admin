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
import PropTypes from 'prop-types';
import { DraggableItemTypes } from './draggable-items-types';
import {DropTarget } from 'react-dnd';
import { PixelsPerMinute, DefaultEventMinutesDuration } from '../../constants';
import SummitEvent from '../../models/summit-event';

const ScheduleEventTimeSlotTarget = {
    canDrop(props, monitor) {
        let subEvent   = monitor.getItem();
        let eventModel = new SummitEvent(subEvent);
        let { event, height, currentDay, timeSlot} = props;
        if(subEvent.id == event.id) return false;
        let minHeight = ( PixelsPerMinute * DefaultEventMinutesDuration);
        if(height !== minHeight) return false;
        if(eventModel.hasChilds()) return false;
        return eventModel.canMoveChild(event, currentDay, timeSlot);
    },
    drop(props, monitor, component) {
        let subEvent                                      = monitor.getItem();
        let { onDroppedSubEvent, event, timeSlot, height} = props;
        let eventModel                                    = new SummitEvent(subEvent);
        let duration                                      = Math.floor(height / PixelsPerMinute);
        // check if published to get real duration ...
        if(eventModel.isPublished()) {
            duration = eventModel.getMinutesDuration();
        }

        onDroppedSubEvent(subEvent, event, timeSlot, duration);
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

class ScheduleEventTimeSlot extends React.Component {

    renderOverlay(color) {
        return (
            <div style={{
                backgroundColor: color,
            }} className="sub-event-time-slot-overlay"/>
        );
    }

    render(){

        const {
            connectDropTarget,
            height,
            isOver,
            canDrop,
        } = this.props;

        return connectDropTarget(
            <div style={{
                position: 'relative',
                top: 0,
                left: 0,
                height: height,
                width: '100%',
            }}>
                {isOver && !canDrop && this.renderOverlay('red')}
                {!isOver && canDrop && this.renderOverlay('yellow')}
                {isOver && canDrop && this.renderOverlay('green')}
            </div>
        );
    }
}

export default DropTarget([
        DraggableItemTypes.UNSCHEDULEEVENT,
        DraggableItemTypes.SCHEDULEEVENT ],
    ScheduleEventTimeSlotTarget,
    collect
)(ScheduleEventTimeSlot);