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
import {flattenData} from "../../actions/report-actions";


class PresentationCompanyReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleSort = this.handleSort.bind(this);

    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit} = this.props;
        listFilters.summitId = currentSummit.id;

        let query = new Query("speakers", listFilters);
        let registration = new Query("registration");
        registration.find(["id", "email"]);
        let organization = new Query("organization");
        organization.find(["name"]);
        let affiliations = new Query("affiliations", {current: true});
        affiliations.find(["id", {"organization": organization}]);
        let member = new Query("member");
        member.find(["id", "firstName", "lastName","email", {"affiliations": affiliations}]);
        let category = new Query("category");
        category.find(["id", "title"]);
        let presentations = new Query("presentations",{summitId: currentSummit.id});
        presentations.find(["id", "title", "abstract", {"category": category}]);
        let results = new Query("results", filters);
        results.find([
            "id",
            "firstName",
            "lastName",
            {"registration": registration},
            {"member": member},
            {"presentations": presentations}
        ]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    handleSort(index, key, dir, func) {
        let sortKey = null;
        switch(key) {
            case 'track':
                sortKey = 'presentations__category__title';
                break;
        }

        this.props.onSort(index, sortKey, dir, func);

    }

    getName() {
        return 'Presentation Company Report';
    }

    render() {
        let {data, currentSummit, totalCount, onSort} = this.props;

        let flatData = flattenData(data);

        let report_columns = [
            { columnKey: 'link', value: 'Link' },
            { columnKey: 'event_title', value: 'Presentation' },
            { columnKey: 'description', value: 'Description' },
            { columnKey: 'track', value: 'Track', sortable: true },
            { columnKey: 'first_name', value: 'First Name' },
            { columnKey: 'last_name', value: 'Last Name' },
            { columnKey: 'email', value: 'Email' },
            { columnKey: 'company', value: 'Company' }
        ];

        let report_options = { actions: {} }

        let reportData = flatData.map(it => {

            return ({
                link: `<a href="/app/summits/${currentSummit.id}/events/${it.presentations_id}">link</a>`,
                event_title: it.presentations_title,
                description: it.presentations_abstract,
                track: it.presentations_category_title,
                first_name: it.firstName,
                last_name: it.lastName,
                email: it.member_email,
                company: it.member_affiliations_organization_name
            });
        });

        return (
            <div className="panel panel-default">
                <div className="panel-heading">Speakers ({totalCount})</div>
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


export default wrapReport(PresentationCompanyReport, {pagination: true});
