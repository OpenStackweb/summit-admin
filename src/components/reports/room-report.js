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
import T from 'i18n-react/dist/i18n-react'
import { Table } from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {groupBy} from '../../utils/methods'
import {flattenData} from "../../actions/report-actions";

class RoomReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.preProcessData = this.preProcessData.bind(this);

    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit} = this.props;

        listFilters.published = true;
        listFilters.summitId = currentSummit.id;

        let query = new Query("presentations", listFilters);
        let category = new Query("category");
        category.find(["code"]);
        let venue = new Query("venue");
        venue.find(["name"]);
        let venueroom = new Query("venueroom");
        venueroom.find(["name", "capacity", {"venue": venue}]);
        let location = new Query("location");
        location.find([{"venueroom": venueroom}]);
        let results = new Query("results", filters);
        results.find(["id", "title", "startDate", "endDate", "headCount", "speakerCount", "attendeeCount", {"category": category}, {"location": location}])

        query.find([{"results": results}, "totalCount"]);

        return query;
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

    getName() {
        return 'Room Report';
    }

    preProcessData(data, extraData, forExport=false) {

        let flatData = flattenData(data);

        let columns = [
            { columnKey: 'id', value: 'Id' },
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


        let processedData = flatData.map(it => {

            let date = moment(it.startDate).format('dddd Do');
            let time = moment(it.startDate).format('h:mm a') + ' - ' + moment(it.endDate).format('h:mm a');
            let capacity = forExport ? it.location_venueroom_capacity : <div className="text-center">{it.location_venueroom_capacity + ''}</div>;
            let speakers = forExport ? it.speakerCount : <div className="text-center">{it.speakerCount + ''}</div>;
            let head_count = forExport ? it.headCount : <div className="text-center">{it.headCount + ''}</div>;
            let total = forExport ? it.attendeeCount : <div className="text-center">{it.attendeeCount + ''}</div>;

            return ({
                id: it.id,
                date: date,
                time: time,
                code: it.category_code,
                event: it.title,
                room: it.location_venueroom_name,
                venue: it.location_venueroom_venue_name,
                capacity: capacity,
                speakers: speakers,
                head_count: head_count,
                total: total,
            });
        });

        return {reportData: processedData, tableColumns: columns};
    }

    render() {
        let {data, sortKey, sortDir, currentSummit} = this.props;
        let storedDataName = this.props.name;

        if (!data || storedDataName != this.getName()) return (<div></div>)

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        }

        let {reportData, tableColumns} = this.preProcessData(data, null);
        let groupedData = groupBy(reportData ,'date');

        let tables = [];

        for (var key in groupedData) {
            tables.push(
                <div className="panel panel-default" key={'section_'+key}>
                    <div className="panel-heading">{key}</div>
                    <div className="table-responsive">
                        <Table
                            options={report_options}
                            data={groupedData[key]}
                            columns={tableColumns}
                            onSort={this.handleSort}
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


export default wrapReport(RoomReport, {pagination: false, filters:['track', 'room']});
