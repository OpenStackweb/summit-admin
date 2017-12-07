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
import ScheduleEventResult from './schedule-event-result';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminScheduleEventsSearchResults extends React.Component
{
    render(){
        let{ searchTerm, events, onEditEvent } = this.props;
        if(searchTerm == null || searchTerm == '') return null;
        if(events == null || events.length == 0) return(
          <p className="empty-list-message">There are no match for your search criteria.</p>
        );

        return (<ul className="schedule-list-search-results">
            {
                events.map((event, index) => (
                    <li key={index}>
                        <ScheduleEventResult event={event} onEditEvent={onEditEvent}></ScheduleEventResult>
                    </li>
                ))
            }
        </ul>);
    }
}

export default ScheduleAdminScheduleEventsSearchResults;