/**
 * Copyright 2020 OpenStack Foundation
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
import {Modal, Pagination} from "react-bootstrap";
import Swal from "sweetalert2";
import T from 'i18n-react/dist/i18n-react';
import {
    FreeTextSearch,
    SelectableTable,
    UploadInput,
    Dropdown,
    TagInput
} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import {
    exportInvitationsCSV, getInvitations, importInvitationsCSV, selectInvitation, unSelectInvitation,
    clearAllSelectedInvitations, deleteAllRegistrationInvitation, deleteRegistrationInvitation, setCurrentFlowEvent,
    setSelectedAll, sendEmails
}
from "../../actions/registration-invitation-actions";

import { MaxTextLengthForTicketTypesOnTable, MaxTextLengthForTagsOnTable } from '../../utils/constants';



class RegistrationInvitationsListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleTicketTypeSelected = this.handleTicketTypeSelected.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleImportInvitations = this.handleImportInvitations.bind(this);
        this.handleExportInvitations = this.handleExportInvitations.bind(this);
        this.handleChangeNonAccepted = this.handleChangeNonAccepted.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewInvitation = this.handleNewInvitation.bind(this);
        this.handleSendEmails = this.handleSendEmails.bind(this);
        this.handleChangeFlowEvent = this.handleChangeFlowEvent.bind(this);
        this.handleDeleteAll = this.handleDeleteAll.bind(this);
        this.handleChangeNoSent = this.handleChangeNoSent.bind(this);
        this.handleTagFilterChange = this.handleTagFilterChange.bind(this);

        this.state = {
            showImportModal: false,
            importFile: null,
        }
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            const {term, order, orderDir, currentPage, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
            this.props.getInvitations(term, currentPage, perPage, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
        }
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
    }

    handleEdit(invitation_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/registration-invitations/${invitation_id}`);
    }

    handleChangeFlowEvent(ev){
        const {value, id} = ev.target;
        this.props.setCurrentFlowEvent(value);
    }

    handleDeleteAll(){

        const {deleteAllRegistrationInvitation} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("registration_invitation_list.remove_all_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteAllRegistrationInvitation();
            }
        });
    }

    handleDelete(invitation_id){
        const {deleteRegistrationInvitation, invitations} = this.props;
        let invitation = invitations.find(i => i.id === invitation_id);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("registration_invitation_list.remove_warning") + ' (' + invitation.email + ") .",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRegistrationInvitation(invitation_id);
            }
        });
    }

    handleNewInvitation(){
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/registration-invitations/new`);
    }

    handleSendEmails(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedAll,
            term,
            showNonAccepted,
            showNotSent,
            selectedInvitationsIds,
            currentFlowEvent,
            sendEmails,
            allowedTicketTypesIds,
            tagFilter
        } = this.props;

        if(!currentFlowEvent){
            Swal.fire("Validation error", T.translate("registration_invitation_list.select_template") , "warning");
            return false;
        }

        if(!selectedAll && selectedInvitationsIds.length === 0){
            Swal.fire("Validation error", T.translate("registration_invitation_list.select_items"), "warning");
            return false;
        }

        sendEmails
        (
            currentFlowEvent,
            selectedAll ,
            selectedInvitationsIds,
            term,
            showNonAccepted,
            showNotSent,
            allowedTicketTypesIds,
            tagFilter
        );
    }

    handleSelected(invitation_id, isSelected){
        if(isSelected){
            this.props.selectInvitation(invitation_id);
            return;
        }
        this.props.unSelectInvitation(invitation_id);
    }

    handleSelectedAll(ev){
        let selectedAllCb = ev.target.checked;
        this.props.setSelectedAll(selectedAllCb);
        if(!selectedAllCb){
            //clear all selected
            this.props.clearAllSelectedInvitations();
        }
    }

    handleTicketTypeSelected(ev){
        const {term, page, order, orderDir, perPage, showNonAccepted, showNotSent, tagFilter} = this.props;
        let {value} = ev.target;
        const ticketTypeFilter = [...value];
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted, showNotSent, ticketTypeFilter, tagFilter);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, key, dir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
    }

    handleImportInvitations() {
        this.setState({showImportModal: false});
        let formData = new FormData();
        if (this.state.importFile) {
            formData.append('file', this.state.importFile);
            this.props.importInvitationsCSV(formData);
        }
    }

    handleExportInvitations() {        
        const {term, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.exportInvitationsCSV(term, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
    }

    handleTagFilterChange(ev) {
        const {term, order, page, orderDir, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted, showNotSent, allowedTicketTypesIds, ev.target.value);        
    }

    handleChangeNonAccepted() {
        const {term, order, page, orderDir, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, !showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter);
    }

    handleChangeNoSent() {
        const {term, order, page, orderDir, perPage, showNonAccepted, showNotSent, allowedTicketTypesIds, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted, !showNotSent, allowedTicketTypesIds, tagFilter);
    }

    render(){

        const { currentSummit, invitations, term, order,
            orderDir, totalInvitations,
            lastPage, currentPage, showNonAccepted,
            selectedInvitationsIds, showNotSent,
            currentFlowEvent, selectedAll, allowedTicketTypesIds, tagFilter
        } = this.props;

        const {showImportModal, importFile} = this.state;
        
        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'email', value: T.translate("registration_invitation_list.email") },
            { columnKey: 'first_name', value: T.translate("registration_invitation_list.first_name") },
            { columnKey: 'last_name', value: T.translate("registration_invitation_list.last_name") },
            { columnKey: 'is_accepted', value: T.translate("registration_invitation_list.completed") },
            { columnKey: 'is_sent', value: T.translate("registration_invitation_list.sent") },
            { columnKey: 'allowed_ticket_types', value: T.translate("registration_invitation_list.allowed_ticket_types"), render: (t) =>
                t.allowed_ticket_types_full.length > MaxTextLengthForTicketTypesOnTable ?
                    <>
                        {`${t.allowed_ticket_types}...`}&nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={t.allowed_ticket_types_full}/>
                    </>
                    : t.allowed_ticket_types
            },
            { columnKey: 'tags', value: T.translate("registration_invitation_list.tags"),render: (t) =>
                t.tags_full.length > MaxTextLengthForTagsOnTable ?
                    <>
                        {`${t.tags}...`}&nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={t.tags_full}/>
                    </>
                    :
                    t.tags
            },
        ];

        const table_options = {
            selectedIds: selectedInvitationsIds,
            sortCol: order,
            sortDir: orderDir,
            selectedAll: selectedAll,
            actions: {
                edit: {
                    onClick: this.handleEdit,
                    onSelected: this.handleSelected,
                    onSelectedAll: this.handleSelectedAll

                },
                delete: { onClick: this.handleDelete },
            }
        }

        if(!currentSummit.id) return (<div />);

        const ticketTypesFilterDDL = currentSummit.ticket_types.map(t => { return {label: t.name, value: t.id}; });

        let flowEventsDDL = [
            {label: '-- SELECT EMAIL EVENT --', value: ''},
            {label: 'SUMMIT_REGISTRATION_INVITE_REGISTRATION', value: 'SUMMIT_REGISTRATION_INVITE_REGISTRATION'},
            {label: 'SUMMIT_REGISTRATION_REINVITE_REGISTRATION', value: 'SUMMIT_REGISTRATION_REINVITE_REGISTRATION'},
        ];

        return(
            <div>
                <div className="container">
                    <h3> {T.translate("registration_invitation_list.invitation_list")} ({totalInvitations})</h3>
                    <div className="actions-wrapper">
                        <div className="row">
                            <div className="col-md-6">
                                <FreeTextSearch
                                    value={term}
                                    placeholder={T.translate("registration_invitation_list.placeholders.search")}
                                    onSearch={this.handleSearch}
                                />
                            </div>
                            <div className="col-md-6 text-right">
                                <button className="btn btn-default right-space" onClick={() => this.setState({showImportModal:true})}>
                                    {T.translate("registration_invitation_list.import")}
                                </button>
                                <button className="btn btn-default right-space" onClick={this.handleExportInvitations}>
                                    {T.translate("registration_invitation_list.export")}
                                </button>
                                <button className="btn btn-primary right-space" onClick={this.handleNewInvitation}>
                                    {T.translate("registration_invitation_list.add_invitation")}
                                </button>
                                <button className="btn btn-danger" onClick={this.handleDeleteAll}>
                                    {T.translate("registration_invitation_list.delete_all_invitations")}
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <TagInput
                                    id="tags"
                                    clearable
                                    isMulti
                                    value={tagFilter}
                                    onChange={this.handleTagFilterChange}
                                    placeholder={T.translate("registration_invitation_list.placeholders.tags")}
                                />        
                            </div>
                            <div className='col-md-6'>
                                <Dropdown
                                    id="allowed_ticket_types_filter"
                                    value={allowedTicketTypesIds}
                                    placeholder={T.translate("registration_invitation_list.placeholders.allowed_ticket_types_filter")}
                                    onChange={this.handleTicketTypeSelected}
                                    options={ticketTypesFilterDDL}
                                    isMulti={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-check abc-checkbox col-md-6">
                                    <input type="checkbox" id="showNonSent" checked={showNotSent}
                                           className="form-check-input"
                                           onChange={this.handleChangeNoSent}
                                    />
                                    <label className="form-check-label" htmlFor="showNonSent">
                                        {T.translate("registration_invitation_list.show_non_sent")}
                                    </label>
                                </div>
                                <div className="form-check abc-checkbox col-md-6">
                                    <input type="checkbox" id="showNonAccepted" checked={showNonAccepted}
                                           className="form-check-input"
                                           onChange={this.handleChangeNonAccepted}
                                    />
                                    <label className="form-check-label" htmlFor="showNonAccepted">
                                        {T.translate("registration_invitation_list.show_non_accepted")}
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6 text-right">
                                <div className={'row'}>
                                    <div className={'col-md-10'}>
                                        <Dropdown
                                            id="flow_event"
                                            value={currentFlowEvent}
                                            onChange={this.handleChangeFlowEvent}
                                            options={flowEventsDDL}
                                        />
                                    </div>
                                    <div className={'col-md-2'}>
                                        <button className="btn btn-primary right-space" onClick={this.handleSendEmails}>
                                            {T.translate("registration_invitation_list.send_emails")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {invitations.length === 0 &&
                    <div>{T.translate("registration_invitation_list.no_invitations")}</div>
                    }

                    { invitations.length > 0 &&
                    <div>
                        <SelectableTable
                            options={table_options}
                            data={invitations}
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

                <Modal show={showImportModal} onHide={() => this.setState({showImportModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("registration_invitation_list.import_invitations")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                Format must be the following:<br />
                                <b>email</b>: invitee email<br />
                                <b>first_name</b>: invitee First Name<br />
                                <b>last_name</b>: invitee Last Name<br />
                                <b>allowed_ticket_types (optional) </b>: Pipe Separated list of ticket types ids<br />
                            </div>
                            <div className="col-md-12 invitation-import-upload-wrapper">
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
                        <button disabled={!this.state.importFile} className="btn btn-primary" onClick={this.handleImportInvitations}>
                            {T.translate("registration_invitation_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, RegistrationInvitationListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...RegistrationInvitationListState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getInvitations,
        importInvitationsCSV,
        exportInvitationsCSV,
        selectInvitation,
        unSelectInvitation,
        clearAllSelectedInvitations,
        deleteAllRegistrationInvitation,
        deleteRegistrationInvitation,
        setCurrentFlowEvent,
        setSelectedAll,
        sendEmails,
    }
)(RegistrationInvitationsListPage);
