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
import {Dropdown, FreeTextSearch, SelectableTable} from 'openstack-uicore-foundation/lib/components';
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
    exportAttendees
} from "../../actions/attendee-actions";

import {getBadgeFeatures, getBadgeTypes} from "../../actions/badge-actions";

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
        this.handleChangeTicketTypeFilter = this.handleChangeTicketTypeFilter.bind(this);
        this.handleChangeFlowEvent = this.handleChangeFlowEvent.bind(this);
        this.handleSetMemberFilter = this.handleSetMemberFilter.bind(this);
        this.handleSetStatusFilter = this.handleSetStatusFilter.bind(this);
        this.handleSetTicketsFilter = this.handleSetTicketsFilter.bind(this);
        this.handleSetVirtualCheckInFilter = this.handleSetVirtualCheckInFilter.bind(this);
        this.handleSetCheckedInFilter = this.handleSetCheckedInFilter.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleChangeFeaturesFilter = this.handleChangeFeaturesFilter.bind(this);
        this.handleChangeBadgeTypeFilter = this.handleChangeBadgeTypeFilter.bind(this);
        this.state = {
            showModal: false,
            modalTitle: '',
            modalSchedule: []
        }
    }

    handleExport(ev) {
        const {badgeTypeFilter, featuresFilter, order, orderDir, term, statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        ev.preventDefault();
        this.props.exportAttendees(order, orderDir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
    }

    handleSetMemberFilter(newMemberFilter){
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, statusFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term,
            statusFilter,
            memberFilter: newMemberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
    }

    handleSetTicketsFilter(newTicketsFilter){
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir,
            {
                term,
                statusFilter,
                memberFilter,
                ticketsFilter: newTicketsFilter,
                virtualCheckInFilter,
                checkedInFilter,
                ticketTypeFilter,
                featuresFilter,
                badgeTypeFilter,
            });
    }

    handleSetStatusFilter(newStatusFilter){
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir,
            {
                term,
                statusFilter: newStatusFilter,
                memberFilter,
                ticketsFilter,
                virtualCheckInFilter,
                checkedInFilter,
                ticketTypeFilter,
                featuresFilter,
                badgeTypeFilter,
            });
    }

    handleSetVirtualCheckInFilter(newVirtualCheckInFilter){
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir,
            {
                term,
                statusFilter,
                memberFilter,
                ticketsFilter,
                virtualCheckInFilter: newVirtualCheckInFilter,
                checkedInFilter,
                ticketTypeFilter,
                featuresFilter,
                badgeTypeFilter,
            })
        ;
    }

    handleChangeTicketTypeFilter(ev){
        const {value: newTicketTypeFilter } = ev.target;
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter: newTicketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
    }

    handleChangeFeaturesFilter(ev){
        const {value: newFeaturesFilter } = ev.target;
        const {badgeTypeFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, ticketTypeFilter, virtualCheckInFilter, checkedInFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter: newFeaturesFilter,
            badgeTypeFilter,
        });
    }

    handleChangeBadgeTypeFilter(ev) {
        const {value: newBadgeTypeFilter } = ev.target;
        const { featuresFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, ticketTypeFilter, virtualCheckInFilter, checkedInFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter: newBadgeTypeFilter,
        });
    }

    handleSetCheckedInFilter(newCheckedInFilter){
        const {badgeTypeFilter, featuresFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter: newCheckedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
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
            memberFilter,
            statusFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            selectedIds,
            currentFlowEvent,
            sendEmails,
            featuresFilter,
            badgeTypeFilter,
        } = this.props;

        if(!currentFlowEvent){
            Swal.fire("Validation error", T.translate("attendee_list.select_template") , "warning");
            return false;
        }

        if(!selectedAll && selectedIds.length === 0){
            Swal.fire("Validation error", T.translate("attendee_list.select_items"), "warning");
            return false;
        }

        sendEmails(currentFlowEvent, selectedAll , selectedIds, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
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
        const {currentSummit} = this.props;
        if(currentSummit) {
            const {featuresFilter, badgeTypeFilter, term, order, page, orderDir, perPage, statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
            this.props.getBadgeFeatures();
            this.props.getBadgeTypes();
            this.props.getAttendees(page, perPage, order, orderDir,
                {
                    term,
                    statusFilter,
                    memberFilter,
                    ticketsFilter,
                    virtualCheckInFilter,
                    checkedInFilter,
                    ticketTypeFilter,
                    badgeTypeFilter,
                    featuresFilter,
                });

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
        const {badgeTypeFilter, featuresFilter, term, order, orderDir, perPage,  statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir,
            {
                term,
                statusFilter,
                memberFilter,
                ticketsFilter,
                virtualCheckInFilter,
                checkedInFilter,
                ticketTypeFilter,
                featuresFilter,
                badgeTypeFilter,
            });
    }

    handleSort(index, key, dir, func) {
        const {badgeTypeFilter, featuresFilter, term, page, perPage,  statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        key = (key === 'name') ? 'full_name' : key;
        this.props.getAttendees(page, perPage, key, dir, {
            term,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
    }

    handleSearch(newTerm) {
        const {badgeTypeFilter, featuresFilter, order, orderDir, page, perPage, statusFilter, memberFilter, ticketsFilter, virtualCheckInFilter, checkedInFilter, ticketTypeFilter} = this.props;
        this.props.getAttendees(page, perPage, order, orderDir, {
            term: newTerm,
            statusFilter,
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeTypeFilter,
        });
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

    render(){
        const {
            currentSummit,
            attendees,
            lastPage, currentPage,
            term, order, orderDir, totalRealAttendees,
            selectedIds,
            currentFlowEvent,
            selectedAll,
            statusFilter, 
            memberFilter,
            ticketsFilter,
            virtualCheckInFilter,
            checkedInFilter,
            ticketTypeFilter,
            featuresFilter,
            badgeFeatures,
            badgeTypes,
            badgeTypeFilter,
        } = this.props;

        const {showModal, modalSchedule, modalTitle} = this.state;

        const columns = [
            { columnKey: 'member_id', value: T.translate("attendee_list.member_id"), sortable: true},
            { columnKey: 'name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'email', value: T.translate("general.email") , sortable: true},
            { columnKey: 'tickets_qty', value: T.translate("attendee_list.tickets") },
            { columnKey: 'company', value: T.translate("attendee_list.company") , sortable: true},
            { columnKey: 'status', value: T.translate("attendee_list.status") , sortable: true},
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

        return(
            <div className="container">
                <h3> {T.translate("attendee_list.attendee_list")} ({totalRealAttendees})</h3>
                <div className={'row'}>
                    <div className={'col-md-8'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("attendee_list.placeholders.search_attendees")}
                            onSearch={this.handleSearch}
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
                <div className="row">
                    <div className="col-md-4">
                        <SegmentedControl
                            name="memberFilter"
                            options={[
                                { label: "All", value: null, default: memberFilter === null},
                                { label: "With IDP Account", value: "HAS_MEMBER",default: memberFilter === "HAS_MEMBER" },
                                { label: "Without IDP Account", value: "HAS_NO_MEMBER",default: memberFilter === "HAS_NO_MEMBER" },
                            ]}
                            setValue={newValue => this.handleSetMemberFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7' , fontSize: '10px' }}
                        />
                    </div>
                    <div className="col-md-4">
                        <SegmentedControl
                            name="statusFilter"
                            options={[
                                { label: "All", value: null, default: statusFilter === null},
                                { label: "Complete Questions", value: "Complete",default: statusFilter === "Complete"},
                                { label: "Incomplete Questions", value: "Incomplete", default: statusFilter === "Incomplete"},
                            ]}
                            setValue={newValue => this.handleSetStatusFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px'  }}
                        />
                    </div>
                    <div className="col-md-4">
                        <SegmentedControl
                            name="ticketsFilter"
                            options={[
                                { label: "All", value: null, default: ticketsFilter === null},
                                { label: "With Tickets", value: "HAS_TICKETS",default: ticketsFilter === "HAS_TICKETS" },
                                { label: "Without Tickets", value: "HAS_NO_TICKETS",default: ticketsFilter === "HAS_NO_TICKETS" },
                            ]}
                            setValue={newValue => this.handleSetTicketsFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                        />
                    </div>
                    <div className="col-md-4">
                         <SegmentedControl
                            name="virtualCheckInFilter"
                            options={[
                                { label: "All", value: null, default: virtualCheckInFilter === null},
                                { label: "Has Virtual Checkin", value: "HAS_VIRTUAL_CHECKIN", default: virtualCheckInFilter === "HAS_TICKETS" },
                                { label: "Has Not Virtual Checkin", value: "HAS_NO_VIRTUAL_CHECKIN", default: virtualCheckInFilter === "HAS_NO_TICKETS" },
                            ]}
                            setValue={newValue => this.handleSetVirtualCheckInFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                        />
                    </div>
                    <div className="col-md-4">
                        <SegmentedControl
                            name="checkedInFilter"
                            options={[
                                { label: "All", value: null, default: checkedInFilter === null},
                                { label: "Checked in", value: "CHECKED_IN", default: checkedInFilter === "CHECKED_IN" },
                                { label: "Not Checked in", value: "NO_CHECKED_IN", default: checkedInFilter === "NO_CHECKED_IN" },
                            ]}
                            setValue={newValue => this.handleSetCheckedInFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px' }}
                        />
                    </div>
                    <div className="col-md-4" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="ticketTypeFilter"
                            value={ticketTypeFilter}
                            onChange={this.handleChangeTicketTypeFilter}
                            options={ticketTypesDDL}
                            isClearable={true}
                            placeholder={"FILTER BY TICKET TYPE"}
                            isMulti
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="badgeTypeFilter"
                            value={badgeTypeFilter}
                            onChange={this.handleChangeBadgeTypeFilter}
                            options={badgeTypesDDL}
                            isClearable={true}
                            placeholder={"FILTER BY BADGE TYPE"}
                            isMulti
                        />
                    </div>
                    <div className="col-md-6" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="featuresFilter"
                            value={featuresFilter}
                            onChange={this.handleChangeFeaturesFilter}
                            options={featuresTypesDDL}
                            isClearable={true}
                            placeholder={"FILTER BY BADGE FEATURE"}
                            isMulti
                        />
                    </div>
                </div>
                {attendees.length === 0 &&
                    <div>{T.translate("attendee_list.no_attendees")}</div>
                }

                <div className={'row'}>
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
    }
)(SummitAttendeeListPage);
