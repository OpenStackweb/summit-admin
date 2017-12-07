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
import {Popover, OverlayTrigger} from 'react-bootstrap';
import RawHTML from '../raw-html';

class ScheduleEventResult extends React.Component {

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

    render(){
        const { event } = this.props;
        return (
                <div className='row schedule-event-result'>
                    <i className="fa fa-pencil-square-o edit-published-event-btn" title="edit event" aria-hidden="true" onClick={this.onClickEdit.bind(this)}></i>
                    <div className="col-md-12">
                        <OverlayTrigger trigger={['hover']} placement="bottom" overlay={this.popoverHoverFocus()}>
                            <span className="event-title">
                                { event.title }
                            </span>
                        </OverlayTrigger>
                    </div>
                </div>
        )
    }
}

export default ScheduleEventResult;