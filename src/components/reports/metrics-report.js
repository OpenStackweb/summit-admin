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
import {
    CompanyInput,
    DateTimePicker,
    Dropdown,
    EventInput,
    Panel,
    Table
} from 'openstack-uicore-foundation/lib/components'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {groupByDate, parseAndFormat} from '../../utils/methods'
import {flattenData} from "../../actions/report-actions";
import ReactDOMServer from "react-dom/server";

const RawMetricsTable = ({data, timezone}) => {
    const columns = [
        { columnKey: 'ingressDate', value: 'Ingress' },
        { columnKey: 'outgressDate', value: 'Outgress' },
    ];

    if (!data) return null;

    data.forEach(d => {
       d.ingressDate = moment.tz(d.ingressDate, timezone).format('dddd, MMMM Do YYYY, h:mm a (z)');
       d.outgressDate = d.outgressDate ? moment.tz(d.outgressDate, timezone).format('dddd, MMMM Do YYYY, h:mm a (z)') : '-';
    });

    return (
      <Table
        options={{actions: {}}}
        data={data}
        columns={columns}
      />
    );
};

class MetricsReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.buildDrillDownQuery = this.buildDrillDownQuery.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.handleGroupByChange = this.handleGroupByChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.filterReport = this.filterReport.bind(this);
        this.getTable = this.getTable.bind(this);
        this.toggleDrillDownData = this.toggleDrillDownData.bind(this);

        this.state = {
            sponsor: null,
            eventType: null,
            fromDate: null,
            toDate: null,
            showAnswers: false,
            subTypeFilter: null,
            roomFilter: null,
            eventFilter: null,
        };

        this.memberReport = false;
    }

    buildMetricsQuery = (filters, listFilters, sortKey, sortDir) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType, sponsor, showAnswers, subTypeFilter, roomFilter, eventFilter} = this.state;
        const overallFilter = {};
        const roomQueryFilter = {};
        const eventQueryFilter = {};
        const metricsFields = ["name", "email", "company", "subType", "attendeeId", "memberId", "ingress", "outgress"];
        const sponsorsMessage = ["sponsors"];
        const roomsMessage = ["rooms"];
        const eventsMessage = ["events"];
        const venueRoomMessage = ["venueroom"];

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
            overallFilter.fromDate = moment(fromDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            overallFilter.toDate = moment(toDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (subTypeFilter) {
            overallFilter.metricSubType = subTypeFilter;
        }

        if (roomFilter) {
            roomQueryFilter.id = roomFilter;
        }

        if (eventFilter) {
            eventQueryFilter.id = eventFilter.id;
        }

        if (sortKey && sortDir) {
            overallFilter.sortBy = this.translateSortKey(sortKey);
            overallFilter.sortDir = sortDir === '1' ? 'ASC' : 'DESC';
        }

        const query = new Query("summits", listFilters);
        const metrics = new Query("uniqueMetrics", overallFilter)
        metrics.find(metricsFields)
        const sponsors = new Query(...sponsorsMessage);
        sponsors.find(["id", "companyName", {"metrics": metrics}]);
        const events = new Query(...eventsMessage, eventQueryFilter);
        events.find(["id", "title", {"metrics": metrics}]);
        const rooms = new Query(...roomsMessage, roomQueryFilter);
        const venueRoom = new Query(...venueRoomMessage);
        venueRoom.find([{"metrics": metrics}]);
        const extraQuestions = new Query("orderExtraQuestions");
        extraQuestions.find(["id", "name"]);

        const posterMetrics = new Query("uniqueMetrics", {...overallFilter, metricType: 'POSTER'})
        posterMetrics.find(metricsFields)
        const posters = new Query("events", {type_Type: "Poster"});
        posters.find(["id", "title", {"metrics": posterMetrics}]);

        const findQueries = ["id", "title", {"extraQuestions": extraQuestions}];

        if (eventType === 'EVENT') {
            rooms.find(["id", "name", {"events": events}]);
            findQueries.push({"rooms": rooms});
        } else if (eventType === 'ROOM') {
            rooms.find(["id", "name", {"venueroom": venueRoom}]);
            findQueries.push({"rooms": rooms});
        } else if (eventType === 'SPONSOR') {
            findQueries.push({"sponsors": sponsors});
        } else if (eventType === 'POSTER') {
            findQueries.push({"posters": posters});
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
            listFilters.fromDate = moment(fromDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            listFilters.toDate = moment(toDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        let query = new Query("metrics", listFilters);
        let results = new Query("results", filters);
        let eventmetric = new Query("eventmetric");
        eventmetric.find(["subType"]);
        results.find(["type", "ingressDate", "outgressDate", "memberName", "eventName", "sponsorName", "locationName", {"eventmetric": eventmetric} ]);

        query.find([{"results": results}, "totalCount"]);

        return query;
    };

    buildDrillDownQuery = (typeId, memberId, attendeeId) => {
        const {currentSummit} = this.props;
        const {fromDate, toDate, eventType} = this.state;
        const filters = {ordering: 'ingress_date', limit: 3000};
        const listFilters = {summitId: currentSummit.id, type: eventType};

        if (memberId) {
            listFilters.memberId = memberId;
        } else if (attendeeId) {
            listFilters.attendeeId = attendeeId;
        }

        if (eventType === 'ROOM') {
            listFilters.roomId = typeId;
        } else if (eventType === 'EVENT') {
            listFilters.eventId = typeId;
        }

        if (fromDate) {
            listFilters.fromDate = moment(fromDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        if (toDate) {
            listFilters.toDate = moment(toDate).tz('UTC').format('YYYY-MM-DDTHH:mm:ss+00:00');
        }

        let query = new Query("metrics", listFilters);
        let results = new Query("results", filters);
        results.find(["type", "ingressDate", "outgressDate", "memberName", "attendeeName", "eventName", "sponsorName", "locationName", "subType" ]);

        query.find([{"results": results}, "totalCount"]);

        return "{ reportData: "+ query + " }";
    };

    async toggleDrillDownData(target, id, metric) {
        const {currentSummit} = this.props;

        if (target.nextSibling.innerHTML) {
            target.nextSibling.innerHTML = '';
            return;
        }

        const query = this.buildDrillDownQuery(id, metric.memberId, metric.attendeeId);
        const data = await this.props.getMetricRaw(query);
        target.nextSibling.innerHTML = ReactDOMServer.renderToString(<RawMetricsTable data={data} timezone={currentSummit.time_zone_id} />);
    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        let query = null;
        if (listFilters.search) {
            this.memberReport = true;
            query = this.buildMemberQuery(filters, listFilters);
        } else {
            this.memberReport = false;
            query = this.buildMetricsQuery(filters, listFilters, sortKey, sortDir);
        }

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;
        switch(key) {
            case 'ingressdate':
                sortKey = 'Ingress';
                break;
            case 'outgressdate':
                sortKey = 'Outgress';
                break;
            case 'sub_type':
                sortKey = 'SubType';
                break;
            case 'company':
                sortKey = 'Company';
                break;
            case 'email':
                sortKey = 'Email';
                break;
            case 'metric':
                sortKey = 'FirstName';
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

        if (metric.subType) {
            result.subType = metric.subType;
        }

        if (metric.attendeeId) {
            result.attendeeId = parseInt(metric.attendeeId);
        }

        if (metric.memberId) {
            result.memberId = parseInt(metric.memberId);
        }

        if (metric.ingress) {
            result.ingress = metric.ingress;
        }

        if (metric.outgress) {
            result.outgress = metric.outgress;
        }

        return result;
    }

    getSearchPlaceholder() {
        return 'Search by Member Email, Attendee Email or Room Name';
    }

    preProcessData(data, extraData, forExport=false) {
        const {currentSummit} = this.props;
        let {eventType, showAnswers} = this.state;
        let processedData = [];
        let columns = [];

        if (!data || (this.memberReport && !data?.length))
            return {reportData: processedData, tableColumns: columns};

        if (this.memberReport) {
            const newData = data.map(d => {
                const origin = d.eventName || d.sponsorName || d.locationName;
                return {
                    type: d.type,
                    date: moment.tz(d.ingressDate, currentSummit.time_zone_id).format('dddd, MMMM Do YYYY, h:mm a (z)'),
                    origin: origin,
                    member: d.memberName,
                    subType: d.eventmetric?.subType
                }

            });

            processedData = groupByDate(newData, "member", "member");

            columns = [
                { columnKey: 'type', value: 'Type' },
                { columnKey: 'origin', value: 'Origin' },
                { columnKey: 'subType', value: 'SubType' },
                { columnKey: 'date', value: 'Date' }
            ];
        } else {
            columns = [
                { columnKey: 'metric', value: 'Metric', sortable: true },
                { columnKey: 'email', value: 'Email', sortable: true },
                { columnKey: 'company', value: 'Company', sortable: true }
            ];

            if (showAnswers && data.extraQuestions) {
                columns = [...columns, ...data.extraQuestions.map(q => ({ columnKey: q.id, value: q.name}))]
            }

            if (eventType === 'EVENT') {
                columns.push({ columnKey: 'subType', value: 'SubType', sortable: true });
                columns.push({ columnKey: 'ingress', value: 'Ingress', sortable: true });
                columns.push({ columnKey: 'outgress', value: 'Outgress', sortable: true });

                if (!data.rooms?.some(r => r.events))
                    return {reportData: processedData, tableColumns: columns};

                processedData = data.rooms
                    .map(rm => {
                        return {
                            ...rm,
                            events: rm.events
                                .filter(ev => ev?.metrics?.length)
                                .map(ev => {
                                    const metrics = ev.metrics.map(m => {
                                        const metric = this.parseMetricData(m);
                                        return ({
                                            ...metric,
                                            metric: forExport ? metric.metric : (
                                              <div>
                                                  <span className="metricDrilldown" onClick={evt => this.toggleDrillDownData(evt.target, ev.id, metric)}>{metric.metric}</span>
                                                  <div className="raw-metrics-table" />
                                              </div>
                                            ),
                                            ingress: moment.tz(metric.ingress, currentSummit.time_zone_id).format('dddd, MMMM Do YYYY, h:mm a (z)'),
                                            outgress: metric.outgress ? moment.tz(metric.outgress, currentSummit.time_zone_id).format('dddd, MMMM Do YYYY, h:mm a (z)') : '-',
                                        })
                                    });
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
                        { columnKey: 'metrics_subType', value: 'Subtype' },
                        { columnKey: 'metrics_metric', value: 'Metric' },
                        { columnKey: 'metrics_email', value: 'Email' },
                        { columnKey: 'metrics_company', value: 'Company' },
                        { columnKey: 'metrics_ingress', value: 'Ingress' },
                        { columnKey: 'metrics_outgress', value: 'Outgress' },
                    ];

                    if (showAnswers && data.extraQuestions) {
                        columns = [...columns, ...data.extraQuestions.map(q => ({ columnKey: `metrics_${q.id}`, value: q.name}))]
                    }
                }
            } else if (eventType === 'ROOM') {
                columns.push({ columnKey: 'subType', value: 'SubType' });
                columns.push({ columnKey: 'ingress', value: 'Ingress' });
                columns.push({ columnKey: 'outgress', value: 'Outgress' });

                if (!data.rooms)
                    return {reportData: processedData, tableColumns: columns};

                processedData = data.rooms.filter(r => r?.venueroom?.metrics?.length)
                  .map(rm => {
                      const metrics = rm.venueroom.metrics.map(m => {
                          const metric = this.parseMetricData(m);
                          return ({
                              ...metric,
                              metric: (
                                <div>
                                  <span className="metricDrilldown" onClick={ev => this.toggleDrillDownData(ev.target, rm.id, metric)}>{metric.metric}</span>
                                  <div className="raw-metrics-table" />
                                </div>
                              ),
                              ingress: moment.tz(metric.ingress, currentSummit.time_zone_id).format('dddd, MMMM Do YYYY, h:mm a (z)'),
                              outgress: metric.outgress ? moment.tz(metric.outgress, currentSummit.time_zone_id).format('dddd, MMMM Do YYYY, h:mm a (z)') : '-',
                          })
                      });
                      return ({...rm, metrics})
                  });

                if (forExport) {
                    processedData = flattenData(processedData);

                    columns = [
                        { columnKey: 'id', value: 'Room Id' },
                        { columnKey: 'name', value: 'Room Name' },
                        { columnKey: 'metrics_subType', value: 'Subtype' },
                        { columnKey: 'metrics_metric', value: 'Metric' },
                        { columnKey: 'metrics_email', value: 'Email' },
                        { columnKey: 'metrics_company', value: 'Company' },
                        { columnKey: 'metrics_ingress', value: 'Ingress' },
                        { columnKey: 'metrics_outgress', value: 'Outgress' },
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
            } else if (eventType === 'POSTER') {
                if (!data.posters)
                    return {reportData: processedData, tableColumns: columns};

                processedData = data.posters
                    .filter(p => p.metrics.length)
                    .map(pos => {
                        const metrics = pos.metrics.map(this.parseMetricData);
                        return ({...pos, metrics})
                    });

                if (forExport) {
                    processedData = flattenData(processedData);
                    columns = [
                        { columnKey: 'id', value: 'Id' },
                        { columnKey: 'title', value: 'Poster' },
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
        if (id === 'eventType') {
            state.roomFilter = null;
            state.eventFilter = null;
            state.subTypeFilter = null;
        }
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
        } else if (eventType === 'POSTER') {
            tables = data.map(grp => {
                const name = grp.title;
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
        } else if (eventType === 'ROOM') {
            tables = data.map(room => {
                const name = room.name;
                const id = room.id;

                const sectionId = `section_${id}`;

                return (
                  <Panel show={showSection === sectionId} title={`${name} (${room.metrics.length})`}
                         handleClick={() => toggleSection(sectionId)} key={sectionId}>
                      <div className="table-responsive">
                          <Table
                            options={options}
                            data={room.metrics}
                            columns={tableCols}
                            onSort={this.props.onSort}
                          />
                      </div>
                  </Panel>
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
        const {data, currentSummit, sortKey, sortDir} = this.props;
        const {eventType, sponsor, showAnswers, subTypeFilter, roomFilter, eventFilter} = this.state;

        const report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        const {reportData, tableColumns} = this.preProcessData(data, null);

        const event_types_ddl = [
            {label: 'Lobby (Virtual only)', value: 'LOBBY'},
            {label: 'Activity (Virtual & In-Person)', value: 'EVENT'},
            {label: 'Room (Virtual & In-Person)', value: 'ROOM'},
            {label: 'Poster Type (Virtual only)', value: 'POSTER'},
            {label: 'Sponsor Page (Virtual only)', value: 'SPONSOR'},
            {label: 'Other', value: 'GENERAL'},
        ];

        const sub_types_ddl = [
            {label: 'In-Person', value: 'ON_SITE'},
            {label: 'Virtual', value: 'VIRTUAL'},
        ];

        const room_ddl = currentSummit.locations.map(l => ({
            label: l.name, value: l.id
        }));

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
                        {eventType === 'ROOM' &&
                        <div className="col-md-3">
                            <label>Room</label>
                            <Dropdown
                              id="roomFilter"
                              options={room_ddl}
                              onChange={this.handleFilterChange}
                              value={roomFilter}
                              clearable
                            />
                        </div>
                        }
                        {eventType === 'EVENT' &&
                        <div className="col-md-3">
                            <label>Activity</label>
                            <EventInput
                              id="eventFilter"
                              summit={currentSummit}
                              value={eventFilter}
                              onChange={this.handleFilterChange}
                              onlyPublished={true}
                              isClearable
                            />
                        </div>
                        }
                        {['ROOM', 'EVENT'].includes(eventType) &&
                        <div className="col-md-3">
                            <label>Sub Type</label>
                            <Dropdown
                              id="subTypeFilter"
                              options={sub_types_ddl}
                              onChange={this.handleFilterChange}
                              value={subTypeFilter}
                              clearable
                            />
                        </div>
                        }
                    </div>
                    <div className="row" style={{marginTop: 20}}>
                        <div className="col-md-4">
                            <label>Ingress date</label>
                            <div className="inline">
                                From: &nbsp;&nbsp;
                                <DateTimePicker
                                  id="fromDate"
                                  onChange={this.handleFilterChange}
                                  format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                  value={this.state.fromDate}
                                  timezone={currentSummit.time_zone_id}
                                />
                                &nbsp;&nbsp;To:&nbsp;&nbsp;
                                <DateTimePicker
                                  id="toDate"
                                  onChange={this.handleFilterChange}
                                  format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                  value={this.state.toDate}
                                  timezone={currentSummit.time_zone_id}
                                />
                            </div>
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
                </div>


                {this.getTable(reportData, report_options, tableColumns)}
            </div>
        );
    }
}


export default wrapReport(MetricsReport, {pagination: false, preventInitialLoad: true});
