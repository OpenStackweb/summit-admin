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
import {Modal, Pagination} from 'react-bootstrap';
import { FreeTextSearch, SelectableTable, Dropdown, Input } from 'openstack-uicore-foundation/lib/components';
import {
    initSpeakersList,
    getSpeakersBySummit,
    exportSummitSpeakers,
    selectSummitSpeaker,
    unselectSummitSpeaker,
    selectAllSummitSpeakers,
    unselectAllSummitSpeakers,
    setCurrentFlowEvent,
    sendSpeakerEmails
} from "../../actions/speaker-actions";
import {
    initSubmittersList,
    getSubmittersBySummit,
    exportSummitSubmitters,
    selectSummitSubmitter,
    unselectSummitSubmitter,
    selectAllSummitSubmitters,
    unselectAllSummitSubmitters,
    setCurrentSubmitterFlowEvent,
    sendSubmitterEmails
} from "../../actions/submitter-actions";

import { SpeakersSources as sources } from "../../utils/constants";

class SummitSpeakersListPage extends React.Component {
    constructor(props) {
        super(props);

        this.getSubjectProps = this.getSubjectProps.bind(this);
        this.export = this.export.bind(this);
        this.getBySummit = this.getBySummit.bind(this);
        this.handleSpeakerSubmitterSourceChange = this.handleSpeakerSubmitterSourceChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.handleSelectedAll = this.handleSelectedAll.bind(this);
        this.handleChangeSelectionPlanFilter = this.handleChangeSelectionPlanFilter.bind(this);
        this.handleChangeTrackFilter = this.handleChangeTrackFilter.bind(this);
        this.handleChangeActivityTypeFilter = this.handleChangeActivityTypeFilter.bind(this);
        this.handleChangeSelectionStatusFilter = this.handleChangeSelectionStatusFilter.bind(this);
        this.handleChangeFlowEvent = this.handleChangeFlowEvent.bind(this);
        this.showEmailSendModal = this.showEmailSendModal.bind(this);
        this.handleSendEmails = this.handleSendEmails.bind(this);

        this.state = {
            testRecipient: '',
            showSendEmailModal: false,
            excerptRecipient: '',
            source: sources.speakers,
        };
    }

