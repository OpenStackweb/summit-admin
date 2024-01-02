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
import {Modal, Pagination} from 'react-bootstrap';
import {FreeTextSearch, Dropdown, Table, UploadInput} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getPromocodes, getPromocodeMeta, deletePromocode, exportPromocodes, importPromoCodesCSV } from "../../actions/promocode-actions";
import { trim } from '../../utils/methods'

const fieldNames = [
    { columnKey: 'class_name', value: "type" },
    { columnKey: 'description', value: "description", title: true, render:(row) => {
        return row.description?.length > 50 ? 
        <span title={row.description}>
            {`${row.description.slice(0,50)}...`}
        </span>
            : row.description 
    }},
    { columnKey: 'tags', value: "tags" },
    { columnKey: 'owner_email', value: "owner_email" },
    { columnKey: 'email_sent', value: "emailed" },
    { columnKey: 'creator', value: "creator" }
]

class PromocodeListPage extends React.Component {

    constructor(props) {
        super(props);

        props.getPromocodeMeta();

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.isNotRedeemed = this.isNotRedeemed.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewPromocode = this.handleNewPromocode.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleImport = this.handleImport.bind(this);
        this.handleColumnsChange = this.handleColumnsChange.bind(this);
        this.handleDDLSortByLabel = this.handleDDLSortByLabel.bind(this);

        this.state = {
            showImportModal: false,
            importFile:null,
            selectedColumns: [],            
        }
    }

    componentDidMount() {
        const {currentSummit, term , currentPage , extraColumns, perPage , order , orderDir , type} = this.props;
        this.setState({
            ...this.state, 
            selectedColumns: extraColumns,
        });
        if(currentSummit) {
            this.props.getPromocodes(term , currentPage , perPage , order , orderDir , type, extraColumns);
        }
    }

    handleImport() {
        if (this.state.importFile) {
            this.props.importPromoCodesCSV(this.state.importFile);
        }
        this.setState({...this.state, showImportModal:false, importFile: null});
    }

