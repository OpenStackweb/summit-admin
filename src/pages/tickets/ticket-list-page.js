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
import {
    FreeTextSearch,
    UploadInput,
    SelectableTable,
    Dropdown,
    PromocodeInput,
    TagInput
} from 'openstack-uicore-foundation/lib/components';
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
    getTicket,
} from "../../actions/ticket-actions";
import {Modal, Pagination} from "react-bootstrap";
import {Breadcrumb} from "react-breadcrumbs";
import {SegmentedControl} from "segmented-control";
import Select from "react-select";
import Swal from "sweetalert2";
import QrReaderInput from "../../components/inputs/qr-reader-input";
import '../../styles/ticket-list-page.less';
import OrAndFilter from '../../components/filters/or-and-filter';
import { ALL_FILTER } from '../../utils/constants';

const BatchSize = 25;

const fieldNames = [    
    { columnKey: 'number', value: 'number', sortable: true, render: (item, val) => {
        const hasRequested =  item.refund_requests.some((r) => r.status === 'Requested');
        return `${val}` + (hasRequested ? '&nbsp;<span class="label label-danger">Refund Requested</span>' :'')
    } },
    { columnKey: 'promocode', value: 'promocode' },
    { columnKey: 'bought_date', value: 'bought_date'},
    { columnKey: 'owner_email', value: 'owner_email'},
    { columnKey: 'status', value: 'status'},
    { columnKey: 'refunded_amount_formatted', value: 'refunded_amount'},
    { columnKey: 'final_amount_adjusted_formatted', value: 'paid_amount_adjusted'},
    { columnKey: 'promo_code_tags', value: 'promo_code_tags'},    
]

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
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleSendTickets2Print = this.handleSendTickets2Print.bind(this);
        this.handleDoPrinting = this.handleDoPrinting.bind(this);
        this.handleScanQR = this.handleScanQR.bind(this);
        this.handleColumnsChange = this.handleColumnsChange.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleDDLSortByLabel = this.handleDDLSortByLabel.bind(this);

        this.state = {
            showIngestModal: false,
            showImportModal: false,
            importFile: null,
            showPrintModal: false,
            doCheckIn: false,
            selectedViewType: null,
            selectedColumns: [],
            enabledFilters: [],
            ticketFilters: {
                showOnlyPendingRefundRequests: false,
                ticketTypesFilter : [],
                ownerFullNameStartWithFilter:[],
                viewTypesFilter: [],
                hasOwnerFilter : null,
                completedFilter : null,
                amountFilter: null,
                hasBadgeFilter : null,
                showOnlyPrintable: false,
                promocodesFilter: [],
                promocodeTagsFilter:[],
                orAndFilter: ALL_FILTER,
            }
        }
    }

    componentDidMount() {
        if (this.props.currentSummit) {
            const {ticketFilters} = this.state;
            const { term, order, orderDir, filters, extraColumns } = this.props;
            const  enabledFilters = Object.keys(filters).filter(e => filters[e]?.length > 0);
            this.setState({
                ...this.state, 
                selectedColumns: extraColumns,
                enabledFilters: enabledFilters,
                ticketFilters: {...ticketFilters, ...filters}
            });
            this.props.getTickets(term, 1, 10, order, orderDir, filters, extraColumns);
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

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        const {selectedColumns, ticketFilters} = this.state;
        this.props.getTickets(term, page, perPage, order, orderDir, ticketFilters, selectedColumns);
    }

    handleEdit(ticket_id) {
        const {currentSummit, history, tickets} = this.props;
        let ticket = tickets.find(t => t.id === ticket_id);
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${ticket.order_id}/tickets/${ticket_id}`);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        const {selectedColumns, ticketFilters} = this.state;
        this.props.getTickets(term, page, perPage, key, dir, ticketFilters, selectedColumns);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        const {selectedColumns, ticketFilters} = this.state;
        this.props.getTickets(term, page, perPage, order, orderDir, ticketFilters, selectedColumns);
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
        const {term, order, orderDir} = this.props;
        const {selectedColumns, ticketFilters} = this.state;

        this.props.exportTicketsCSV(term, 500, order, orderDir, ticketFilters, selectedColumns);
    }

    handleFilterChange(key, value) {
        const {term, order, orderDir, perPage} = this.props;        
        const {selectedColumns} = this.state;
        this.setState({...this.state, ticketFilters: {...this.state.ticketFilters, [key]: value }}, () => {
            this.props.getTickets(term, 1, perPage, order, orderDir, this.state.ticketFilters, selectedColumns);
        });
    }

    handleSendTickets2Print(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedIds,
            selectedAll,
        } = this.props;

        if(this.state.selectedViewType == null){
            Swal.fire("Validation error", T.translate("ticket_list.select_view_2_print"), "warning");
            return false;
        }

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
        const {ticketFilters, doCheckIn, selectedViewType} = this.state;
        this.props.printTickets(ticketFilters, doCheckIn, selectedViewType);
    }

    handleScanQR(qrCode){
        const {currentSummit, history} = this.props;
        this.props.getTicket(btoa(qrCode)).then(
            (data) => {
                history.push(`/app/summits/${currentSummit.id}/purchase-orders/${data.order_id}/tickets/${data.id}`);
            }
        );
    }

    handleColumnsChange(ev) {
        const {value} = ev.target;
        this.setState({...this.state, selectedColumns: value})
    }

    handleFiltersChange(ev) {
        const {value} = ev.target;
        const {term, perPage, order, orderDir} = this.props;
        if(value.length < this.state.enabledFilters.length) {
            if(value.length === 0) {
                const resetFilters = {
                    showOnlyPendingRefundRequests: false,
                    ticketTypesFilter : [],
                    ownerFullNameStartWithFilter:[],
                    viewTypesFilter: [],
                    hasOwnerFilter : null,
                    completedFilter : null,
                    amountFilter: null,
                    hasBadgeFilter : null,
                    showOnlyPrintable: false,
                    promocodesFilter: [],
                    promocodeTagsFilter: [],
                    orAndFilter: this.state.ticketFilters.orAndFilter
                };
                this.setState({...this.state, enabledFilters: value, ticketFilters: resetFilters}, () => {
                    this.props.getTickets(term, 1, perPage, order, orderDir, this.state.ticketFilters, this.state.selectedColumns);
                });
            } else {
                const removedFilter = this.state.enabledFilters.filter(e => !value.includes(e))[0];            
                const defaultValue = removedFilter === 'published_filter' ? null : Array.isArray(this.state.ticketFilters[removedFilter]) ? [] : '';
                let newEventFilters = {...this.state.ticketFilters, [removedFilter]: defaultValue};
                this.setState({...this.state, enabledFilters: value, ticketFilters: newEventFilters}, () => {
                    this.props.getTickets(term, 1, perPage, order, orderDir, this.state.ticketFilters, this.state.selectedColumns);
                });
            }
        } else {
            this.setState({...this.state, enabledFilters: value})
        }
    }

    handleDDLSortByLabel(ddlArray) {
        return ddlArray.sort((a, b) => a.label.localeCompare(b.label));
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
            selectedCount,
            selectedAll,
        } = this.props;                

        const {doCheckIn, showIngestModal, showImportModal, importFile, showPrintModal, selectedViewType, enabledFilters, ticketFilters} = this.state;

        let columns = [
            { columnKey: 'id', value: T.translate("ticket_list.id") },
            { columnKey: 'ticket_type', value: T.translate("ticket_list.ticket_type") },
            { columnKey: 'owner_name', value: T.translate("ticket_list.owner_name"), sortable: true },
            { columnKey: 'final_amount_formatted', value: T.translate("ticket_list.paid_amount") },
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
            selectedAll: selectedAll,
        }

        if(!currentSummit.id) return (<div />);

        let ticketTypesOptions = [
            ...currentSummit.ticket_types.map(t => ({label: t.name, value: t.id}))
        ];

        const alpha = Array.from(Array(26)).map((e, i) => i + 65);
        const alphabet = alpha.map((x) => ({ label : String.fromCharCode(x), value : String.fromCharCode(x)}));

        // adds 'All' option to the print type dropdown
        const badge_view_type_ddl = [
            { label: 'All', value: 0 },
            ...currentSummit.badge_view_types.map(vt => ({ label: vt.name, value: vt.id }))
        ];

        const viewTypesOptions = [
            ...currentSummit.badge_view_types.map(vt => ({label: vt.name, value: vt.id}))
        ];

        const ddl_columns = [
            { value: 'number', label: T.translate("ticket_list.number") },
            { value: 'promocode', label: T.translate("ticket_list.promo_code") },
            { value: 'bought_date', label: T.translate("ticket_list.bought_date") },
            { value: 'owner_email', label: T.translate("ticket_list.owner_email") },
            { value: 'status', label: T.translate("ticket_list.status") },
            { value: 'refunded_amount_formatted', label: T.translate("ticket_list.refunded_amount") },
            { value: 'final_amount_adjusted_formatted', label: T.translate("ticket_list.paid_amount_adjusted") },
            { value: 'promo_code_tags', label: T.translate("ticket_list.promo_code_tags") },
        ];

        const filters_ddl = [
            {label: 'Has Assignee?', value: 'hasOwnerFilter'},
            {label: 'Completed', value: 'completedFilter'},
            {label: 'Badge', value: 'hasBadgeFilter'},
            {label: 'Amount', value: 'amountFilter'},
            {label: 'Assignee Name', value: 'ownerFullNameStartWithFilter'},
            {label: 'View Type', value: 'viewTypesFilter'},
            {label: 'Ticket Type', value: 'ticketTypesFilter'},
            {label: 'Promo Code', value: 'promocodesFilter'},
            {label: 'Promo Code Tags', value: 'promocodeTagsFilter'},
            {label: 'Refund Requested', value: 'show_refund_request_pending'},  
            {label: 'Printable', value: 'show_printable'},
        ]

        let showColumns = fieldNames
        .filter(f => this.state.selectedColumns.includes(f.columnKey) )
        .map( f2 => (
            {   columnKey: f2.columnKey,
                value: T.translate(`ticket_list.${f2.value}`),
                sortable: f2.sortable,
                render: f2.render ? f2.render : (item) => item[f2.columnKey]
            }));

        columns = [...columns, ...showColumns];

        return(
            <div className="ticket-list-wrapper">
                <Breadcrumb data={{ title: T.translate("ticket_list.ticket_list"), pathname: match.url }} />
                <div className="container">
                    <h3> {T.translate("ticket_list.ticket_list")} ({totalTickets})</h3>
                    <div className={'row'}>
                        <div className="col-md-6 search-section">
                            <FreeTextSearch
                                value={term}
                                placeholder={T.translate("ticket_list.placeholders.search_tickets")}
                                onSearch={this.handleSearch}
                            />
                            <QrReaderInput onScan={this.handleScanQR} />
                        </div>
                        <div className="col-md-6 text-right" style={{marginBottom: 20}}>
                            <div className="row">
                                <div className="col-md-8">
                                    <Dropdown
                                        id="view_type_id"
                                        placeholder={T.translate('ticket_list.placeholders.view_type')}
                                        value={selectedViewType}
                                        onChange={(ev) => this.setState({...this.state, selectedViewType: ev.target.value})}
                                        options={badge_view_type_ddl}
                                    />
                                </div>
                                <div className="col-md-4 text-right">
                                    <button className="btn btn-primary right-space" onClick={this.handleSendTickets2Print}>
                                        {T.translate("ticket_list.print")}
                                    </button>
                                </div>
                            </div>
                            <br/>
                            <div className="row">

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 buttons-wrapper">
                            <button className="btn btn-primary" onClick={() => this.setState({showIngestModal:true})}>
                                {T.translate("ticket_list.ingest")}
                            </button>
                            <button className="btn btn-default" onClick={() => this.setState({showImportModal:true})}>
                                {T.translate("ticket_list.import")}
                            </button>
                            <button className="btn btn-default" onClick={this.handleExportTickets}>
                                {T.translate("ticket_list.export")}
                            </button>
                        </div>
                    </div>
                    <hr/>
                    <OrAndFilter value={ticketFilters.orAndFilter} entity={'tickets'} onChange={(filter) => this.handleFilterChange('orAndFilter', filter)}/>
                    <div className="row">
                        <div className="col-md-6">
                            <Dropdown
                                id="enabled_filters"
                                placeholder={'Enabled Filters'}
                                value={enabledFilters}
                                onChange={this.handleFiltersChange}
                                options={this.handleDDLSortByLabel(filters_ddl)}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    </div>
                    <div className="row">
                        {enabledFilters.includes('hasOwnerFilter') &&
                        <div className="col-md-6">
                            <SegmentedControl
                                name="hasOwnerFilter"
                                options={[
                                    { label: T.translate("ticket_list.all"), value: null, default: ticketFilters.hasOwnerFilter === null},
                                    { label: T.translate("ticket_list.has_owner"), value: "HAS_OWNER",default: ticketFilters.hasOwnerFilter === "HAS_OWNER" },
                                    { label: T.translate("ticket_list.has_no_owner"), value: "HAS_NO_OWNER",default: ticketFilters.hasOwnerFilter === "HAS_NO_OWNER" },
                                ]}
                                setValue={val => this.handleFilterChange('hasOwnerFilter', val)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        }
                        {enabledFilters.includes('completedFilter') &&
                        <div className="col-md-6">
                            <SegmentedControl
                              name="completedFilter"
                              options={[
                                  { label: T.translate("ticket_list.all"), value: null, default: ticketFilters.completedFilter === null},
                                  { label: T.translate("ticket_list.complete"), value: "Complete",default: ticketFilters.completedFilter === "Complete" },
                                  { label: T.translate("ticket_list.incomplete"), value: "Incomplete",default: ticketFilters.completedFilter === "Incomplete" },
                              ]}
                              setValue={val => this.handleFilterChange('completedFilter', val)}
                              style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        }
                        {enabledFilters.includes('hasBadgeFilter') &&
                        <div className="col-md-6">
                            <SegmentedControl
                                name="hasBadgeFilter"
                                options={[
                                    { label: T.translate("ticket_list.all"), value: null, default: ticketFilters.hasBadgeFilter === null},
                                    { label: T.translate("ticket_list.has_badge"), value: "HAS_BADGE",default: ticketFilters.hasBadgeFilter === "HAS_BADGE" },
                                    { label: T.translate("ticket_list.has_no_badge"), value: "HAS_NO_BADGE",default: ticketFilters.hasBadgeFilter === "HAS_NO_BADGE" },
                                ]}
                                setValue={newValue => this.handleFilterChange('hasBadgeFilter', newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        }
                        {enabledFilters.includes('amountFilter') &&
                        <div className="col-md-6">
                            <SegmentedControl
                              name="amountFilter"
                              options={[
                                  { label: T.translate("ticket_list.all"), value: null, default: ticketFilters.amountFilter === null},
                                  { label: T.translate("ticket_list.paid"), value: "Paid",default: ticketFilters.amountFilter === "Paid" },
                                  { label: T.translate("ticket_list.free"), value: "Free",default: ticketFilters.amountFilter === "Free" },
                              ]}
                              setValue={val => this.handleFilterChange('amountFilter', val)}
                              style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                        }
                        {enabledFilters.includes('ownerFullNameStartWithFilter') &&
                        <div className={'col-md-6'}>
                            <Select
                                placeholder={T.translate("ticket_list.placeholders.owner_first_name")}
                                name="ownerFullNameStartWithFilter"
                                value={ticketFilters.ownerFullNameStartWithFilter}
                                onChange={val => this.handleFilterChange('ownerFullNameStartWithFilter', val)}
                                options={alphabet}
                                isClearable={true}
                                isMulti
                                className="ticket-types-filter"
                            />
                        </div>
                        }
                        {enabledFilters.includes('viewTypesFilter') &&
                        <div className={'col-md-6'}>
                            <Select
                                placeholder={T.translate('ticket_list.placeholders.view_types')}
                                name="viewTypesFilter"
                                value={ticketFilters.viewTypesFilter}
                                onChange={val => this.handleFilterChange('viewTypesFilter', val)}
                                options={viewTypesOptions}
                                isClearable={true}
                                isMulti
                                className="view-types-filter"
                            />
                        </div>
                        }
                        {enabledFilters.includes('ticketTypesFilter') &&
                        <div className="col-md-6">
                            <Select
                              placeholder={T.translate('ticket_list.placeholders.ticket_types')}
                              name="ticketTypesFilter"
                              value={ticketFilters.ticketTypesFilter}
                              onChange={val => this.handleFilterChange('ticketTypesFilter', val)}
                              options={ticketTypesOptions}
                              isClearable={true}
                              isMulti
                              className="ticket-types-filter"
                            />
                        </div>
                        }
                        {enabledFilters.includes('promocodesFilter') && 
                        <div className="col-md-6">
                            <PromocodeInput
                              id="promocodesFilter"
                              value={ticketFilters.promocodesFilter}
                              onChange={ev => this.handleFilterChange('promocodesFilter', ev.target.value)}
                              summitId={currentSummit.id}
                              className="promocodes-filter"
                              placeholder={T.translate('ticket_list.placeholders.promocodes')}
                              isClearable
                              multi
                            />
                        </div>
                        }
                        {enabledFilters.includes('promocodeTagsFilter') && 
                        <div className="col-md-6">
                            <TagInput
                              id="promocodeTagsFilter"
                              value={ticketFilters.promocodeTagsFilter}
                              onChange={ev => this.handleFilterChange('promocodeTagsFilter', ev.target.value)}
                              className="promocodes-filter"
                              placeholder={T.translate('ticket_list.placeholders.promocodes_tags')}
                              isClearable
                              multi
                            />
                        </div>
                        }       
                        {enabledFilters.includes('show_refund_request_pending') && 
                        <div className={'col-md-6'}>
                            <div className="form-check abc-checkbox">
                                <input
                                  type="checkbox"
                                  id="show_refund_request_pending"
                                  checked={ticketFilters.showOnlyPendingRefundRequests}
                                  onChange={ev => this.handleFilterChange('showOnlyPendingRefundRequests', ev.target.checked)}
                                  className="form-check-input"
                                />
                                <label className="form-check-label" htmlFor="show_refund_request_pending">
                                    {T.translate("ticket_list.show_refund_request_pending")}
                                </label>
                            </div>
                        </div>
                        }
                        {enabledFilters.includes('show_printable') && 
                        <div className={'col-md-6'}>
                            <div className="form-check abc-checkbox">
                                <input
                                  type="checkbox"
                                  id="show_printable"
                                  checked={ticketFilters.showOnlyPrintable}
                                  onChange={ev => this.handleFilterChange('showOnlyPrintable', ev.target.checked)}
                                  className="form-check-input"
                                />
                                <label className="form-check-label" htmlFor="show_printable">
                                    {T.translate("ticket_list.show_printable")} &nbsp;
                                    <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("ticket_list.show_printable_info")} />
                                </label>
                            </div>
                        </div>
                        }
                    </div>

                    <hr/>

                    <div className={'row'} style={{marginBottom: 15}}>
                        <div className={'col-md-12'}>
                            <label>{T.translate("ticket_list.select_fields")}</label>
                            <Dropdown
                                id="select_fields"
                                placeholder={T.translate("ticket_list.placeholders.select_fields")}
                                value={this.state.selectedColumns}
                                onChange={this.handleColumnsChange}
                                options={this.handleDDLSortByLabel(ddl_columns)}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    </div>

                    <hr />

                    {tickets.length === 0 &&
                        <div>{T.translate("ticket_list.no_tickets")}</div>
                    }

                    {tickets.length > 0 &&
                        <div>
                            { selectedCount > 0 &&
                                <span><b>{T.translate("ticket_list.items_qty", {qty:selectedCount})}</b></span>
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
                <Modal className="modal_ingest" show={showIngestModal} onHide={() => this.setState({...this.state, showIngestModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("ticket_list.ingest_tickets", {source: currentSummit.external_registration_feed_type})}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                {T.translate("ticket_list.ingest_tickets_text",{source: currentSummit.external_registration_feed_type})}
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
                                {T.translate("ticket_list.import_tickets_format")}<br />
                                <b>{T.translate("ticket_list.import_tickets_id")}</b>{T.translate("ticket_list.import_tickets_id_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_number")}</b>{T.translate("ticket_list.import_tickets_number_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_attendee_email")}</b>{T.translate("ticket_list.import_tickets_attendee_email_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_attendee_first_name")}</b>{T.translate("ticket_list.import_tickets_attendee_first_name_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_attendee_last_name")}</b>{T.translate("ticket_list.import_tickets_attendee_last_name_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_attendee_company")}</b>{T.translate("ticket_list.import_tickets_attendee_company_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_attendee_company_id")}</b>{T.translate("ticket_list.import_tickets_attendee_company_id_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_ticket_type_name")}</b>{T.translate("ticket_list.import_tickets_ticket_type_name_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_ticket_type_id")}</b>{T.translate("ticket_list.import_tickets_ticket_type_id_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_ticket_promo_code")}</b>{T.translate("ticket_list.import_tickets_ticket_promo_code_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_badge_type_id")}</b>{T.translate("ticket_list.import_tickets_badge_type_id_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_badge_type_name")}</b>{T.translate("ticket_list.import_tickets_badge_type_name_text")}<br />
                                <b>{T.translate("ticket_list.import_tickets_badge_features")}</b>{T.translate("ticket_list.import_tickets_badge_features_text")}<br />
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
                                <input
                                  type="checkbox"
                                  id="check_in"
                                  checked={doCheckIn}
                                  onChange={ev => {this.setState({...this.state, doCheckIn : ev.target.checked})}}
                                  className="form-check-input"
                                />
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
        getTicket,
    }
)(TicketListPage);
