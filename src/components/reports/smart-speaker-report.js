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
    {label: 'Title', key: 'title', simple: true},
    {label: 'Company', key: 'currentCompany', simple: true},
    {label: 'Job Title', key: 'currentJobTitle', simple: true},
    {label: 'Bio', key: 'bio', simple: true},
    {label: 'IRC', key: 'ircHandle', simple: true},
    {label: 'Twitter', key: 'twitterName', simple: true},
    {label: 'Member ID', key: 'member_id'},
    {label: 'PromoCode', key: 'promoCodes_code'},
    {label: 'Code Type', key: 'promoCodes_type'},
    {label: 'Confirmed', key: 'attendances_confirmed'},
    {label: 'Registered', key: 'attendances_registered'},
    {label: 'Checked In', key: 'attendances_checkedIn'},
    {label: 'Phone #', key: 'attendances_phoneNumber'},
    {label: 'Presentations', key: 'presentationTitles'},
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
        let reportData = ["id", "title", "fullname: fullName", `rolebysummit: roleBySummit (summitId:${currentSummit.id})`];

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

        let promoCodesFields = ['promoCodes_code', 'promoCodes_type'];
        if (showFields.filter(f => promoCodesFields.includes(f)).length > 0) {
            let promoCodes = new Query("promoCodes", {summit_Id:currentSummit.id});
            promoCodes.find(["code", "type"]);
            reportData.push({"promoCodes": promoCodes})
        }

        let attendancesFields = ['attendances_confirmed', 'attendances_registered', 'attendances_checkedIn', 'attendances_phoneNumber'];
        if (showFields.filter(f => attendancesFields.includes(f)).length > 0) {
            let attendances = new Query("attendances", {summit_Id:currentSummit.id});
            attendances.find(["confirmed", "registered", "checkedIn", "phoneNumber"]);
            reportData.push({"attendances": attendances})
        }

        if (showFields.includes("presentationTitles")) {
            reportData.push(`presentationTitles (summitId:${currentSummit.id})`)
        }

        let allSimpleFields = fieldNames.filter(f => f.simple).map(f => f.key);
        let simpleFields = showFields.filter(f => allSimpleFields.includes(f));
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
            case 'fullname':
                sortKey = 'first_name,last_name';
                break;
            case 'emails':
                sortKey = 'registration__email,member__email';
                break;
            case 'rolebysummit':
                sortKey = 'role_by_summit';
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
            { columnKey: 'rolebysummit', value: 'Role', sortable: true }
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
