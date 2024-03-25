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
import UnScheduleEvent from './unschedule-event';
import { Pagination } from 'react-bootstrap';
import T from "i18n-react/dist/i18n-react";

class UnScheduleEventList extends React.Component {

    isSelected = (event) => {
        const {selectedUnPublishedEvents, excludedUnPublishedEvents, selectedAllUnPublished} = this.props;
        return (selectedAllUnPublished && !excludedUnPublishedEvents.includes(event.id)) || (!selectedAllUnPublished && selectedUnPublishedEvents.includes(event.id));
    }

    render(){
        const { events, currentPage, lastPage, onPageChange, onEditEvent, onClickSelected } = this.props;

        return (
            <div>
                { events.length === 0 &&
                    <p className="empty-list-message">{T.translate("errors.empty_list")}</p>
                }
                {   events.length > 0 &&
                    <ul className="unschedule-list">
                        {
                            events.map((event, index) => (
                                <li key={index}>
                                    <UnScheduleEvent
                                        event={event}
                                        onEditEvent={onEditEvent}
                                        isSelected={this.isSelected(event)}
                                        onClickSelected={onClickSelected}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                }
                {   events.length > 0 &&
                    <Pagination
                        bsSize="medium"
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        maxButtons={10}
                        items={lastPage}
                        activePage={currentPage}
                        onSelect={onPageChange}
                    />
                }
            </div>
        );
    }
}

export default UnScheduleEventList;
