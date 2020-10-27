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
        this.handleExport = this.handleExport.bind(this);
        this.state = {
            showModal: false,
            modalTitle: '',
            modalSchedule: []
        }
    }

    handleExport(ev) {
        let {term, order, orderDir, statusFilter, memberFilter} = this.props;
        ev.preventDefault();
        this.props.exportAttendees(term, order, orderDir, statusFilter, memberFilter);
    }

    handleSetMemberFilter(newMemberFilter){
        let {term, order, page, orderDir, perPage, statusFilter} = this.props;
        this.props.getAttendees(term, page, perPage, order, orderDir, statusFilter, newMemberFilter);
    }

    handleSetStatusFilter(newStatusFilter){
        let {term, order, page, orderDir, perPage, memberFilter} = this.props;
        this.props.getAttendees(term, page, perPage, order, orderDir, newStatusFilter, memberFilter);
    }

    handleChangeFlowEvent(ev){
        let {value, id} = ev.target;
        this.props.setCurrentFlowEvent(value);
    }

    handleSendEmails(ev){
        ev.stopPropagation();
        ev.preventDefault();

        let {
            selectedAll,
            term,
            memberFilter,
            statusFilter,
            selectedIds,
            currentFlowEvent,
            sendEmails
        } = this.props;

        if(!currentFlowEvent){
            Swal.fire("Validation error", T.translate("attendee_list.select_template") , "warning");
            return false;
        }

        if(!selectedAll && selectedIds.length === 0){
            Swal.fire("Validation error", T.translate("attendee_list.select_items"), "warning");
            return false;
        }

        sendEmails(currentFlowEvent, selectedAll , selectedIds, term, statusFilter, memberFilter);
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
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            let {term, order, page, orderDir, perPage, statusFilter, memberFilter} = this.props;
            this.props.getAttendees(term, page, perPage, order, orderDir, statusFilter, memberFilter);
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id !== newProps.currentSummit.id) {
            let {term, order, page, orderDir, perPage, statusFilter, memberFilter} = this.props;
            this.props.getAttendees(term, page, perPage, order, orderDir, statusFilter, memberFilter);
        }
    }

    handleEdit(attendee_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/attendees/${attendee_id}`);
    }

    handleViewSchedule(attendee_id) {
        let {attendees} = this.props;
        let attendee = attendees.find(a => a.id === attendee_id);

        this.setState({
            showModal: true,
            modalTitle: attendee.name,
            modalSchedule: attendee.schedule
        });
    }

    hasSchedule(attendee_id) {

        let {attendees} = this.props;
        let attendee = attendees.find(a => a.id === attendee_id);

        return attendee.schedule_count > 0;
    }

    onCloseSchedule() {
        this.setState({showModal: false})
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage,  statusFilter, memberFilter} = this.props;
        this.props.getAttendees(term, page, perPage, order, orderDir, statusFilter, memberFilter);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage,  statusFilter, memberFilter} = this.props;
        key = (key === 'name') ? 'full_name' : key;
        this.props.getAttendees(term, page, perPage, key, dir, statusFilter, memberFilter);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage, statusFilter, memberFilter} = this.props;
        this.props.getAttendees(term, page, perPage, order, orderDir, statusFilter, memberFilter);
    }

    handleNewAttendee(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/attendees/new`);
    }

    handleDeleteAttendee(attendeeId) {
        let {deleteAttendee, attendees} = this.props;
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
        let {currentSummit, attendees, lastPage, currentPage,
            term, order, orderDir, totalAttendees,
            selectedIds,
            currentFlowEvent,
            selectedAll,
            statusFilter, memberFilter
        } = this.props;
        let {showModal, modalSchedule, modalTitle} = this.state;

        let columns = [
            { columnKey: 'member_id', value: T.translate("attendee_list.member_id"), sortable: true},
            { columnKey: 'name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'email', value: T.translate("general.email") , sortable: true},
            { columnKey: 'tickets_qty', value: T.translate("attendee_list.tickets") },
            { columnKey: 'company', value: T.translate("attendee_list.company") , sortable: true},
            { columnKey: 'status', value: T.translate("attendee_list.status") , sortable: true},
        ];

        let table_options = {
            sortCol: (order === 'last_name') ? 'name' : order,
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
                        icon: <i className="fa fa-list"></i>,
                        onClick: this.handleViewSchedule,
                        display: this.hasSchedule
                    }
                ]
            },
            selectedIds: selectedIds,
            selectedAll: selectedAll,
        }

        if(!currentSummit.id) return (<div></div>);

        let flowEventsDDL = [
            {label: '-- SELECT EMAIL EVENT --', value: ''},

            {label: 'SUMMIT_REGISTRATION__ATTENDEE_TICKET_REGENERATE_HASH', value: 'SUMMIT_REGISTRATION__ATTENDEE_TICKET_REGENERATE_HASH'},
            {label: 'SUMMIT_REGISTRATION_INVITE_ATTENDEE_TICKET_EDITION', value: 'SUMMIT_REGISTRATION_INVITE_ATTENDEE_TICKET_EDITION'},
        ];

        return(
            <div className="container">
                <h3> {T.translate("attendee_list.attendee_list")} ({totalAttendees})</h3>
                <div className={'row'}>
                    <div className={'col-md-8'}>
                        <FreeTextSearch
                            value={term}
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
                    <div className="col-md-6">
                        <SegmentedControl
                            name="memberFilter"
                            options={[
                                { label: "All", value: null, default: memberFilter === null},
                                { label: "With IDP Account", value: "HAS_MEMBER",default: memberFilter === "HAS_MEMBER" },
                                { label: "Without IDP Account", value: "HAS_NO_MEMBER",default: memberFilter === "HAS_NO_MEMBER" },
                            ]}
                            setValue={newValue => this.handleSetMemberFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7' }}
                        />
                    </div>
                    <div className="col-md-6">
                        <SegmentedControl
                            name="statusFilter"
                            options={[
                                { label: "All", value: null, default: statusFilter === null},
                                { label: "Complete Questions", value: "Complete",default: statusFilter === "Complete"},
                                { label: "Incomplete Questions", value: "Incomplete", default: statusFilter === "Incomplete"},
                            ]}
                            setValue={newValue => this.handleSetStatusFilter(newValue)}
                            style={{ width: "100%", height:40, color: '#337ab7' }}
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

const mapStateToProps = ({ currentSummitState, currentAttendeeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentAttendeeListState
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
    }
)(SummitAttendeeListPage);
