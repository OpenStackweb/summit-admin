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


class SingleTagReport extends React.Component {
    constructor(props) {
        super(props);

        let reportName = props.location.state ? props.location.state.name : `Tag ${props.match.params.tag_id}`;

        this.state = {
            reportName: reportName
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.getName = this.getName.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        let tag_id = this.props.match.params.tag_id;
        const {currentSummit} = this.props;

        listFilters.summitId = currentSummit.id;
        listFilters.tagId = parseInt(tag_id);
        listFilters.published = true;

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        let query = new Query("presentations", listFilters);
        let results = new Query("results", filters);
        results.find(["id", "title", "attendingMedia", "speakerNames"]);
        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;

        return sortKey;
    }

    preProcessData(data, extraData, forExport=false) {
        let processedData = data.map(it => {
            let attMedia = it.attendingMedia;

            if(!forExport) {
                attMedia = it.attendingMedia ? '<div class="text-center"><i class="fa fa-times" aria-hidden="true"/></div>' :
                    '<div class="text-center"><i class="fa fa-check" aria-hidden="true"/></div>';
            }

            return ({
                id: it.id,
                title: it.title,
                speakers: it.speakerNames,
                attendingMedia: attMedia
            });
        });

        let columns = [
            { columnKey: 'id', value: 'Event Id', sortable: true },
            { columnKey: 'title', value: 'Title' },
            { columnKey: 'speakers', value: 'Speakers' },
            { columnKey: 'attendingMedia', value: 'Att. Media' },
        ];

        return {reportData: processedData, tableColumns: columns};
    }


    getName() {
        return this.state.reportName;
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
            <div className="panel panel-default">
                <div className="panel-heading">Events ({totalCount})</div>
                <div className="table-responsive">
                    <Table
                        options={report_options}
                        data={reportData}
                        columns={tableColumns}
                        onSort={this.props.onSort}
                    />
                </div>
            </div>
        );
    }
}


export default wrapReport(SingleTagReport, {pagination: true});
