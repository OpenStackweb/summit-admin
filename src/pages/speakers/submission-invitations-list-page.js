/**
 * Copyright 2023 OpenStack Foundation
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
    clearAllSelectedInvitations,
    deleteAllInvitations,
    deleteInvitation,
    setCurrentFlowEvent,
    setCurrentSelectionPlanId,
    setSelectedAll, sendEmails
}
from "../../actions/submission-invitation-actions";

import {MaxTextLengthForTagsOnTable } from '../../utils/constants';

class SubmissionInvitationsListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleImportInvitations = this.handleImportInvitations.bind(this);
        this.handleExportInvitations = this.handleExportInvitations.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewInvitation = this.handleNewInvitation.bind(this);
        this.handleSendEmails = this.handleSendEmails.bind(this);
        this.handleChangeFlowEvent = this.handleChangeFlowEvent.bind(this);
        this.handleDeleteAll = this.handleDeleteAll.bind(this);
        this.handleChangeNoSent = this.handleChangeNoSent.bind(this);
        this.handleTagFilterChange = this.handleTagFilterChange.bind(this);
        this.handleChangeSelectionPlan = this.handleChangeSelectionPlan.bind(this);

        this.state = {
            showImportModal: false,
            importFile: null,
        }
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            const {term, order, orderDir, currentPage, perPage, showNotSent, tagFilter} = this.props;
            this.props.getInvitations(term, currentPage, perPage, order, orderDir, showNotSent,tagFilter);
        }
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage, showNotSent, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNotSent, tagFilter);
    }

    handleEdit(invitation_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/submission-invitations/${invitation_id}`);
    }

    handleChangeFlowEvent(ev){
        const {value, id} = ev.target;
        this.props.setCurrentFlowEvent(value);
    }

    handleChangeSelectionPlan(ev){
        const {value, id} = ev.target;
        this.props.setCurrentSelectionPlanId(value);
    }

    handleDeleteAll(){

        const {deleteAllInvitations} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("submission_invitation_list.remove_all_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteAllInvitations();
            }
        });
    }

    handleDelete(invitation_id){
        const {deleteInvitation, invitations} = this.props;
        let invitation = invitations.find(i => i.id === invitation_id);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("submission_invitation_list.remove_warning") + ' (' + invitation.email + ") .",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteInvitation(invitation_id);
            }
        });
    }

    handleNewInvitation(){
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/submission-invitations/new`);
    }

    handleSendEmails(ev){
        ev.stopPropagation();
        ev.preventDefault();

        const {
            selectedCount,
            currentFlowEvent,
            sendEmails,
        } = this.props;

        if(!currentFlowEvent){
            Swal.fire("Validation error", T.translate("submission_invitation_list.select_template") , "warning");
            return false;
        }

        if(selectedCount === 0){
            Swal.fire("Validation error", T.translate("submission_invitation_list.select_items"), "warning");
            return false;
        }

        sendEmails();
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

    handleSort(index, key, dir, func) {
        const {term, page, perPage, showNotSent, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, key, dir, showNotSent, tagFilter);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage, showNotSent, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNotSent, tagFilter);
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
        const {term, order, orderDir, showNotSent, tagFilter} = this.props;
        this.props.exportInvitationsCSV(term, order, orderDir, showNotSent, tagFilter);
    }

    handleTagFilterChange(ev) {
        const {term, order, page, orderDir, perPage, showNotSent} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNotSent, ev.target.value);
    }

    handleChangeNoSent() {
        const {term, order, page, orderDir, perPage, showNotSent, tagFilter} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, !showNotSent, tagFilter);
    }

    render(){

        const { currentSummit, invitations, term, order,
            orderDir, totalInvitations,
            lastPage, currentPage,
            selectedCount, showNotSent,
            currentFlowEvent, selectedAll,
            tagFilter,
            currentSelectionPlanId,
        } = this.props;

        const {showImportModal, importFile} = this.state;

        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'email', value: T.translate("submission_invitation_list.email") },
            { columnKey: 'first_name', value: T.translate("submission_invitation_list.first_name") },
            { columnKey: 'last_name', value: T.translate("submission_invitation_list.last_name") },
            { columnKey: 'is_sent', value: T.translate("submission_invitation_list.sent") },
            { columnKey: 'tags', value: T.translate("submission_invitation_list.tags"),render: (t) =>
                    t.tags_full.length > MaxTextLengthForTagsOnTable ?
                        <>
                            {`${t.tags}...`}&nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={t.tags_full}/>
                        </>
                        :
                        t.tags
            },
        ];

        const table_options = {
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

        let flowEventsDDL = [
            {label: T.translate("submission_invitation_list.placeholders.ddl_flow_event"), value: ''},
            {label: 'SUMMIT_SUBMISSION_INVITE_REGISTRATION', value: 'SUMMIT_SUBMISSION_INVITE_REGISTRATION'},
            {label: 'SUMMIT_SUBMISSION_REINVITE_REGISTRATION', value: 'SUMMIT_SUBMISSION_REINVITE_REGISTRATION'},
        ];

        let selectionPlansDDL = [
            {label: T.translate("submission_invitation_list.placeholders.ddl_selection_plan"), value: ''},
            ...currentSummit.selection_plans.map(sp => ({ label: sp.name, value: sp.id }))];

        return(
            <div>
                <div className="container">
                    <h3> {T.translate("submission_invitation_list.invitation_list")} ({totalInvitations})</h3>
                    <div className="actions-wrapper">
                        <div className="row">
                            <div className="col-md-6">
                                <FreeTextSearch
                                    value={term}
                                    placeholder={T.translate("submission_invitation_list.placeholders.search")}
                                    onSearch={this.handleSearch}
                                />
                            </div>
                            <div className="col-md-6 text-right">
                                <button className="btn btn-default right-space" onClick={() => this.setState({showImportModal:true})}>
                                    {T.translate("submission_invitation_list.import")}
                                </button>
                                <button className="btn btn-default right-space" onClick={this.handleExportInvitations}>
                                    {T.translate("submission_invitation_list.export")}
                                </button>
                                <button className="btn btn-primary right-space" onClick={this.handleNewInvitation}>
                                    {T.translate("submission_invitation_list.add_invitation")}
                                </button>
                                <button className="btn btn-danger" onClick={this.handleDeleteAll}>
                                    {T.translate("submission_invitation_list.delete_all_invitations")}
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
                                    placeholder={T.translate("submission_invitation_list.placeholders.tags")}
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
                                        {T.translate("submission_invitation_list.show_non_sent")}
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6 text-right">

                            </div>
                        </div>
                        <div className="row">
                            <div className={'row'}>
                                <div className={'col-md-5'}>
                                    <Dropdown
                                        id="flow_event"
                                        value={currentFlowEvent}
                                        onChange={this.handleChangeFlowEvent}
                                        options={flowEventsDDL}
                                    />
                                </div>
                                <div className={'col-md-5'}>
                                    <Dropdown
                                        id="selection_plan"
                                        value={currentSelectionPlanId}
                                        onChange={this.handleChangeSelectionPlan}
                                        options={selectionPlansDDL}
                                    />
                                </div>
                                <div className={'col-md-2'}>
                                    <button className="btn btn-primary right-space" onClick={this.handleSendEmails}>
                                        {T.translate("submission_invitation_list.send_emails")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {invitations.length === 0 &&
                    <div>{T.translate("submission_invitation_list.no_invitations")}</div>
                    }

                    { invitations.length > 0 &&
                    <div>
                        { selectedCount > 0 &&
                          <span><b>{T.translate("registration_invitation_list.items_qty", {qty:selectedCount})}</b></span>
                        }
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
                        <Modal.Title>{T.translate("submission_invitation_list.import_invitations")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                Format must be the following:<br />
                                <b>email</b>: invitee email<br />
                                <b>first_name</b>: invitee First Name<br />
                                <b>last_name</b>: invitee Last Name<br />
                                <b>tags (optional) </b>: Pipe Separated list of tags (string) <br />
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
                            {T.translate("submission_invitation_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, SubmmissionInvitationListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...SubmmissionInvitationListState
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
        deleteAllInvitations,
        deleteInvitation,
        setCurrentFlowEvent,
        setSelectedAll,
        sendEmails,
        setCurrentSelectionPlanId,
    }
)(SubmissionInvitationsListPage);
