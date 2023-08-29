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
import {Dropdown, FreeTextSearch, SelectableTable, DateTimePicker} from 'openstack-uicore-foundation/lib/components';
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import ScheduleModal from "../../components/schedule-modal/index";
import { SegmentedControl } from 'segmented-control'
import {
    getAttendees,
    deleteAttendee,
    selectAttendee,
    unSelectAttendee,
    clearAllSelectedAttendees,
    setCurrentFlowEvent,
    setSelectedAll,
    sendEmails,
    exportAttendees,
    changeAttendeeListSearchTerm
} from "../../actions/attendee-actions";

import {getBadgeFeatures, getBadgeTypes} from "../../actions/badge-actions";
import {ALL_FILTER, HAS_NO_TICKETS, HAS_TICKETS} from '../../utils/constants';
import OrAndFilter from '../../components/filters/or-and-filter';

const fieldNames = [    
    { columnKey: 'member_id', value: 'member_id', sortable: true},
    { columnKey: 'tickets_qty', value: 'tickets_qty' },
    { columnKey: 'company', value: 'company', sortable: true},
    { columnKey: 'summit_hall_checked_in_date', value: 'summit_hall_checked_in_date', sortable: true},
]

const FILTERS_DEFAULT_STATE = {
    memberFilter: null,
    statusFilter: null,
    ticketsFilter: null,
    virtualCheckInFilter: null,
    checkedInFilter: null,
    ticketTypeFilter: [],
    badgeTypeFilter: [],
    featuresFilter: [],
    checkinDateFilter: Array(2).fill(null),
    orAndFilter: ALL_FILTER,
};

class SummitAttendeeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleViewSchedule = this.handleViewSchedule.bind(this);
        this.hasSchedule = this.hasSchedule.bind(this);
        this.onCloseSchedule = this.onCloseSchedule.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewAttendee = this.handleNewAttendee.bind(this);
        this.handleDeleteAttendee = this.handleDeleteAttendee.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleSendEmails = this.handleSendEmails.bind(this);
        this.handleChangeFlowEvent = this.handleChangeFlowEvent.bind(this);
        this.handleSetMemberFilter = this.handleSetMemberFilter.bind(this);
        this.handleSetStatusFilter = this.handleSetStatusFilter.bind(this);
        this.handleSetTicketsFilter = this.handleSetTicketsFilter.bind(this);
        this.handleSetVirtualCheckInFilter = this.handleSetVirtualCheckInFilter.bind(this);
        this.handleSetCheckedInFilter = this.handleSetCheckedInFilter.bind(this);
        this.handleExport = this.handleExport.bind(this);        
        this.handleDDLSortByLabel = this.handleDDLSortByLabel.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleColumnsChange = this.handleColumnsChange.bind(this);
        this.handleCheckInDate = this.handleCheckInDate.bind(this);
        this.handleExtraFilterChange = this.handleExtraFilterChange.bind(this);
        this.handleApplyEventFilters = this.handleApplyEventFilters.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
        this.handleOrAndFilter = this.handleOrAndFilter.bind(this);
        this.state = {
            showModal: false,
            modalTitle: '',
            modalSchedule: [],
            enabledFilters: [],
            attendeeFilters: {...FILTERS_DEFAULT_STATE},
            selectedColumns: [],
        }
    }

    handleExport(ev) {
        const {order, orderDir, term} = this.props;
        const {attendeeFilters, selectedColumns} = this.state;
        ev.preventDefault();
        this.props.exportAttendees(term, order, orderDir, attendeeFilters, selectedColumns);
    }

    handleSetMemberFilter(ev){
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, memberFilter: ev}});
    }    

    handleSetTicketsFilter(ev){
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, ticketsFilter: ev}});
    }

    handleSetStatusFilter(ev){
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, statusFilter: ev}});
    }

    handleSetVirtualCheckInFilter(ev){
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, virtualCheckInFilter: ev}});
    }        

    handleSetCheckedInFilter(ev){
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, checkedInFilter: ev}});        
    }

    handleChangeFlowEvent(ev){
        const {value, id} = ev.target;
        this.props.setCurrentFlowEvent(value);
    }

    handleSendEmails(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedAll,
            term,
            selectedIds,
            currentFlowEvent,
            sendEmails,            
        } = this.props;

        const {attendeeFilters, selectedColumns} = this.state;

        if(!currentFlowEvent){
            Swal.fire("Validation error", T.translate("attendee_list.select_template") , "warning");
            return false;
        }

        if(!selectedAll && selectedIds.length === 0){
            Swal.fire("Validation error", T.translate("attendee_list.select_items"), "warning");
            return false;
        }

        sendEmails(term, currentFlowEvent, selectedAll , selectedIds, attendeeFilters, selectedColumns);
    }

    handleSelected(attendee_id, isSelected){
        if(isSelected){
            this.props.selectAttendee(attendee_id);
            return;
        }
        this.props.unSelectAttendee(attendee_id);
    }

    handleSelectedAll(ev){
        let selectedAll = ev.target.checked;
        this.props.setSelectedAll(selectedAll);
        if(!selectedAll){
            //clear all selected
            this.props.clearAllSelectedAttendees();
        }
    }

    componentDidMount() {
        const {currentSummit, term, order, orderDir, filters, extraColumns } = this.props;
        const {attendeeFilters} = this.state;
        const enabledFilters = Object.keys(filters).filter(e => Array.isArray(filters[e]) ? filters[e]?.some(e => e !== null) : filters[e]?.length > 0);

        this.setState({
            ...this.state, 
            selectedColumns: extraColumns,
            enabledFilters: enabledFilters,
            attendeeFilters: {...attendeeFilters, ...filters}
        });

        if(currentSummit) {
            this.props.getBadgeFeatures();
            this.props.getBadgeTypes();
            this.props.getAttendees(term, 1, 10, order, orderDir, filters, extraColumns)
        }
    }

    handleEdit(attendee_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/attendees/${attendee_id}`);
    }

    handleViewSchedule(attendee_id) {
        const {attendees} = this.props;
        let attendee = attendees.find(a => a.id === attendee_id);

        this.setState({
            showModal: true,
            modalTitle: attendee.name,
            modalSchedule: attendee.schedule
        });
    }

    hasSchedule(attendee_id) {
        const {attendees} = this.props;
        let attendee = attendees.find(a => a.id === attendee_id);
        return attendee.schedule_count > 0;
    }

    onCloseSchedule() {
        this.setState({showModal: false})
    }

    handlePageChange(page) {
        const {order, orderDir, perPage, term} = this.props;
        const {attendeeFilters, selectedColumns} = this.state;
        this.props.getAttendees(term, page, perPage, order, orderDir, attendeeFilters, selectedColumns);
    }

    handleSort(index, key, dir, func) {
        const {page, perPage, term} = this.props;
        const {attendeeFilters, selectedColumns} = this.state;
        key = (key === 'name') ? 'full_name' : key;
        this.props.getAttendees(term, page, perPage, key, dir, attendeeFilters, selectedColumns);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        const {attendeeFilters, selectedColumns} = this.state;
        this.props.getAttendees(term, page, perPage, order, orderDir, attendeeFilters, selectedColumns);
    }    

    handleNewAttendee(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/attendees/new`);
    }

    handleDeleteAttendee(attendeeId) {

        const {deleteAttendee, attendees} = this.props;
        let attendee = attendees.find(a => a.id === attendeeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("attendee_list.delete_attendee_warning") + ' ' + attendee.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteAttendee(attendeeId);
            }
        });
    }

    handleApplyEventFilters() {
        const {order, orderDir, page, perPage, term} = this.props;
        const {attendeeFilters, selectedColumns} = this.state;
        this.props.getAttendees(term, page, perPage, order, orderDir, attendeeFilters, selectedColumns);
    }

    handleDDLSortByLabel(ddlArray) {
        return ddlArray.sort((a, b) => a.label.localeCompare(b.label));
    }

    handleFiltersChange(ev) {
        const {value} = ev.target;
        if(value.length < this.state.enabledFilters.length) {
            if(value.length === 0) {
                const resetFilters = {...FILTERS_DEFAULT_STATE};
                this.setState({...this.state, enabledFilters: value, attendeeFilters: resetFilters});
            } else {
                const removedFilter = this.state.enabledFilters.filter(e => !value.includes(e))[0];
                const defaultValue = Array.isArray(this.state.attendeeFilters[removedFilter]) ? [] : null;
                let newEventFilters = {...this.state.attendeeFilters, [removedFilter]: defaultValue};
                this.setState({...this.state, enabledFilters: value, attendeeFilters: newEventFilters});
            }
        } else {
            this.setState({...this.state, enabledFilters: value})
        }
    }

    handleColumnsChange(ev) {
        const {value} = ev.target;
        let newColumns = value;
        this.setState({...this.state, selectedColumns: newColumns})
    }

    handleCheckInDate(ev, lastDate) {
        const {value} = ev.target;
        const {checkinDateFilter} = this.state.attendeeFilters;

        this.setState({...this.state, attendeeFilters: {
            ...this.state.attendeeFilters, 
            checkinDateFilter: lastDate ? [checkinDateFilter[0], value.unix()] : [value.unix(), checkinDateFilter[1]]
        }});
    }

    handleExtraFilterChange(ev) {
        let {value, type, id} = ev.target;
        if (type === 'operatorinput') {
            value = Array.isArray(value) ? value : `${ev.target.operator}${ev.target.value}`;
            if(id === 'duration_filter') {
                value = Array.isArray(value) ? value : `${ev.target.operator}${ev.target.value}`;
            }
        }
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, [id]: value}});
    }

    handleOrAndFilter(ev) {
        this.setState({...this.state, attendeeFilters: {...this.state.attendeeFilters, orAndFilter: ev}});
    }

    handleTermChange(term) {
        this.props.changeAttendeeListSearchTerm(term);
    }

    render(){
        const {
            currentSummit,
            attendees,
            lastPage, currentPage,
            term, order, orderDir, totalRealAttendees,
            selectedIds,
            currentFlowEvent,
            selectedAll,            
            badgeFeatures,
            badgeTypes,
        } = this.props;

        const {showModal, modalSchedule, modalTitle, enabledFilters, attendeeFilters} = this.state;

        const filters_ddl = [
            {label: 'Member', value: 'memberFilter'},
            {label: 'Status', value: 'statusFilter'},
            {label: 'Ticket', value: 'ticketsFilter'},
            {label: 'Virtual Checkin', value: 'virtualCheckInFilter'},
            {label: 'Checked In', value: 'checkedInFilter'},
            {label: 'Ticket Type', value: 'ticketTypeFilter'},
            {label: 'Badge Type', value: 'badgeTypeFilter'},
            {label: 'Badge Feature', value: 'featuresFilter'},
            {label: 'Check In Date', value: 'checkinDateFilter'},
        ]

        let columns = [
            { columnKey: 'id', value: T.translate("attendee_list.id"), sortable: true},
            { columnKey: 'name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'email', value: T.translate("general.email") , sortable: true},
            { columnKey: 'status', value: T.translate("attendee_list.status") , sortable: true},            
        ];

        const ddl_columns = [            
            { value: 'member_id', label: T.translate("attendee_list.member_id")},
            { value: 'tickets_qty', label: T.translate("attendee_list.tickets_qty") },
            { value: 'company', label: T.translate("attendee_list.company")},
            { value: 'summit_hall_checked_in_date', label: T.translate("attendee_list.summit_hall_checked_in_date")},
        ];

        const table_options = {
            sortCol: (order === 'full_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                edit: {
                    onClick: this.handleEdit,
                    onSelected: this.handleSelected,
                    onSelectedAll: this.handleSelectedAll
                },
                delete: { onClick: this.handleDeleteAttendee },
                custom: [
                    {
                        name: 'show_schedule',
                        tooltip: 'show schedule',
                        icon: <i className="fa fa-list"/>,
                        onClick: this.handleViewSchedule,
                        display: this.hasSchedule
                    }
                ]
            },
            selectedIds: selectedIds,
            selectedAll: selectedAll,
        }

        if(!currentSummit.id) return (<div />);
        
        let flowEventsDDL = [
            {label: '-- SELECT EMAIL EVENT --', value: ''},
            {label: 'SUMMIT_REGISTRATION__ATTENDEE_TICKET_REGENERATE_HASH', value: 'SUMMIT_REGISTRATION__ATTENDEE_TICKET_REGENERATE_HASH'},
            {label: 'SUMMIT_REGISTRATION_INVITE_ATTENDEE_TICKET_EDITION', value: 'SUMMIT_REGISTRATION_INVITE_ATTENDEE_TICKET_EDITION'},
            {label: 'SUMMIT_REGISTRATION_ATTENDEE_ALL_TICKETS_EDITION', value: 'SUMMIT_REGISTRATION_ATTENDEE_ALL_TICKETS_EDITION'},
            {label: 'SUMMIT_REGISTRATION_INCOMPLETE_ATTENDEE_REMINDER', value: 'SUMMIT_REGISTRATION_INCOMPLETE_ATTENDEE_REMINDER'},
            {label: 'SUMMIT_REGISTRATION_GENERIC_ATTENDEE_EMAIL', value: 'SUMMIT_REGISTRATION_GENERIC_ATTENDEE_EMAIL'},
        ];

        const  ticketTypesDDL = [
            ...currentSummit.ticket_types.map(t => ({label: t.name, value: t.id}))
        ];

        const featuresTypesDDL = [
            ...badgeFeatures.map(bf => ({label: bf.name, value: bf.id}))
        ];

        const badgeTypesDDL = [
            ...badgeTypes.map(bt => ({label: bt.name, value: bt.id}))
        ];

        let showColumns = fieldNames
        .filter(f => this.state.selectedColumns.includes(f.columnKey) )
        .map( f2 => (
            {   columnKey: f2.columnKey,
                value: T.translate(`attendee_list.${f2.value}`),
                sortable: f2.sortable,
                title: f2.title
            }));

        columns = [...columns, ...showColumns];

        return(
            <div className="container">
                <h3> {T.translate("attendee_list.attendee_list")} ({totalRealAttendees})</h3>
                <div className={'row'}>
                    <div className={'col-md-8'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("attendee_list.placeholders.search_attendees")}
                            onSearch={this.handleSearch}
                            onChange={this.handleTermChange}
                        />
                    </div>
                    <div className="col-md-4 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewAttendee}>
                            {T.translate("attendee_list.add_attendee")}
                        </button>
                        <button className="btn btn-default" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                    </div>
                </div>
                <OrAndFilter style={{marginTop: 15}} value={attendeeFilters.orAndFilter} entity={'attendees'} onChange={(filter) => this.handleOrAndFilter(filter)}/>
                <div className='row' style={{marginBottom: 15}}>
                    <div className={'col-md-6'}>
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
                    <div className={'col-md-6'}>
                    <button className="btn btn-primary right-space" onClick={this.handleApplyEventFilters}>
                            {T.translate("event_list.apply_filters")}
                        </button>
                    </div>
                </div>    
                <div className="filters-row">
                    {enabledFilters.includes('memberFilter') && 
                        <div className="col-md-6">
                            <SegmentedControl
                                name="memberFilter"
                                options={[
                                    { label: "All", value: null, default: attendeeFilters.memberFilter === null},
                                    { label: "With IDP Account", value: "HAS_MEMBER",default: attendeeFilters.memberFilter === "HAS_MEMBER" },
                                    { label: "Without IDP Account", value: "HAS_NO_MEMBER",default: attendeeFilters.memberFilter === "HAS_NO_MEMBER" },
                                ]}
                                setValue={newValue => this.handleSetMemberFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                            />
                        </div>
                    }
                    {enabledFilters.includes('statusFilter') && 
                        <div className="col-md-6">
                            <SegmentedControl
                                name="statusFilter"
                                options={[
                                    { label: "All", value: null, default: attendeeFilters.statusFilter === null},
                                    { label: "Complete Questions", value: "Complete",default: attendeeFilters.statusFilter === "Complete"},
                                    { label: "Incomplete Questions", value: "Incomplete", default: attendeeFilters.statusFilter === "Incomplete"},
                                ]}
                                setValue={newValue => this.handleSetStatusFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px'  }}
                            />
                        </div>
                    }
                    {enabledFilters.includes('ticketsFilter') && 
                        <div className="col-md-6">
                            <SegmentedControl
                                name="ticketsFilter"
                                options={[
                                    { label: "All", value: null, default: attendeeFilters.ticketsFilter === null},
                                    { label: "With Tickets", value: HAS_TICKETS, default: attendeeFilters.ticketsFilter === HAS_TICKETS },
                                    { label: "Without Tickets", value: HAS_NO_TICKETS,default: attendeeFilters.ticketsFilter === HAS_NO_TICKETS },
                                ]}
                                setValue={newValue => this.handleSetTicketsFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                            />
                        </div>
                    }
                    {enabledFilters.includes('virtualCheckInFilter') && 
                        <div className="col-md-6">
                            <SegmentedControl
                                name="virtualCheckInFilter"
                                options={[
                                    { label: "All", value: null, default: attendeeFilters.virtualCheckInFilter === null},
                                    { label: "Has Virtual Checkin", value: "HAS_VIRTUAL_CHECKIN", default: attendeeFilters.virtualCheckInFilter === "HAS_VIRTUAL_CHECKIN" },
                                    { label: "Has Not Virtual Checkin", value: "HAS_NO_VIRTUAL_CHECKIN", default: attendeeFilters.virtualCheckInFilter === "HAS_NO_VIRTUAL_CHECKIN" },
                                ]}
                                setValue={newValue => this.handleSetVirtualCheckInFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                            />
                        </div>
                    }
                    {enabledFilters.includes('checkedInFilter') && 
                        <div className="col-md-6">
                            <SegmentedControl
                                name="checkedInFilter"
                                options={[
                                    { label: "All", value: null, default: attendeeFilters.checkedInFilter === null},
                                    { label: "Checked in", value: "CHECKED_IN", default: attendeeFilters.checkedInFilter === "CHECKED_IN" },
                                    { label: "Not Checked in", value: "NO_CHECKED_IN", default: attendeeFilters.checkedInFilter === "NO_CHECKED_IN" },
                                ]}
                                setValue={newValue => this.handleSetCheckedInFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                            />
                        </div>
                    }
                    {enabledFilters.includes('ticketTypeFilter') && 
                        <div className="col-md-6" style={{ minHeight: "61px", paddingTop: "8px" }}>
                            <Dropdown
                                id="ticketTypeFilter"
                                value={attendeeFilters.ticketTypeFilter}
                                onChange={this.handleExtraFilterChange}
                                options={ticketTypesDDL}
                                isClearable={true}
                                placeholder={T.translate("attendee_list.placeholders.ticket_type")}
                                isMulti
                            />
                        </div>
                    }
                    {enabledFilters.includes('badgeTypeFilter') && 
                        <div className="col-md-6" style={{ minHeight: "61px", paddingTop: "8px" }}>
                            <Dropdown
                                id="badgeTypeFilter"
                                value={attendeeFilters.badgeTypeFilter}
                                onChange={this.handleExtraFilterChange}
                                options={badgeTypesDDL}
                                isClearable={true}
                                placeholder={T.translate("attendee_list.placeholders.badge_type")}
                                isMulti
                            />
                        </div>
                    }
                    {enabledFilters.includes('featuresFilter') && 
                        <div className="col-md-6" style={{ minHeight: "61px", paddingTop: "8px" }}>
                            <Dropdown
                                id="featuresFilter"
                                value={attendeeFilters.featuresFilter}
                                onChange={this.handleExtraFilterChange}
                                options={featuresTypesDDL}
                                isClearable={true}
                                placeholder={T.translate("attendee_list.placeholders.badge_feature")}
                                isMulti
                            />
                        </div>
                    }
                    {enabledFilters.includes('checkinDateFilter') &&
                        <>
                            <div className={'col-md-3'} style={{ minHeight: "61px", paddingTop: "8px" }}>
                                <DateTimePicker
                                    id="checkin_date_from_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}                                    
                                    inputProps={{placeholder: T.translate("attendee_list.placeholders.checkin_date_from")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleCheckInDate(ev, false)}
                                    value={epochToMomentTimeZone(attendeeFilters.checkinDateFilter[0], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>                    
                            <div className={'col-md-3'} style={{ minHeight: "61px", paddingTop: "8px" }}>
                                <DateTimePicker
                                    id="checkin_date_to_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    inputProps={{placeholder: T.translate("attendee_list.placeholders.checkin_date_to")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleCheckInDate(ev, true)}
                                    value={epochToMomentTimeZone(attendeeFilters.checkinDateFilter[1], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>
                        </>
                    }
                </div>                
                {attendees.length === 0 &&
                    <div>{T.translate("attendee_list.no_attendees")}</div>
                }

                <div className={'row'} style={{marginBottom: 15, marginTop: 15}}>
                    <div className={'col-md-6'}>
                        <Dropdown
                            id="flow_event"
                            value={currentFlowEvent}
                            onChange={this.handleChangeFlowEvent}
                            options={flowEventsDDL}
                        />
                    </div>
                    <div className={'col-md-1'}>
                        <button className="btn btn-primary right-space" onClick={this.handleSendEmails}>
                            {T.translate("attendee_list.send_emails")}
                        </button>
                    </div>
                </div>

                <div className={'row'} style={{marginBottom: 15, marginTop: 15}}>
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

                {attendees.length > 0 &&
                <div>
                    <SelectableTable
                        options={table_options}
                        data={attendees}
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
                <ScheduleModal
                    show={showModal}
                    title={modalTitle}
                    schedule={modalSchedule}
                    summit={currentSummit}
                    onClose={this.onCloseSchedule}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentAttendeeListState, currentBadgeFeatureListState, currentBadgeTypeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentAttendeeListState,
    badgeFeatures: currentBadgeFeatureListState.badgeFeatures,
    badgeTypes: currentBadgeTypeListState.badgeTypes,
})

export default connect (
    mapStateToProps,
    {
        getAttendees,
        deleteAttendee,
        selectAttendee,
        unSelectAttendee,
        clearAllSelectedAttendees,
        setCurrentFlowEvent,
        setSelectedAll,
        sendEmails,
        exportAttendees,
        getBadgeFeatures,
        getBadgeTypes,
        changeAttendeeListSearchTerm
    }
)(SummitAttendeeListPage);
