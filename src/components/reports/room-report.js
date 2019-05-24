/**
 * Copyright 2019 OpenStack Foundation
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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import { Table } from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';

const reportName = 'room_report';

const buildQuery = (filters, listFilters, summitId) => {

    listFilters.published = true;

    let query = new Query("presentations", listFilters);
    let category = new Query("category");
    category.find(["code"]);
    let venueroom = new Query("venueroom");
    venueroom.find(["name", "capacity"]);
    let location = new Query("location");
    location.find(["name", {"venueroom": venueroom}]);
    let results = new Query("results", filters);
    results.find(["id", "title", "startDate", "endDate", "headCount", "speakerCount", "attendeeCount", {"category": category}, {"location": location}])

    query.find([{"results": results}, "totalCount"]);

    return query;
}

class RoomReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.handleSort = this.handleSort.bind(this);

    }

    handleSort(index, key, dir, func) {
        let sortKey = key;
        switch(key) {
            case 'track':
                sortKey = 'category__title';
                break;
        }

        this.props.onSort(index, sortKey, dir, func);

    }

    centerValue(value) {
        return `<div class="text-center">${value+''}</div>`;
    }

    render() {
        let {data, totalCount, onSort} = this.props;

        let report_columns = [
            { columnKey: 'id', value: 'Id' },
            { columnKey: 'date', value: 'Date' },
            { columnKey: 'time', value: 'Time' },
            { columnKey: 'code', value: 'Code' },
            { columnKey: 'event', value: 'Event', sortable: true },
            { columnKey: 'room', value: 'Room' },
            { columnKey: 'venue', value: 'Venue' },
            { columnKey: 'capacity', value: 'Capacity' },
            { columnKey: 'speakers', value: 'Speakers' },
            { columnKey: 'head_count', value: 'HeadCount' },
            { columnKey: 'total', value: 'Total' },
        ];

        let report_options = { actions: {} }

        let reportData = data.map(it => {

            let date = it.startDate;
            let time = it.endDate;

            return ({
                id: it.id,
                date: date,
                time: time,
                code: it.category_code,
                event: it.title,
                room: it.location_venueroom_name,
                venue: it.location_name,
                capacity: this.centerValue(it.location_venueroom_capacity),
                speakers: this.centerValue(it.speakerCount),
                head_count: this.centerValue(it.headCount),
                total: this.centerValue(it.attendeeCount),
            });
        });

        return (
            <div className="panel panel-default">
                <div className="panel-heading">Presentations ({totalCount})</div>
                <div className="table-responsive">
                    <Table
                        options={report_options}
                        data={reportData}
                        columns={report_columns}
                        onSort={this.handleSort}
                    />
                </div>
            </div>
        );
    }
}


export default wrapReport(RoomReport, buildQuery, reportName);
