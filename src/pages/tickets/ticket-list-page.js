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
import { FreeTextSearch, UploadInput, SelectableTable} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import {
    getTickets,
    ingestExternalTickets,
    importTicketsCSV,
    exportTicketsCSV,
    selectTicket,
    unSelectTicket,
    clearAllSelectedTicket,
    setSelectedAll,
    printTickets,
} from "../../actions/ticket-actions";

import {Modal, Pagination} from "react-bootstrap";
import {Breadcrumb} from "react-breadcrumbs";

import '../../styles/ticket-list-page.less';
import {SegmentedControl} from "segmented-control";
import Select from "react-select";
import Swal from "sweetalert2";
const BatchSize = 25;

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
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleSetHasOwnerFilter = this.handleSetHasOwnerFilter.bind(this);
        this.handleSetTicketTypesFilter = this.handleSetTicketTypesFilter.bind(this);
        this.handleSetCompletedFilter = this.handleSetCompletedFilter.bind(this);
        this.handleSetOwnerFullNameStartWithFilter = this.handleSetOwnerFullNameStartWithFilter.bind(this);
        this.handleSendTickets2Print = this.handleSendTickets2Print.bind(this);
        this.handleSetHasBadgeFilter = this.handleSetHasBadgeFilter.bind(this);
        this.handleDoPrinting = this.handleDoPrinting.bind(this);
        this.handleChangeShowOnlyPrintable = this.handleChangeShowOnlyPrintable.bind(this);
        this.state = {
            showIngestModal: false,
            showImportModal: false,
            importFile: null,
            showPrintModal: false,
            doCheckIn: false,
        }
    }

    handleSelected(attendee_id, isSelected){
        if(isSelected){
            this.props.selectTicket(attendee_id);
            return;
        }
        this.props.unSelectTicket(attendee_id);
    }

    handleSelectedAll(ev){
        let selectedAll = ev.target.checked;
        this.props.setSelectedAll(selectedAll);
        if(!selectedAll){
            //clear all selected
            this.props.clearAllSelectedTicket();
        }
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            const {term, order, orderDir, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
            this.props.getTickets(1, 10, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
        }
    }

    handleChangeShowRefundRequestPending(ev){
        const {order, orderDir, page, perPage, term, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        let value = ev.target.checked;
        this.props.getTickets(page, perPage, order, orderDir, {showOnlyPendingRefundRequests : value, hasOwnerFilter, ticketTypesFilter, term , completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleChangeShowOnlyPrintable(ev){
        const {order, orderDir, page, perPage, term, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPendingRefundRequests} = this.props;
        let value = ev.target.checked;
        this.props.getTickets(page, perPage, order, orderDir, {showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, term , completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable: value});
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(page, perPage, order, orderDir, { term , showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleEdit(ticket_id) {
        const {currentSummit, history, tickets} = this.props;
        let ticket = tickets.find(t => t.id === ticket_id);
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${ticket.order_id}/tickets/${ticket_id}`);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(page, perPage, key, dir, { term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(page, perPage, order, orderDir, { term , showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
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

    handleSetHasOwnerFilter(newHasOwnerFilter){
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(1, perPage, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter: newHasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleSetTicketTypesFilter(newTicketTypesFilter){
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(1, perPage, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter : newTicketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleSetCompletedFilter(newCompletedFilter){
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(1, perPage, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter:newCompletedFilter, ownerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleSetOwnerFullNameStartWithFilter(newOwnerFullNameStartWithFilter){
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, completedFilter, ticketTypesFilter, hasBadgeFilter, showOnlyPrintable} = this.props;
        this.props.getTickets(1, perPage, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter: newOwnerFullNameStartWithFilter, hasBadgeFilter, showOnlyPrintable});
    }

    handleSetHasBadgeFilter(newHasBadgeFilter){
        const {term, order, orderDir, perPage, showOnlyPendingRefundRequests, hasOwnerFilter, completedFilter, ticketTypesFilter, ownerFullNameStartWithFilter , showOnlyPrintable} = this.props;
        this.props.getTickets(1, perPage, order, orderDir,{ term, showOnlyPendingRefundRequests, hasOwnerFilter, ticketTypesFilter, completedFilter, ownerFullNameStartWithFilter, hasBadgeFilter: newHasBadgeFilter, showOnlyPrintable});
    }

    handleSendTickets2Print(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedIds,
            selectedAll,
        } = this.props;

        if(!selectedAll && selectedIds.length === 0){
            Swal.fire("Validation error", T.translate("ticket_list.select_items"), "warning");
            return false;
        }
        if(!selectedAll && selectedIds.length > BatchSize){
            Swal.fire("Validation error", `You can not select more than ${BatchSize} Tickets To print.`, "warning");
            return false;
        }

        this.setState({...this.state, showPrintModal: true});
    }

    handleDoPrinting(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedIds,
            selectedAll,
            term,
            showOnlyPendingRefundRequests,
            hasOwnerFilter,
            ticketTypesFilter,
            completedFilter,
            ownerFullNameStartWithFilter,
            hasBadgeFilter,
            order,
            orderDir,
            showOnlyPrintable,
        } = this.props;

        this.props.printTickets({
            selectedIds,
            selectedAll,
            term,
            showOnlyPendingRefundRequests,
            hasOwnerFilter,
            ticketTypesFilter,
            completedFilter,
            ownerFullNameStartWithFilter,
            hasBadgeFilter,
            showOnlyPrintable,
        }, order, orderDir, this.state.doCheckIn);

    }

    render(){
        const {
            currentSummit,
            tickets,
            term,
            order,
            orderDir,
            totalTickets,
            lastPage,
            currentPage,
            match,
            showOnlyPendingRefundRequests,
            selectedIds,
            selectedAll,
            hasOwnerFilter,
            ticketTypesFilter,
            completedFilter,
            ownerFullNameStartWithFilter,
            hasBadgeFilter,
            showOnlyPrintable,
        } = this.props;

        const {showIngestModal, showImportModal, importFile, showPrintModal} = this.state;

        const columns = [
            { columnKey: 'number', value: T.translate("ticket_list.number"), sortable: true, render: (item, val) => {
                const hasRequested =  item.refund_requests.some((r) => r.status === 'Requested');
                return `${val}` + (hasRequested ? '&nbsp;<span class="label label-danger">Refund Requested</span>' :'')
            } },
            { columnKey: 'ticket_type', value: T.translate("ticket_list.ticket_type") },
            { columnKey: 'bought_date', value: T.translate("ticket_list.bought_date") },
            { columnKey: 'owner_name', value: T.translate("ticket_list.owner_name"), sortable: true },
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
                edit: {
                    onClick: this.handleEdit ,
                    onSelected: this.handleSelected,
                    onSelectedAll: this.handleSelectedAll,
                },
            },
            selectedIds: selectedIds,
            selectedAll: selectedAll,
        }

        if(!currentSummit.id) return (<div />);

        let ticketTypesOptions = [
            ...currentSummit.ticket_types.map(t => ({label: t.name, value: t.id}))
        ];

        const alpha = Array.from(Array(26)).map((e, i) => i + 65);
        const alphabet = alpha.map((x) => ({ label : String.fromCharCode(x), value : String.fromCharCode(x)}));

        return(
            <div className="ticket-list-wrapper">
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
                            <button className="btn btn-primary right-space" onClick={this.handleSendTickets2Print}>
                                {T.translate("ticket_list.print")}
                            </button>
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
                    <div className="row">
                        <div className="col-md-6">
                            <SegmentedControl
                                name="hasOwnerFilter"
                                options={[
                                    { label: T.translate("ticket_list.all"), value: null, default: hasOwnerFilter === null},
                                    { label: T.translate("ticket_list.has_owner"), value: "HAS_OWNER",default: hasOwnerFilter === "HAS_OWNER" },
                                    { label: T.translate("ticket_list.has_no_owner"), value: "HAS_NO_OWNER",default: hasOwnerFilter === "HAS_NO_OWNER" },
                                ]}
                                setValue={newValue => this.handleSetHasOwnerFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        <div className="col-md-6">
                            <SegmentedControl
                                name="completedFilter"
                                options={[
                                    { label: T.translate("ticket_list.all"), value: null, default: completedFilter === null},
                                    { label: T.translate("ticket_list.complete"), value: "Complete",default: completedFilter === "Complete" },
                                    { label: T.translate("ticket_list.incomplete"), value: "Incomplete",default: completedFilter === "Incomplete" },
                                ]}
                                setValue={newValue => this.handleSetCompletedFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <SegmentedControl
                                name="hasBadgeFilter"
                                options={[
                                    { label: T.translate("ticket_list.all"), value: null, default: hasBadgeFilter === null},
                                    { label: T.translate("ticket_list.has_badge"), value: "HAS_BADGE",default: hasBadgeFilter === "HAS_BADGE" },
                                    { label: T.translate("ticket_list.has_no_badge"), value: "HAS_NO_BADGE",default: hasBadgeFilter === "HAS_NO_BADGE" },
                                ]}
                                setValue={newValue => this.handleSetHasBadgeFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        <div className="col-md-6">
                            <Select
                                placeholder={T.translate('ticket_list.placeholders.ticket_types')}
                                name="ticketTypesFilter"
                                value={ticketTypesFilter}
                                onChange={this.handleSetTicketTypesFilter}
                                options={ticketTypesOptions}
                                isClearable={true}
                                isMulti
                                className="ticket-types-filter"
                            />
                        </div>
                    </div>
                    <div className={'row'}>
                        <div className={'col-md-12'}>
                            <Select
                                placeholder={T.translate("ticket_list.placeholders.owner_first_name")}
                                name="ownerFullNameStartWithFilter"
                                value={ownerFullNameStartWithFilter}
                                onChange={this.handleSetOwnerFullNameStartWithFilter}
                                options={alphabet}
                                isClearable={true}
                                isMulti
                                className="ticket-types-filter"
                            />
                        </div>
                    </div>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="show_refund_request_pending" checked={showOnlyPendingRefundRequests}
                                       onChange={this.handleChangeShowRefundRequestPending} className="form-check-input" />
                                <label className="form-check-label" htmlFor="show_refund_request_pending">
                                    {T.translate("ticket_list.show_refund_request_pending")}
                                </label>
                            </div>
                        </div>
                        <div className={'col-md-6'}>
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="show_printable" checked={showOnlyPrintable}
                                       onChange={this.handleChangeShowOnlyPrintable} className="form-check-input" />
                                <label className="form-check-label" htmlFor="show_printable">
                                    {T.translate("ticket_list.show_printable")}
                                </label>
                            </div>
                        </div>
                    </div>

                    {tickets.length === 0 &&
                        <div>{T.translate("ticket_list.no_tickets")}</div>
                    }

                    {tickets.length > 0 &&
                        <div>
                            { selectedIds.length > 0 &&
                                <span><b>{T.translate("ticket_list.items_qty", {qty:selectedIds.length})}</b></span>
                            }
                            { selectedAll &&
                                <span><b>{T.translate("ticket_list.items_qty", {qty:totalTickets})}</b></span>
                            }
                            <SelectableTable
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
                <Modal show={showIngestModal} onHide={() => this.setState({...this.state, showIngestModal:false})} >
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

                <Modal show={showImportModal} onHide={() => this.setState({...this.state, showImportModal:false})} >
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

                <Modal show={showPrintModal} onHide={() => this.setState({...this.state, showPrintModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("ticket_list.print_modal_title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                {T.translate("ticket_list.print_modal_body")}
                            </div>
                            <br />
                            <br />
                            <br />
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="check_in"
                                       onChange={(ev) => {
                                           this.setState({...this.state, doCheckIn : ev.target.checked})
                                       }} className="form-check-input" />
                                <label className="form-check-label" htmlFor="check_in">
                                    {T.translate("ticket_list.check_in")}
                                </label>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleDoPrinting}>
                            {T.translate("ticket_list.print")}
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
        selectTicket,
        unSelectTicket,
        clearAllSelectedTicket,
        setSelectedAll,
        printTickets,
    }
)(TicketListPage);
