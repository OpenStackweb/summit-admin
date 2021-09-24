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
import { FreeTextSearch, Table, UploadInput} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getTickets, ingestExternalTickets, importTicketsCSV, exportTicketsCSV } from "../../actions/ticket-actions";
import {Modal, Pagination} from "react-bootstrap";
import {Breadcrumb} from "react-breadcrumbs";

import '../../styles/ticket-list-page.less';

class TicketListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleIngestTickets = this.handleIngestTickets.bind(this);
        this.handleImportTickets = this.handleImportTickets.bind(this);
        this.handleExportTickets = this.handleExportTickets.bind(this);
        this.handleChangeShowRefundRequestPending = this.handleChangeShowRefundRequestPending.bind(this);
        this.state = {
            showIngestModal: false,
            showImportModal: false,
            importFile: null
        }

    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getTickets('', 1, 10);
        }
    }

    handleChangeShowRefundRequestPending(ev){
        const {order, orderDir, page, perPage, term} = this.props;
        let value = ev.target.checked;
        this.props.getTickets(term, page, perPage, order, orderDir, value);

    }

    handleSearch(term) {
        const {order, orderDir, page, perPage, showOnlyPendingRefundRequests} = this.props;
        this.props.getTickets(term, page, perPage, order, orderDir, showOnlyPendingRefundRequests);
    }

    handleEdit(ticket_id) {
        const {currentSummit, history, tickets} = this.props;
        let ticket = tickets.find(t => t.id === ticket_id);
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${ticket.order_id}/tickets/${ticket_id}`);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getTickets(term, page, perPage, key, dir);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests} = this.props;
        this.props.getTickets(term, page, perPage, order, orderDir, showOnlyPendingRefundRequests);
    }

    handleIngestTickets() {
        let email = this.ingestEmailRef.value;
        this.setState({showIngestModal: false});
        this.props.ingestExternalTickets(email);
    }

    handleImportTickets() {
        this.setState({showImportModal: false});
        let formData = new FormData();
        if (this.state.importFile) {
            formData.append('file', this.state.importFile);
            this.props.importTicketsCSV(formData);
        }
    }

    handleExportTickets() {
        this.props.exportTicketsCSV();
    }

    render(){
        const {currentSummit, tickets, term, order,
            orderDir, totalTickets, lastPage, currentPage, match, showOnlyPendingRefundRequests} = this.props;
        const {showIngestModal, showImportModal, importFile} = this.state;

        const columns = [
            { columnKey: 'number', value: T.translate("ticket_list.number"), sortable: true, render: (item, val) => {
                const hasRequested =  item.refund_requests.some((r) => r.status === 'Requested');
                return `${val}` + (hasRequested ? '&nbsp;<span class="label label-danger">Refund Requested</span>' :'')
            } },
            { columnKey: 'ticket_type', value: T.translate("ticket_list.ticket_type") },
            { columnKey: 'bought_date', value: T.translate("ticket_list.bought_date") },
            { columnKey: 'owner_name', value: T.translate("ticket_list.owner_name") },
            { columnKey: 'owner_email', value: T.translate("ticket_list.owner_email") },
            { columnKey: 'status', value: T.translate("ticket_list.status") },
            { columnKey: 'final_amount_formatted', value: T.translate("ticket_list.paid_amount") },
            { columnKey: 'refunded_amount_formatted', value: T.translate("ticket_list.refunded_amount") },
            { columnKey: 'final_amount_adjusted_formatted', value: T.translate("ticket_list.paid_amount_adjusted") },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("ticket_list.ticket_list"), pathname: match.url }} />
                <div className="container">
                    <h3> {T.translate("ticket_list.ticket_list")} ({totalTickets})</h3>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <FreeTextSearch
                                value={term}
                                placeholder={T.translate("ticket_list.placeholders.search_tickets")}
                                onSearch={this.handleSearch}
                            />

                        </div>
                        <div className="col-md-6 text-right">
                            <button className="btn btn-primary right-space" onClick={() => this.setState({showIngestModal:true})}>
                                {T.translate("ticket_list.ingest")}
                            </button>
                            <button className="btn btn-default right-space" onClick={() => this.setState({showImportModal:true})}>
                                {T.translate("ticket_list.import")}
                            </button>
                            <button className="btn btn-default" onClick={this.handleExportTickets}>
                                {T.translate("ticket_list.export")}
                            </button>
                        </div>
                    </div>
                    <div className={'row'}>
                        <div className={'col-md-12'}>
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="show_refund_request_pending" checked={showOnlyPendingRefundRequests}
                                       onChange={this.handleChangeShowRefundRequestPending} className="form-check-input" />
                                <label className="form-check-label" htmlFor="show_refund_request_pending">
                                    {T.translate("ticket_list.show_refund_request_pending")}
                                </label>
                            </div>
                        </div>
                    </div>

                    {tickets.length === 0 &&
                    <div>{T.translate("ticket_list.no_tickets")}</div>
                    }

                    {tickets.length > 0 &&
                        <div>
                            <Table
                                options={table_options}
                                data={tickets}
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

                <Modal show={showIngestModal} onHide={() => this.setState({showIngestModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("ticket_list.ingest_tickets")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                This will trigger the external registration data ingestion from defined feed on Summit
                                Badge data will not be overwritten unless a promo code is applied
                            </div>
                            <br />
                            <br />
                            <br />
                            <div className="col-md-12 ticket-ingest-email-wrapper">
                                <label>{T.translate("ticket_list.send_email")}</label><br/>
                                <input
                                    id="ingest_email"
                                    className="form-control"
                                    ref={node => this.ingestEmailRef = node}
                                />
                            </div>

                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleIngestTickets}>
                            {T.translate("ticket_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showImportModal} onHide={() => this.setState({showImportModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("ticket_list.import_tickets")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                Format must be the following:<br />
                                <b>id</b>: the id of the ticket<br />
                                <b>number</b>: the number of the ticket, only if id is not provided<br />
                                <b>badge_type_id</b>: the id of the badge type<br />
                                <b>badge_type_name</b>: the name of the badge type, only if id is not provided<br />
                                <b>badge_features</b>: a list of badge features names to add to the badge delimited by "|" (pipe)<br />
                            </div>
                            <div className="col-md-12 ticket-import-upload-wrapper">
                                <UploadInput
                                    value={importFile && importFile.name}
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
                        <button disabled={!this.state.importFile} className="btn btn-primary" onClick={this.handleImportTickets}>
                            {T.translate("ticket_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTicketListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentTicketListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTickets,
        ingestExternalTickets,
        importTicketsCSV,
        exportTicketsCSV,
    }
)(TicketListPage);
