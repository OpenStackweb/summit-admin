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
import { DragSource } from 'react-dnd';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import { RawHTML } from 'openstack-uicore-foundation/lib/components';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'


const UnScheduleEventSource = {
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

        //CardActions.moveCardToList(item.id, dropResult.listId);
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class UnScheduleEvent extends React.Component {

    popoverHoverFocus(){
        const { event } = this.props;
        return(
            <Popover id="popover-trigger-focus" title={event.title}>
                <RawHTML>{event.description}</RawHTML>
            </Popover>
        )
    }

    onClickEdit(){
        let { event, onEditEvent } = this.props;
        onEditEvent(event);
    }

    onClickSelected(){
        let { event, onClickSelected } = this.props;
        onClickSelected(event);
    }

    onChanged(){

    }

    render() {
        const { connectDragSource, isDragging, event, selectedUnPublishedEvents } = this.props;
        let isSelected = selectedUnPublishedEvents.includes(event.id);

        return connectDragSource(

                <div className='row unschedule-event'
                     style={{
                         opacity: isDragging ? 0.5 : 1,
                         cursor: isDragging ? 'move' : '-webkit-grab'
                     }}>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="event-select-wrapper">
                                    <input className="select-event-btn"
                                       id={`selected_event_${event.id}`}
                                       type="checkbox"
                                       checked={isSelected}
                                       onChange={this.onChanged.bind(this)}
                                       onClick={this.onClickSelected.bind(this)}/>
                                </div>
                                <div className="event-container">
                                    <div className="event-content">
                                        <OverlayTrigger trigger={['hover']} placement="bottom" overlay={this.popoverHoverFocus()}>
                                            <span className="event-title">
                                                { event.title }
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                </div>
                                <div className="event-actions">
                                    <i className="fa fa-pencil-square-o edit-unpublished-event-btn" title="edit event" aria-hidden="true" onClick={this.onClickEdit.bind(this)}></i>
                                </div>
                            </div>
                        </div>
                </div>
        );
    }
}

UnScheduleEvent.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
};

export default DragSource(DraggableItemTypes.UNSCHEDULEEVENT, UnScheduleEventSource, collect)(UnScheduleEvent);
