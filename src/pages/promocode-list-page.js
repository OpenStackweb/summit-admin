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
import Dropdown from '../components/dropdown';
import Table from "../components/table/Table";
import { getSummitById }  from '../actions/summit-actions';
import { getPromocodes } from "../actions/promocode-actions";

class PromocodeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.isRedeemed = this.isRedeemed.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewPromocode = this.handleNewPromocode.bind(this);
        this.handleExport = this.handleExport.bind(this);

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
            this.props.getPromocodes();
        }
    }

    handleEdit(promocode_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/promocodes/${promocode_id}`);
    }

    handleExport(promocode_id, ev) {
        ev.preventDefault();

        //export
    }

    handleDelete(promocode_id, ev) {
        ev.preventDefault();

        //delete
    }

    isRedeemed(promocode_id) {

        let {promocodes} = this.props;
        let promocode = promocodes.find(a => a.id == promocode_id);

        return promocode.redeemed;
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage, type} = this.props;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type);
    }

    handleTypeChange(type) {
        let {term, order, orderDir, perPage, page} = this.props;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage, type} = this.props;
        key = (key == 'name') ? 'last_name' : key;
        this.props.getPromocodes(term, page, perPage, key, dir, type);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage, type} = this.props;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type);
    }

    handleNewPromocode(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/promocodes/new`);
    }

    render(){
        let {currentSummit, promocodes, lastPage, currentPage, term, order, orderDir, totalPromocodes} = this.props;
        let {showModal, modalSchedule, modalTitle} = this.state;

        let columns = [
            { columnKey: 'code', value: T.translate("promocode_list.code") },
            { columnKey: 'type', value: T.translate("general.type"), sortable: true },
            { columnKey: 'owner', value: T.translate("general.owner") },
            { columnKey: 'owner_email', value: T.translate("promocode_list.owner_email") },
            { columnKey: 'emailed', value: T.translate("promocode_list.emailed") },
            { columnKey: 'redeemed', value: T.translate("promocode_list.redeemed") },
            { columnKey: 'source', value: T.translate("promocode_list.source") },
        ];

        let table_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            sortCol: 'code',
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete, display: this.isRedeemed }
            }
        }

        if(currentSummit == null) return null;

        let promocode_types_ddl = [
            {label: 'ALL', value: '1'},
            {label: 'ACCEPTED', value: '2'},
            {label: 'ALTERNATE', value: '3'},
            {label: 'VIP', value: '4'}
        ]

        return(
            <div className="container">
                <h3> {T.translate("promocode_list.promocode_list")} ({totalPromocodes})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("promocode_list.placeholders.search_promocodes")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-2">
                        <Dropdown
                            id="ticket_type"
                            placeholder={T.translate("promocode_list.placeholders.select_type")}
                            options={promocode_types_ddl}
                            onChange={this.handleTypeChange}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary" onClick={this.handleNewPromocode}>
                            {T.translate("promocode_list.add_promocode")}
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-default" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                    </div>
                </div>

                {promocodes.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={promocodes}
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

const mapStateToProps = ({ currentSummitState, currentPromocodeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentPromocodeListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPromocodes
    }
)(PromocodeListPage);