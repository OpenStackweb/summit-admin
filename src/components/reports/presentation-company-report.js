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
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    componentWillMount () {
        let query = this.buildQuery(1);

        this.props.getReport(query, reportName, 1);
    }


    buildQuery(page, key=null, dir=null) {
        let {pageInfo, currentPage, perPage} = this.props;
        let filters = {first: 25, summit_Id: 25};

        if (page != 1) {
            if(page > currentPage) {
                filters.first = perPage;
                filters.after = pageInfo.endCursor;
            } else {
                filters.last = perPage;
                filters.before = pageInfo.startCursor;
            }
        }

        if (key) {
            let order = (dir == 1) ? '' : '-';
            filters.sortBy = order + '' + key;
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

    handleSort(index, key, dir, func) {
        let sortKey = null;
        switch(key) {
            case 'track':
                sortKey = 'presentations__category__title';
                break;
        }

        let query = this.buildQuery(1, key, dir);
        this.props.getReport(query, reportName, 1);
    }

    handlePageChange(page) {
        let query = this.buildQuery(page);
        this.props.getReport(query, reportName, page);

    }

    render() {
        let {data, pageInfo, match, currentPage, totalCount, perPage} = this.props;

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
        let lastPage = Math.floor(totalCount / perPage);


        let reportData = data.filter(it => it.presentations.length > 0).map(it => {

            let org = (it.member.affiliations.length > 0 && it.member.affiliations[0].organization) ? it.member.affiliations[0].organization.name : 'N/A';

            return ({
                link: '<a href="">link</a>',
                event_title: it.presentations[0].title,
                description: it.presentations[0].abstract,
                track: it.presentations[0].category.title,
                first_name: it.firstName,
                last_name: it.lastName,
                email: it.member.email,
                company: org
            });
        });

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
                    <div className="panel panel-default">
                        <div className="panel-heading">Speakers ({totalCount})</div>

                        <Table
                            options={report_options}
                            data={reportData}
                            columns={report_columns}
                            onSort={this.handleSort}
                        />
                    </div>
                </div>

                <Pagination
                    bsSize="medium"
                    prev
                    next
                    ellipsis={false}
                    boundaryLinks={false}
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
