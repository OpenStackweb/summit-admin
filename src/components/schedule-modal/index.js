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
import T from 'i18n-react/dist/i18n-react';
import moment from 'moment-timezone';
import { Modal } from 'react-bootstrap';
import './schedule-modal.less';

export default class ScheduleModal extends React.Component {

    constructor(props) {
        super(props);

        this.getFormatedSchedule = this.getFormatedSchedule.bind(this);
    }

    getFormattedTime(atime) {
        atime = atime * 1000;
        return moment(atime).tz(this.props.summit.time_zone.name).format('h:mm a');
    }

    getFormattedDay(atime) {
        atime = atime * 1000;
        return moment(atime).tz(this.props.summit.time_zone.name).format('dddd D');
    }

    getFormatedSchedule() {
        let groupedSchedule = {};
        let sortedSchedule = this.props.schedule.sort(
            (a, b) => (a.start_date > b.start_date ? 1 : (a.start_date < b.start_date ? -1 : 0))
        );

        for (var i in sortedSchedule) {
            let day = this.getFormattedDay(sortedSchedule[i].start_date);
            if (!groupedSchedule.hasOwnProperty(day)) groupedSchedule[day] = [];
            groupedSchedule[day].push(sortedSchedule[i]);
        }

        return Object.keys(groupedSchedule).map((day) =>
            <div key={groupedSchedule[day][0].start_date}>
                <h3>{day}</h3>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Event</th>
                        <th>Place</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groupedSchedule[day].map(e =>
                        <tr key={e.id}>
                            <td>{e.title}</td>
                            <td>need location in schedule</td>
                            <td>{this.getFormattedTime(e.start_date)}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }

    render() {
        let {show, title, onClose} = this.props;

        return (
            <Modal show={show} onHide={onClose} dialogClassName="schedule-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{title} {T.translate("attendee_list.schedule")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.getFormatedSchedule()}
                </Modal.Body>
            </Modal>
        );

    }
}

