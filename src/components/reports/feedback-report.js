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
import history from '../../history'
import { Table } from 'openstack-uicore-foundation/lib/components'
import StarRatings from 'react-star-ratings';
import Select from 'react-select'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";


class FeedbackReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groupBy: 'feedback'
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.getName = this.getName.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;
        let {groupBy} = this.state
        listFilters.summitId = currentSummit.id;
        let query = null;

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        switch (groupBy) {
            case 'feedback': {
                query = new Query("feedbacks", listFilters);
                let presentation = new Query("presentation");
                presentation.find(["id", "speakerNames"]);
                let event = new Query("event");
                event.find(["id", "title", {"presentation": presentation}]);
                let owner = new Query("owner");
                owner.find(["id", "firstName", "lastName"]);
                let results = new Query("results", filters);
                results.find(["id", "rate", "note", {"event": event}, {"owner": owner}])

                query.find([{"results": results}, "totalCount", {"extraStat":"avgRate"}]);
            }
            break;
            case 'presentation': {
                listFilters.hasFeedback = true;
                query = new Query("presentations", listFilters);
                let results = new Query("results", filters);
                results.find(["id", "title", "speakerNames", "feedbackCount", "feedbackAvg"])

                query.find([{"results": results}, "totalCount"]);
            }
            break;
            case 'track': {
                listFilters.hasFeedback = true;
                query = new Query("categories", listFilters);
                let results = new Query("results", filters);
                results.find(["id", "title", "feedbackCount", "feedbackAvg"])

                query.find([{"results": results}, "totalCount"]);
            }
            break;
            case 'speaker': {
                listFilters.hasFeedbackForSummit = currentSummit.id;
                query = new Query("speakers", listFilters);
                let results = new Query("results", filters);
                results.find([
                    "id",
                    "firstName",
                    "lastName",
                    "feedbackCount(summitId:"+currentSummit.id+")",
                    "feedbackAvg(summitId:"+currentSummit.id+")",
                    {"overallCount": "feedbackCount"},
                    {"overallAvg": "feedbackAvg"}
                ])

                query.find([{"results": results}, "totalCount"]);
            }
            break;
        }

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;
        switch(key) {
            case 'event':
                sortKey = 'title';
                break;
            case 'room':
                sortKey = 'location__venueroom__name';
                break;
        }

        return sortKey;
    }

    handleFilterChange(value) {
        this.setState({groupBy: value.value}, () => {this.props.onReload()});
    }

    getName() {
        let {groupBy} = this.state;
        let name = groupBy === 'feedback' ? '' : ' by ' + groupBy;
        return `Feedback Report ${name}`;
    }

    preProcessData(data, extraData, forExport=false) {
        let {groupBy} = this.state;
        let processedData = []
        let columns = [];

        switch (groupBy) {
            case 'feedback': {
                processedData = flattenData(data).map(it => {
                    let rate = forExport ? it.rate : <StarRatings rating={it.rate} starRatedColor="gold" starDimension="10px" starSpacing="1px" isSelectable={false}/>

                    return ({
                        rate: rate,
                        presentation: it.event_title,
                        speakers: it.event_presentation_speakerNames,
                        critic: it.owner_firstName + ' ' + it.owner_lastName,
                        note: it.note,
                    });
                });

                columns = [
                    { columnKey: 'rate', value: 'Rate', sortable: true },
                    { columnKey: 'presentation', value: 'Presentation' },
                    { columnKey: 'speakers', value: 'Speakers' },
                    { columnKey: 'critic', value: 'Critic' },
                    { columnKey: 'note', value: 'Note' },
                ];
            }
            break;
            case 'presentation': {
                processedData = data.map(it => {
                    let pres = forExport ? it.title : <a onClick={() => {history.push(`feedback_report/presentation/${it.id}`, {name: it.title})}} >{it.title}</a>
                    let rate = forExport ? it.feedbackAvg : <StarRatings rating={it.feedbackAvg} starRatedColor="gold" starDimension="10px" starSpacing="1px" isSelectable={false}/>

                    return ({
                        rate: rate,
                        presentation: pres,
                        speakers: it.speakerNames,
                        count: it.feedbackCount
                    });
                });

                columns = [
                    { columnKey: 'rate', value: 'Rate', sortable: true },
                    { columnKey: 'presentation', value: 'Presentation' },
                    { columnKey: 'speakers', value: 'Speakers' },
                    { columnKey: 'count', value: 'Count' }
                ];
            }
            break;
            case 'track': {
                processedData = data.map(it => {
                    let track = forExport ? it.title : <a onClick={() => {history.push(`feedback_report/track/${it.id}`, {name: it.title})}} >{it.title}</a>
                    let rate = forExport ? it.feedbackAvg : <StarRatings rating={it.feedbackAvg} starRatedColor="gold" starDimension="10px" starSpacing="1px" isSelectable={false}/>


                    return ({
                        rate: rate,
                        category: track,
                        count: it.feedbackCount
                    });
                });

                columns = [
                    { columnKey: 'rate', value: 'Rate', sortable: true },
                    { columnKey: 'category', value: 'Track' },
                    { columnKey: 'count', value: 'Count' }
                ];
            }
            break;
            case 'speaker': {
                processedData = data.map(it => {
                    let speakerName = it.firstName + ' ' + it.lastName;
                    let speaker = forExport ? speakerName : <a onClick={() => {history.push(`feedback_report/speaker/${it.id}`, {name: speakerName})}} >{speakerName}</a>
                    let rate = forExport ? it.feedbackAvg : <StarRatings rating={it.feedbackAvg} starRatedColor="gold" starDimension="10px" starSpacing="1px" isSelectable={false}/>


                    return ({
                        rate: rate,
                        speaker: speaker,
                        count: it.feedbackCount,
                        overall_avg: it.overallAvg,
                        overall_count: it.overallCount
                    });
                });

                columns = [
                    { columnKey: 'rate', value: 'Rate', sortable: true },
                    { columnKey: 'count', value: 'Count' },
                    { columnKey: 'speaker', value: 'Speaker' },
                    { columnKey: 'overall_avg', value: 'Overall Avg' },
                    { columnKey: 'overall_count', value: 'Overall Count' }
                ];
            }
            break;
        }

        return {reportData: processedData, tableColumns: columns};
    }


    render() {
        let {data, extraData, totalCount, extraStat, sortKey, sortDir} = this.props;
        let {groupBy} = this.state;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />)

        let avgRate = extraStat ? extraStat : 0;

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        let groupOptions = [
            {label: 'Feedback', value: 'feedback'},
            {label: 'Track', value: 'track'},
            {label: 'Presentation', value: 'presentation'},
            {label: 'Speaker', value: 'speaker'}
        ];

        let table_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        return (
            <div>
                <div className="row report-filters">
                    <div className="col-md-4 pull-right">
                        <label>Group by</label>
                        <Select
                            value={groupOptions.find(v => v.value === groupBy)}
                            id="report_group_by"
                            options={groupOptions}
                            onChange={this.handleFilterChange}
                        />
                    </div>
                </div>
                <div className="panel panel-default">
                    {extraStat ?
                        (<div className="panel-heading">
                            <StarRatings rating={avgRate} starRatedColor="gold" starDimension="20px" starSpacing="3px"
                                     isSelectable={false}/>
                            &nbsp; of {totalCount} feedbacks
                        </div>)
                        :
                        (
                            <div className="panel-heading"> Grouped by {groupBy} </div>
                        )
                    }

                    <div className="table-responsive">
                        <Table
                            options={table_options}
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


export default wrapReport(FeedbackReport, {pagination: true});
