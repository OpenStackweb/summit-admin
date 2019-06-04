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
import history from "../../history";


class TagReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleSort = this.handleSort.bind(this);

    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit} = this.props;

        listFilters.summitId = currentSummit.id;
        listFilters.published = true;

        let query = new Query("tags", listFilters);

        let results = new Query("results", filters);
        results.find(["id", "tag", `eventCount(summitId:${currentSummit.id})`]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    preProcessData(data, extraData, forExport=false) {

        let processedData = data.map(it => {
            let tag = forExport ? it.tag : <a onClick={() => {history.push(`tag_report/${it.id}`, {name: it.tag})}} >{it.tag}</a>

            return ({
                id: it.id,
                tag: tag,
                count: it.eventCount,
            });
        });

        let columns = [
            { columnKey: 'tag', value: 'Tag', sortable: true },
            { columnKey: 'count', value: 'Count' },
        ];

        return {reportData: processedData, tableColumns: columns};
    }

    handleSort(index, key, dir, func) {
        let sortKey = null;
        switch(key) {
            case 'track':
                sortKey = 'category__title';
                break;
        }

        this.props.onSort(index, sortKey, dir, func);

    }

    getName() {
        return 'Tag Report';
    }

    render() {
        let {data, extraData, totalCount} = this.props;

        let report_options = { actions: {} }

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        return (
            <div className="tag-report">
                <div className="panel panel-default">
                    <div className="panel-heading"> Tags ({totalCount}) </div>

                    <div className="table">
                        <Table
                            options={report_options}
                            data={reportData}
                            columns={tableColumns}
                            onSort={this.handleSort}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


export default wrapReport(TagReport, {pagination: true});
