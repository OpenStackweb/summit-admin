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
import { Table } from 'openstack-uicore-foundation/lib/components'
import StarRatings from 'react-star-ratings';
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";



class FeedbackGroupReport extends React.Component {
    constructor(props) {
        super(props);

        let reportName = props.location.state ? props.location.state.name : `${props.match.params.group} ${props.match.params.group_id}`;

        this.state = {
            reportName: reportName
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.preProcessData = this.preProcessData.bind(this);
        this.getName = this.getName.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit, match} = this.props;
        listFilters.summitId = currentSummit.id;
        filters.ordering = filters.ordering ? filters.ordering : 'rate';
        let {group, group_id} = match.params;
        let query = null;

        switch (group) {
            case 'presentation': {
                listFilters.eventId = parseInt(group_id);
            }
            break;
            case 'track': {
                listFilters.categoryId = parseInt(group_id);
            }
            break;
            case 'speaker': {
                listFilters.speakerId = parseInt(group_id);
            }
            break;
        }

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

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

        return query;
    }

    translateSortKey(key) {
        let sortKey = key;

        return sortKey;
    }

    getName() {
        return this.state.reportName;
    }


    preProcessData(data, extraData, forExport=false) {

        let processedData = flattenData(data).map(it => {
            let rate = forExport ? it.rate : <StarRatings rating={it.rate} starRatedColor="gold" starDimension="10px" starSpacing="1px" isSelectable={false}/>
            return ({
                rate: rate,
                presentation: it.event_title,
                speakers: it.event_presentation_speakerNames,
                critic: it.owner_firstName + ' ' + it.owner_lastName,
                note: it.note,
            });
        });

        let columns = [
            { columnKey: 'rate', value: 'Rate', sortable: true },
            { columnKey: 'presentation', value: 'Presentation' },
            { columnKey: 'speakers', value: 'Speakers' },
            { columnKey: 'critic', value: 'Critic' },
            { columnKey: 'note', value: 'Note' },
        ];

        return {reportData: processedData, tableColumns: columns};
    }


    render() {
        let {data, extraData, totalCount, extraStat, sortKey, sortDir, location} = this.props;
        let {reportName} = this.state;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />)

        let avgRate = extraStat ? extraStat : 0;

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        let table_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        {reportName} &nbsp;-&nbsp;
                        <StarRatings rating={avgRate} starRatedColor="gold" starDimension="20px" starSpacing="3px"
                                     isSelectable={false}/>
                        &nbsp; of {totalCount} feedbacks
                    </div>

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


export default wrapReport(FeedbackGroupReport, {pagination: true});
