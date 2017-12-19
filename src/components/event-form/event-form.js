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
import moment from 'moment-timezone'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import TextEditor from '../editor-input'
import Dropdown from '../dropdown'
import GroupedDropdown from '../grouped-dropdown'
import DateTimePicker from '../datetimepicker'
import TagInput from '../tag-input'
import SpeakerInput from '../speaker-input'
import CompanyInput from '../company-input'
import GroupInput from '../group-input'
import UploadInput from '../upload-input'
import Input from '../text-input'
import {findElementPos} from '../../utils/methods'


class EventForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
        console.log('file uploaded');
        let formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData)
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};

        entity.attachment = '';
        this.setState({entity:entity});
    }

    handleSubmit(publish, ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, publish, this.props.history);
    }

    handleUnpublish(ev) {
        ev.preventDefault();
        this.props.onUnpublish(this.state.entity);
    }

    handleScheduleLink(ev) {
        let {entity} = this.state;
        let {currentSummit, history} = this.props;

        ev.preventDefault();

        let start_date = this.getFormattedTime(entity.start_date).format('YYYY-MM-DD');
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

    getFormattedTime(atime) {
        if(!atime) return atime;
        atime = atime * 1000;
        return moment(atime).tz(this.props.currentSummit.time_zone.name);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        let {entity} = this.state;
        let { currentSummit, levelOpts, typeOpts, trackOpts, locationOpts } = this.props;

        let event_types_ddl = typeOpts.map(
            t => {
                let disabled = (entity.id) ? !this.isEventType(t.class_name) : false;
                return {label: t.name, value: t.id, type: t.class_name, disabled: disabled}
            }
        );

        let tracks_ddl = trackOpts.map(t => ({label: t.name, value: t.id}));

        let venues = locationOpts.filter(v => (v.class_name == 'SummitVenue')).map(l =>
            ({label: l.name, value: l.id, options: l.rooms.map(r =>
                ({label: r.name, value: r.id})
            )})
        );

        let locations_ddl = [
            {label: 'TBD', value: 0},
            ...venues
        ];

        let levels_ddl = levelOpts.map(l => ({label: l, value: l}));

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-9">
                        <label> {T.translate("titles.title")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('title')}
                            id="title"
                            value={entity.title}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-3 published">
                        <label> {T.translate("titles.published")} </label>
                        <div><i className={"fa fa-2x " + (entity.is_published ? 'fa-check' : 'fa-times')}></i></div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.short_description")} </label>
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
                        <label> {T.translate("titles.social_summary")} </label>
                        <textarea className="form-control" id="social_description" value={entity.social_description} onChange={this.handleChange} />
                    </div>
                </div>
                {this.isEventType('PresentationType') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.expect_to_learn")} </label>
                        <TextEditor id="attendees_expected_learnt" value={entity.attendees_expected_learnt} onChange={this.handleChange} />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.head_count")} </label>
                        <input className="form-control" type="number" id="head_count" value={entity.head_count} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-8">
                        <label> {T.translate("titles.rsvp_link")} </label>
                        <input className="form-control" id="rsvp_link" value={entity.rsvp_link} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.location")} </label>
                        <GroupedDropdown
                            id="location_id"
                            value={entity.location_id}
                            options={locations_ddl}
                            placeholder={T.translate("placeholders.select_venue")}
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
                            value={this.getFormattedTime(entity.start_date)}
                            inputProps={{placeholder: T.translate("placeholders.start_date")}}
                            timezone={currentSummit.time_zone.name}
                            error={this.hasErrors('start_date')}
                        />
                    </div>
                    <div className="col-md-4" style={{paddingTop: '24px'}}>
                        <DateTimePicker
                            id="end_date"
                            onChange={this.handleChange}
                            validation={{after: currentSummit.start_date, before: currentSummit.end_date}}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            value={this.getFormattedTime(entity.end_date)}
                            inputProps={{placeholder: T.translate("placeholders.end_date")}}
                            timezone={currentSummit.time_zone.name}
                            error={this.hasErrors('end_date')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.event_type")} *</label>
                        <Dropdown
                            id="type_id"
                            value={entity.type_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("placeholders.select_event_type")}
                            options={event_types_ddl}
                            error={this.hasErrors('type_id')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.track")} *</label>
                        <Dropdown
                            id="track_id"
                            value={entity.track_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("placeholders.select_track")}
                            options={tracks_ddl}
                            error={this.hasErrors('track_id')}
                        />
                    </div>
                    {this.isEventType('Presentation') &&
                    <div className="col-md-4">
                        <label> {T.translate("titles.level")} </label>
                        <Dropdown
                            id="level"
                            value={entity.level}
                            onChange={this.handleChange}
                            placeholder={T.translate("placeholders.select_level")}
                            options={levels_ddl}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.feedback")} </label>
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="allow_feedback" checked={entity.allow_feedback} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="allow_feedback"> {T.translate("titles.allow_feedback")} </label>
                        </div>
                    </div>
                    {this.isEventType('PresentationType') &&
                    <div className="col-md-4">
                        <label> {T.translate("titles.recording")} </label>
                        <div className="form-check abc-checkbox">
                            <input id="to_record" onChange={this.handleChange} checked={entity.to_record} className="form-check-input" type="checkbox" />
                            <label className="form-check-label" htmlFor="to_record"> {T.translate("titles.to_record")} </label>
                        </div>
                    </div>
                    }
                    <div className="col-md-4">
                        <label> {T.translate("titles.feature_os_cloud")} </label><br/>
                        <div className="form-check abc-radio radio-inline">
                            <input checked={entity.feature_cloud} onChange={this.handleChange} name="feature_cloud" id="feature_cloud_1" value={1} className="form-check-input" type="radio" />
                            <label className="form-check-label" htmlFor="feature_cloud_1"> {T.translate("titles.yes")} </label>
                        </div>
                        <div className="form-check abc-radio radio-inline" style={{marginLeft: '100px'}}>
                            <input checked={!entity.feature_cloud} onChange={this.handleChange} name="feature_cloud" id="feature_cloud_2" value={0} className="form-check-input" type="radio" />
                            <label className="form-check-label" htmlFor="feature_cloud_2"> {T.translate("titles.no")} </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.tags")} </label>
                        <TagInput
                            id="tags"
                            value={entity.tags}
                            onChange={this.handleChange}
                            allow_new={false}
                            error={this.hasErrors('tags')}
                        />
                    </div>
                </div>
                {this.isEventType('Presentation') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.sponsors")} </label>
                        <CompanyInput
                            id="sponsors"
                            value={entity.sponsors}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={true}
                        />
                    </div>
                </div>
                }
                {this.isEventType('PresentationType') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.speakers")} </label>
                        <SpeakerInput
                            id="speakers"
                            value={entity.speakers}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={true}
                        />
                    </div>
                </div>
                }
                {this.isEventType(['Keynotes', 'Panel']) &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.moderator")} </label>
                        <SpeakerInput
                            id="moderator"
                            value={entity.moderator}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                        />
                    </div>
                </div>
                }
                {this.isEventType('Fishbowl') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.discussion_leader")} </label>
                        <SpeakerInput
                            id="moderator"
                            value={entity.moderator}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                        />
                    </div>
                </div>
                }
                {this.isEventType('Groups Events') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.groups")} </label>
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

                {this.isEventType('SummitEventType') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.attachment")} </label>
                        <UploadInput
                            value={entity.attachment}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={this.props.multi}
                            accept="image/*"
                        />
                    </div>
                </div>
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        {!entity.is_published &&
                        <div>
                            <input type="button" onClick={this.handleSubmit.bind(this, false)}
                                   className="btn btn-primary pull-right" value={T.translate("titles.save")}/>
                            <input type="button" onClick={this.handleSubmit.bind(this, true)}
                                className="btn btn-success pull-right" value={T.translate("titles.save_and_publish")} />
                        </div>
                        }

                        {entity.is_published &&
                        <div>
                            <input type="button" onClick={this.handleSubmit.bind(this, true)}
                                   className="btn btn-success pull-right" value={T.translate("titles.save_and_publish")} />
                            <input type="button" onClick={this.handleUnpublish.bind(this)}
                                   className="btn btn-danger pull-right" value={T.translate("titles.unpublish")}/>
                            <input type="button"
                                   onClick={this.handleScheduleLink.bind(this)}
                                   className="btn btn-default pull-left" value={T.translate("titles.go_to_calendar")}/>
                            <input type="button"
                                   onClick={this.handleEventLink.bind(this)}
                                   className="btn btn-default pull-left" value={T.translate("titles.view_event")}/>
                        </div>
                        }

                    </div>
                </div>
            </form>
        );
    }
}

export default EventForm;