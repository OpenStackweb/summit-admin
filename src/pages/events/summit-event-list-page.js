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
import {FreeTextSearch, Table, UploadInput, Input, TagInput, SpeakerInput, Dropdown, DateTimePicker, OperatorInput} from 'openstack-uicore-foundation/lib/components';
import { SegmentedControl } from 'segmented-control'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import { getSummitById }  from '../../actions/summit-actions';
import { getEvents, deleteEvent, exportEvents, importEventsCSV, importMP4AssetsFromMUX } from "../../actions/event-actions";
import {hasErrors} from "../../utils/methods";
import '../../styles/summit-event-list-page.less';

const fieldNames = [
    { columnKey: 'speakers', value: 'speakers' },
    { columnKey: 'created_by_fullname', value: 'created_by' },
    { columnKey: 'published_date', value: 'published' },
    { columnKey: 'duration', value: 'duration' },
    { columnKey: 'speaker_count', value: 'speaker_count' },
    { columnKey: 'track', value: 'track' },
    { columnKey: 'start_date', value: 'start_date' },
    { columnKey: 'end_date', value: 'end_date' },
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
                level_filter: [],
                tags_filter: [],
                published_filter: null,
                start_date_filter: '',
                end_date_filter: '',
                duration_filter: '',
                speaker_count_filter: '',
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
        const  enabledFilters = Object.keys(filters).filter(e => filters[e]?.length > 0);
        // corner case for date_filter
        let {end_date_filter, start_date_filter} = filters;
        if((start_date_filter && start_date_filter > 0) || ( end_date_filter && end_date_filter > 0)){
            enabledFilters.push('date_filter');
        }

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

    handleChangeStartDate(ev) {
        const {value} = ev.target;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, start_date_filter: value.unix()}});    
    }

    handleChangeEndDate(ev) {
        const {value} = ev.target;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, end_date_filter: value.unix()}});        
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
                    level_filter: [],
                    tags_filter: [],
                    published_filter: null,
                    start_date_filter: '',
                    end_date_filter: '',
                    duration_filter: '',
                    speaker_count_filter: '',
                };
                this.setState({...this.state, enabledFilters: value, eventFilters: resetFilters});
            } else {
                const removedFilter = this.state.enabledFilters.filter(e => !value.includes(e))[0];            
                const defaultValue = removedFilter === 'published_filter' ? null : Array.isArray(this.state.eventFilters[removedFilter]) ? [] : '';
                let newEventFilters = {...this.state.eventFilters, [removedFilter]: defaultValue};
                if(removedFilter === 'date_filter'){
                    newEventFilters = {...newEventFilters, start_date_filter: '', end_date_filter: ''}
                }
                this.setState({...this.state, enabledFilters: value, eventFilters: newEventFilters});
            }
        } else {
            this.setState({...this.state, enabledFilters: value})
        }
    }

    handleChangeStartDate(ev) {
        const {value} = ev.target;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, start_date_filter: value.unix()}});    
    }

    handleChangeEndDate(ev) {
        const {value} = ev.target;
        this.setState({...this.state, eventFilters: {...this.state.eventFilters, end_date_filter: value.unix()}});        
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
                    level_filter: [],
                    tags_filter: [],
                    published_filter: null,
                    start_date_filter: '',
                    end_date_filter: '',
                    duration_filter: '',
                    speaker_count_filter: '',
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
        this.setState({...this.state, selectedColumns: value})
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
            {label: 'Selected', value: 'selected'},
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

        const filters_ddl = [
            {label: 'Event Type Capacity', value: 'event_type_capacity_filter'},
            {label: 'Selection Plan', value: 'selection_plan_id_filter'},
            {label: 'Location', value: 'location_id_filter'},
            {label: 'Selection Status', value: 'selection_status_filter'},
            {label: 'Published Status', value: 'published_filter'},
            {label: 'Track', value: 'track_id_filter'},
            {label: 'Event Type', value: 'event_type_id_filter'},
            {label: 'Speaker', value: 'speaker_id_filter'},
            {label: 'Level', value: 'level_filter'},
            {label: 'Tags', value: 'tags_filter'},
            {label: 'Date', value: 'date_filter'},
            {label: 'Duration', value: 'duration_filter'},
            {label: 'Speaker Count', value: 'speaker_count_filter'}
        ]

        const ddl_columns = [
            { value: 'speakers', label: T.translate("event_list.speakers") },
            { value: 'created_by_fullname', label: T.translate("event_list.created_by") },
            { value: 'published_date', label: T.translate("event_list.published") },
            { value: 'duration', label: T.translate("event_list.duration") },
            { value: 'speaker_count', label: T.translate("event_list.speaker_count") },
            { value: 'track', label: T.translate("event_list.track") },
            { value: 'start_date', label: T.translate("event_list.start_date") },
            { value: 'end_date', label: T.translate("event_list.end_date") },
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
                            options={filters_ddl}
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
                    {enabledFilters.includes('date_filter') &&
                        <>
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="start_date_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}                            
                                    inputProps={{placeholder: T.translate("event_list.placeholders.start_date")}}
                                    timezone={currentSummit.time_zone.name}                            
                                    onChange={this.handleChangeStartDate}                            
                                    value={epochToMomentTimeZone(eventFilters.start_date_filter, currentSummit.time_zone_id)}
                                />
                            </div>                    
                            <div className={'col-md-3'}>
                                <DateTimePicker
                                    id="end_date_filter"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}                            
                                    inputProps={{placeholder: T.translate("event_list.placeholders.end_date")}}
                                    timezone={currentSummit.time_zone.name}                            
                                    onChange={this.handleChangeEndDate}                            
                                    value={epochToMomentTimeZone(eventFilters.end_date_filter, currentSummit.time_zone_id)}
                                />
                            </div>
                        </>
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
                    {enabledFilters.includes('speaker_count_filter') &&
                        <div className={'col-md-10 col-md-offset-1'}> 
                            <OperatorInput 
                                id="speaker_count_filter" 
                                label={T.translate("event_list.speaker_count")}
                                value={eventFilters.speaker_count_filter}
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
                            options={ddl_columns}
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
