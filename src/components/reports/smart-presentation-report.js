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
import {parseAndFormat} from "../../utils/methods";


const fieldNames = [
    {label: 'Id', key: 'id', simple: true},
    {label: 'Presentation', key: 'title', simple: true},
    {label: 'Start Date', key: 'startDate', simple: true},
    {label: 'End Date', key: 'endDate', simple: true},
    {label: 'Abstract', key: 'abstract', simple: true},
    {label: 'Social', key: 'socialSummary', simple: true},
    {label: 'Expect to Learn', key: 'expectToLearn', simple: true},
    {label: 'Speakers', key: 'speakerNames', simple: true},
    {label: 'Company', key: 'speakerCompanies', simple: true},
    {label: 'Speaker Emails', key: 'speakerEmails', simple: true},
    {label: 'Member Emails', key: 'memberEmails', simple: true},
    {label: 'Track', key: 'category_title', sortable: true},
    {label: 'Tags', key: 'tagNames', simple: true},
    {label: 'Event Type', key: 'type_type', sortable: true},
    {label: 'Head Count', key: 'headCount', simple: true},
    {label: 'Attending Media', key: 'attendingMedia', simple: true},
    {label: 'To Record', key: 'toRecord', simple: true},
    {label: 'Status', key: 'status', simple: true},
    {label: 'Level', key: 'level', simple: true},
    {label: 'Published', key: 'published', simple: true},
    {label: 'All Materials', key: 'allMediaUploads', simple: true},
    {label: 'Stream URL', key: 'streamingUrl', simple: true},
    {label: 'Meeting URL', key: 'meetingUrl', simple: true},
    {label: 'Etherpad URL', key: 'etherpadLink', simple: true},
    {label: 'Creation date', key: 'created', simple: true, sortable: true},
];

class SmartPresentationReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showFields: ["category_title"]
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.preProcessData = this.preProcessData.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;
        const {showFields} = this.state;
        listFilters.summitId = currentSummit.id;

        const query = new Query("presentations", listFilters);
        const reportData = ["id", "title"];

        if (sortKey) {
            const querySortKey = this.translateSortKey(sortKey);
            const order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        if (showFields.includes("type_type")) {
            const type = new Query("type");
            type.find(["id", "type"]);
            reportData.push({"type": type})
        }

        if (showFields.includes("category_title")) {
            const category = new Query("category");
            category.find(["id", "code", "title"]);
            reportData.push({"category": category})
        }

        if (showFields.includes("speakers_currentCompany")) {
            const speakers = new Query("speakers");
            speakers.find(["currentCompany"]);
            reportData.push({"speakers": speakers})
        }

        const allSimpleFields = fieldNames.filter(f => f.simple).map(f => f.key);
        const simpleFields = showFields.filter(f => allSimpleFields.includes(f));
        const results = new Query("results", filters);
        results.find([...reportData, ...simpleFields]);

        const categoryStats = new Query("categoryStats")
        categoryStats.find(["key", "value"]);

        query.find([{"results": results}, "totalCount", {"extraStat":categoryStats}]);

        return query;
    }

    handleFilterChange(value) {
        this.setState({showFields: value.map(v => v.value)});
    }

    translateSortKey(key) {
        let sortKey = key;

        switch(key) {
            case 'category_title':
                sortKey = 'category__title';
                break;
        }

        return sortKey;
    }

    getName() {
        return 'Presentation Report';
    }

    preProcessData(data, extraData, forExport=false) {
        let {showFields} = this.state;
        const {currentSummit} = this.props;

        let flatData = flattenData(data);

       flatData.forEach(d => {
            if (d.startDate) d.startDate = parseAndFormat(d.startDate, 'YYYY-MM-DDTHH:mm:ss+00:00', 'MM/DD/YYYY h:mma', 'UTC', currentSummit.time_zone_id);
            if (d.endDate) d.endDate = parseAndFormat(d.endDate, 'YYYY-MM-DDTHH:mm:ss+00:00', 'MM/DD/YYYY h:mma', currentSummit.time_zone_id);
            if (d.created) d.created = parseAndFormat(d.created, 'YYYY-MM-DDTHH:mm:ss+00:00');
        });

        let columns = [
            { columnKey: 'id', value: 'Id' },
            { columnKey: 'title', value: 'Presentation' }
        ];

        let showColumns = fieldNames
            .filter(f => showFields.includes(f.key) )
            .map( f2 => (
                {   columnKey: f2.key,
                    value: f2.label,
                    sortable: f2.sortable
                }));


        columns = [...columns, ...showColumns];
        return {reportData: flatData, tableColumns: columns};
    }

    render() {
        let {data, totalCount, extraStat, sortKey, sortDir} = this.props;
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

        let categoryStats = extraStat ? extraStat : [];

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
                <div className="extra-stats cat-stats">
                    <div className="row">
                        <div className="col-md-12">
                            <label>Track count</label>
                        </div>
                    </div>
                    <div className="row">
                    {categoryStats.map((cat, idx) =>
                        <div className="col-md-2" key={"cat_stat_"+idx}>{cat.key}: {cat.value}</div>
                    )}
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Presentations ({totalCount})</div>
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


export default wrapReport(SmartPresentationReport, {pagination: true, filters:['track', 'published', 'status']});
