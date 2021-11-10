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
import {DateTimePicker, Dropdown, Panel, Table} from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {groupByDate} from '../../utils/methods'
import {flattenData} from "../../actions/report-actions";

class MetricsReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.handleGroupByChange = this.handleGroupByChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.filterReport = this.filterReport.bind(this);
        this.getTable = this.getTable.bind(this);

        this.state = {
            eventType: null,
            fromDate: null,
            toDate: null,
        };

        this.memberReport = false;
    }

    buildMetricsQuery = (filters, listFilters) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType} = this.state;
        const overallFilter = [];
        const dateFilter = [];

        listFilters.id = currentSummit.id;

        if (eventType) {
            overallFilter.push(`metricType: "${eventType}"`);
        }

        if (fromDate) {
            overallFilter.push(`fromDate: "${moment(fromDate).format('YYYY-MM-DDTHH:mm:ss+00:00')}"`);
            dateFilter.push(`fromDate: "${moment(fromDate).format('YYYY-MM-DDTHH:mm:ss+00:00')}"`);
        }

        if (toDate) {
            overallFilter.push(`toDate: "${moment(toDate).format('YYYY-MM-DDTHH:mm:ss+00:00')}"`);
            dateFilter.push(`toDate: "${moment(toDate).format('YYYY-MM-DDTHH:mm:ss+00:00')}"`);
        }

        let overallMetrics = 'uniqueMetrics';
        let metrics = 'uniqueMetrics';

        if (overallFilter.length) {
            overallMetrics = overallMetrics + `(${overallFilter.join(', ')})`
        }

        if (dateFilter.length) {
            metrics = metrics + `(${dateFilter.join(', ')})`
        }


        let query = new Query("summits", listFilters);
        let sponsors = new Query("sponsors");
        sponsors.find(["id", "companyName", metrics]);
        let events = new Query("events");
        events.find(["id", "title", metrics]);
        let rooms = new Query("rooms");
        rooms.find(["id", "name", {"events": events}]);

        query.find(["id", "title", overallMetrics, {"rooms": rooms}, {"sponsors": sponsors}]);

        return query;
    };

    buildMemberQuery = (filters, listFilters) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType} = this.state;
        const overallFilter = [];
        const dateFilter = [];

        listFilters.summitId = currentSummit.id;
        filters.ordering = 'ingress_date';
        filters.limit = 3000;

        if (eventType) {
            listFilters.type = eventType;
        }

        if (fromDate) {
            listFilters.fromDate = moment(fromDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            listFilters.toDate = moment(toDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        let query = new Query("metrics", listFilters);
        let results = new Query("results", filters);
        results.find(["type", "ingressDate", "outgressDate", "memberName", "eventName", "sponsorName", "location"]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    };

    buildReportQuery(filters, listFilters) {
        let query = null;
        if (listFilters.search) {
            this.memberReport = true;
            query = this.buildMemberQuery(filters, listFilters);
        } else {
            this.memberReport = false;
            query = this.buildMetricsQuery(filters, listFilters);
        }

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
        return this.memberReport ? 'Member Metrics' : 'Metrics Report';
    }

    getSearchPlaceholder() {
        return 'Search by User Email or User Last Name';
    }

    preProcessData(data, extraData, forExport=false) {
        let {eventType} = this.state;
        let processedData = [];
        let columns = [];

        if (Array.isArray(data) && data.length === 0) return [];

        if (this.memberReport) {
            const newData = data.map(d => {
                const page = d.eventName || d.sponsorName || d.location;
                return {
                    type: d.type,
                    date: moment(d.ingressDate, 'YYYY-MM-DDTHH:mm:ss+00:00').format('dddd Do h:mm a'),
                    page: page,
                    member: d.memberName
                }

            });

            processedData = groupByDate(newData, "member", "member");

            columns = [
                { columnKey: 'type', value: 'Type' },
                { columnKey: 'page', value: 'Page' },
                { columnKey: 'date', value: 'Date' }
            ];
        } else {
            columns = [
                { columnKey: 'metric', value: 'Metric' }
            ];

            if (eventType === 'EVENT') {
                processedData = data.rooms.map(rm => {
                    return {...rm, events: rm.events.filter(ev => ev?.uniqueMetrics?.length)};
                }).filter(rm => rm.events.length);

                if (forExport) {
                    processedData = processedData.reduce((result, item) => {
                        result = [...result, ...item.events];
                        return result;
                    }, []);
                    processedData = flattenData(processedData);
                    columns = [
                        { columnKey: 'id', value: 'Event Id' },
                        { columnKey: 'title', value: 'Event' },
                        { columnKey: 'uniqueMetrics', value: 'Metric' }
                    ];
                }
            } else if (eventType === 'SPONSOR') {
                processedData = data.sponsors.filter(s => s.uniqueMetrics.length);

                if (forExport) {
                    processedData = flattenData(processedData);
                    columns = [
                        { columnKey: 'id', value: 'Id' },
                        { columnKey: 'companyName', value: 'Sponsor' },
                        { columnKey: 'uniqueMetrics', value: 'Metric' },
                    ];
                }
            } else if (data.uniqueMetrics) {
                processedData = data.uniqueMetrics.map(it => ({metric: it}));
            }
        }

        return {reportData: processedData, tableColumns: columns};
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

    getTable(data, options, tableCols) {
        const {eventType, showSection} = this.state;
        let tables = [];

        const toggleSection = (sectionName) => {
            const {showSection} = this.state;
            const newSection = showSection === sectionName ? null : sectionName;
            this.setState({showSection: newSection})
        };

        if (this.memberReport) {
            tables = Object.entries(data).map(([user, metricData]) => {
                const sectionId = `section_${user}`;

                return (
                    <Panel show={showSection === sectionId} title={user}
                           handleClick={() => toggleSection(sectionId)} key={sectionId}>
                        <div className="table-responsive">
                            <Table
                                options={options}
                                data={metricData}
                                columns={tableCols}
                                onSort={this.props.onSort}
                            />
                        </div>
                    </Panel>
                );
            });
        } else if (eventType === 'SPONSOR') {
            tables = data.map(grp => {
                const tableData = grp.uniqueMetrics.map(it => ({metric: it}));
                const name = grp.companyName;
                const sectionId = `section_${grp.id}`;

                return (
                    <Panel show={showSection === sectionId} title={`${name} (${tableData.length})`}
                           handleClick={() => toggleSection(sectionId)} key={sectionId}>
                        <div className="table-responsive">
                            <Table
                                options={options}
                                data={tableData}
                                columns={tableCols}
                                onSort={this.props.onSort}
                            />
                        </div>
                    </Panel>
                );
            });
        } else if (eventType === 'EVENT') {
            tables = data.filter(rm => rm.events.length).map(room => {
                const name = room.name;
                const id = room.id;

                return (
                    <div className="panel panel-default" key={'section_' + id}>
                        <div className="panel-heading">{name}</div>
                        <div style={{padding: 10}}>
                            {room.events.map(ev => {
                                const tableData = ev.uniqueMetrics.map(it => ({metric: it}));
                                const sectionId = `section_${ev.id}`;

                                return (
                                    <Panel show={showSection === sectionId} title={`${ev.title} (${ev.uniqueMetrics.length})`}
                                           handleClick={() => toggleSection(sectionId)} key={sectionId}>
                                        <div className="table-responsive">
                                            <Table
                                                options={options}
                                                data={tableData}
                                                columns={tableCols}
                                                onSort={this.props.onSort}
                                            />
                                        </div>
                                    </Panel>
                                );
                            })}
                        </div>
                    </div>
                );
            });
        } else {
            tables = (
                <div className="panel panel-default">
                    <div className="panel-heading">Metrics ({data.length})</div>
                    <div className="table-responsive">
                        <Table
                            options={options}
                            data={data}
                            columns={tableCols}
                            onSort={this.props.onSort}
                        />
                    </div>
                </div>
            )
        }

        return tables;
    }

    render() {
        let {data, sortKey, sortDir} = this.props;
        let storedDataName = this.props.name;
        const {eventType} = this.state;

        if (!data || ( Array.isArray(data) && !data.length ) || storedDataName !== this.getName()) return (<div />);

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
                            <label>Type</label>
                            <Dropdown
                                id="eventType"
                                options={event_types_ddl}
                                onChange={this.handleFilterChange}
                                value={this.state.eventType}
                                clearable
                            />
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
                        <div className="col-md-3">
                            <button className="btn btn-primary" onClick={this.filterReport}> GO </button>
                        </div>
                    </div>
                </div>


                {this.getTable(reportData, report_options, tableColumns)}
            </div>
        );
    }
}


export default wrapReport(MetricsReport, {pagination: false});
