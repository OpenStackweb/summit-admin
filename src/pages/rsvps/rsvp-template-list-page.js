/**
 * Copyright 2018 OpenStack Foundation
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
import swal from "sweetalert2";
import { Pagination } from 'react-bootstrap';
import FreeTextSearch from "../../components/free-text-search/index";
import Table from "../../components/table/Table";
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpTemplates, deleteRsvpTemplate } from "../../actions/rsvp-template-actions";

class RsvpTemplateListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewRsvpTemplate = this.handleNewRsvpTemplate.bind(this);

        this.state = {}

    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null || currentSummit.id != summitId){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount() {
        let {currentSummit, allTypes} = this.props;
        if(currentSummit !== null) {
            this.props.getRsvpTemplates();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getRsvpTemplates();
        }
    }

    handleEdit(rsvpTemplateId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}`);
    }

    handleDelete(rsvpTemplateId, ev) {
        let {deleteRsvpTemplate, rsvpTemplates} = this.props;
        let rsvpTemplate = rsvpTemplates.find(r => r.id == rsvpTemplateId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("rsvp_template_list.remove_warning") + ' ' + rsvpTemplate.owner,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(){
            deleteRsvpTemplate(rsvpTemplateId);
        }).catch(swal.noop);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getRsvpTemplates(term, page, perPage, order, orderDir, type);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getRsvpTemplates(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getRsvpTemplates(term, page, perPage, order, orderDir);
    }

    handleNewRsvpTemplate(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/new`);
    }

    render(){
        let {currentSummit, rsvpTemplates, lastPage, currentPage, term, order, orderDir, totalRsvpTemplates} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'title', value: T.translate("rsvp_template_list.title") }
        ];

        let table_options = {
            className: "dataTable",
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(currentSummit == null) return null;

        return(
            <div className="container">
                <h3> {T.translate("rsvp_template_list.rsvp_template_list")} ({totalRsvpTemplates})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("rsvp_template_list.placeholders.search_rsvp_templates")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewRsvpTemplate}>
                            {T.translate("rsvp_template_list.add_rsvp_template")}
                        </button>
                    </div>
                </div>

                {rsvpTemplates.length == 0 &&
                <div>{T.translate("rsvp_template_list.no_items")}</div>
                }

                {rsvpTemplates.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={rsvpTemplates}
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

const mapStateToProps = ({ currentSummitState, currentRsvpTemplateListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentRsvpTemplateListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRsvpTemplates,
        deleteRsvpTemplate
    }
)(RsvpTemplateListPage);