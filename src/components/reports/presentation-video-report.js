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
import { Table } from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";
import moment from "moment-timezone";


class PresentationVideoReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.buildReportQuery = this.buildReportQuery.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;

        listFilters.summitId = currentSummit.id;
        listFilters.hasVideo = true;

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        let query = new Query("presentations", listFilters);
        let venue = new Query("venue");
        venue.find(["id", "name"]);
        let venueroom = new Query("venueroom");
        venueroom.find(["id", "name", {"venue": venue}]);
        let location = new Query("location");
        location.find(["id", {"venueroom": venueroom}]);
        let results = new Query("results", filters);
        results.find
        (
            [
                "id",
                "title",
                "startDate",
                "endDate",
                "tagNames",
                "youtubeId",
                "externalUrl",
                {"location": location}
                ]
        );

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    preProcessData(data, extraData, forExport=false) {
        const {currentSummit} = this.props;
        let flatData = flattenData(data);

        let processedData = flatData.map(it => {
            let momentStartDate = moment.tz(it.startDate, 'UTC').tz(currentSummit.time_zone_id);
            let momentEndDate = moment.tz(it.endDate, 'UTC').tz(currentSummit.time_zone_id);
            let time = momentStartDate.format('h:mm a') + ' - ' + momentEndDate.format('h:mm a');

            return ({
                id: it.id,
                event: it.title,
                time: time,
                tags: it.tagNames,
                room: it.location_venueroom_name,
                venue: it.location_venueroom_venue_name,
                youtubeId: it.youtubeId,
                externalUrl: it.externalUrl,
            });
        });

        let columns = [
            { columnKey: 'id', value: 'ID', sortable: true },
            { columnKey: 'time', value: 'Time' },
            { columnKey: 'tags', value: 'Tags' },
            { columnKey: 'event', value: 'Event' },
            { columnKey: 'room', value: 'Room' },
            { columnKey: 'venue', value: 'Venue' },
            { columnKey: 'youtubeId', value: 'Youtube Id' },
            { columnKey: 'externalUrl', value: 'External Url' },
        ];

        return {reportData: processedData, tableColumns: columns};
    }

    translateSortKey(key) {
        let sortKey = key;
        return sortKey;
    }

    getName() {
        return 'Video Output Report';
    }

    render() {
        let {data, extraData, totalCount, sortKey, sortDir} = this.props;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />)

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        return (
            <div className="tag-report">
                <div className="panel panel-default">
                    <div className="panel-heading"> Events ({totalCount}) </div>

                    <div className="table">
                        <Table
                            options={report_options}
                            data={reportData}
                            columns={tableColumns}
                            onSort={this.props.onSort}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


export default wrapReport(PresentationVideoReport, {pagination: true, filters:["track", "room"]});
