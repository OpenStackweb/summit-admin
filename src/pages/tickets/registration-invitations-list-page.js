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
import T from 'i18n-react/dist/i18n-react';
import {FreeTextSearch, Table, UploadInput} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import {exportInvitationsCSV, getInvitations, importInvitationsCSV, resendNonAcceptedInvitations}
from "../../actions/registration-invitation-actions";
import {Breadcrumb} from "react-breadcrumbs";
import {Modal, Pagination} from "react-bootstrap";


class RegistrationInvitationsListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleImportInvitations = this.handleImportInvitations.bind(this);
        this.handleExportInvitations = this.handleExportInvitations.bind(this);
        this.handleResendNonAccepted = this.handleResendNonAccepted.bind(this);
        this.handleChangeNonAccepted = this.handleChangeNonAccepted.bind(this);

        this.state = {
            showImportModal: false,
            importFile: null
        }
    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getInvitations('', 1, 10);
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id !== newProps.currentSummit.id) {
            this.props.getInvitations();
        }
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage, showNonAccepted} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted);
    }

    handleEdit(invitation_id) {
        let {currentSummit, history, invitations} = this.props;
        let invitation = invitations.find(i => i.id === invitations);
        //history.push(`/app/summits/${currentSummit.id}/purchase-orders/${ticket.order_id}/tickets/${ticket_id}`);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage, showNonAccepted} = this.props;
        this.props.getInvitations(term, page, perPage, key, dir, showNonAccepted);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage, showNonAccepted} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, showNonAccepted);
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
        let {term, order, orderDir, showNonAccepted} = this.props;
        this.props.exportInvitationsCSV(term, order, orderDir, showNonAccepted);
    }

    handleResendNonAccepted(){
        this.props.resendNonAcceptedInvitations();
    }

    handleChangeNonAccepted() {
        let {term, order, page, orderDir, perPage, showNonAccepted} = this.props;
        this.props.getInvitations(term, page, perPage, order, orderDir, !showNonAccepted);
    }

    render(){
        let {currentSummit, invitations, term, order, orderDir, totalInvitations, lastPage, currentPage, match, showNonAccepted} = this.props;
        let {showImportModal, importFile} = this.state;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'email', value: T.translate("registration_invitation_list.email") },
            { columnKey: 'first_name', value: T.translate("registration_invitation_list.first_name") },
            { columnKey: 'last_name', value: T.translate("registration_invitation_list.last_name") },
            { columnKey: 'is_accepted', value: T.translate("registration_invitation_list.accepted") },
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
            }
        }

        if(!currentSummit.id) return (<div></div>);

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("registration_invitation_list.invitation_list"), pathname: match.url }} ></Breadcrumb>

                <div className="container">
                    <h3> {T.translate("registration_invitation_list.invitation_list")} ({totalInvitations})</h3>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <FreeTextSearch
                                value={term}
                                placeholder={T.translate("registration_invitation_list.placeholders.search_invitations")}
                                onSearch={this.handleSearch}
                            />
                            <div className="form-check abc-checkbox">
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
                            <button className="btn btn-default right-space" onClick={() => this.setState({showImportModal:true})}>
                                {T.translate("registration_invitation_list.import")}
                            </button>
                            <button className="btn btn-default right-space" onClick={this.handleExportInvitations}>
                                {T.translate("registration_invitation_list.export")}
                            </button>
                            <button className="btn btn-default" onClick={this.handleResendNonAccepted}>
                                {T.translate("registration_invitation_list.resend_non_accepted_invitations")}
                            </button>
                        </div>
                    </div>

                    {invitations.length == 0 &&
                    <div>{T.translate("registration_invitation_list.no_invitations")}</div>
                    }

                    {invitations.length > 0 &&
                    <div>
                        <Table
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
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getInvitations,
        importInvitationsCSV,
        exportInvitationsCSV,
        resendNonAcceptedInvitations,
    }
)(RegistrationInvitationsListPage);
