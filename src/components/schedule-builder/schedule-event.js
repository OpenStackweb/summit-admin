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
import ReactDOM    from 'react-dom';
import { DraggableItemTypes } from './draggable-items-types';
import { DragSource, DropTarget } from 'react-dnd';
import { DefaultEventMinutesDuration, PixelsPerMinute } from '../../constants';
import ScheduleEventTimeSlot from './schedule-event-time-slot';
import moment from 'moment';

const RESIZING_DIR_NORTH = 'N';
const RESIZING_DIR_SOUTH = 'S';

const ScheduleEventSource = {
    beginDrag(props) {
        let { event } = props;
        return event;
    },
    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            return;
        }
        // When dropped on a compatible target, do something
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        connectDragPreview: connect.dragPreview(),
    }
}

const IsResizeClass = new RegExp('(\\s|^)is-resizable(\\s|$)');

class ScheduleEvent extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            top: this.props.initialTop,
            height: this.props.initialHeight,
            resizing: false,
            resizeInfo: null,
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp   = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    get height(){
        return this.state.height;
    }

    componentDidMount() {
    }

    componentWillMount(){
    }

    componentWillReceiveProps(nextProps){
        this.setState({...this.state,
            top: nextProps.initialTop,
            height: nextProps.initialHeight});
    }

    componentWillUpdate(){
    }

    getInlineStyles(isDragging){
        return {
            top: this.state.top,
            height:this.state.height,
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move',
        };
    }

    // resize behavior

    onMouseDown(evt){
        if (!IsResizeClass.test(evt.target.className)) { return; }
        const box = ReactDOM.findDOMNode(this.scheduleEvent).getBoundingClientRect();
        let type;
        if (evt.clientY - box.top < 10) {
            type =  RESIZING_DIR_NORTH;
        } else if (box.bottom - evt.clientY < 10) {
            type = RESIZING_DIR_SOUTH;
        } else {
            return;
        }
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('mouseup', this.onMouseUp, false);
        this.setState({...this.state, resizing: true, resizeInfo: {type, startYPos : evt.pageY, lastYPos: evt.pageY, prevTop: this.state.top, prevHeight: this.state.height}})
        evt.preventDefault();
    }

    onMouseMove(evt) {
        let {resizeInfo, top, height, resizing} = this.state;
        if(!resizing) return;

        let lastYPos = resizeInfo.lastYPos;
        let newYPos  = evt.pageY;
        let deltaY   = newYPos - lastYPos;

        if(this.props.step && this.props.step > 0){
            /*
            if((Math.abs(deltaY) % this.props.step) !== 0){
                evt.preventDefault();
                return false;
            }*/
            let steps = parseInt(Math.round(Math.abs(deltaY) / this.props.step));
            deltaY    = Math.sign(deltaY) * steps * this.props.step;
            if(!deltaY){
                evt.preventDefault();
                return false;
            }
        }

        let newHeight = height;
        let newTop    = top;

        if(resizeInfo.type == RESIZING_DIR_SOUTH) {
            newHeight = height + deltaY;
        }

        if(resizeInfo.type == RESIZING_DIR_NORTH){
            if(deltaY < 0){
                newTop = top - Math.abs(deltaY);
                newHeight = height + Math.abs(deltaY);
            }
            else{
                newTop    = top + Math.abs(deltaY);
                newHeight = height - Math.abs(deltaY);
            }
        }

        // check constraints
        if(newHeight < this.props.minHeight){
            newHeight = this.props.minHeight;
            newYPos   = lastYPos;
            newTop    = top;
        }

        let maxHeight = this.props.maxHeight;
        if(typeof maxHeight === "function")
            maxHeight = maxHeight();
        if(newHeight > maxHeight){
            newHeight = maxHeight;
            newYPos   = lastYPos;
            newTop    = top;
        }

        if(newTop < 0){
            newTop    = 0;
            newHeight = height;
            newYPos   = lastYPos;
        }

        if(this.canResize(newTop, newHeight))
            this.setState(
                {...this.state,
                    top:newTop,
                    height:newHeight,
                    resizeInfo: {...this.state.resizeInfo, lastYPos: newYPos }}
            );
        evt.preventDefault();
    }

    onMouseUp(evt) {
        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);
        this.setState({...this.state, resizing: false, resizeInfo: null})
        if(this.props.onResized){
            return this.props.onResized(this.props.event.id, this.state.top, this.state.height);
        }
        evt.preventDefault();
    }

    canResize(newTop, newHeight){
        if(this.props.canResize){
            return this.props.canResize(this.props.event.id, newTop, newHeight);
        }
        return true;
    }

    // end resize behavior

    renderTimeSlotGrid(){
        const {
            event,
            type,
            currentDay
        } = this.props;

        if(type !== 'MAIN') return null;

        let minHeight = DefaultEventMinutesDuration * PixelsPerMinute;
        let slots     = Math.floor(this.state.height / minHeight);

        let slotsJSX  = [];
        let eventStartDateTime = moment(event.start_datetime);
        let startTime          = eventStartDateTime.format('HH:mm')
        let timeSlot           = moment(startTime, 'HH:mm');
        for(let i = 0; i < slots; i++){
            slotsJSX.push(
                <ScheduleEventTimeSlot
                    key={event.id+i}
                    height={minHeight}
                    event={event}
                    timeSlot={timeSlot}
                    onDroppedSubEvent={this.props.onDroppedSubEvent}
                    currentDay={currentDay}
                >
                </ScheduleEventTimeSlot>
            );
            timeSlot = timeSlot.clone();
            timeSlot.add(DefaultEventMinutesDuration, 'minutes');
        }

        let reminder = this.state.height % minHeight;
        if(reminder > 0){

            slotsJSX.push(
                <ScheduleEventTimeSlot
                    key={event.id+slotsJSX.length}
                    height={reminder}
                    event={event}
                    timeSlot={timeSlot}
                    onDroppedSubEvent={this.props.onDroppedSubEvent}
                    currentDay={currentDay}
                >
                </ScheduleEventTimeSlot>
            );
        }

        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
            }}>

                {
                    slotsJSX
                }
            </div>
        );

    }

    render() {
        const { connectDragSource,
            isDragging,
            event,
            type
        } = this.props;

        return connectDragSource(
            <div className={'row '+(type == 'CHILD' ?'schedule-sub-event':'schedule-event')+' is-resizable'}
                 onMouseDown={this.onMouseDown}
                 ref={(div) => { this.scheduleEvent = div; }}
                 style={this.getInlineStyles(isDragging)}>
                <div className="col-md-12 event-container">
                    <div className={((type == 'MAIN' && event.subEvents.length == 0) || type == 'CHILD')?'event-content':'event-content-half'}>
                        <span>{ event.title }</span>
                    </div>
                </div>
                {this.renderTimeSlotGrid()}
            </div>
        );
    }
}

export default DragSource(DraggableItemTypes.SCHEDULEEVENT, ScheduleEventSource, collect)(ScheduleEvent);