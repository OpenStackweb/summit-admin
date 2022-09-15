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
import moment from 'moment-timezone'
import { Table } from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {groupByDate} from '../../utils/methods'
import {flattenData} from "../../actions/report-actions";

class RoomReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.handleAttendeeList = this.handleAttendeeList.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;

        listFilters.published = true;
        listFilters.summitId = currentSummit.id;

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = `${order}${querySortKey},start_date`;
        }

        let query = new Query("events", listFilters);
        let category = new Query("category");
        category.find(["code"]);
        let venue = new Query("venue");
        venue.find(["name"]);
        let venueroom = new Query("venueroom");
        venueroom.find(["name", "capacity", {"venue": venue}]);
        let location = new Query("location");
        location.find([{"venueroom": venueroom}]);
        let results = new Query("results", filters);
        results.find(["id", "title", "startDate", "endDate", "headCount", "speakerCount", "attendeeCount", "uniqueMetricCount", {"category": category}, {"location": location}])

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;
        switch(key) {
            case 'event':
                sortKey = 'title';
                break;
            case 'room':
                sortKey = 'location__venueroom__name';
                break;
            case 'time':
                sortKey = 'start_date';
                break;
        }

        return sortKey;
    }

    getName() {
        return 'Room Report';
    }

    handleAttendeeList(eventId) {
        let {data} = this.props;
        let event = data.find(ev => ev.id === eventId);

        if (event) {
            this.props.getMembersForEventCSV(event);
        }
    }

    preProcessData(data, extraData, forExport=false) {
        const {currentSummit} = this.props;
        let flatData = flattenData(data);

        let columns = [
            { columnKey: 'id', value: 'Id' },
            { columnKey: 'time', value: 'Time', sortable: true },
            { columnKey: 'code', value: 'Code' },
            { columnKey: 'event', value: 'Event', sortable: true },
            { columnKey: 'room', value: 'Room', sortable: true },
            { columnKey: 'venue', value: 'Venue' },
            { columnKey: 'capacity', value: 'Capacity' },
            { columnKey: 'speakers', value: 'Speakers' },
            { columnKey: 'scheduled', value: 'Scheduled' },
            { columnKey: 'metrics', value: 'Total Metrics' },
        ];


        let processedData = flatData.map(it => {

            // 2020-10-19T12:30:00+00:00

            const format = 'YYYY-MM-DDTHH:mm:ss+00:00';
            let momentStartDate = moment.tz(it.startDate, format, 'UTC').tz(currentSummit.time_zone_id);
            let momentEndDate = moment.tz(it.endDate, format, 'UTC').tz(currentSummit.time_zone_id);


            let date = momentStartDate.format('dddd Do');
            let date_simple = momentStartDate.valueOf();
            let time = momentStartDate.format('h:mm a') + ' - ' + momentEndDate.format('h:mm a');
            let capacity = forExport ? it.location_venueroom_capacity : <div className="text-center">{it.location_venueroom_capacity + ''}</div>;
            let speakers = forExport ? it.speakerCount : <div className="text-center">{it.speakerCount + ''}</div>;
            let head_count = forExport ? it.headCount : <div className="text-center">{it.headCount + ''}</div>;
            let scheduled = forExport ? it.attendeeCount : <div className="text-center">{it.attendeeCount + ''}</div>;
            let metrics = forExport ? it.uniqueMetricCount : <div className="text-center">{it.uniqueMetricCount + ''}</div>;

            return ({
                id: it.id,
                date: date,
                date_simple: date_simple,
                time: time,
                code: it.category_code,
                event: it.title,
                room: it.location_venueroom_name,
                venue: it.location_venueroom_venue_name,
                capacity: capacity,
                speakers: speakers,
                head_count: head_count,
                scheduled: scheduled,
                metrics: metrics,
            });
        });

        let groupedData = groupByDate(processedData ,'date', 'date_simple');

        return {reportData: groupedData, tableColumns: columns};
    }

    render() {
        let {data, sortKey, sortDir, currentSummit} = this.props;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />);

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {
              custom: [
                {
                  name: 'list_attendees',
                  tooltip: 'list attendees',
                  icon: <i className="fa fa-download"/>,
                  onClick: this.handleAttendeeList,
                }
              ]
            }
        };

        let {reportData, tableColumns} = this.preProcessData(data, null);

        let tables = [];

        for (var key in reportData) {
            tables.push(
                <div className="panel panel-default" key={'section_'+key}>
                    <div className="panel-heading">{key}</div>
                    <div className="table-responsive">
                        <Table
                            options={report_options}
                            data={reportData[key]}
                            columns={tableColumns}
                            onSort={this.props.onSort}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div>
                {tables}
            </div>
        );
    }
}


export default wrapReport(RoomReport, {pagination: false, filters:['track', 'room', 'type'], grouped: true});
