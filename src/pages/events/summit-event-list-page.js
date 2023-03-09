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
import { 
    FreeTextSearch, 
    Table, 
    UploadInput, 
    Input, 
    TagInput, 
    SpeakerInput, 
    Dropdown, 
    DateTimePicker, 
    OperatorInput,
    MemberInput,
    CompanyInput } from 'openstack-uicore-foundation/lib/components';
import { SegmentedControl } from 'segmented-control'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import { getSummitById }  from '../../actions/summit-actions';
import { getEvents, deleteEvent, exportEvents, importEventsCSV, importMP4AssetsFromMUX } from "../../actions/event-actions";
import {hasErrors} from "../../utils/methods";
import '../../styles/summit-event-list-page.less';

const fieldNames = [
    { columnKey: 'speakers', value: 'speakers' },
    { columnKey: 'created_by_fullname', value: 'created_by', sortable: true },
    { columnKey: 'published_date', value: 'published' },
    { columnKey: 'duration', value: 'duration', sortable: true },
    { columnKey: 'speakers_count', value: 'speakers_count', sortable: true },
    { columnKey: 'speaker_company', value: 'speaker_company', sortable: true },
    { columnKey: 'track', value: 'track' },
    { columnKey: 'start_date', value: 'start_date', sortable: true },
    { columnKey: 'end_date', value: 'end_date', sortable: true },
    { columnKey: 'submitters', value: 'submitters' },
    { columnKey: 'submitter_company', value: 'submitter_company', sortable: true },
    { columnKey: 'streaming_url', value: 'streaming_url' },
    { columnKey: 'meeting_url', value: 'meeting_url' },
    { columnKey: 'etherpad_url', value: 'etherpad_url' },
    { columnKey: 'streaming_type', value: 'streaming_type' },
    { columnKey: 'sponsor', value: 'sponsor', sortable: true }
]

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
        this.handleExtraFilterChange = this.handleExtraFilterChange.bind(this);
        this.handleTagOrSpeakerFilterChange = this.handleTagOrSpeakerFilterChange.bind(this);        
        this.handleSetPublishedFilter = this.handleSetPublishedFilter.bind(this);
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.handleApplyEventFilters = this.handleApplyEventFilters.bind(this);
        this.handleFiltersChange = this.handleFiltersChange.bind(this);
        this.handleColumnsChange = this.handleColumnsChange.bind(this);
        this.handleDDLSortByLabel = this.handleDDLSortByLabel.bind(this);
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
            enabledFilters: [],
            errors:{},
            eventFilters: {
                event_type_capacity_filter: [],
                selection_plan_id_filter: [],
                location_id_filter: [],
                selection_status_filter: [],
                track_id_filter: [],
                event_type_id_filter: [],
                speaker_id_filter: [],
                speaker_company: [],
                level_filter: [],
                tags_filter: [],
                published_filter: null,
                start_date_filter: Array(2).fill(null),
                end_date_filter: Array(2).fill(null),
                duration_filter: '',
                speakers_count_filter: '',
                submitters: [],
                submitter_company: [],
                streaming_url: '',
                meeting_url: '',
                etherpad_url: '',
                streaming_type: '',
                sponsor: [],
                all_companies: []
            },
            selectedColumns: []
        };

        this.extraFilters = {
            allows_attendee_vote_filter: false,
            allows_location_filter: false,
            allows_publishing_dates_filter: false            
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
        const {currentSummit, filters, extraColumns, term, order, orderDir} = this.props;
        const {eventFilters} = this.state;
        const  enabledFilters = Object.keys(filters).filter(e => filters[e]?.length > 0 && filters[e].some(e => e !== null));

        this.setState({
            ...this.state, 
            selectedColumns: extraColumns,
            enabledFilters: enabledFilters,
            eventFilters: {...eventFilters, ...filters}
        });

        if(currentSummit) {
            this.props.getEvents(term, 1, 10, order, orderDir, filters, extraColumns)
        }
    }

    handleEdit(event_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${event_id}`);
    }

    handleExport(ev) {
        const {term, order, orderDir} = this.props;
        const {eventFilters, selectedColumns} = this.state;
        ev.preventDefault();
        this.props.exportEvents(term, order, orderDir, eventFilters, selectedColumns);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        const {eventFilters, selectedColumns} = this.state;
        this.props.getEvents(term, page, perPage, order, orderDir, eventFilters, selectedColumns);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        const {eventFilters, selectedColumns} = this.state;
        key = (key === 'name') ? 'last_name' : key;
        key = (key === 'submitter_company') ? 'created_by_company' : key;
        this.props.getEvents(term, page, perPage, key, dir, eventFilters, selectedColumns);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        const {eventFilters, selectedColumns} = this.state;
        this.props.getEvents(term, page, perPage, order, orderDir, eventFilters, selectedColumns);
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

    handleApplyEventFilters() {
        const {term, order, orderDir, page, perPage} = this.props;
        const {eventFilters, selectedColumns} = this.state;
        this.props.getEvents(term, page, perPage, order, orderDir, eventFilters, selectedColumns);
    }

    handleExtraFilterChange(ev) {
        let {value, type, id} = ev.target;
        if (type === 'operatorinput') {
            value = Array.isArray(value) ? value : `${ev.target.operator}${ev.target.value}`;
            if(id === 'duration_filter') {
                value = Array.isArray(value) ? value : `${ev.target.operator}${ev.target.value}`;
            }
        }
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, [id]: value}});
    }

    handleTagOrSpeakerFilterChange(ev) {
        let {value, id} = ev.target;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, [id]: value}});
    }    

    handleSetPublishedFilter(ev) {
        this.extraFilters.published_filter = ev;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, published_filter: ev}});
    }

    handleFiltersChange(ev) {
        const {value} = ev.target;
        if(value.length < this.state.enabledFilters.length) {
            if(value.length === 0) {
                const resetFilters = {
                    event_type_capacity_filter: [],
                    selection_plan_id_filter: [],
                    location_id_filter: [],
                    selection_status_filter: [],
                    track_id_filter: [],
                    event_type_id_filter: [],
                    speaker_id_filter: [],
                    speaker_company: [],
                    level_filter: [],
                    tags_filter: [],
                    published_filter: null,
                    start_date_filter: Array(2).fill(null),
                    end_date_filter: Array(2).fill(null),
                    duration_filter: '',
                    speakers_count_filter: '',
                    submitters: [],
                    submitter_company: [],
                    streaming_url: '',
                    meeting_url: '',
                    etherpad_url: '',
                    streaming_type: '',
                    sponsor: [],
                    all_companies: []
                };
                this.setState({...this.state, enabledFilters: value, eventFilters: resetFilters});
            } else {
                const removedFilter = this.state.enabledFilters.filter(e => !value.includes(e))[0];            
                const defaultValue = removedFilter === 'published_filter' ? null : Array.isArray(this.state.eventFilters[removedFilter]) ? [] : '';
                let newEventFilters = {...this.state.eventFilters, [removedFilter]: defaultValue};                
                this.setState({...this.state, enabledFilters: value, eventFilters: newEventFilters});
            }
        } else {
            this.setState({...this.state, enabledFilters: value})
        }
    }

    handleChangeStartDate(ev, lastDate) {
        const {value} = ev.target;
        const {start_date_filter} = this.state.eventFilters;

        this.setState({...this.state, eventFilters: {
            ...this.state.eventFilters, 
            start_date_filter: lastDate ? [start_date_filter[0], value.unix()] : [value.unix(), start_date_filter[1]]
        }});
    }

    handleChangeEndDate(ev, lastDate) {
        const {value} = ev.target;
        const {end_date_filter} = this.state.eventFilters;

        this.setState({...this.state, eventFilters: {
            ...this.state.eventFilters, 
            end_date_filter: lastDate ? [end_date_filter[0], value.unix()] : [value.unix(), end_date_filter[1]]
        }});
    }

    handleFiltersChange(ev) {
        const {value} = ev.target;
        if(value.length < this.state.enabledFilters.length) {
            if(value.length === 0) {
                const resetFilters = {
                    event_type_capacity_filter: [],
                    selection_plan_id_filter: [],
                    location_id_filter: [],
                    selection_status_filter: [],
                    track_id_filter: [],
                    event_type_id_filter: [],
                    speaker_id_filter: [],
                    speaker_company: [],
                    level_filter: [],
                    tags_filter: [],
                    published_filter: null,
                    start_date_filter: Array(2).fill(null),
                    end_date_filter: Array(2).fill(null),
                    duration_filter: '',
                    speakers_count_filter: '',
                    submitters: [],
                    submitter_company: [],
                    streaming_url: '',
                    meeting_url: '',
                    etherpad_url: '',
                    streaming_type: '',
                    sponsor: [],
                    all_companies: []
                };
                this.setState({...this.state, enabledFilters: value, eventFilters: resetFilters});
            } else {
                const removedFilter = this.state.enabledFilters.filter(e => !value.includes(e))[0];            
                const defaultValue = removedFilter === 'published_filter' ? null : Array.isArray(this.state.eventFilters[removedFilter]) ? [] : '';
                this.setState({...this.state, enabledFilters: value, eventFilters: {...this.state.eventFilters, [removedFilter]: defaultValue}});
            }
        } else {
            this.setState({...this.state, enabledFilters: value})
        }
    }

    handleColumnsChange(ev) {
        const {value} = ev.target;
        const {selectedColumns} = this.state;
        let newColumns = value;
        const all_companies = ['submitter_company', 'speaker_company', 'sponsor'];
        
        if(selectedColumns.includes('all_companies') && !newColumns.includes('all_companies')) {
            newColumns = [...newColumns.filter(e => !all_companies.includes(e))];
        }      
        const selectedCompanies = selectedColumns.filter(c => all_companies.includes(c)).length;
        const newCompanies = newColumns.filter(c => all_companies.includes(c)).length
        if(newColumns.includes('all_companies')) {
            if(newColumns.filter(c => all_companies.includes(c)).length === 0) {
                newColumns = [...this.state.selectedColumns, ...all_companies, 'all_companies'];
            } else if (selectedCompanies === newCompanies) {
                newColumns = [...this.state.selectedColumns, ...all_companies, 'all_companies'];
            } else if (newCompanies < selectedCompanies) {                
                newColumns = [...newColumns.filter(c => c !== 'all_companies')];
            } 
        }          

        this.setState({...this.state, selectedColumns: newColumns})
    }

    handleDDLSortByLabel(ddlArray) {
        return ddlArray.sort((a, b) => a.label.localeCompare(b.label));
    }


    render(){
        const {currentSummit, events, lastPage, currentPage, term, order, orderDir, totalEvents, extraColumns, filters} = this.props;
        const {enabledFilters, eventFilters} = this.state;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'type', value: T.translate("event_list.type") },
            { columnKey: 'title', value: T.translate("event_list.title"), sortable: true },
            { columnKey: 'selection_status', value: T.translate("event_list.selection_status") }            
        ];

        const table_options = {
            sortCol: (order === 'last_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteEvent }
            }
        }

        const selection_plans_ddl = currentSummit.selection_plans?.sort((a,b) => a.order - b.order).map((sp => ({label: sp.name, value: sp.id})));

        const location_ddl = currentSummit.locations?.sort((a,b) => a.order - b.order).map((l => ({label: l.name, value: l.id})));

        const selection_status_ddl = [
            {label: 'Accepted', value: 'selected'},
            {label: 'Rejected', value: 'rejected'},
            {label: 'Alternate', value: 'alternate'},
        ];

        const track_ddl = currentSummit.tracks?.sort((a,b) => a.order - b.order).map((t => ({label: t.name, value: t.id})));

        const event_type_ddl = currentSummit.event_types?.sort((a,b) => a.order - b.order).map((t => ({label: t.name, value: t.id})));

        const level_ddl = [
            {label: 'Beginner', value: 'beginner'},
            {label: 'Intermediate', value: 'intermediate'},
            {label: 'Advanced', value: 'advanced'},
            {label: 'N/A', value: 'na'},
        ];

        const streaming_type_ddl = [{ label: 'LIVE', value: 'LIVE' }, { label: 'VOD', value: 'VOD' }];

        const filters_ddl = [
            {label: 'Activity Type Capacity', value: 'event_type_capacity_filter'},
            {label: 'Selection Plan', value: 'selection_plan_id_filter'},
            {label: 'Activity Type', value: 'event_type_id_filter'},
            {label: 'Activity Category', value: 'track_id_filter'},
            {label: 'Duration', value: 'duration_filter'},
            {label: 'Level', value: 'level_filter'},
            {label: 'Etherpad URL', value: 'etherpad_url'}, 
            {label: 'Location', value: 'location_id_filter'},
            {label: 'Selection Plan', value: 'selection_plan_id_filter'},
            {label: 'Meeting URL', value: 'meeting_url'},
            {label: 'Published Status', value: 'published_filter'},    
            {label: 'Speakers', value: 'speaker_id_filter'},
            {label: 'Speakers Companies', value: 'speaker_company'},
            {label: 'Level', value: 'level_filter'},
            {label: 'Tags', value: 'tags_filter'},
            {label: 'Start Date', value: 'start_date_filter'},
            {label: 'End Date', value: 'end_date_filter'},
            {label: 'Duration', value: 'duration_filter'},
            {label: 'Speakers Count', value: 'speakers_count_filter'},
            {label: 'Submitter', value: 'submitters'},
            {label: 'Submitter Company', value: 'submitter_company'},
            {label: 'Selection Status', value: 'selection_status_filter'},
            {label: 'Stream URL', value: 'streaming_url'},
            {label: 'Streaming Type', value: 'streaming_type'},
            {label: 'Sponsors', value: 'sponsor'},
            {label: 'All Companies', value: 'all_companies'},            
        ]

        const ddl_columns = [
            { value: 'all_companies', label: T.translate("event_list.all_companies") },
            { value: 'created_by_fullname', label: T.translate("event_list.created_by") },
            { value: 'duration', label: T.translate("event_list.duration") },
            { value: 'end_date', label: T.translate("event_list.end_date") },
            { value: 'published_date', label: T.translate("event_list.published") },
            { value: 'speaker_company', label: T.translate("event_list.speaker_company") },
            { value: 'speakers_count', label: T.translate("event_list.speakers_count") },
            { value: 'speakers', label: T.translate("event_list.speakers") },
            { value: 'sponsor', label: T.translate("event_list.sponsor") },
            { value: 'start_date', label: T.translate("event_list.start_date") },
            { value: 'submitter_company', label: T.translate("event_list.submitter_company")},
            { value: 'track', label: T.translate("event_list.track") },
        ];

        const ddl_filterByEventTypeCapacity = [
            {value: 'allows_attendee_vote_filter', label: T.translate("event_list.allows_attendee_vote_filter")},
            {value: 'allows_location_filter', label: T.translate("event_list.allows_location_filter")},
            {value: 'allows_publishing_dates_filter', label: T.translate("event_list.allows_publishing_dates_filter")}
        ]

        let showColumns = fieldNames
        .filter(f => this.state.selectedColumns.includes(f.columnKey) )
        .map( f2 => (
            {   columnKey: f2.columnKey,
                value: T.translate(`event_list.${f2.value}`),
                sortable: f2.sortable
            }));

        columns = [...columns, ...showColumns];

        if(!currentSummit.id) return(<div />);

        return(
            <div className="container summit-event-list-filters">
                <h3> {T.translate("event_list.event_list")} ({totalEvents})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("event_list.placeholders.search_events")}
                            title={T.translate("event_list.placeholders.search_events")}
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
                <hr/>
                <div className={'row'}>
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
                <div className={'filters-row'}>
                    {enabledFilters.includes('event_type_capacity_filter') &&
                        <div className={'col-md-6'}>
                            <Dropdown
                                id="event_type_capacity_filter"
                                placeholder={T.translate("event_list.placeholders.event_type_capacity")}
                                value={eventFilters.event_type_capacity_filter}
                                onChange={this.handleExtraFilterChange}
                                options={ddl_filterByEventTypeCapacity}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('selection_plan_id_filter') &&
                        <div className={'col-md-6'}>   
                            <Dropdown
                                id="selection_plan_id_filter"
                                placeholder={T.translate("event_list.placeholders.selection_plan")}
                                value={eventFilters.selection_plan_id_filter}
                                onChange={this.handleExtraFilterChange}
                                options={selection_plans_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('location_id_filter') &&
                        <div className={'col-md-6'}>
                            <Dropdown
                                id="location_id_filter"
                                placeholder={T.translate("event_list.placeholders.location")}
                                value={eventFilters.location_id_filter}
                                onChange={this.handleExtraFilterChange}
                                options={location_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('selection_status_filter') &&
                        <div className={'col-md-6'}> 
                            <Dropdown
                                id="selection_status_filter"
                                placeholder={T.translate("event_list.placeholders.selection_status")}
                                value={eventFilters.selection_status_filter}
                                onChange={this.handleExtraFilterChange}
                                options={selection_status_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>                
                    }
                    {enabledFilters.includes('published_filter') &&
                        <div className={'col-md-6'}>
                            <SegmentedControl
                                name="published_filter"
                                options={[
                                    { label: "All", value: null, default: eventFilters.published_filter === null},
                                    { label: "Published", value: "published",default: eventFilters.published_filter === "published"},
                                    { label: "Non Published", value: "non_published", default: eventFilters.published_filter === "non_published"},
                                ]}
                                setValue={newValue => this.handleSetPublishedFilter(newValue)}
                                style={{ width: "100%", height:40, color: '#337ab7', fontSize: '10px'  }}
                            />                        
                        </div>
                    }
                    {enabledFilters.includes('track_id_filter') &&
                        <div className={'col-md-6'}> 
                            <Dropdown
                                id="track_id_filter"
                                placeholder={T.translate("event_list.placeholders.track")}
                                value={eventFilters.track_id_filter}
                                onChange={this.handleExtraFilterChange}
                                options={track_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }                
                    {enabledFilters.includes('event_type_id_filter') &&
                        <div className={'col-md-6'}>
                            <Dropdown
                                id="event_type_id_filter"
                                placeholder={T.translate("event_list.placeholders.event_type")}
                                value={eventFilters.event_type_id_filter}
                                onChange={this.handleExtraFilterChange}
                                options={event_type_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('speaker_id_filter') &&
                        <div className={'col-md-6'}> 
                            <SpeakerInput
                                id="speaker_id_filter"
                                placeholder={T.translate("event_list.placeholders.speaker")}
                                value={eventFilters.speaker_id_filter}
                                onChange={this.handleTagOrSpeakerFilterChange}
                                summitId={currentSummit.id}
                                isMulti={true}
                                isClearable={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('speaker_company') &&
                        <div className={'col-md-6'}> 
                            <CompanyInput
                                id='speaker_company'
                                value={eventFilters.speaker_company}
                                placeholder={T.translate("event_list.placeholders.speaker_company")}
                                onChange={this.handleExtraFilterChange}
                                multi
                            />
                        </div>
                    }
                    {enabledFilters.includes('level_filter') &&
                        <div className={'col-md-6'}>
                            <Dropdown
                                id="level_filter"
                                placeholder={T.translate("event_list.placeholders.level")}
                                value={eventFilters.level_filter}
                                onChange={this.handleExtraFilterChange}
                                options={level_ddl}
                                isClearable={true}
                                isMulti={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('tags_filter') &&
                        <div className={'col-md-6'}> 
                            <TagInput
                                id="tags_filter"
                                placeholder={T.translate("event_list.placeholders.tags")}
                                value={eventFilters.tags_filter}
                                onChange={this.handleTagOrSpeakerFilterChange}
                                summitId={currentSummit.id}
                                isMulti={true}
                                isClearable={true}
                            />
                        </div>
                    }
                    {enabledFilters.includes('sponsor') &&
                        <div className={'col-md-6'}> 
                            <CompanyInput
                                id='sponsor'
                                value={eventFilters.sponsor}
                                placeholder={T.translate("event_list.placeholders.sponsor")}
                                onChange={this.handleExtraFilterChange}
                                multi
                            />
                        </div>
                    }
                    {enabledFilters.includes('all_companies') &&
                        <div className={'col-md-6'}> 
                            <CompanyInput
                                id='all_companies'
                                value={eventFilters.all_companies}
                                placeholder={T.translate("event_list.placeholders.all_companies")}
                                onChange={this.handleExtraFilterChange}
                                multi
                            />
                        </div>
                    }
                    {enabledFilters.includes('start_date_filter') &&
                        <>
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="start_date_from_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}                                    
                                    inputProps={{placeholder: T.translate("event_list.placeholders.start_date_from")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleChangeStartDate(ev, false)}
                                    value={epochToMomentTimeZone(eventFilters.start_date_filter[0], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>                    
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="start_date_to_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    inputProps={{placeholder: T.translate("event_list.placeholders.start_date_to")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleChangeStartDate(ev, true)}
                                    value={epochToMomentTimeZone(eventFilters.start_date_filter[1], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>
                        </>
                    }
                    {enabledFilters.includes('end_date_filter') &&
                        <>
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="end_date_from_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    inputProps={{placeholder: T.translate("event_list.placeholders.end_date_from")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleChangeEndDate(ev, false)}
                                    value={epochToMomentTimeZone(eventFilters.end_date_filter[0], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>                    
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="end_date_to_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    inputProps={{placeholder: T.translate("event_list.placeholders.end_date_to")}}
                                    timezone={currentSummit.time_zone.name}
                                    onChange={(ev) => this.handleChangeEndDate(ev, true)}
                                    value={epochToMomentTimeZone(eventFilters.end_date_filter[1], currentSummit.time_zone_id)}
                                    className={'event-list-date-picker'}
                                />
                            </div>
                        </>
                    }
                    {enabledFilters.includes('submitters') && 
                        <div className={'col-md-6'}> 
                        <MemberInput
                            id="submitters"
                            value={eventFilters.submitters}
                            onChange={this.handleExtraFilterChange}
                            multi={true}
                            placeholder={T.translate("event_list.placeholders.submitters")}
                            getOptionLabel={
                                (member) => {
                                    return member.hasOwnProperty("email") ?
                                        `${member.first_name} ${member.last_name} (${member.email})`:
                                        `${member.first_name} ${member.last_name} (${member.id})`;
                                }
                            }
                        />
                    </div>
                    }
                    {enabledFilters.includes('submitter_company') &&
                        <div className={'col-md-6'}> 
                            <CompanyInput
                                id='submitter_company'
                                value={eventFilters.submitter_company}
                                placeholder={T.translate("event_list.placeholders.submitter_company")}
                                onChange={this.handleExtraFilterChange}
                                multi
                            />
                        </div>
                    }
                    {enabledFilters.includes('streaming_url') && 
                        <div className={'col-md-6'}> 
                        <Input
                            id='streaming_url'
                            value={eventFilters.streaming_url}
                            placeholder={T.translate("event_list.placeholders.streaming_url")}
                            onChange={this.handleExtraFilterChange}
                        />
                    </div>
                    }
                    {enabledFilters.includes('meeting_url') && 
                        <div className={'col-md-6'}> 
                        <Input
                            id='meeting_url'
                            value={eventFilters.meeting_url}
                            placeholder={T.translate("event_list.placeholders.meeting_url")}
                            onChange={this.handleExtraFilterChange}
                        />
                    </div>
                    }
                    {enabledFilters.includes('etherpad_url') && 
                        <div className={'col-md-6'}> 
                        <Input
                            id='etherpad_url'
                            value={eventFilters.etherpad_url}
                            placeholder={T.translate("event_list.placeholders.etherpad_url")}
                            onChange={this.handleExtraFilterChange}
                        />
                    </div>
                    }
                    {enabledFilters.includes('streaming_type') && 
                        <div className={'col-md-6'}> 
                        <Dropdown
                            id="streaming_type"
                            value={eventFilters.streaming_type}
                            onChange={this.handleExtraFilterChange}
                            placeholder={T.translate("event_list.placeholders.streaming_type")}
                            options={streaming_type_ddl}
                        />
                    </div>
                    }                    
                    {enabledFilters.includes('duration_filter') &&
                        <div className={'col-md-10 col-md-offset-1'}> 
                            <OperatorInput 
                                id="duration_filter" 
                                label={T.translate("event_list.duration")}
                                value={eventFilters.duration_filter}
                                onChange={this.handleExtraFilterChange}/>
                        </div>
                    }
                    {enabledFilters.includes('speakers_count_filter') &&
                        <div className={'col-md-10 col-md-offset-1'}> 
                            <OperatorInput 
                                id="speakers_count_filter" 
                                label={T.translate("event_list.speakers_count")}
                                value={eventFilters.speakers_count_filter}
                                onChange={this.handleExtraFilterChange}/>
                        </div>
                    }
                </div>

                <hr/>

                <div className={'row'} style={{marginBottom: 15}}>
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
                                * description (text )<br />
                                * type_id (int) or type (string type name)<br />
                                * track_id (int) or track ( string track name)<br />
                                * speaker_emails ( list of email | delimited) [optional]<br />
                                * speaker_fullnames ( list of full names | delimited) [optional]<br />
                                * speaker_companies ( list of companies | delimited) [optional]<br />
                                * speaker_titles ( list of titles | delimited) [optional]<br />
                                <br />
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
