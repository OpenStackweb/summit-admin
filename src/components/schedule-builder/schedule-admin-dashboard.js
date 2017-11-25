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
import { getUnScheduleEventsPage, publishEvent } from '../../actions';
import UnScheduleEventList from './unschedule-event-list';
import ScheduleEventList from './schedule-event-list';
import SummitEvent from '../../models/summit-event';
import { DefaultEventMinutesDuration, PixelsPerMinute } from '../../constants';

class ScheduleAdminDashBoard extends React.Component {

    constructor(props){
        super(props);
        this.onScheduleEvent             = this.onScheduleEvent.bind(this);
        this.onScheduleSubEvent          = this.onScheduleSubEvent.bind(this);
        this.onScheduleEventWithDuration = this.onScheduleEventWithDuration.bind(this);
    }

    componentDidMount(){
        let { summit } = this.props;
        this.props.getUnScheduleEventsPage(summit.id);
    }

    onScheduleEvent(event, currentDay, startDateTime){
        let eventModel      = new SummitEvent(event);
        let formerParentId  = eventModel.isChildEvent() ? eventModel.getParentId(): 0;
        this.props.publishEvent({...event, parentId: 0, formerParentId}, currentDay, startDateTime, eventModel.getMinutesDuration());
    }

    onScheduleSubEvent(subEvent, parentEvent, currentDay, startTime, duration){
        let eventModel      = new SummitEvent(subEvent);
        let formerParentId  = eventModel.isChildEvent() ? eventModel.getParentId(): 0;
        this.props.publishEvent
        (
            {...subEvent, parentId: parentEvent.id, formerParentId},
            currentDay,
            startTime,
            duration
        );
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
        let { scheduleEvents, unScheduleEvents, childScheduleEvents } = this.props;
        return(
            <div className="row schedule-app-container no-margin">
                <div className="col-md-6 published-container">
                    <ScheduleEventList
                        startTime={"07:00"}
                        endTime={"22:00"}
                        interval={DefaultEventMinutesDuration}
                        currentDay={"2017-11-04"}
                        pixelsPerMinute={PixelsPerMinute}
                        onScheduleEvent={this.onScheduleEvent}
                        onScheduleSubEvent={this.onScheduleSubEvent}
                        onScheduleEventWithDuration={this.onScheduleEventWithDuration}
                        events={ scheduleEvents }
                        childEvents={childScheduleEvents}/>
                </div>
                <div className="col-md-6 unpublished-container">
                    <UnScheduleEventList events={ unScheduleEvents } />
                </div>
            </div>
        );
    }
}

ScheduleAdminDashBoard = DragDropContext(HTML5Backend)(ScheduleAdminDashBoard);

function mapStateToProps({ currentScheduleBuilderState }) {
    return {
        scheduleEvents      : currentScheduleBuilderState.scheduleEvents,
        unScheduleEvents    : currentScheduleBuilderState.unScheduleEvents,
        childScheduleEvents : currentScheduleBuilderState.childScheduleEvents,
    }
}

export default connect(mapStateToProps, {
    getUnScheduleEventsPage,
    publishEvent,
})(ScheduleAdminDashBoard);