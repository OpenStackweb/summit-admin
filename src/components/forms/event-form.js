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
import Swal from "sweetalert2";
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'
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
    Table, MemberInput
} from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";
import QuestionAnswersInput from "../inputs/question-answers-input";


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
        this.handleMaterialDownload = this.handleMaterialDownload.bind(this);
        this.handleMaterialDelete = this.handleMaterialDelete.bind(this);
        this.getQAUsersOptionLabel = this.getQAUsersOptionLabel.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    getQAUsersOptionLabel(member){
        if(member.hasOwnProperty("full_name")){
            return member.full_name;
        }
        //default
        return `${member.first_name} ${member.last_name} (${member.id})`;
    }

    handleChange(ev) {
        const entity = {...this.state.entity};
        let {onAddQAMember, onDeleteQAMember, currentSummit, extraQuestions} = this.props;
        const {errors} = this.state;
        let {value, id} = ev.target;
        let currentError = '';
        // logic for summit help users ( chat roles )
        if (ev.target.type === 'memberinput') {
            let oldHelpUsers =  entity[id];
            let currentOldOnes = [];
            try {
                // remap to chat api payload format
                let newHelpUsers = value.map((member) => {
                    if (member.hasOwnProperty("email")) {
                        // if has email property then its cames from main api
                        // we need to remap but first only users with idp id set
                        // are valid
                        if (!member.user_external_id) {
                            throw "Invalid user";
                        }
                        let newMember = {
                            member_id: member.id,
                            idp_user_id: member.user_external_id,
                            full_name: `${member.first_name} ${member.last_name}`,
                            summit_event_id: entity.id,
                            summit_id: currentSummit.id,
                        };
                        onAddQAMember(newMember, entity.id);
                        return newMember;
                    }
                    currentOldOnes.push(member)
                    return member;
                });

                // check if we delete something
                if (oldHelpUsers.length != currentOldOnes.length) {
                    // get missing one
                    let missingOne = oldHelpUsers.filter((oldOne) => {
                        let matches = currentOldOnes.filter(newOne => {
                            return newOne.member_id == oldOne.member_id;
                        });
                        return matches.length == 0;
                    })
                    if (missingOne.length > 0) {
                        // remove it
                        onDeleteQAMember(missingOne[0], entity.id);
                    }
                }

                value = newHelpUsers;
            }
            catch (e){
                console.log(e);
                value = oldHelpUsers;
                currentError = e;
            }
        }

        if (ev.target.type === 'radio') {
            id = ev.target.name;
            value = (ev.target.value === 1);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = currentError;
        entity[id] = value;
        this.setState({entity: entity});
    }

    handleUploadFile(file) {
        const entity = {...this.state.entity};

        entity.attachment = file.preview;
        this.setState({entity:entity});

        const formData = new FormData();
        formData.append('file', file);

        this.props.onAttach(entity, formData, 'file');
    }

    handleRemoveFile(attr) {
        const entity = {...this.state.entity};

        entity[attr] = '';

        if (attr === 'image') {
            this.props.onRemoveImage(entity.id);
        }

        this.setState({entity:entity});
    }

    handleSubmit(publish, ev) {
        const entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(entity, publish);
    }

    handleUnpublish(ev) {
        ev.preventDefault();
        this.props.onUnpublish(this.state.entity);
    }

    handleScheduleLink(ev) {
        const {entity} = this.state;
        const {currentSummit, history} = this.props;

        ev.preventDefault();

        const start_date = epochToMomentTimeZone(entity.start_date, currentSummit.time_zone_id).format('YYYY-MM-DD');
        const location_id = entity.location_id;
        const event_id = entity.id;

        history.push(`/app/summits/${currentSummit.id}/events/schedule#location_id=${location_id}&day=${start_date}&event=${event_id}`);
    }

    handleEventLink(ev) {
        const {entity} = this.state;
        const {currentSummit} = this.props;
        ev.preventDefault();

        const eventStart = epochToMomentTimeZone(entity.start_date + 300, currentSummit.time_zone_id).format('YYYY-MM-DD,HH:mm:ss');

        const event_detail_url = `${currentSummit.virtual_site_url}event/${entity.id}#now=${eventStart}`;

        window.open(event_detail_url, '_blank');
    }

    isEventType(types) {
        const {entity} = this.state;
        if (!entity.type_id) return false;
        const entity_type = this.props.typeOpts.find(t => t.id === entity.type_id);

        types = Array.isArray(types) ? types : [types] ;
        return ( types.indexOf(entity_type.class_name) !== -1 || types.indexOf(entity_type.name) !== -1 );
    }

    isEventTypeAllowsLevel(){
        const {entity} = this.state;
        if (!entity.type_id) return false;
        const entity_type = this.props.typeOpts.find(t => t.id === entity.type_id);
        return entity_type.allows_level;
    }

    shouldShowField(flag){
        const {entity} = this.state;
        if (!entity.type_id) return false;
        const entity_type = this.props.typeOpts.find(t => t.id === entity.type_id);

        return entity_type[flag];
    }

    toggleSection(section, ev) {
        const {showSection} = this.state;
        const newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handleMaterialEdit(materialId) {
        const {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${entity.id}/materials/${materialId}`);
    }

    handleNewMaterial(ev) {
        ev.preventDefault();

        const {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/events/${entity.id}/materials/new`);
    }

    handleUploadPic(file) {
        const entity = {...this.state.entity};

        entity.image = file.preview;
        this.setState({entity:entity});

        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData, 'profile')
    }

    handleMaterialDownload(materialId) {
        const {entity} = this.props;
        const material = entity.materials.find(m => m.id === materialId);
        window.open(material.private_url || material.public_url, "_blank");
    }

    handleMaterialDelete(materialId) {
        const {entity, onMaterialDelete} = this.props;
        const material = entity.materials.find(m => m.id === materialId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_event.delete_material") + ' ' + material.filename,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                onMaterialDelete(materialId);
            }
        });
    }

    render() {
        const {entity, showSection, errors} = this.state;
        const { currentSummit, levelOpts, typeOpts, trackOpts,
            locationOpts, rsvpTemplateOpts, selectionPlansOpts, history, extraQuestions } = this.props;

        const event_types_ddl = typeOpts.map(
            t => {
                let disabled = (entity.id) ? !this.isEventType(t.class_name) : false;
                return {label: t.name, value: t.id, type: t.class_name, disabled: disabled}
            }
        );

        const tracks_ddl = trackOpts.map(t => ({label: t.name, value: t.id}));

        const venues = locationOpts.filter(v => (v.class_name === 'SummitVenue')).map(l => {
            let options = [];
            if (l.rooms) {
                options = l.rooms.map(r => ({label: r.name, value: r.id}) );
            }
            return {label: l.name, value: l.id, options: options};
        });

        const locations_ddl = [
            {label: 'TBD', value: 0},
            ...venues
        ];

        const levels_ddl = levelOpts.map(l => ({label: l, value: l}));

        let selection_plans_ddl = [];

        if (entity.track_id) {
            const track = trackOpts.find(t => t.id === entity.track_id);
            selection_plans_ddl = selectionPlansOpts
                .filter(sp => sp.track_groups.some(gr => track.track_groups.includes(gr)))
                .map(sp => ({label: sp.name, value: sp.id}));
        }

        const rsvp_templates_ddl = rsvpTemplateOpts.map(
            t => {
                return {label: t.title, value: t.id}
            }
        );

        const material_columns = [
            { columnKey: 'class_name', value: T.translate("edit_event.type") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'filename', value: T.translate("general.file") },
            { columnKey: 'display_on_site_label', value: T.translate("edit_event.display_on_site") }
        ];

        const material_options = {
            actions: {
                edit: {onClick: this.handleMaterialEdit},
                custom: [
                    {
                        name: 'download',
                        tooltip: 'download',
                        icon: <i className="fa fa-download" />,
                        onClick: this.handleMaterialDownload,
                    }
                ],
                delete: { onClick: this.handleMaterialDelete },
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
                            error={hasErrors('title', errors)}
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
                            error={hasErrors('description', errors)}
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
                            error={hasErrors('location_id', errors)}
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
                            error={hasErrors('start_date', errors)}
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
                            error={hasErrors('end_date', errors)}
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
                            error={hasErrors('type_id', errors)}
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
                            error={hasErrors('track_id', errors)}
                        />
                    </div>
                    {this.isEventTypeAllowsLevel() &&
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
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="allow_feedback" checked={entity.allow_feedback} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="allow_feedback"> {T.translate("edit_event.allow_feedback")} </label>
                        </div>
                    </div>
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input id="to_record" onChange={this.handleChange} checked={entity.to_record} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="to_record"> {T.translate("edit_event.to_record")} </label>
                        </div>
                    </div>
                    }
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input id="attending_media" onChange={this.handleChange} checked={entity.attending_media} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="attending_media"> {T.translate("edit_event.attending_media")} </label>
                        </div>
                    </div>
                    }
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input id="disclaimer_accepted" onChange={this.handleChange} checked={entity.disclaimer_accepted} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="disclaimer_accepted"> {T.translate("edit_event.disclaimer_accepted")} </label>
                        </div>
                    </div>
                    }
                </div>
                {this.isEventType('PresentationType') &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event.selection_plan")} </label>
                        <Dropdown
                            id="selection_plan_id"
                            value={entity.selection_plan_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event.placeholders.select_selection_plan")}
                            options={selection_plans_ddl}
                        />
                    </div>
                    { entity.id > 0 &&
                    <div className="col-md-6">
                        <label> {T.translate("edit_event.qa_users")}  <i title={T.translate("edit_event.qa_users_info")} className="fa fa-info-circle"/></label>
                        <MemberInput
                            id="qa_users"
                            value={entity.qa_users}
                            onChange={this.handleChange}
                            error={hasErrors('qa_users', errors)}
                            getOptionLabel={this.getQAUsersOptionLabel}
                            multi={true}
                        />
                    </div>
                    }
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
                            error={hasErrors('tags', errors)}
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
                <Panel show={showSection === 'live'} title={T.translate("edit_event.live")}
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
                <Panel show={showSection === 'rsvp'} title={T.translate("edit_event.rsvp")}
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
                {entity.id != 0 && this.isEventType('PresentationType') &&
                <Panel show={showSection === 'materials'} title={T.translate("edit_event.materials")}
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

                {entity.id !== 0 && extraQuestions && extraQuestions.length > 0 &&
                <Panel show={showSection === 'extra_questions'} title={T.translate("edit_attendee.extra_questions")}
                       handleClick={this.toggleSection.bind(this, 'extra_questions')}>
                    <QuestionAnswersInput
                        id="extra_questions"
                        answers={entity.extra_questions}
                        questions={extraQuestions}
                        onChange={this.handleChange}
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
                            <input
                                type="button"
                                onClick={this.handleSubmit.bind(this, true)}
                                className="btn btn-success pull-right"
                                value={T.translate("general.save_and_publish")}
                            />
                            <input
                                type="button"
                                onClick={this.handleUnpublish.bind(this)}
                                className="btn btn-danger pull-right"
                                value={T.translate("edit_event.unpublish")}
                            />
                            <input
                                type="button"
                                onClick={this.handleScheduleLink.bind(this)}
                                className="btn btn-default pull-left"
                                value={T.translate("edit_event.go_to_calendar")}
                            />
                            <input
                                type="button"
                                onClick={this.handleEventLink.bind(this)}
                                disabled={!currentSummit.virtual_site_url}
                                className="btn btn-default pull-left"
                                value={T.translate("edit_event.view_event")}
                            />
                        </div>
                        }

                    </div>
                </div>
            </form>
        );
    }
}

export default EventForm;
