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
import {Table} from "openstack-uicore-foundation/lib/components";
import Select from "react-select";
import T from "i18n-react";
import TicketTypeFilter from "../filters/ticket-type-filter";
import BadgeFeatureFilter from "../filters/badge-feature-filter";
import OrderQuestionFilter from "../filters/order-question-filter"
import {ALL_FILTER} from "../../utils/constants";

class AttendeeReport extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showQuestions: []
        };
    }
    componentDidMount() {
        this.props.getOrderExtraQuestions();
        this.props.getBadgeFeatures();
    }
    
    onShowQuestionsChange = (value) => {
        this.setState({showQuestions: value});
    }
    
    buildReportQuery = (filters, listFilters, sortKey, sortDir) => {
        const {currentSummit} = this.props;
        listFilters.summitId = currentSummit.id;
    
        if (sortKey) {
            let querySortKey = this.translateSortKey(sortKey);
            let order = (sortDir == 1) ? '' : '-';
            filters.ordering = order + '' + querySortKey;
        }

        const query = new Query("attendees", listFilters);

        const answers = new Query("extraQuestionAnswers");
        answers.find(["answerText", "questionId"]);

        const results = new Query("results", filters);
        results.find(["id", "fullname:fullName", "email", "company:companyName", "featureList", "ticketTypeList", {"answers": answers}])

        query.find([{"results": results}, "totalCount"]);

        return query;
    }
    
    translateFilters = (reportQueryFilters) => {
        const {ticket_types, badge_features, questions, ...newFilters} = reportQueryFilters;
        
        if (ticket_types) {
            newFilters['ticketTypeId'] = ticket_types;
        }
    
        if (badge_features) {
            newFilters['featureId'] = badge_features;
        }
    
        if (questions) {
            const questionsRawArray = questions.split(',');
            const allOrAny = questionsRawArray.pop();

            const parsedQuestions = questionsRawArray.reduce((results, qs) => {
                const [questionId, answerId] = qs.split(':');
                if (!results[questionId]) results[questionId] = [];
                results[questionId].push(answerId);
                return results;
            }, {});

            const filter = Object.entries(parsedQuestions).map(([questionId, answers]) => {
                return `${questionId}:${answers.join(',')}`;
            });
            filter.push(allOrAny);

            newFilters['question'] = filter.join('|');
        }

        return newFilters;
    }
    
    translateSortKey = (key) => {
        let sortKey = key;
    
        switch(key) {
            case 'fullname':
            case 'fullName':
                sortKey = 'existing_last_name';
                break;
            case 'company':
                sortKey = 'company_name';
                break;
        }
        
        return sortKey;
    }
    getName = () => {
        return 'Attendee Report';
    }
    
    getSearchPlaceholder = () => {
        return 'Search by Last Name, Email or Company';
    }
    
    preProcessData(data, extraData, forExport=false) {
        const {showQuestions} = this.state;
        
        let columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'fullname', value: 'Full Name', sortable: true },
            { columnKey: 'email', value: 'Email', sortable: true },
            { columnKey: 'company', value: 'Company', sortable: true },
            { columnKey: 'featureList', value: 'Features' },
            { columnKey: 'ticketTypeList', value: 'Tickets' }
        ];
        
        
        let processedData = data.map(it => {
            const {answers, ...baseData} = it;
            const newData = {...baseData}
            
            answers.forEach(ans => {
                newData[`question_${ans.questionId}`] = ans.answerText;
            })
            return newData;
        });
    
        showQuestions.forEach(q => {
            columns.push({columnKey: `question_${q.value}`, value: q.label});
        })
        
        return {reportData: processedData, tableColumns: columns};
    }
    
    render() {
        const {currentSummit, data, name, filters, totalCount, sortKey, sortDir, onReload, onFilterChange} = this.props;
        const {showQuestions} = this.state;
        const {attendee_extra_questions, ticket_types, badge_features} = currentSummit;
        
        if (!attendee_extra_questions || !data || name !== this.getName()) return null;
        
        const parsedQuestions = attendee_extra_questions
          .filter(eq => {
              // here we filter questions according to the features and ticket type filters
              const {allowed_badge_features_types, allowed_ticket_types} = eq;
              const ticketTypesFilter = filters.ticket_types?.split(',') || [];
              const featuresFilter = filters.badge_features?.split(',') || [];
              let allowedByFeature = true;
              let allowedByTicketType = true;
              
              if (allowed_badge_features_types.length > 0 && featuresFilter.length > 0) {
                  allowedByFeature = allowed_badge_features_types.some(fid => featuresFilter.includes(fid.toString()));
              }
    
              if (allowed_ticket_types.length > 0 && ticketTypesFilter.length > 0) {
                  allowedByTicketType = allowed_ticket_types.some(fid => ticketTypesFilter.includes(fid.toString()));
              }
              
              return allowedByFeature && allowedByTicketType;
          })
          .map(eq => ({...eq, label_text: eq.label.replace(/<[^>]+>/g, '').slice(0, 60)})
          );
        
        const report_options = {
            sortCol: sortKey,
            sortDir: sortDir,
            actions: {}
        };
    
        const {reportData, tableColumns} = this.preProcessData(data, null);
    
        const showQuestionsOptions = parsedQuestions.map( q => ({label: q.label_text, value: q.id}));
        
        return (
          <div className="attendee-report">
              <div className="report-filters">
                  <div className="row">
                      <div className="col-md-4">
                          <TicketTypeFilter
                            value={filters?.ticket_types || null}
                            types={ticket_types}
                            onChange={value => onFilterChange('ticket_types', value, true)}
                            isMulti
                          />
                      </div>
                      <div className="col-md-4">
                          <BadgeFeatureFilter
                            value={filters?.badge_features || null}
                            features={badge_features}
                            onChange={value => onFilterChange('badge_features', value, true)}
                            isMulti
                          />
                      </div>
                      <div className="col-md-4">
                          <OrderQuestionFilter
                            value={filters?.questions || null}
                            questions={parsedQuestions}
                            onChange={value => onFilterChange('questions', value, true)}
                            isMulti
                          />
                      </div>
                  </div>
                  <div className="row" style={{marginTop: 20}}>
                      <div className="col-md-8">
                          <label>Show Questions</label>
                          <Select
                            name="questionsDropDown"
                            value={showQuestions}
                            id="show_questions"
                            placeholder={T.translate("reports.placeholders.select_questions")}
                            options={showQuestionsOptions}
                            onChange={this.onShowQuestionsChange}
                            isMulti
                          />
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <button className="btn btn-primary pull-right" onClick={onReload}> Go </button>
                      </div>
                  </div>
              </div>
              <div className="panel panel-default">
                  <div className="panel-heading"> Attendees ({totalCount}) </div>
          
                  <div className="table">
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


export default wrapReport(AttendeeReport, {pagination: true});
