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

const reportName = 'presentation_track_report';

const buildQuery = (filters, listFilters, summitId) => {

    let query = new Query("presentations", listFilters);
    let category = new Query("category");
    category.find(["title"]);
    let type = new Query("type");
    type.find(["type"]);
    let results = new Query("results", filters);
    results.find(["id", "title", "status", {"category": category}, {"type": type}])

    query.find([{"results": results}, "totalCount"]);

    return query;
}

class PresentationTrackReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.handleSort = this.handleSort.bind(this);

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


    render() {
        let {data, totalCount, onSort} = this.props;

        let report_columns = [
            { columnKey: 'id', value: 'Id' },
            { columnKey: 'title', value: 'Presentation' },
            { columnKey: 'track', value: 'Track', sortable: true },
            { columnKey: 'status', value: 'Status' },
            { columnKey: 'type', value: 'Type' },
        ];

        let report_options = { actions: {} }

        let reportData = data.map(it => {

            return ({
                id: it.id,
                title: it.title,
                track: it.category_title,
                status: it.status,
                type: it.type_type,
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


export default wrapReport(PresentationTrackReport, buildQuery, reportName);
