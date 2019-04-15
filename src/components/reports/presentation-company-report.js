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
import { Pagination } from 'react-bootstrap';
import { Breadcrumb } from 'react-breadcrumbs';
import { Table } from 'openstack-uicore-foundation/lib/components'
import {getReport} from "../../actions/report-actions";
import {connect} from "react-redux";
const Query = require('graphql-query-builder');

const reportName = 'presentation_company_report';

class PresentationCompanyReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildQuery = this.buildQuery.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    componentWillMount () {
        let query = this.buildQuery(1);

        this.props.getReport(query, reportName, 1);
    }


    buildQuery(page) {
        let {pageInfo, currentPage, perPage} = this.props;
        let filters = {first: 25, summit_Id: 25};

        if(page > currentPage) {
            filters.first = perPage;
            filters.after = pageInfo.endCursor;
        } else {
            filters.last = perPage;
            filters.before = pageInfo.startCursor;
        }


        let query = new Query("allSpeakers",filters);
        let registration = new Query("registration");
        registration.find(["id", "email"]);
        let organization = new Query("organization");
        organization.find(["name"]);
        let affiliations = new Query("affiliations", {current: true});
        affiliations.find([{"edges":[{"node":["id", {"organization": organization}]}]}]);
        let member = new Query("member");
        member.find(["id", "firstName", "lastName","email", {"affiliations": affiliations}]);
        let category = new Query("category");
        category.find(["id", "title"]);
        let presentations = new Query("presentations",{summit_Id: 25});
        presentations.find([{"edges":[{"node":["id", "title", "abstract", {"category": category}]}]}]);

        query.find([
            {"edges":[
                "cursor",
                {"node":[
                    "id",
                    "firstName",
                    "lastName",
                    {"registration": registration},
                    {"member": member},
                    {"presentations": presentations},
                ]}
            ]},
            {"pageInfo":[
                "startCursor", "endCursor"
            ]},
            "totalCount"
        ]);

        //console.log(query.toString());

        return query;
    }

    handlePageChange(page) {
        let query = this.buildQuery(page);
        this.props.getReport(query, reportName, page);

    }

    render() {
        let {data, pageInfo, match, currentPage, totalCount, perPage} = this.props;

        let report_columns = [
            { columnKey: 'id', value: 'ID' },
            { columnKey: 'firstName', value: 'First Name' },
            { columnKey: 'lastName', value: 'Last Name' },
        ];

        let report_options = { actions: {} }

        let reportData = data;
        let lastPage = Math.floor(totalCount / perPage);

        return (
            <div className="container">
                <Breadcrumb data={{ title: T.translate(`reports.${reportName}`), pathname: match.url }} ></Breadcrumb>
                <div className="row">
                    <div className="col-md-8">
                        <h3>{T.translate(`reports.${reportName}`)}</h3>
                    </div>

                </div>
                <hr/>

                <div className="report-container">
                    <Table
                        options={report_options}
                        data={reportData}
                        columns={report_columns}
                    />
                </div>

                <Pagination
                    bsSize="medium"
                    prev
                    next
                    ellipsis
                    boundaryLinks
                    maxButtons={1}
                    items={lastPage}
                    activePage={currentPage}
                    onSelect={this.handlePageChange}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ currentSummitState, currentReportState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentReportState
})

export default connect (
    mapStateToProps,
    {
        getReport,
    }
)(PresentationCompanyReport);