    componentDidMount() {
        const { currentSummit, initSubmittersList, initSpeakersList } = this.props;
        initSubmittersList();
        initSpeakersList();
        if (currentSummit) {
            const { term, page, order, orderDir, perPage, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
            this.getBySummit(term, page, perPage, order, orderDir, {
                selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    getSubjectProps() {
        const { source } = this.state;
        return source === sources.speakers ? this.props.speakersProps : this.props.submittersProps;
    }

    getBySummit(term, page, perPage, order, orderDir, filters) {
        const { source } = this.state;
        const callable = source === sources.speakers ? this.props.getSpeakersBySummit : this.props.getSubmittersBySummit;
        callable(term, page, perPage, order, orderDir, filters, source);
    }

    export(term, order, orderDir, filters) {
        const { source } = this.state;
        const callable = source === sources.speakers ? this.props.exportSummitSpeakers : this.props.exportSummitSubmitters;
        callable(term, order, orderDir, filters, source);
    }

    handleSpeakerSubmitterSourceChange(ev) {
        const { value } = ev.target;
        const { term, order, orderDir, perPage, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        const { initSubmittersList, initSpeakersList } = this.props;
        this.setState({...this.state, source: value}, function() {
            initSubmittersList();
            initSpeakersList();
            this.getBySummit(term, 1, perPage, order, orderDir, {
                selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
            });
        });
    }

    handleEdit(itemId) {
        if (this.state.source === sources.speakers) {
            const { history } = this.props;
            history.push(`/app/speakers/${itemId}`);
        }
    }

    handlePageChange(page) {
        const { term, order, orderDir, perPage, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir, {
            selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
        });
    }

    handleSort(index, key, dir, func) {
        const { term, page, perPage, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, key, dir, {
            selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
        });
    }

    handleSearch(term) {
        const { order, orderDir, page, perPage, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir,
        {
            selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
        });
    }

    handleChangeSelectionPlanFilter(ev) {
        const { value: newSelectionPlanFilter } = ev.target;
        const { term, order, page, orderDir, perPage, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir,
            {
                selectionPlanFilter: newSelectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter
            });
    }

    handleChangeTrackFilter(ev) {
        const { value: newTrackFilter } = ev.target;
        const { term, order, page, orderDir, perPage, selectionPlanFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir,
            {
                selectionPlanFilter, trackFilter: newTrackFilter, activityTypeFilter, selectionStatusFilter
            });
    }

    handleChangeActivityTypeFilter(ev) {
        const { value: newActivityTypeFilter } = ev.target;
        const { term, order, page, orderDir, perPage, selectionPlanFilter, trackFilter, selectionStatusFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir,
            {
                selectionPlanFilter, trackFilter, activityTypeFilter: newActivityTypeFilter, selectionStatusFilter
            });
    }

    handleChangeSelectionStatusFilter(ev) {
        let { value: newSelectionStatusFilter } = ev.target;
        // exclusive filters tests ....
        if(newSelectionStatusFilter.includes('only_rejected')){
            newSelectionStatusFilter = ['only_rejected'];
        }
        else if(newSelectionStatusFilter.includes('only_alternate')){
            newSelectionStatusFilter = ['only_alternate'];
        }
        else if(newSelectionStatusFilter.includes('only_accepted')){
            newSelectionStatusFilter = ['only_accepted'];
        }
        else if(newSelectionStatusFilter.includes('accepted_alternate')){
            newSelectionStatusFilter = ['accepted_alternate'];
        }
        else if(newSelectionStatusFilter.includes('accepted_rejected')){
            newSelectionStatusFilter = ['accepted_rejected'];
        }
        else if(newSelectionStatusFilter.includes('alternate_rejected')){
            newSelectionStatusFilter = ['alternate_rejected'];
        }

        const { term, order, page, orderDir, perPage, selectionPlanFilter, trackFilter, activityTypeFilter } = this.getSubjectProps();
        this.getBySummit(term, page, perPage, order, orderDir,
            {
                selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter: newSelectionStatusFilter
            });
    }

    handleChangeFlowEvent(ev) {
        const { value, id } = ev.target;
        const { source } = this.state;
        source === sources.speakers ? this.props.setCurrentFlowEvent(value) : this.props.setCurrentSubmitterFlowEvent(value);
    }

    handleSendEmails(ev){
        ev.stopPropagation();
        ev.preventDefault();
        const { testRecipient, source } = this.state;
        const isSpeakerMode = source === sources.speakers;
        let excerptRecipient = this.ingestEmailRef.value;
        let shouldSendCopy2Submitter = isSpeakerMode && this.shouldSendCopy2SubmitterRef.checked
        this.setState({showSendEmailModal: false, excerptRecipient: '', testRecipient: ''});
        // send emails

        const {
            selectedAll, term, selectedItems, currentFlowEvent, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter,
        } = this.getSubjectProps();

        const callable = isSpeakerMode ? this.props.sendSpeakerEmails : this.props.sendSubmitterEmails;

        callable(currentFlowEvent, selectedAll, selectedItems, testRecipient, excerptRecipient, shouldSendCopy2Submitter, term,
            { selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter }, source)
    }

    showEmailSendModal(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        const { source } = this.state;
        const {
            selectedAll, selectedItems, currentFlowEvent
        } = this.getSubjectProps();

        if (!currentFlowEvent) {
            Swal.fire("Validation error", T.translate("summit_speakers_list.select_template"), "warning");
            return false;
        }

        if (!selectedAll && selectedItems.length === 0) {
            const content = source === sources.speakers ? 
                T.translate("summit_speakers_list.select_items") : T.translate("summit_submitters_list.select_items");
            Swal.fire("Validation error", content, "warning");
            return false;
        }

        this.setState({...this.state,
            showSendEmailModal: true,
            excerptRecipient: ''});
    }

    handleExport(ev) {
        const { term, order, orderDir, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter } = this.getSubjectProps();
        ev.preventDefault();
        this.export(term, order, orderDir,{ selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter });
    }

    handleSelected(item_id, isSelected) {
        const { source } = this.state;
        if (isSelected) {
            source === sources.speakers ? this.props.selectSummitSpeaker(item_id) : this.props.selectSummitSubmitter(item_id);
            return;
        }
        source === sources.speakers ? this.props.unselectSummitSpeaker(item_id) : this.props.unselectSummitSubmitter(item_id);
    }

    handleSelectedAll(ev) {
        let selectedAll = ev.target.checked;
        const { source } = this.state;
        source === sources.speakers ? this.props.selectAllSummitSpeakers() : this.props.selectAllSummitSubmitters();
        if (!selectedAll) {
            //clear all selected
            source === sources.speakers ? this.props.unselectAllSummitSpeakers() : this.props.unselectAllSummitSubmitters();
        }
    }

    render() {
        const { currentSummit } = this.props;

        const { testRecipient, source } = this.state;

        const { items, lastPage, currentPage, term, order, orderDir, totalItems, selectedItems,
            selectedAll, selectionPlanFilter, trackFilter, activityTypeFilter, selectionStatusFilter, currentFlowEvent } = this.getSubjectProps();

        const columns = [
            { columnKey: 'full_name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'email', value: T.translate("general.email"), sortable: true },
            { columnKey: 'accepted_presentations_count', value: T.translate("summit_speakers_list.accepted") },
            { columnKey: 'alternate_presentations_count', value: T.translate("summit_speakers_list.alternate") },
            { columnKey: 'rejected_presentations_count', value: T.translate("summit_speakers_list.rejected") },
        ];

        const selectionPlansDDL = currentSummit.selection_plans.map(selectionPlan => ({ label: selectionPlan.name, value: selectionPlan.id }));
        const tracksDDL = currentSummit.tracks.map(track => ({ label: track.name, value: track.id }));
        const activityTypesDDL = currentSummit.event_types.map(type => ({ label: type.name, value: type.id }));
        
        const selectionStatusDDL = [
            { label: 'Accepted', value: 'accepted' },
            { label: 'Alternate', value: 'alternate' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Only Rejected', value: 'only_rejected' },
            { label: 'Only Accepted', value: 'only_accepted' },
            { label: 'Only Alternate', value: 'only_alternate' },
            { label: 'Accepted/Alternate', value: 'accepted_alternate' },
            { label: 'Accepted/Rejected', value: 'accepted_rejected' },
            { label: 'Alternate/Rejected', value: 'alternate_rejected' },
        ];

        const speakerSubmitterSourceSelectorDDL = [
            { label: T.translate("summit_speakers_list.speakers"), value: sources.speakers },
            { label: T.translate("summit_submitters_list.submitters"), value: sources.submitters },
            { label: T.translate("summit_submitters_list.submitters_no_speakers"), value: sources.submitters_no_speakers }
        ];

        let emailFlowDDL = this.state.source === sources.speakers ? [
            { label: '-- SELECT EMAIL EVENT --', value: '' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_ALTERNATE', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_ALTERNATE' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_REJECTED', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_REJECTED' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ALTERNATE_REJECTED', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ALTERNATE_REJECTED' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ACCEPTED_ONLY' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ALTERNATE_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_ALTERNATE_ONLY' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_REJECTED_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SPEAKER_REJECTED_ONLY' },
        ] : [
            { label: '-- SELECT EMAIL EVENT --', value: '' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_ALTERNATE', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_ALTERNATE' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_REJECTED', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_REJECTED' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ALTERNATE_REJECTED', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ALTERNATE_REJECTED' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ACCEPTED_ONLY' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ALTERNATE_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_ALTERNATE_ONLY' },
            { label: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_REJECTED_ONLY', value: 'SUMMIT_SUBMISSIONS_PRESENTATION_SUBMITTER_REJECTED_ONLY' },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {
                    onClick: this.handleEdit,
                    onSelected: this.handleSelected,
                    onSelectedAll: this.handleSelectedAll
                }
            },
            selectedIds: selectedItems,
            selectedAll: selectedAll,
        }

        if (!currentSummit.id) return (<div />);

        return (
            <div className="container">
                <h3> {
                    this.state.source === sources.speakers ?
                    T.translate("summit_speakers_list.summit_speakers_list") : 
                    T.translate("summit_submitters_list.summit_submitters_list")
                } ({totalItems})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("summit_speakers_list.placeholders.search_speakers")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-3">
                        <Dropdown
                            id="speakerSubmitterSourceSelector"
                            value={source}
                            onChange={this.handleSpeakerSubmitterSourceChange}
                            options={speakerSubmitterSourceSelectorDDL}
                            isClearable={false}
                            placeholder={"Select a source"}
                        />
                    </div>
                    <div className="col-md-3 text-right">
                        <button className="btn btn-default right-space" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                    </div>
                </div>
                <div className='row'>
                    <div className="col-md-3" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="selectionPlanFilter"
                            value={selectionPlanFilter}
                            onChange={this.handleChangeSelectionPlanFilter}
                            options={selectionPlansDDL}
                            isClearable={true}
                            placeholder={"Filter By Selection Plan"}
                            isMulti
                        />
                    </div>
                    <div className="col-md-3" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="trackFilter"
                            value={trackFilter}
                            onChange={this.handleChangeTrackFilter}
                            options={tracksDDL}
                            isClearable={true}
                            placeholder={"Filter By Track"}
                            isMulti
                        />
                    </div>
                    <div className="col-md-3" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="activityTypeFilter"
                            value={activityTypeFilter}
                            onChange={this.handleChangeActivityTypeFilter}
                            options={activityTypesDDL}
                            isClearable={true}
                            placeholder={"Filter By Activity Type"}
                            isMulti
                        />
                    </div>
                    <div className="col-md-3" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="selectionStatusFilter"
                            value={selectionStatusFilter}
                            onChange={this.handleChangeSelectionStatusFilter}
                            options={selectionStatusDDL}
                            isClearable={true}
                            placeholder={"Filter By Selection Status"}
                            isMulti
                        />
                    </div>
                </div>

                <div className='row'>
                    <div className="col-md-6" style={{ height: "61px", paddingTop: "8px" }}>
                        <Dropdown
                            id="activityTypeFilter"
                            value={currentFlowEvent}
                            onChange={this.handleChangeFlowEvent}
                            options={emailFlowDDL}
                            isClearable={true}
                        />
                    </div>
                    <div className={'col-md-4'} style={{ height: "61px", paddingTop: "8px" }}>
                        <Input
                            value={testRecipient}
                            onChange={(ev) => this.setState({ testRecipient: ev.target.value })}
                            placeholder={T.translate("summit_speakers_list.placeholders.test_recipient")}

                        />
                    </div>
                    <div className={'col-md-2'} style={{ height: "61px", paddingTop: "8px" }}>
                        <button className="btn btn-default right-space" onClick={this.showEmailSendModal}>
                            {T.translate("summit_speakers_list.send_emails")}
                        </button>
                    </div>
                </div>

                {items.length === 0 &&
                    <div>{
                        this.state.source === sources.speakers ?
                            T.translate("summit_speakers_list.no_speakers") : 
                            T.translate("summit_submitters_list.no_submitters")
                    }</div>
                }

                {items.length > 0 &&
                    <div>
                        <SelectableTable
                            options={table_options}
                            data={items}
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

                        <Modal show={this.state.showSendEmailModal} onHide={() => this.setState({...this.state, showSendEmailModal:false})} backdrop={false} >
                            <Modal.Header closeButton>
                                <Modal.Title>{
                                    this.state.source === sources.speakers ?
                                        T.translate("summit_speakers_list.send_emails_title") : 
                                        T.translate("summit_submitters_list.send_emails_title")
                                }</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="row">
                                    <div className="col-md-12">
                                        This will trigger a background EMAIL BATCH to selected speakers
                                    </div>
                                    { this.state.testRecipient !== '' &&
                                    <div className="col-md-12">
                                        BLAST IS ON TEST MODE ( all emails would be sent to {this.state.testRecipient} )
                                    </div>
                                    }
                                    <br />
                                    <br />
                                    <br />
                                    <div className="col-md-12 ticket-ingest-email-wrapper">
                                        <label>{T.translate("summit_speakers_list.excerpt_email")}</label><br/>
                                        <input
                                            id="ingest_email"
                                            className="form-control"
                                            ref={node => this.ingestEmailRef = node}
                                        />
                                    </div>
                                    { this.state.source === sources.speakers &&
                                    <div className="col-md-12 ticket-ingest-email-wrapper">
                                        <div className="form-check abc-checkbox">
                                            <input
                                                id="should_send_copy_2_submitter"
                                                className="form-check-input"
                                                type="checkbox"
                                                ref={node => this.shouldSendCopy2SubmitterRef = node}
                                            />
                                            <label className="form-check-label" htmlFor="should_send_copy_2_submitter">
                                                {T.translate("summit_speakers_list.should_send_copy_2_submitter")}
                                            </label>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn btn-primary" onClick={this.handleSendEmails}>
                                    {T.translate("summit_speakers_list.send_emails")}
                                </button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSummitSpeakersListState, currentSummitSubmittersListState }) => ({
    currentSummit: currentSummitState.currentSummit,
    speakersProps: currentSummitSpeakersListState,
    submittersProps: currentSummitSubmittersListState
})

export default connect(
    mapStateToProps,
    {
        initSpeakersList,
        getSpeakersBySummit,
        exportSummitSpeakers,
        selectSummitSpeaker,
        unselectSummitSpeaker,
        selectAllSummitSpeakers,
        unselectAllSummitSpeakers,
        setCurrentFlowEvent,
        sendSpeakerEmails,
        initSubmittersList,
        getSubmittersBySummit,
        exportSummitSubmitters,
        selectSummitSubmitter,
        unselectSummitSubmitter,
        selectAllSummitSubmitters,
        unselectAllSummitSubmitters,
        setCurrentSubmitterFlowEvent,
        sendSubmitterEmails
    }
)(SummitSpeakersListPage);
