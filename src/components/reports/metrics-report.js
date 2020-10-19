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
import moment from 'moment-timezone'
import {DateTimePicker, Dropdown, Input, Table} from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";
import {ButtonToolbar, ToggleButton, ToggleButtonGroup} from "react-bootstrap";

class MetricsReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.handleGroupByChange = this.handleGroupByChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.filterReport = this.filterReport.bind(this);

        this.state = {
            grouped: false,
            fromDate: null,
            toDate: null
        }
    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit, sortKey, sortDir} = this.props;
        const {eventId, fromDate, toDate, sponsorName, eventType} = this.state;

        listFilters.summitId = currentSummit.id;

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir == 1) ? '' : '-';
            filters.ordering = `${order}${querySortKey}`;
        }

        if (eventId) {
            listFilters.eventId = parseInt(eventId);
        } else if (sponsorName) {
            listFilters.companyName = sponsorName;
        }

        if (eventType) {
            listFilters.type = eventType;
        }


        if (fromDate) {
            listFilters.fromDate = moment(fromDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            listFilters.toDate = moment(toDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }


        // filters.limit = 50;


        let query = new Query("metrics", listFilters);
        let results = new Query("results", filters);
        results.find(["id", "type", "ingressDate", "outgressDate", "memberName", "eventName", "sponsorName"]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;
        switch(key) {
            case 'ingressdate':
                sortKey = 'ingress_date';
                break;
            case 'outgressdate':
                sortKey = 'outgress_date';
                break;
            case 'eventname':
                sortKey = 'eventmetric__event__title';
                break;
            case 'sponsorname':
                sortKey = 'sponsormetric__sponsor__company__name';
                break;
            case 'membername':
                sortKey = 'member__first_name';
                break;
        }
        return sortKey;
    }

    getName() {
        return 'Metrics Report';
    }

    preProcessData(data, extraData, forExport=false) {
        let {currentSummit} = this.props;
        let {grouped} = this.state;
        let flatData = flattenData(data);

        let columns = [
            { columnKey: 'type', value: 'Type', sortable: true },
            { columnKey: 'eventName', value: 'Event', sortable: true },
            { columnKey: 'sponsorName', value: 'Sponsor', sortable: true },
            { columnKey: 'memberCount', value: 'Unique Users' },
        ];

        if (!grouped) {
            columns.push(...[
                { columnKey: 'ingressDate', value: 'In', sortable: true },
                { columnKey: 'outgressDate', value: 'Out' },
                { columnKey: 'memberName', value: 'User', sortable: true },
                { columnKey: 'enterCounts', value: 'Metric Counts' }
            ]);
        }


        let processedData = flatData.map(it => {

            // 2020-10-19T12:30:00+00:00

            const format = 'YYYY-MM-DDTHH:mm:ss+00:00';
            let momentInDate = moment(it.ingressDate, format);
            let momentOutDate = moment(it.outgressDate, format);

            return ({
                ...it,
                ingressDate: momentInDate.format('MM/DD HH:mm:ss'),
                outgressDate: momentOutDate.format('MM/DD HH:mm:ss'),
                momentInDate,
                momentOutDate,
                hash: `${it.type}${it.eventName}${it.sponsorName}${it.memberName}`
            });
        });

        // group by type,event,sponsor,member
        let uniqueData = processedData.reduce((result, itemEval, idx, data) => {
            let resItem = result.find(it => it.hash === itemEval.hash);

            if (resItem) {
                const minIn = moment.min(resItem.momentInDate, itemEval.momentInDate);
                const maxOut = moment.max(resItem.momentOutDate, itemEval.momentOutDate);
                resItem.ingressDate = minIn.format('MM/DD HH:mm:ss');
                resItem.outgressDate = maxOut.format('MM/DD HH:mm:ss');
                resItem.momentInDate = minIn;
                resItem.momentOutDate = maxOut;
                resItem.enterCounts++
            } else {
                result.push({...itemEval, enterCounts: 1});
            }

            return result;
        }, []);

        // group all members together to get the unique count

        if (grouped) {
            uniqueData = uniqueData.reduce((result, itemEval, idx, data) => {
                let resItem = result.find(it => it.type === itemEval.type && it.eventName === itemEval.eventName && it.sponsorName === itemEval.sponsorName);

                if (resItem) {
                    resItem.memberCount++
                } else {
                    result.push({...itemEval, memberCount: 1});
                }

                return result;
            }, []);
        }

        return {reportData: uniqueData, tableColumns: columns};
    }

    handleGroupByChange(value) {
        this.setState({grouped: value})
    }

    handleFilterChange(ev) {
        let {id, value} = ev.target;
        const {state} = this;

        state[id] = value;
        this.setState(state);
    }

    filterReport(ev) {
        this.props.onReload();
    }

    render() {
        let {data, sortKey, sortDir, currentSummit, totalCount} = this.props;
        let storedDataName = this.props.name;

        if (!data || storedDataName != this.getName()) return (<div></div>);

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        let {reportData, tableColumns} = this.preProcessData(data, null);

        let event_types_ddl = [
            {label: 'Lobby', value: 'LOBBY'},
            {label: 'Event', value: 'EVENT'},
            {label: 'Sponsor', value: 'SPONSOR'},
            {label: 'General', value: 'GENERAL'},
        ];

        return (
            <div>
                <div className="report-filters">
                    <div className="row">
                        <div className="col-md-3">
                            <label>Grouped</label>
                            <ButtonToolbar>
                                <ToggleButtonGroup type="radio" name="grouped" value={this.state.grouped} onChange={this.handleGroupByChange}>
                                    <ToggleButton value={true}>Grouped</ToggleButton>
                                    <ToggleButton value={false}>Raw</ToggleButton>
                                </ToggleButtonGroup>
                            </ButtonToolbar>
                        </div>
                        <div className="col-md-6">
                            <label>Ingress date</label>
                            <div className="inline">
                                From: &nbsp;&nbsp;
                                <DateTimePicker
                                    id="fromDate"
                                    onChange={this.handleFilterChange}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    value={this.state.fromDate}
                                />
                                &nbsp;&nbsp;To:&nbsp;&nbsp;
                                <DateTimePicker
                                    id="toDate"
                                    onChange={this.handleFilterChange}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    value={this.state.toDate}
                                />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className="row">
                        <div className="col-md-3">
                            <label>Event Id</label>
                            <Input
                                id="eventId"
                                onChange={this.handleFilterChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Sponsor Name</label>
                            <Input
                                id="sponsorName"
                                onChange={this.handleFilterChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Type</label>
                            <Dropdown
                                id="eventType"
                                options={event_types_ddl}
                                onChange={this.handleFilterChange}
                                clearable
                            />
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-primary" onClick={this.filterReport}> GO </button>
                        </div>
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Metrics ({totalCount})</div>
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


export default wrapReport(MetricsReport, {pagination: false, filters:[]});
