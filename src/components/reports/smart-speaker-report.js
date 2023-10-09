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
import Select from 'react-select';
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";


const fieldNames = [
    {label: 'Emails', key: 'emails', simple: true, sortable: true},
    {label: 'Title', key: 'title', simple: true, sortable: true},
    {label: 'Company', key: 'currentcompany', queryKey: 'currentCompany', simple: true, sortable: true},
    {label: 'Job Title', key: 'currentjobtitle', queryKey: 'currentJobTitle', simple: true, sortable: true},
    {label: 'Bio', key: 'bio', simple: true, sortable: true},
    {label: 'IRC', key: 'irchandle', queryKey: 'ircHandle', simple: true, sortable: true},
    {label: 'Twitter', key: 'twittername', queryKey: 'twitterName', simple: true, sortable: true},
    {label: 'Member ID', key: 'member_id', sortable: true},
    {label: 'PromoCode', key: 'promocodes_code', sortable: true},
    {label: 'Code Type', key: 'promocodes_type', sortable: true},
    {label: 'Willing to speak', key: 'attendances_confirmed', sortable: true},
    {label: 'Attendance Registered', key: 'attendances_registered', sortable: true},
    {label: 'Attendance Checked In', key: 'attendances_checkedin', sortable: true},
    {label: 'Phone #', key: 'attendances_phonenumber', sortable: true},
    {label: 'Presentations', key: 'presentationtitles', sortable: true},
];

class SmartSpeakerReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showFields: ["emails"]
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.preProcessData = this.preProcessData.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;
        let {showFields} = this.state;

        if (!filters.published_in) {
            listFilters.summitId = currentSummit.id;
        }

        let query = new Query("speakers", listFilters);
        let reportData = [
            "id",
            "title",
            "fullname: fullName",
            `rolebysummit: roleBySummit (summitId:${currentSummit.id})`,
            `paidtickets: paidTickets(summitId:${currentSummit.id})`];

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir == 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        if (showFields.includes('member_id')) {
            let member = new Query("member");
            member.find(["id"]);
            reportData.push({"member": member})
        }

        let promoCodesFields = ['promocodes_code', 'promocodes_type'];
        if (showFields.filter(f => promoCodesFields.includes(f)).length > 0) {
            let promoCodes = new Query("promoCodes", {summit_Id:currentSummit.id});
            promoCodes.find(["code", "type"]);
            reportData.push({"promocodes": promoCodes})
        }

        let attendancesFields = ['attendances_confirmed', 'attendances_registered', 'attendances_checkedin', 'attendances_phonenumber'];
        if (showFields.filter(f => attendancesFields.includes(f)).length > 0) {
            let attendances = new Query("attendances", {summit_Id:currentSummit.id});
            attendances.find(["confirmed", "registered", "checkedin: checkedIn", "phonenumber: phoneNumber"]);
            reportData.push({"attendances": attendances})
        }

        if (showFields.includes("presentationtitles")) {
            reportData.push(`presentationtitles: presentationTitles (summitId:${currentSummit.id})`)
        }

        let simpleFields = fieldNames
          .filter(f => f.simple && showFields.includes(f.key))
          .map(f => f.queryKey ? `${f.key}: ${f.queryKey}` : f.key);

        let results = new Query("results", filters);
        results.find([...reportData, ...simpleFields]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    handleFilterChange(value) {
        this.setState({showFields: value.map(v => v.value)});
    }

    translateSortKey(key) {
        let sortKey = key;
        
        switch (key.toLowerCase()) {
            case 'emails':
                sortKey = 'member__email';
                break;
            case 'title':
                sortKey = 'title';
                break;
            case 'currentjobtitle': // this
                sortKey = 'title';
                break;
            case 'member_id':
                sortKey = 'member__id';
                break;
            case 'fullname':
                sortKey = 'first_name,last_name';
                break;
            case 'irchandle':
                sortKey = 'irc_handle';
                break;
            case 'twittername':
                sortKey = 'twitter_name';
                break;
            case 'presentationtitles':
                sortKey = 'presentations__title';
                break;
            case 'currentcompany': // this
                sortKey = 'company';
                break;
            case 'rolebysummit':
                sortKey = 'role_by_summit';
                break;
            case 'promocodes_code':
                sortKey = 'promo_codes__code';
                break;
            case 'promocodes_type':
                sortKey = 'promo_codes__type';
                break;
            case 'attendances_confirmed':
                sortKey = 'attendances__confirmed';
                break;
            case 'attendances_registered':
                sortKey = 'attendances__registered';
                break;
            case 'attendances_checkedin':
                sortKey = 'attendances__checked_in';
                break;
            case 'attendances_phonenumber':
                sortKey = 'attendances__phone_number';
                break;
            case 'paidtickets':
                sortKey = 'paid_tickets';
                break;
        }

        return sortKey;
    }

    getName() {
        return 'Speaker Report';
    }

    preProcessData(data, extraData, forExport=false) {
        let {showFields} = this.state;

        let flatData = flattenData(data);

        let columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'fullname', value: 'Speaker', sortable: true },
            { columnKey: 'rolebysummit', value: 'Role', sortable: true },
            { columnKey: 'paidtickets', value: 'Registered for Summit?', sortable: true },
        ];

        let showColumns = fieldNames
            .filter(f => showFields.includes(f.key) )
            .map( f2 => ({columnKey: f2.key, value: f2.label, sortable: f2.sortable}));


        columns = [...columns, ...showColumns];


        return {reportData: flatData, tableColumns: columns};
    }

    render() {
        let {data, totalCount, sortKey, sortDir} = this.props;
        let {showFields} = this.state;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />)

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };
        
        let {reportData, tableColumns} = this.preProcessData(data, null);

        let showFieldOptions = fieldNames.map( f => ({label: f.label, value: f.key}));
        let showFieldSelection = fieldNames
            .filter(f => showFields.includes(f.key) )
            .map( f2 => ({label: f2.label, value: f2.key}));
    
    
        return (
            <div>
                <div className="report-filters">
                    <div className="row">
                        <div className="col-md-4">
                            <label>Select Data</label>
                            <Select
                                name="fieldsDropDown"
                                value={showFieldSelection}
                                id="show_fields"
                                placeholder={T.translate("reports.placeholders.select_fields")}
                                options={showFieldOptions}
                                onChange={this.handleFilterChange}
                                isMulti
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <button className="btn btn-primary pull-right" onClick={this.props.onReload}> Go </button>
                        </div>
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Speakers ({totalCount})</div>
                    <div className="table-responsive">
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


export default wrapReport(SmartSpeakerReport, {pagination: true, filters:['track', 'attendance', 'media', 'published_in']});