    handleEdit(promocode_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/promocodes/${promocode_id}`);
    }

    handleExport(ev) {
        const {term, order, orderDir, type} = this.props;
        ev.preventDefault();

        this.props.exportPromocodes(term, order, orderDir, type);
    }

    handleDelete(promocodeId) {
        const {deletePromocode, promocodes} = this.props;
        let promocode = promocodes.find(p => p.id === promocodeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("promocode_list.remove_promocode_warning") + ' ' + promocode.owner,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deletePromocode(promocodeId);
            }
        });
    }

    isNotRedeemed(promocodeId) {

        const {promocodes} = this.props;
        let promocode = promocodes.find(a => a.id === promocodeId);

        return (promocode.redeemed === 'No');
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage, type} = this.props;
        const {selectedColumns} = this.state;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type, selectedColumns);
    }

    handleTypeChange(type) {
        const {term, order, orderDir, perPage, page} = this.props;
        const {selectedColumns} = this.state;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type.target.value, selectedColumns);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage, type} = this.props;
        key = (key === 'name') ? 'last_name' : key;
        const {selectedColumns} = this.state;
        this.props.getPromocodes(term, page, perPage, key, dir, type, selectedColumns);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage, type} = this.props;
        const {selectedColumns} = this.state;
        this.props.getPromocodes(term, page, perPage, order, orderDir, type, selectedColumns);
    }

    handleNewPromocode(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/promocodes/new`);
    }

    handleColumnsChange(ev) {
        const {value} = ev.target;                
        this.setState({...this.state, selectedColumns: value})
    }

    handleDDLSortByLabel(ddlArray) {
        return ddlArray.sort((a, b) => a.label.localeCompare(b.label));
    }

    render(){
        const {currentSummit, promocodes, lastPage, currentPage, term, order, orderDir, totalPromocodes, allTypes, allClasses, type} = this.props;
        const {showImportModal} = this.state;

        let columns = [
            { columnKey: 'id', value: T.translate("promocode_list.id"), sortable: true },
            { columnKey: 'code', value: T.translate("promocode_list.code"), sortable: true },
            { columnKey: 'redeemed', value: T.translate("promocode_list.redeemed") }
        ];

        const ddl_columns = [            
            { value: 'class_name', label: T.translate("promocode_list.type") },
            { value: 'description', label: T.translate("promocode_list.description") },
            { value: 'owner_email', label: T.translate("promocode_list.owner_email") },
            { value: 'tags', label: T.translate("promocode_list.tags") },
            { value: 'email_sent', label: T.translate("promocode_list.emailed") },
            { value: 'creator', label: T.translate("promocode_list.creator") }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete, display: this.isNotRedeemed }
            }
        }

        let showColumns = fieldNames
        .filter(f => this.state.selectedColumns.includes(f.columnKey) )
        .map( f2 => {
            let c = {
                columnKey: f2.columnKey,
                value: T.translate(`promocode_list.${f2.value}`),
                sortable: f2.sortable,
            }
            // optional fields
            if(f2.hasOwnProperty('title'))
                c = {...c, title: f2.title}

            if(f2.hasOwnProperty('render'))
                c = {...c, render: f2.render}

            return c;
        });

        columns = [...columns, ...showColumns];

        if(!currentSummit.id) return(<div />);

        let promocode_types_ddl = allTypes.map(t => ({label: t, value: t}));

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
                    <div className="col-md-6 text-right">
                            <Dropdown
                                id="promo_code_type"
                                className="right-space"
                                value={type}
                                placeholder={T.translate("promocode_list.placeholders.select_type")}
                                options={promocode_types_ddl}
                                onChange={this.handleTypeChange}
                            />
                    </div>
                </div>

                <div className={'row'}>
                    <div className={'col-md-6'}>
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewPromocode}>
                            {T.translate("promocode_list.add_promocode")}
                        </button>
                        <button className="btn btn-default right-space" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                        <button className="btn btn-default" onClick={() => this.setState({showImportModal:true})}>
                            {T.translate("promocode_list.import")}
                        </button>
                    </div>
                </div>

                <hr/>

                <div className={'row'} style={{marginBottom: 15}}>
                    <div className={'col-md-12'}>
                        <label>{T.translate("event_list.select_fields")}</label>
                        <Dropdown
                            id="select_fields"
                            placeholder={T.translate("event_list.placeholders.select_fields")}
                            value={this.state.selectedColumns}
                            onChange={this.handleColumnsChange}
                            options={this.handleDDLSortByLabel(ddl_columns)}
                            isClearable={true}
                            isMulti={true}
                        />
                    </div>
                </div>

                {promocodes.length === 0 &&
                <div>{T.translate("promocode_list.no_promocodes")}</div>
                }

                {promocodes.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={promocodes.map(p => {return {...p, owner_email: <abbr title={p.owner_email}>{trim(p.owner_email, 40)}</abbr>}})}
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
                <Modal show={showImportModal} onHide={() => this.setState({showImportModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("promocode_list.import_promocodes")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                Format must be the following:<br />
                                <ul>
                                    <li><b>code:</b> text</li>
                                    <li><b>class_name:</b> text</li>
                                    <li><b>quantity_available:</b> int</li>
                                    <li><b>badge_features:</b> list of badge feature ids pipe delimited (optional)</li>
                                    <li><b>allowed_tickets_types:</b> list of allowed ticket type ids pipe delimited (optional)</li>
                                    <li><b>speaker_ids:</b> list of badge speaker ids pipe delimited (optional)</li>
                                </ul>
                            </div>
                            <div className="col-md-12 ticket-import-upload-wrapper">
                                <UploadInput
                                    value={this.state.importFile && this.state.importFile.name}
                                    handleUpload={(file) => this.setState({importFile: file})}
                                    handleRemove={() => this.setState({importFile: null})}
                                    className="dropzone col-md-6"
                                    multiple={false}
                                    accept=".csv"
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button disabled={!this.state.importFile} className="btn btn-primary" onClick={this.handleImport}>
                            {T.translate("promocode_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPromocodeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentPromocodeListState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPromocodes,
        getPromocodeMeta,
        deletePromocode,
        exportPromocodes,
        importPromoCodesCSV,
    }
)(PromocodeListPage);
