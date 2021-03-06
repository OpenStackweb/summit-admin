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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { findElementPos, epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'
import {
    TextEditor,
    Dropdown,
    GroupedDropdown,
    DateTimePicker,
    TagInput,
    SpeakerInput,
    CompanyInput,
    GroupInput,
    UploadInput,
    Input,
    Panel,
    Table
} from 'openstack-uicore-foundation/lib/components'


class EventForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            showSection: 'main',
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleMaterialEdit = this.handleMaterialEdit.bind(this);
        this.handleNewMaterial = this.handleNewMaterial.bind(this);
        this.handleUploadPic = this.handleUploadPic.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: nextProps.errors
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let {errors} = this.state;
        let {value, id} = ev.target;

        if (ev.target.type == 'radio') {
            id = ev.target.name;
            value = (ev.target.value == 1);
        }

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity});
    }

    handleUploadFile(file) {
        let entity = {...this.state.entity};

        entity.attachment = file.preview;
        this.setState({entity:entity});

        let formData = new FormData();
        formData.append('file', file);

        this.props.onAttach(entity, formData, 'file');
    }

    handleRemoveFile(attr) {
        let entity = {...this.state.entity};

        entity[attr] = '';

        if (attr === 'image') {
            this.props.onRemoveImage(entity.id);
        }

        this.setState({entity:entity});
    }

    handleSubmit(publish, ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(entity, publish);
    }

    handleUnpublish(ev) {
        ev.preventDefault();
        this.props.onUnpublish(this.state.entity);
    }

    handleScheduleLink(ev) {
        let {entity} = this.state;
        let {currentSummit, history} = this.props;

        ev.preventDefault();

        let start_date = epochToMomentTimeZone(entity.start_date, currentSummit.time_zone_id).format('YYYY-MM-DD');
        let location_id = entity.location_id;
        let event_id = entity.id;

        history.push(`/app/summits/${currentSummit.id}/events/schedule#location_id=${location_id}&day=${start_date}&event=${event_id}`);
    }

    handleEventLink(ev) {
        let {entity} = this.state;
        let {currentSummit} = this.props;

        ev.preventDefault();

        let event_id = entity.id;
        let event_detail_url = currentSummit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');

        window.open(event_detail_url, '_blank');
    }

    isEventType(types) {
        let {entity} = this.state;
        if (!entity.type_id) return false;
        let entity_type = this.props.typeOpts.find(t => t.id == entity.type_id);

        types = Array.isArray(types) ? types : [types] ;

        return ( types.indexOf(entity_type.class_name) != -1 || types.indexOf(entity_type.name) != -1 );

    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    shouldShowField(flag){
        let {entity} = this.state;
        if (!entity.type_id) return false;
        let entity_type = this.props.typeOpts.find(t => t.id == entity.type_id);

        return entity_type[flag];
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handleMaterialEdit(materialId) {
        let {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${entity.id}/materials/${materialId}`);
    }

    handleNewMaterial(ev) {
        ev.preventDefault();

        let {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${entity.id}/materials/new`);
    }

    handleUploadPic(file) {
        let entity = {...this.state.entity};

        entity.image = file.preview;
        this.setState({entity:entity});

        let formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData, 'profile')
    }

    render() {
        let {entity, showSection} = this.state;
        let { currentSummit, levelOpts, typeOpts, trackOpts, locationOpts, rsvpTemplateOpts, selectionPlansOpts, history } = this.props;

        let event_types_ddl = typeOpts.map(
            t => {
                let disabled = (entity.id) ? !this.isEventType(t.class_name) : false;
                return {label: t.name, value: t.id, type: t.class_name, disabled: disabled}
            }
        );

        let tracks_ddl = trackOpts.map(t => ({label: t.name, value: t.id}));

        let venues = locationOpts.filter(v => (v.class_name == 'SummitVenue')).map(l => {
            let options = [];
            if (l.rooms) {
                options = l.rooms.map(r => ({label: r.name, value: r.id}) );
            }
            return {label: l.name, value: l.id, options: options};
        });

        let locations_ddl = [
            {label: 'TBD', value: 0},
            ...venues
        ];

        let levels_ddl = levelOpts.map(l => ({label: l, value: l}));

        let selection_plans_ddl = [];

        if (entity.track_id) {
            const track = trackOpts.find(t => t.id === entity.track_id);
            selection_plans_ddl = selectionPlansOpts
                .filter(sp => sp.track_groups.some(gr => track.track_groups.includes(gr)))
                .map(sp => ({label: sp.name, value: sp.id}));
        }

        let rsvp_templates_ddl = rsvpTemplateOpts.map(
            t => {
                return {label: t.title, value: t.id}
            }
        );

        let material_columns = [
            { columnKey: 'class_name', value: T.translate("edit_event.type") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'filename', value: T.translate("general.file") },
            { columnKey: 'display_on_site_label', value: T.translate("edit_event.display_on_site") }
        ];

        let material_options = {
            actions: {
                edit: {onClick: this.handleMaterialEdit},
                delete: { onClick: this.props.onMaterialDelete }
            }
        };

        const creator = (entity.id && entity.creator) ? `${entity.creator.first_name} ${entity.creator.last_name} (${entity.creator.email})` : 'N/A';

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("edit_event.title")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('title')}
                            id="title"
                            value={entity.title}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-2">
                        <label> {T.translate("edit_event.submitter")} </label>
                        <div>{creator}</div>
                    </div>
                    <div className="col-md-2 published">
                        <label> {T.translate("edit_event.published")} </label>
                        <div><i className={"fa fa-2x " + (entity.is_published ? 'fa-check' : 'fa-times')} /></div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.short_description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.social_summary")} </label>
                        <textarea className="form-control" id="social_description" value={entity.social_description} onChange={this.handleChange} />
                    </div>
                </div>
                {this.isEventType('PresentationType') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.expect_to_learn")} </label>
                        <TextEditor id="attendees_expected_learnt" value={entity.attendees_expected_learnt} onChange={this.handleChange} />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.location")} </label>
                        <GroupedDropdown
                            id="location_id"
                            value={entity.location_id}
                            options={locations_ddl}
                            placeholder={T.translate("edit_event.placeholders.select_venue")}
                            onChange={this.handleChange}
                            error={this.hasErrors('location_id')}
                        />
                    </div>
                    <div className="col-md-4" style={{paddingTop: '24px'}}>
                        <DateTimePicker
                            id="start_date"
                            onChange={this.handleChange}
                            validation={{after: currentSummit.start_date, before: currentSummit.end_date}}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            value={epochToMomentTimeZone(entity.start_date, currentSummit.time_zone_id)}
                            inputProps={{placeholder: T.translate("edit_event.placeholders.start_date")}}
                            timezone={currentSummit.time_zone_id}
                            error={this.hasErrors('start_date')}
                            viewDate={epochToMomentTimeZone(currentSummit.start_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4" style={{paddingTop: '24px'}}>
                        <DateTimePicker
                            id="end_date"
                            onChange={this.handleChange}
                            validation={{after: currentSummit.start_date, before: currentSummit.end_date}}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            value={epochToMomentTimeZone(entity.end_date, currentSummit.time_zone_id)}
                            inputProps={{placeholder: T.translate("edit_event.placeholders.end_date")}}
                            timezone={currentSummit.time_zone_id}
                            error={this.hasErrors('end_date')}
                            viewDate={epochToMomentTimeZone(currentSummit.start_date, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.event_type")} *</label>
                        <Dropdown
                            id="type_id"
                            value={entity.type_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event.placeholders.select_event_type")}
                            options={event_types_ddl}
                            error={this.hasErrors('type_id')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.track")} *</label>
                        <Dropdown
                            id="track_id"
                            value={entity.track_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event.placeholders.select_track")}
                            options={tracks_ddl}
                            error={this.hasErrors('track_id')}
                        />
                    </div>
                    {this.isEventType('Presentation') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.level")} </label>
                        <Dropdown
                            id="level"
                            value={entity.level}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event.placeholders.select_level")}
                            options={levels_ddl}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.feedback")} </label>
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="allow_feedback" checked={entity.allow_feedback} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="allow_feedback"> {T.translate("edit_event.allow_feedback")} </label>
                        </div>
                    </div>
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.recording")} </label>
                        <div className="form-check abc-checkbox">
                            <input id="to_record" onChange={this.handleChange} checked={entity.to_record} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="to_record"> {T.translate("edit_event.to_record")} </label>
                        </div>
                    </div>
                    }
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.attending_media")} </label>
                        <div className="form-check abc-checkbox">
                            <input id="attending_media" onChange={this.handleChange} checked={entity.attending_media} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="attending_media"> {T.translate("edit_event.attending_media")} </label>
                        </div>
                    </div>
                    }
                </div>
                {this.isEventType('PresentationType') &&
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event.selection_plan")} </label>
                    <Dropdown
                        id="selection_plan_id"
                        value={entity.selection_plan_id}
                        onChange={this.handleChange}
                        placeholder={T.translate("edit_event.placeholders.select_selection_plan")}
                        options={selection_plans_ddl}
                    />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.tags")} </label>
                        <TagInput
                            id="tags"
                            value={entity.tags}
                            summitId={currentSummit.id}
                            onChange={this.handleChange}
                            error={this.hasErrors('tags')}
                        />
                    </div>
                </div>
                {this.shouldShowField('use_sponsors') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.sponsors")} </label>
                        <CompanyInput
                            id="sponsors"
                            value={entity.sponsors}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi
                        />
                    </div>
                </div>
                }
                {this.shouldShowField('use_speakers') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("general.speakers")} </label>
                        <SpeakerInput
                            id="speakers"
                            value={entity.speakers}
                            onChange={this.handleChange}
                            multi={true}
                            history={history}
                        />
                    </div>
                </div>
                }
                {this.shouldShowField('use_moderator') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.moderator")} </label>
                        <SpeakerInput
                            id="moderator"
                            value={entity.moderator}
                            onChange={this.handleChange}
                            history={history}
                        />
                    </div>
                </div>
                }
                {this.isEventType('Fishbowl') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.discussion_leader")} </label>
                        <SpeakerInput
                            id="moderator"
                            value={entity.moderator}
                            onChange={this.handleChange}
                            history={history}
                        />
                    </div>
                </div>
                }
                {this.isEventType('Groups Events') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.groups")} </label>
                        <GroupInput
                            id="groups"
                            value={entity.groups}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={true}
                        />
                    </div>
                </div>
                }

                {this.shouldShowField('allows_attachment') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.attachment")} </label>
                        <UploadInput
                            value={entity.attachment}
                            handleUpload={this.handleUploadFile}
                            handleRemove={ev => this.handleRemoveFile('attachment')}
                            className="dropzone col-md-6"
                            multiple={this.props.multi}
                            accept="image/*"
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event.pic")} </label>
                        <UploadInput
                            value={entity.image}
                            handleUpload={this.handleUploadPic}
                            handleRemove={ev => this.handleRemoveFile('image')}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <Panel show={showSection == 'live'} title={T.translate("edit_event.live")}
                       handleClick={this.toggleSection.bind(this, 'live')}>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label>
                                {T.translate("edit_event.streaming_url")}&nbsp;
                                <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_event.streaming_url_info")} />
                            </label>
                            <input className="form-control" id="streaming_url" value={entity.streaming_url} onChange={this.handleChange} />
                        </div>
                     </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_event.meeting_url")}&nbsp;
                                <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_event.meeting_url_info")} />
                            </label>
                            <input className="form-control" id="meeting_url" value={entity.meeting_url} onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_event.etherpad_link")} </label>
                            <input className="form-control" id="etherpad_link" value={entity.etherpad_link} onChange={this.handleChange} />
                        </div>
                    </div>
                </Panel>
                <Panel show={showSection == 'rsvp'} title={T.translate("edit_event.rsvp")}
                       handleClick={this.toggleSection.bind(this, 'rsvp')}>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_event.head_count")} </label>
                            <input className="form-control" type="number" id="head_count" value={entity.head_count} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_event.rsvp_max_user_number")} </label>
                            <input className="form-control" type="number" id="rsvp_max_user_number" value={entity.rsvp_max_user_number} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_event.rsvp_max_user_wait_list_number")} </label>
                            <input className="form-control" type="number" id="rsvp_max_user_wait_list_number" value={entity.rsvp_max_user_wait_list_number} onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_event.rsvp_link")} </label>
                            <input className="form-control" id="rsvp_link" value={entity.rsvp_link} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_event.rsvp_template")} </label>
                            <Dropdown
                                id="rsvp_template_id"
                                value={entity.rsvp_template_id}
                                onChange={this.handleChange}
                                placeholder={T.translate("edit_event.placeholders.select_rsvp_template")}
                                options={rsvp_templates_ddl}
                                clearable
                            />
                        </div>
                    </div>
                </Panel>

                {entity.id != 0 &&
                <Panel show={showSection == 'materials'} title={T.translate("edit_event.materials")}
                       handleClick={this.toggleSection.bind(this, 'materials')}>
                    <button className="btn btn-primary pull-right left-space" onClick={this.handleNewMaterial}>
                        {T.translate("edit_event.add_material")}
                    </button>
                    <Table
                        options={material_options}
                        data={entity.materials}
                        columns={material_columns}
                    />
                </Panel>
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        {!entity.is_published &&
                        <div>
                            <input type="button" onClick={this.handleSubmit.bind(this, false)}
                                   className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                            <input type="button" onClick={this.handleSubmit.bind(this, true)}
                                className="btn btn-success pull-right" value={T.translate("general.save_and_publish")} />
                        </div>
                        }

                        {entity.is_published &&
                        <div>
                            <input type="button" onClick={this.handleSubmit.bind(this, true)}
                                   className="btn btn-success pull-right" value={T.translate("general.save_and_publish")} />
                            <input type="button" onClick={this.handleUnpublish.bind(this)}
                                   className="btn btn-danger pull-right" value={T.translate("edit_event.unpublish")}/>
                            <input type="button"
                                   onClick={this.handleScheduleLink.bind(this)}
                                   className="btn btn-default pull-left" value={T.translate("edit_event.go_to_calendar")}/>
                            <input type="button"
                                   onClick={this.handleEventLink.bind(this)}
                                   className="btn btn-default pull-left" value={T.translate("edit_event.view_event")}/>
                        </div>
                        }

                    </div>
                </div>
            </form>
        );
    }
}

export default EventForm;
