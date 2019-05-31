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
import { flattenData } from '../../actions/report-actions';

const reportName = 'presentation_report';


class PresentationReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleSort = this.handleSort.bind(this);

    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit} = this.props;
        listFilters.summitId = currentSummit.id;

        let query = new Query("presentations", listFilters);
        let category = new Query("category");
        category.find(["title"]);
        let location = new Query("location");
        location.find(["name"]);
        let member = new Query("member");
        member.find(["id", "firstName", "lastName","email"]);
        let attendances = new Query("attendances", {summit_Id: currentSummit.id});
        attendances.find(["phoneNumber", "registered", "checkedIn", "confirmed"]);
        let promoCodes = new Query("promoCodes", {summit_Id: currentSummit.id});
        promoCodes.find(["code", "type"]);
        let speakers = new Query("speakers");
        speakers.find(["id", "firstName", "lastName", {"member": member}, {"attendances": attendances}, {"promoCodes": promoCodes}]);
        let results = new Query("results", filters);
        results.find(["id", "title", "startDate", "published", {"category": category}, {"location": location}, {"speakers": speakers}])

        query.find([{"results": results}, "totalCount"]);

        return query;
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

    getTrueFalseIcon(value) {
        return value ? '<div class="text-center"><i class="fa fa-check" aria-hidden="true"></i></div>' :
            '<div class="text-center"><i class="fa fa-times" aria-hidden="true"></i></div>';
    }

    render() {
        let {data, totalCount, onSort} = this.props;

        let flatData = flattenData(data);

        let report_columns = [
            { columnKey: 'id', value: 'Id' },
            { columnKey: 'title', value: 'Presentation' },
            { columnKey: 'published', value: 'Published' },
            { columnKey: 'track', value: 'Track', sortable: true },
            { columnKey: 'start_date', value: 'Start Date' },
            { columnKey: 'location', value: 'Location' },
            { columnKey: 'speaker_id', value: 'Speaker Id' },
            { columnKey: 'member_id', value: 'Member Id' },
            { columnKey: 'speaker', value: 'Speaker' },
            { columnKey: 'email', value: 'Email' },
            { columnKey: 'phone', value: 'Phone' },
            { columnKey: 'code', value: 'Promo Code' },
            { columnKey: 'code_type', value: 'Code Type' },
            { columnKey: 'confirmed', value: 'Confirmed' },
            { columnKey: 'registered', value: 'Registered' },
            { columnKey: 'checked_in', value: 'Checked In' },
        ];

        let report_options = { actions: {} }

        let reportData = flatData.map(it => {

            let confirmed = this.getTrueFalseIcon(it.speakers_attendances_confirmed) ;
            let registered = this.getTrueFalseIcon(it.speakers_attendances_registered);
            let checkedIn = this.getTrueFalseIcon(it.speakers_attendances_checkedIn);
            let published = this.getTrueFalseIcon(it.published);

            return ({
                id: it.id,
                title: it.title,
                published: published,
                track: it.category_title,
                start_date: it.startDate,
                location: it.location_name,
                speaker_id: it.speakers_id,
                member_id: (it.speakers_member_id || 'N/A'),
                speaker: it.speakers_firstName + ' ' + it.speakers_lastName,
                email: (it.speakers_member_email || 'N/A'),
                phone: (it.speakers_attendances_phoneNumber || 'N/A'),
                code: (it.speakers_promoCodes_code || 'N/A'),
                code_type: (it.speakers_promoCodes_type || 'N/A'),
                confirmed: confirmed,
                registered: registered,
                checked_in: checkedIn,
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


export default wrapReport(PresentationReport, {reportName, pagination: true});
