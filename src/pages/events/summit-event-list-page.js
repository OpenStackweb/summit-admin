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
import {Modal, Pagination } from 'react-bootstrap';
import {FreeTextSearch, Table, UploadInput, Input} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getEvents, deleteEvent, exportEvents, importEventsCSV, importMP4AssetsFromMUX } from "../../actions/event-actions";
import {hasErrors} from "../../utils/methods";

class SummitEventListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewEvent = this.handleNewEvent.bind(this);
        this.handleDeleteEvent = this.handleDeleteEvent.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleChangeSendSpeakerEmail = this.handleChangeSendSpeakerEmail.bind(this);
        this.handleImportEvents = this.handleImportEvents.bind(this);
        this.handleMUXImport = this.handleMUXImport.bind(this);
        this.handleChangeMUXModal = this.handleChangeMUXModal.bind(this);
        this.handleImportAssetsFromMUX = this.handleImportAssetsFromMUX.bind(this);
        this.state = {
            showImportModal: false,
            send_speaker_email:false,
            showImportFromMUXModal: false,
            importFile:null,
            muxModalState: {
                mux_token_id: "",
                mux_token_secret: "",
                mux_email_to:"",
            },
            errors:{},
        }
    }

    handleChangeSendSpeakerEmail(ev){
        this.setState({...this.state, send_speaker_email: ev.target.checked});
    }

    handleChangeMUXModal(ev){
        const errors = {...this.state.errors};
        const muxModalState = {...this.state.muxModalState};
        let {value, id} = ev.target;
        errors[id] = '';
        muxModalState[id] = value;
        this.setState({...this.state, muxModalState: muxModalState, errors: errors});
    }

    handleMUXImport(ev){
        ev.preventDefault();
        this.setState({...this.state , showImportFromMUXModal: true});
    }

    handleImportAssetsFromMUX(ev){
        ev.preventDefault();
        this.props.importMP4AssetsFromMUX
        (
            this.state.muxModalState.mux_token_id,
            this.state.muxModalState.mux_token_secret,
            this.state.muxModalState.mux_email_to
        ).then(() => this.setState({...this.state, muxModalState:{mux_token_id:"",  mux_token_secret:"", mux_email_to:""}}))
    }

    handleImportEvents() {
        if (this.state.importFile) {
            this.props.importEventsCSV(this.state.importFile, this.state.send_speaker_email);
        }
        this.setState({...this.state, showImportModal:false, send_speaker_email:false, importFile: null});
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getEvents();
        }
    }

    handleEdit(event_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${event_id}`);
    }

    handleExport(ev) {
        const {term, order, orderDir} = this.props;
        ev.preventDefault();
        this.props.exportEvents(term, order, orderDir);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getEvents(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        key = (key === 'name') ? 'last_name' : key;
        this.props.getEvents(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getEvents(term, page, perPage, order, orderDir);
    }

    handleNewEvent(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/new`);
    }

    handleDeleteEvent(eventId) {
        const {deleteEvent, events} = this.props;
        let event = events.find(e => e.id === eventId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("event_list.delete_event_warning") + ' ' + event.title,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteEvent(eventId);
            }
        });
    }

    render(){
        const {currentSummit, events, lastPage, currentPage, term, order, orderDir, totalEvents} = this.props;

        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'type', value: T.translate("event_list.type") },
            { columnKey: 'title', value: T.translate("event_list.title"), sortable: true },
            { columnKey: 'status', value: T.translate("event_list.status") },
            { columnKey: 'speakers', value: T.translate("event_list.speakers") },
            { columnKey: 'created_by_fullname', value: T.translate("event_list.created_by") },
            { columnKey: 'published', value: T.translate("event_list.published") },
        ];

        const table_options = {
            sortCol: (order === 'last_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteEvent }
            }
        }

        if(!currentSummit.id) return(<div />);

        return(
            <div className="container">
                <h3> {T.translate("event_list.event_list")} ({totalEvents})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("event_list.placeholders.search_events")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewEvent}>
                            {T.translate("event_list.add_event")}
                        </button>
                        <button className="btn btn-default right-space" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                        <button className="btn btn-default right-space" onClick={this.handleMUXImport}>
                            {T.translate("event_list.mux_import")}
                        </button>
                        <button className="btn btn-default" onClick={() => this.setState({showImportModal:true})}>
                            {T.translate("event_list.import")}
                        </button>
                    </div>
                </div>

                {events.length === 0 &&
                    <div>{T.translate("event_list.no_events")}</div>
                }

                {events.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={events}
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

                <Modal show={this.state.showImportModal} onHide={() => this.setState({showImportModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("event_list.import_events")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                Format must be the following:<br />
                                (Minimal data required)<br />
                                * title ( text )<br />
                                * abstract (text )<br />
                                * type_id (int) or type (string type name)<br />
                                * track_id (int) or track ( string track name)<br />
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
                            <div className="col-md-12 checkboxes-div">
                                    <div className="form-check abc-checkbox">
                                        <input type="checkbox" id="send_speaker_email" checked={this.state.send_speaker_email}
                                               onChange={this.handleChangeSendSpeakerEmail} className="form-check-input" />
                                        <label className="form-check-label" htmlFor="send_speaker_email">
                                            {T.translate("event_list.send_speaker_email")}
                                        </label>
                                    </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button disabled={!this.state.importFile} className="btn btn-primary" onClick={this.handleImportEvents}>
                            {T.translate("event_list.ingest")}
                        </button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showImportFromMUXModal} onHide={() => this.setState({showImportFromMUXModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("event_list.mux_import")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-4">
                                <label> {T.translate("event_list.mux_token_id")}</label>
                                &nbsp;
                                <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("event_list.mux_token_id_info")} />
                                <Input
                                    id="mux_token_id"
                                    value={this.state.muxModalState.mux_token_id}
                                    onChange={this.handleChangeMUXModal}
                                    className="form-control"
                                    error={hasErrors('mux_token_id', this.state.errors)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label> {T.translate("event_list.mux_token_secret")}</label>
                                &nbsp;
                                <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("event_list.mux_token_secret_info")} />
                                <Input
                                    id="mux_token_secret"
                                    value={this.state.muxModalState.mux_token_secret}
                                    onChange={this.handleChangeMUXModal}
                                    className="form-control"
                                    error={hasErrors('mux_token_secret', this.state.errors)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label> {T.translate("event_list.mux_email_to")}</label>
                                &nbsp;
                                <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("event_list.mux_email_to_info")} />
                                <Input
                                    id="mux_email_to"
                                    type="email"
                                    value={this.state.muxModalState.mux_email_to}
                                    onChange={this.handleChangeMUXModal}
                                    className="form-control"
                                    error={hasErrors('mux_email_to', this.state.errors)}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleImportAssetsFromMUX}>
                            {T.translate("event_list.import")}
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentEventListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEvents,
        deleteEvent,
        exportEvents,
        importEventsCSV,
        importMP4AssetsFromMUX,
    }
)(SummitEventListPage);
