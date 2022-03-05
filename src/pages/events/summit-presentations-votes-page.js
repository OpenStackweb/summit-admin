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
import {DateTimePicker, FreeTextSearch, Table} from "openstack-uicore-foundation/lib/components";
import {Pagination} from "react-bootstrap";
import {getPresentationsVotes, exportPresentationsVotes} from "../../actions/presentation-votes-actions";
import {Breadcrumb} from "react-breadcrumbs";
import {epochToMomentTimeZone} from "openstack-uicore-foundation/lib/methods";

class SummitPresentationsVotesPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSort = this.handleSort.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleShowVoterColClick = this.handleShowVoterColClick.bind(this);
        this.handleChangeFilters = this.handleChangeFilters.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterByDate = this.handleFilterByDate.bind(this);
        this.state = {
            showVotersColumn:false,
            errors:{},
            begin_presentation_attendee_vote_date:0,
            end_presentation_attendee_vote_date:0,
            term: '',
        };
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getPresentationsVotes();
        }
    }

    handleShowVoterColClick(ev){
        let {checked} = ev.target;
        this.setState({...this.state, showVotersColumn: checked});
    }

    handleExport(ev) {
        const {order, orderDir} = this.props;
        ev.preventDefault();
        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date, term} = this.state;
        let filters = [];
        if(
            begin_presentation_attendee_vote_date > 0 &&
            end_presentation_attendee_vote_date > 0 &&
            begin_presentation_attendee_vote_date < end_presentation_attendee_vote_date){
            filters.push(`presentation_attendee_vote_date>=${begin_presentation_attendee_vote_date}`);
            filters.push(`presentation_attendee_vote_date<=${end_presentation_attendee_vote_date}`);
        }
        if(term !== ''){
            filters.push(`title=@${term}`);
        }
        this.props.exportPresentationsVotes(order, orderDir, filters);
    }

    handlePageChange(page) {
        const { order, orderDir, perPage} = this.props;
        this.props.getPresentationsVotes(page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const { page, perPage} = this.props;
        this.props.getPresentationsVotes( page, perPage, key, dir);
    }

    handleFilterByDate(ev){
        ev.preventDefault();
        const {order, orderDir, page, perPage} = this.props;
        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date} = this.state;
        let filters = [];
        if(
            begin_presentation_attendee_vote_date > 0 &&
            end_presentation_attendee_vote_date > 0 &&
            begin_presentation_attendee_vote_date < end_presentation_attendee_vote_date){
            filters.push(`presentation_attendee_vote_date>=${begin_presentation_attendee_vote_date}`);
            filters.push(`presentation_attendee_vote_date<=${end_presentation_attendee_vote_date}`);
        }
        this.props.getPresentationsVotes(page, perPage, order, orderDir, filters);
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
        const {order, orderDir, page, perPage} = this.props;
        this.setState({...this.state, term: term});
        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date} = this.state;
        let filters = [`title=@${term}`];
        if(
            begin_presentation_attendee_vote_date > 0 &&
            end_presentation_attendee_vote_date > 0 &&
            begin_presentation_attendee_vote_date < end_presentation_attendee_vote_date){
            filters.push(`presentation_attendee_vote_date>=${begin_presentation_attendee_vote_date}`);
            filters.push(`presentation_attendee_vote_date<=${end_presentation_attendee_vote_date}`);
        }
        this.props.getPresentationsVotes(page, perPage, order, orderDir, filters);
    }

    render(){
        const {currentSummit, presentations, lastPage, currentPage, order, orderDir, totalPresentations, match} = this.props;
        const {begin_presentation_attendee_vote_date, end_presentation_attendee_vote_date, term} = this.state;
        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'title', value: T.translate("presentation_votes_page.title"), sortable: true },
            { columnKey: 'votes_count', value: T.translate("presentation_votes_page.votes_count"), sortable: true }
        ];

        if(this.state.showVotersColumn){
            columns.push(
                { columnKey: 'voters', value: T.translate("presentation_votes_page.voters")}
            )
        }

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {}
        }

        if(!currentSummit.id) return(<div />);

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("presentation_votes_page.presentation_votes_page"), pathname: match.url }} />
                <div className="container">
                <h3> {T.translate("presentation_votes_page.presentation_vote_list")} ({totalPresentations})</h3>
                <div className={'row'}>
                    <div className={'col-md-12'}>
                        <div className={'row'}>
                            <div className={'col-md-2'}>
                                <DateTimePicker
                                    id="begin_presentation_attendee_vote_date"
                                    onChange={this.handleChangeFilters}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    timezone={currentSummit.time_zone_id}
                                    value={epochToMomentTimeZone(begin_presentation_attendee_vote_date, currentSummit.time_zone_id)}
                                />
                            </div>
                            <div className={'col-md-2'}>
                                <DateTimePicker
                                    id="end_presentation_attendee_vote_date"
                                    onChange={this.handleChangeFilters}
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    timezone={currentSummit.time_zone_id}
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
                                        placeholder={T.translate("presentation_votes_page.placeholders.search_presentations")}
                                        onSearch={this.handleSearch}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <div className='panel panel-default'>
                            <div className="panel-body">
                                <div className="form-check abc-checkbox checkbox-inline">
                                    <input type="checkbox" id="show_voters_col"
                                           onChange={this.handleShowVoterColClick} className="form-check-input" />
                                    <label className="form-check-label" htmlFor="show_voters_col">
                                        {T.translate("presentation_votes_page.show_voters_col")}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-default right-space" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                    </div>
                </div>

                {totalPresentations === 0 &&
                    <div>{T.translate("presentation_votes_page.no_presentations")}</div>
                }

                {totalPresentations > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={presentations}
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
        exportPresentationsVotes,
    }
)(SummitPresentationsVotesPage);