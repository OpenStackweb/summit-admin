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
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';


class RsvpEventReport extends React.Component {
    constructor(props) {
        super(props);

        let reportName = props.location.state ? props.location.state.name : `Event ${props.match.params.event_id}`;

        this.state = {
            reportName: reportName
        };

        this.buildReportQuery = this.buildReportQuery.bind(this);
        this.getName = this.getName.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;
        let event_id = this.props.match.params.event_id;

        listFilters.eventId = parseInt(event_id);

        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir === 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        let query = new Query("rsvps", listFilters);
        let question = new Query("question");
        question.find(["id"]);
        let answers = new Query("answers");
        answers.find(["value", {"question": question}]);
        let results = new Query("results", filters);
        results.find(["id", {"answers": answers}]);
        query.find([{"results": results}, "totalCount"]);


        let values = new Query("values");
        values.find(["id", "value"]);
        let rsvpquestionmulti = new Query("rsvpquestionmulti");
        rsvpquestionmulti.find([{"values": values}]);
        let questions = new Query("questions");
        questions.find(["id","label", {"rsvpquestionmulti": rsvpquestionmulti}]);
        let rsvpTemplate = new Query("rsvpTemplate");
        rsvpTemplate.find(["id", {"questions": questions}]);
        let query2 = new Query("presentation", {id: event_id});
        query2.find("id", "title", {"rsvpTemplate": rsvpTemplate})


        return query + ', extraData: ' + query2;
    }

    translateSortKey(key) {
        let sortKey = key;


        return sortKey;
    }

    preProcessData(data, extraData, forExport=false) {
        let questions = extraData.rsvpTemplate.questions.map(q => {
            let qtmp= {id: q.id, label: q.label}
            if (q.rsvpquestionmulti.values.length > 0) {
                qtmp.values = q.rsvpquestionmulti.values;
            }

            return qtmp;
        })

        let answers = [];
        let columns = [{columnKey: 'pos', value: '#'}];

        data.forEach((rsvp, idx) => {
            let rsvpAns = rsvp.answers.map((a, idxA) => {
                let value = a.value;
                let questionLabel = '';

                if (a.question) {
                    let question = questions.find(q => q.id === a.question.id);
                    questionLabel = question.label;

                    if(question.hasOwnProperty("values")) {
                        value = a.value.split(',').map(v => {
                            let qValue = question.values.find(qv => qv.id === v);
                            return qValue.value
                        }).join(', ');
                    }
                }

                if (idx === 0) {
                    columns.push({columnKey: 'question_' + idxA, value: questionLabel});
                }

                return ['question_' + idxA, value]
            })

            let rsvpAnsObj = {pos: idx + 1, ...Object.fromEntries(rsvpAns)};
            answers.push(rsvpAnsObj);
        });

        return {reportData: answers, tableColumns: columns};
    }


    getName() {
        return this.state.reportName;
    }

    render() {
        let {data, extraData, totalCount, sortKey, sortDir} = this.props;
        let storedDataName = this.props.name;

        if (!extraData || !data || storedDataName !== this.getName()) return (<div />)

        let report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };

        let {reportData, tableColumns} = this.preProcessData(data, extraData);

        return (
            <div className="panel panel-default">
                <div className="panel-heading">RSVPs ({totalCount})</div>
                <div className="table-responsive">
                    <Table
                        options={report_options}
                        data={reportData}
                        columns={tableColumns}
                        onSort={this.props.onSort}
                    />
                </div>
            </div>
        );
    }
}


export default wrapReport(RsvpEventReport, {pagination: true});
