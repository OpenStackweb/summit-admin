/**
 * Copyright 2022 OpenStack Foundation
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
import {connect} from "react-redux"
import T from "i18n-react";
import {DateTimePicker, Dropdown, FreeTextSearch, Table} from "openstack-uicore-foundation/lib/components";
import {Pagination} from "react-bootstrap";
import {getPresentationsVotes, getAttendeeVotes} from "../../actions/presentation-votes-actions";
import {Breadcrumb} from "react-breadcrumbs";
import {epochToMomentTimeZone, escapeFilterValue} from "openstack-uicore-foundation/lib/methods";

const REPORT_TYPE_BY_PRESENTATION = 'BY_PRESENTATION';

class SummitPresentationsVotesPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleChangeFilters = this.handleChangeFilters.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterByDate = this.handleFilterByDate.bind(this);
        this.handleChangeReportType = this.handleChangeReportType.bind(this);
        this.buildExtraFilters = this.buildExtraFilters.bind(this);
        this.state = {
            errors:{},
            begin_presentation_attendee_vote_date:0,
            end_presentation_attendee_vote_date:0,
            term: '',
            current_report_type: REPORT_TYPE_BY_PRESENTATION,
        };
    }

    buildExtraFilters(reportType){

        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date, term} = this.state;
        let filters = [];
        if(term !== ''){
            const escapedTerm = escapeFilterValue(term);
            if(reportType === REPORT_TYPE_BY_PRESENTATION)
                filters.push(`title=@${escapedTerm}`);
            else
                filters.push(`full_name=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm}`);
        }
        if(
            begin_presentation_attendee_vote_date > 0 &&
            end_presentation_attendee_vote_date > 0 &&
            begin_presentation_attendee_vote_date < end_presentation_attendee_vote_date){
            if(reportType === REPORT_TYPE_BY_PRESENTATION) {
                filters.push(`presentation_attendee_vote_date>=${begin_presentation_attendee_vote_date}`);
                filters.push(`presentation_attendee_vote_date<=${end_presentation_attendee_vote_date}`);
            }
            else{
                filters.push(`presentation_votes_date>=${begin_presentation_attendee_vote_date}`);
                filters.push(`presentation_votes_date<=${end_presentation_attendee_vote_date}`);
            }
        }
        if(reportType!== REPORT_TYPE_BY_PRESENTATION){
            filters.push(`presentation_votes_track_group_id==${reportType}`);
        }
        return filters;
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getPresentationsVotes();
        }
    }

    handleChangeReportType(ev){
        const {value, id} = ev.target;
        this.setState({...this.state, current_report_type : value});
        let filters = this.buildExtraFilters(value)
        if(value === REPORT_TYPE_BY_PRESENTATION){
            this.props.getPresentationsVotes(1, 10, 'votes_count', 0, filters);
            return;
        }
        this.props.getAttendeeVotes(1,10,'presentation_votes_count',0, filters);
    }

    handlePageChange(page) {
        const { order, orderDir, perPage} = this.props;
        const {current_report_type} = this.state;
        const filters = this.buildExtraFilters(current_report_type);
        if(current_report_type === REPORT_TYPE_BY_PRESENTATION) {
            this.props.getPresentationsVotes(page, perPage, order, orderDir, filters);
            return;
        }
        this.props.getAttendeeVotes(page, perPage, (order ==='votes_count'? 'presentation_votes_count': order), orderDir, filters);
    }

    handleSort(index, key, dir, func) {
        const { page, perPage} = this.props;
        const {current_report_type} = this.state;
        const filters = this.buildExtraFilters(current_report_type);
        if(current_report_type === REPORT_TYPE_BY_PRESENTATION) {
            this.props.getPresentationsVotes(page, perPage, key, dir, filters);
            return;
        }
        this.props.getAttendeeVotes(page, perPage, (key ==='votes_count'? 'presentation_votes_count': key), dir, filters);
    }

    handleFilterByDate(ev){
        ev.preventDefault();
        const { order, orderDir, perPage} = this.props;
        const {current_report_type} = this.state;
        const filters = this.buildExtraFilters(current_report_type);
        if(current_report_type === REPORT_TYPE_BY_PRESENTATION){
            this.props.getPresentationsVotes(1, perPage, order, orderDir, filters)
            return;
        }
        this.props.getAttendeeVotes(1,perPage, (order ==='votes_count'? 'presentation_votes_count': order), orderDir, filters)
    }

    handleChangeFilters(ev) {
        const errors = {...this.state.errors};

        let {value, id} = ev.target;

        if (ev.target.type === 'datetime') {
            value = value.unix();
        }

        errors[id] = '';
        let newState = {...this.state, errors};

        newState[`${id}`] = value;

        this.setState(newState);
    }

    handleSearch(term) {
        const {order, orderDir} = this.props;
        const {current_report_type} = this.state;
        this.setState({...this.state, term: term}, () => {
            const filters = this.buildExtraFilters(current_report_type);
            if(current_report_type === REPORT_TYPE_BY_PRESENTATION){
                this.props.getPresentationsVotes(1, 10, order, orderDir, filters)
                return;
            }
            this.props.getAttendeeVotes(1,10, (order ==='votes_count'? 'presentation_votes_count': order), orderDir, filters)
        });
    }

    render(){
        const {currentSummit, items, lastPage, currentPage, order, orderDir, totalItems, match} = this.props;
        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date, term, current_report_type} = this.state;

        let columns = current_report_type === REPORT_TYPE_BY_PRESENTATION ? [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'title', value: T.translate("presentation_votes_page.title"), sortable: true },
            { columnKey: 'votes_count', value: T.translate("presentation_votes_page.votes_count"), sortable: true }
        ]:[
            { columnKey: 'first_name', value: 'First Name', sortable: true },
            { columnKey: 'last_name', value: 'Last Name', sortable: true },
            { columnKey: 'votes_count', value: T.translate("presentation_votes_page.votes_count"), sortable: true },
            { columnKey: 'presentations', value: T.translate("presentation_votes_page.presentations") }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {}
        }

        if(!currentSummit.id) return(<div />);

        let extraOptions = currentSummit.track_groups.map((tg) => ({label:`View by attendee for ${tg.name}`, value:tg.id}));
        let reportTypeDDL = [
            {label: 'View By Presentation', value: REPORT_TYPE_BY_PRESENTATION}, ...extraOptions
        ];

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("presentation_votes_page.presentation_votes_page"), pathname: match.url }} />
                <div className="container">
                <h3> {current_report_type === REPORT_TYPE_BY_PRESENTATION ?
                    T.translate("presentation_votes_page.presentation_vote_list"):
                    T.translate("presentation_votes_page.attendees_vote_list")
                } ({totalItems})</h3>
                <div className={'row'} style={{"padding-bottom":"1em"}}>
                    <div className={'col-md-6'}>
                        <Dropdown
                            id="report_type"
                            value={this.state.current_report_type}
                            onChange={this.handleChangeReportType}
                            options={reportTypeDDL}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                    </div>
                </div>
                <div className={'row'}>
                    <div className={'col-md-12'}>
                        <div className={'row'}>
                            <div className={'col-md-2'}>
                                <DateTimePicker
                                    id="begin_presentation_attendee_vote_date"
                                    onChange={this.handleChangeFilters}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    timezone={currentSummit.time_zone_id}
                                    inputProps={{ placeholder:"From"}}
                                    value={epochToMomentTimeZone(begin_presentation_attendee_vote_date, currentSummit.time_zone_id)}
                                />
                            </div>
                            <div className={'col-md-2'}>
                                <DateTimePicker
                                    id="end_presentation_attendee_vote_date"
                                    onChange={this.handleChangeFilters}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    timezone={currentSummit.time_zone_id}
                                    inputProps={{ placeholder:"To"}}
                                    value={epochToMomentTimeZone(end_presentation_attendee_vote_date, currentSummit.time_zone_id)}
                                />
                            </div>
                            <div className={'col-md-2'}>
                                <button className="btn btn-primary right-space" onClick={this.handleFilterByDate}>
                                    {T.translate("presentation_votes_page.filter_by_date")}
                                </button>
                            </div>
                            <div className={'col-md-6'}>
                                    <FreeTextSearch
                                        value={term ?? ''}
                                        placeholder={current_report_type === REPORT_TYPE_BY_PRESENTATION ?
                                            T.translate("presentation_votes_page.placeholders.search_presentations"):
                                            T.translate("presentation_votes_page.placeholders.search_attendees")
                                        }
                                        onSearch={this.handleSearch}
                                    />
                            </div>
                        </div>
                    </div>
                </div>

                {totalItems === 0 &&
                    <div>{T.translate("presentation_votes_page.no_presentations")}</div>
                }

                {totalItems > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={items}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                    <Pagination
                        bsSize="medium"
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        maxButtons={10}
                        items={lastPage}
                        activePage={currentPage}
                        onSelect={this.handlePageChange}
                    />
                </div>
                }
            </div>
            </div>
        )
    }
}

const mapStateToProps = ({
    currentSummitState,
    currentPresentationVotesState
}) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentPresentationVotesState,
})

export default connect (
    mapStateToProps,
    {
        getPresentationsVotes,
        getAttendeeVotes
    }
)(SummitPresentationsVotesPage);