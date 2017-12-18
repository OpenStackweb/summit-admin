/**
 * Copyright 2017 OpenStack Foundation
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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { Pagination } from 'react-bootstrap';
import FreeTextSearch from "../components/free-text-search/index";
import Table from "../components/table/Table";
import { getSummitById }  from '../actions/summit-actions';
import { getSpeakers} from "../actions/speaker-actions";

class SummitSpeakerListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {}
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }

    }

    componentDidMount () {
        let {currentSummit} = this.props;
        if(currentSummit != null) {
            this.props.getSpeakers();
        }
    }

    handleEdit(speaker_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/speakers/${speaker_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getSpeakers(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        key = (key == 'name') ? 'last_name' : key;
        this.props.getSpeakers(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getSpeakers(term, page, perPage, order, orderDir);
    }

    render(){
        let {currentSummit, speakers, lastPage, currentPage, term} = this.props;

        let columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'name', value: T.translate("titles.name"), sortable: true },
            { columnKey: 'email', value: T.translate("titles.email"), sortable: true },
            { columnKey: 'member_id', value: T.translate("titles.member_id") },
            { columnKey: 'on_site_phone', value: T.translate("titles.registration_code") },
            { columnKey: 'registration_code', value: T.translate("titles.on_site_phone") },
            { columnKey: 'presentation_count', value: T.translate("titles.presentations") }
        ];

        let table_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            actions: {
                edit: this.handleEdit
            }
        }

        if(currentSummit == null) return null;

        return(
            <div className="container">
                <h3> {T.translate("titles.speaker_list")} </h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch value={term} onSearch={this.handleSearch} />
                    </div>
                </div>

                {this.props.speakers.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={speakers}
                        columns={columns}
                        onSort={this.handleSort}
                        className="dataTable"
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
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSpeakerState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentSpeakerState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSpeakers
    }
)(SummitSpeakerListPage);