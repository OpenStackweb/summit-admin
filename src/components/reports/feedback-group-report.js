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
import StarRatings from 'react-star-ratings';
import Select from 'react-select'
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import {flattenData} from "../../actions/report-actions";

const reportName = 'feedback_group_report';


class FeedbackGroupReport extends React.Component {
    constructor(props) {
        super(props);

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.preProcessData = this.preProcessData.bind(this);

    }

    buildReportQuery(filters, listFilters) {
        let {currentSummit, match} = this.props;
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

        query = new Query("feedbacks", listFilters);
        let presentation = new Query("presentation");
        presentation.find(["id", "speakerNames"]);
        let event = new Query("event");
        event.find(["id", "title", {"presentation": presentation}]);
        let owner = new Query("owner");
        owner.find(["id", "firstName", "lastName"]);
        let results = new Query("results", filters);
        results.find(["id", "rate", "note", {"event": event}, {"owner": owner}])

        query.find([{"results": results}, "totalCount", "avgRate"]);

        return query;
    }

    handleSort(index, key, dir, func) {
        let sortKey = null;
        switch(key) {
            case 'rate':
                sortKey = 'rate';
                break;
        }

        this.props.onSort(index, sortKey, dir, func);
    }


    preProcessData(data, extraData) {

        let processedData = flattenData(data).map(it => {
            return ({
                rate: <StarRatings rating={it.rate} starRatedColor="gold" starDimension="10px" starSpacing="1px"
                                   isSelectable={false}/>,
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

        if (!data) return (<div></div>)

        let avgRate = extraStat ? extraStat : 0;

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        let table_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        }

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        {location.state.name} &nbsp;-&nbsp;
                        <StarRatings rating={avgRate} starRatedColor="gold" starDimension="20px" starSpacing="3px"
                                     isSelectable={false}/>
                        &nbsp; of {totalCount} feedbacks
                    </div>

                    <div className="table-responsive">
                        <Table
                            options={table_options}
                            data={reportData}
                            columns={tableColumns}
                            onSort={this.handleSort}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


export default wrapReport(FeedbackGroupReport, {reportName, pagination: true});
