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
import {CompanyInput, DateTimePicker, Dropdown, Panel, Table} from 'openstack-uicore-foundation/lib/components'
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
            sponsor: null,
            eventType: null,
            fromDate: null,
            toDate: null,
            showAnswers: false,
        };

        this.memberReport = false;
    }

    buildMetricsQuery = (filters, listFilters) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType, sponsor, showAnswers} = this.state;
        const overallFilter = {};
        const metricsFields = ["name", "email", "company"];
        const sponsorsMessage = ["sponsors"];
        const roomsMessage = ["rooms"];
        const eventsMessage = ["events"];

        if (showAnswers) {
            metricsFields.push("answers");
        }

        if (sponsor) {
            const sponsorId = parseInt(sponsor.id);
            sponsorsMessage.push({company: sponsorId});
            roomsMessage.push({events_Sponsors_Id: sponsorId});
            eventsMessage.push({sponsors_Id: sponsorId});
        }

        listFilters.id = currentSummit.id;

        if (eventType) {
            overallFilter.metricType = eventType;
        }

        if (fromDate) {
            overallFilter.fromDate = moment(fromDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            overallFilter.toDate = moment(toDate).format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        let query = new Query("summits", listFilters);
        let metrics = new Query("uniqueMetrics", overallFilter)
        metrics.find(metricsFields)
        let sponsors = new Query(...sponsorsMessage);
        sponsors.find(["id", "companyName", {"metrics": metrics}]);
        let events = new Query(...eventsMessage);
        events.find(["id", "title", {"metrics": metrics}]);
        let rooms = new Query(...roomsMessage);
        rooms.find(["id", "name", {"events": events}]);
        let extraQuestions = new Query("orderExtraQuestions");
        extraQuestions.find(["id", "name"]);

        const findQueries = ["id", "title", {"extraQuestions": extraQuestions}];

        if (eventType === 'EVENT') {
            findQueries.push({"rooms": rooms});
        } else if (eventType === 'SPONSOR') {
            findQueries.push({"sponsors": sponsors});
        } else {
            findQueries.push({"metrics": metrics});
        }

        query.find(findQueries);

        return query;
    };

    buildMemberQuery = (filters, listFilters) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType} = this.state;

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

    parseMetricData = (metric) => {
        const {showAnswers} = this.state;
        let result = {metric: metric.name, email: metric.email, company: metric.company};
        if (showAnswers) {
            const answers = metric.answers?.split('|').reduce((result, qa) => {
                const qaArray = qa.split(':');
                return { ...result, [qaArray[0]]: qaArray[1] || 'n/a'};
            }, {}) || {};
            result = {metric: metric.name, email: metric.email, company: metric.company, ...answers}
        }
        return result;
    }

    getSearchPlaceholder() {
        return 'Search by User Email or User Last Name';
    }

    preProcessData(data, extraData, forExport=false) {
        let {eventType, showAnswers} = this.state;
        let processedData = [];
        let columns = [];

        if (!data || ( Array.isArray(data) && !data.length ))
            return {reportData: processedData, tableColumns: columns};

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
                { columnKey: 'metric', value: 'Metric' },
                { columnKey: 'email', value: 'Email' },
                { columnKey: 'company', value: 'Company' }
            ];

            if (showAnswers && data.extraQuestions) {
                columns = [...columns, ...data.extraQuestions.map(q => ({ columnKey: q.id, value: q.name}))]
            }

            if (eventType === 'EVENT') {
                if (!data.rooms)
                    return {reportData: processedData, tableColumns: columns};

                processedData = data.rooms
                    .map(rm => {
                        return {
                            ...rm,
                            events: rm.events
                                .filter(ev => ev?.metrics?.length)
                                .map(ev => {
                                    const metrics = ev.metrics.map(this.parseMetricData);
                                    return ({...ev, metrics})
                                })
                        };
                    })
                    .filter(rm => rm.events.length);

                if (forExport) {
                    processedData = processedData.reduce((result, item) => {
                        result = [...result, ...item.events];
                        return result;
                    }, []);
                    processedData = flattenData(processedData);
                    columns = [
                        { columnKey: 'id', value: 'Event Id' },
                        { columnKey: 'title', value: 'Event' },
                        { columnKey: 'metrics_metric', value: 'Metric' },
                        { columnKey: 'metrics_email', value: 'Email' },
                        { columnKey: 'metrics_company', value: 'Company' }
                    ];

                    if (showAnswers && data.extraQuestions) {
                        columns = [...columns, ...data.extraQuestions.map(q => ({ columnKey: `metrics_${q.id}`, value: q.name}))]
                    }
                }
            } else if (eventType === 'SPONSOR') {
                if (!data.sponsors)
                    return {reportData: processedData, tableColumns: columns};

                processedData = data.sponsors
                    .filter(s => s.metrics.length)
                    .map(sp => {
                        const metrics = sp.metrics.map(this.parseMetricData);
                        return ({...sp, metrics})
                    });

                if (forExport) {
                    processedData = flattenData(processedData);
                    columns = [
                        { columnKey: 'id', value: 'Id' },
                        { columnKey: 'companyName', value: 'Sponsor' },
                        { columnKey: 'metrics_metric', value: 'Metric' },
                        { columnKey: 'metrics_email', value: 'Email' },
                        { columnKey: 'metrics_company', value: 'Company' }
                    ];

                    if (showAnswers && data.extraQuestions) {
                        columns = [...columns, ...data.extraQuestions.map(q => ({ columnKey: `metrics_${q.id}`, value: q.name}))]
                    }
                }
            } else if (data.metrics) {
                processedData = data.metrics.map(this.parseMetricData);
            }
        }

        return {reportData: processedData, tableColumns: columns};
    }

    handleGroupByChange(value) {
        this.setState({grouped: value})
    }

    handleFilterChange(ev) {
        let {id, value, type, checked} = ev.target;
        const {state} = this;
        state[id] = type === 'checkbox' ? checked : value;
        this.setState(state);
    }

    filterReport(ev) {
        this.props.onReload();
    }

    getTable(data, options, tableCols) {
        const {eventType, showSection} = this.state;
        const {name: storedDataName} = this.props;
        let tables = [];

        const toggleSection = (sectionName) => {
            const {showSection} = this.state;
            const newSection = showSection === sectionName ? null : sectionName;
            this.setState({showSection: newSection})
        };

        if (!data || ( Array.isArray(data) && !data.length ) || storedDataName !== this.getName()) return (<div />);

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
                const name = grp.companyName;
                const sectionId = `section_${grp.id}`;

                return (
                    <Panel show={showSection === sectionId} title={`${name} (${grp.metrics.length})`}
                           handleClick={() => toggleSection(sectionId)} key={sectionId}>
                        <div className="table-responsive">
                            <Table
                                options={options}
                                data={grp.metrics}
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
                                const sectionId = `section_${ev.id}`;

                                return (
                                    <Panel show={showSection === sectionId} title={`${ev.title} (${ev.metrics.length})`}
                                           handleClick={() => toggleSection(sectionId)} key={sectionId}>
                                        <div className="table-responsive">
                                            <Table
                                                options={options}
                                                data={ev.metrics}
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
        let {data, sortKey, sortDir, currentSummit} = this.props;
        const {eventType, sponsor, showAnswers} = this.state;

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
                                value={eventType}
                                clearable
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Sponsor</label>
                            <CompanyInput
                                id="sponsor"
                                value={sponsor}
                                onChange={this.handleFilterChange}
                                summitId={currentSummit.id}
                                clearable
                            />
                        </div>
                        <div className="col-md-2 checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="showAnswers" checked={showAnswers}
                                       onChange={this.handleFilterChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor="showAnswers">
                                    Show Answers
                                </label>
                            </div>
                        </div>
                        <div className="col-md-2" style={{marginTop: 20}}>
                            <button className="btn btn-primary" onClick={this.filterReport}> GO </button>
                        </div>
                    </div>
                    <div className="row" style={{marginTop: 20}}>
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
                </div>


                {this.getTable(reportData, report_options, tableColumns)}
            </div>
        );
    }
}


export default wrapReport(MetricsReport, {pagination: false, preventInitialLoad: true});
