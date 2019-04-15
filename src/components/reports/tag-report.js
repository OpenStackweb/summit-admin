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
import { Breadcrumb } from 'react-breadcrumbs';
import { Table } from 'openstack-uicore-foundation/lib/components'
import history from "../../history";
import {connect} from "react-redux";
import {getReport} from "../../actions/report-actions";
const Query = require('graphql-query-builder');

const reportName = 'tag_report';

class TagReport extends React.Component {
    constructor(props) {
        super(props);

    }

    componentWillMount () {
        let query = this.buildQuery();

        this.props.getReport(query, reportName);
    }


    buildQuery() {
        let query = new Query("allTags",{first: 25, summit_Id: 25});
        let events = new Query("events",{summit_Id: 25, published: true});
        events.find([{"edges":[{"node":["id"]}]}]);

        query.find([{"edges":[{"node":["id", "tag", {"events": events}]}]}]);

        console.log(query.toString());

        return query;
    }

    render() {
        let {data, match} = this.props;

        let report_columns = [
            { columnKey: 'tag', value: 'Tag' },
            { columnKey: 'count', value: 'Count' }
        ];

        let report_options = { actions: {} }

        let reportData = data.map(it => ({tag: it.tag, count: it.events.length}));

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
)(TagReport);
