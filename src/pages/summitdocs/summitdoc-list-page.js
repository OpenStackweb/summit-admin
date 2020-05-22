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
import {FreeTextSearch, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getSummitDocs, deleteSummitDoc } from "../../actions/summitdoc-actions";

class SummitDocListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getSummitDocs();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id !== newProps.currentSummit.id) {
            this.props.getSummitDocs();
        }
    }

    handleEdit(summitdoc_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/summitdocs/${summitdoc_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getSummitDocs(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getSummitDocs(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getSummitDocs(term, page, perPage, order, orderDir);
    }

    handleNew(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/summitdocs/new`);
    }

    handleDelete(summitDocsId) {
        let {deleteSummitDoc, summitDocs} = this.props;
        let summitDoc = summitDocs.find(s => s.id == summitDocId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("summitdoc.delete_warning") + ' ' + summitDoc.label,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSummitDoc(summitDocsId);
            }
        });
    }

    render(){
        let {currentSummit, summitDocs, lastPage, currentPage, term, order, orderDir, totalSummitDocs} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'label', value: T.translate("summitdoc.label"), sortable: true },
            { columnKey: 'description', value: T.translate("summitdoc.description") },
            { columnKey: 'event_type', value: T.translate("summitdoc.event_types")},
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return(<div></div>);

        return(
            <div className="container">
                <h3> {T.translate("summitdoc.list")} ({totalSummitDocs})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("summitdoc.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-2 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNew}>
                            {T.translate("summitdoc.add")}
                        </button>
                    </div>
                </div>

                {summitDocs.length == 0 &&
                <div>{T.translate("summitdoc.no_items")}</div>
                }

                {summitDocs.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={summitDocs}
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

const mapStateToProps = ({ currentSummitState, summitDocListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...summitDocListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSummitDocs,
        deleteSummitDoc
    }
)(SummitDocListPage);
