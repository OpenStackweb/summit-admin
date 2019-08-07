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
import Swal from "sweetalert2";
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getSpeakers, deleteSpeaker } from "../../actions/speaker-actions";


class SummitSpeakerListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewSpeaker = this.handleNewSpeaker.bind(this);

        this.state = {}
    }

    componentWillMount () {
        this.props.getSpeakers();
    }

    handleEdit(speaker_id) {
        let {history} = this.props;
        history.push(`/app/speakers/${speaker_id}`);
    }

    handleDelete(speakerId) {
        let {deleteSpeaker, speakers} = this.props;
        let speaker = speakers.find(s => s.id == speakerId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("speaker_list.delete_speaker_warning") + ' ' + speaker.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSpeaker(speakerId);
            }
        });
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

    handleNewSpeaker(ev) {
        let {history} = this.props;
        history.push(`/app/speakers/new`);
    }

    render(){
        let {speakers, lastPage, currentPage, term, order, orderDir, totalSpeakers } = this.props;

        let columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'email', value: T.translate("general.email"), sortable: true },
            { columnKey: 'member_id', value: T.translate("speaker_list.member_id") }
        ];

        let table_options = {
            sortCol: (order == 'last_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: {onClick: this.handleDelete}
            }
        }

        return(
            <div className="container">
                <h3> {T.translate("speaker_list.speaker_list")} ({totalSpeakers}) </h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("general.placeholders.search_speakers")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary" onClick={this.handleNewSpeaker}>
                            {T.translate("speaker_list.add_speaker")}
                        </button>
                    </div>
                </div>

                {speakers.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={speakers}
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
        )
    }
}

const mapStateToProps = ({ currentSpeakerListState }) => ({
    ...currentSpeakerListState
})

export default connect (
    mapStateToProps,
    {
        getSpeakers,
        deleteSpeaker
    }
)(SummitSpeakerListPage);
