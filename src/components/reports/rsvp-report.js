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
const Query = require('graphql-query-builder');
import wrapReport from './report-wrapper';
import history from "../../history";


class RsvpReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.buildReportQuery = this.buildReportQuery.bind(this);

    }

    buildReportQuery(filters, listFilters, sortKey, sortDir) {
        const {currentSummit} = this.props;

        listFilters.isRsvp = true;
        listFilters.summitId = currentSummit.id;


        let query = new Query("presentations", listFilters);

        let question = new Query("question");
        question.find(["id"]);
        let answers = new Query("answers");
        answers.find(["value", {"question": question}]);
        let rsvps = new Query("rsvps");
        rsvps.find(["id", {"answers": answers}]);
        let values = new Query("values");
        values.find(["id", "value"]);
        let rsvpquestionmulti = new Query("rsvpquestionmulti");
        rsvpquestionmulti.find([{"values": values}]);
        let questions = new Query("questions");
        questions.find(["label", {"rsvpquestionmulti": rsvpquestionmulti}]);
        let rsvpTemplate = new Query("rsvpTemplate");
        rsvpTemplate.find(["id", {"questions": questions}]);

        let results = new Query("results", filters);
        results.find(["id", "title", "startDate", "endDate", "rsvpCount"])

        query.find([{"results": results}, "totalCount"]);

        return query;
    }

    getName() {
        return 'RSVP Report';
    }

    render() {
        let {data} = this.props;
        let storedDataName = this.props.name;

        if (!data || storedDataName !== this.getName()) return (<div />)

        let reportData = data.map(it => {

            return ({
                id: it.id,
                title: it.title,
                start_date: it.startDate,
                end_date: it.endDate,
            });
        });

        return (
            <div className="list-group">
                {reportData.map(it =>
                <a key={"room_pres_" + it.id} onClick={() => {history.push(`rsvp_report/${it.id}`, {name: it.title})}} className="list-group-item">
                    {it.title}
                </a>
                )}
            </div>
        );
    }
}


export default wrapReport(RsvpReport, {pagination: true});
