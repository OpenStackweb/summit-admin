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
import DateTimePicker from '../inputs/datetimepicker/index'
import UploadInput from '../inputs/upload-input/index'
import Input from '../inputs/text-input'
import Panel from '../sections/panel';
import Dropdown from '../inputs/dropdown'

import {epochToMoment} from '../../utils/methods'


class SummitForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            showSection: 'main',
            errors: props.errors
        };

        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    handleSubmit(ev) {
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
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

    handleUploadFile(file) {
        let entity = {...this.state.entity};
        entity.logo = file.preview;

        this.setState({file: file, entity:entity});
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};

        entity.logo = '';
        this.setState({entity:entity});
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }
    
    
    render() {
        let {entity, showSection} = this.state;
        let time_zones_ddl = moment.tz.names().map(tz => ({label: tz, value: tz}));
        let time_zone_name = entity.time_zone.name;

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.name")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('name')}
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.eventbrite_id")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('eventbrite_id')}
                            id="eventbrite_id"
                            value={entity.eventbrite_id}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.max_submission_allowed_per_user")} *</label>
                        <Input
                            className="form-control"
                            type="number"
                            error={this.hasErrors('max_submission_allowed_per_user')}
                            id="max_submission_allowed_per_user"
                            value={entity.max_submission_allowed_per_user}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('link')}
                            id="link"
                            value={entity.link}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.registration_link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('registration_link')}
                            id="registration_link"
                            value={entity.registration_link}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.secondary_registration_link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('secondary_registration_link')}
                            id="secondary_registration_link"
                            value={entity.secondary_registration_link}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.dates_label")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('dates_label')}
                            id="dates_label"
                            value={entity.dates_label}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.secondary_registration_label")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('secondary_registration_label')}
                            id="secondary_registration_label"
                            value={entity.secondary_registration_label}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="active" checked={entity.active}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="active">
                                {T.translate("edit_summit.active")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="available_on_api" checked={entity.available_on_api}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="available_on_api">
                                {T.translate("edit_summit.available_on_api")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("general.file")} </label>
                        <UploadInput
                            value={entity.logo}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>

                <Panel show={showSection == 'dates'} title={T.translate("edit_summit.dates")}
                       handleClick={this.toggleSection.bind(this, 'dates')}>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.time_zone")} *</label>
                            <Dropdown
                                id="time_zone_name"
                                value={time_zone_name}
                                onChange={this.handleChange}
                                options={time_zones_ddl}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.start_date")} </label>
                            <DateTimePicker
                                id="start_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                timeConstraints={{ hours: { min: 7, max: 22}}}
                                value={epochToMoment(entity.start_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.end_date")} </label>
                            <DateTimePicker
                                id="end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                timeConstraints={{ hours: { min: 7, max: 22}}}
                                value={epochToMoment(entity.end_date)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.submission_begin_date")} </label>
                            <DateTimePicker
                                id="submission_begin_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.submission_begin_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.submission_end_date")} </label>
                            <DateTimePicker
                                id="submission_end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.submission_end_date)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.voting_begin_date")} </label>
                            <DateTimePicker
                                id="voting_begin_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.voting_begin_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.voting_end_date")} </label>
                            <DateTimePicker
                                id="voting_end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.voting_end_date)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.selection_begin_date")} </label>
                            <DateTimePicker
                                id="selection_begin_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.selection_begin_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.selection_end_date")} </label>
                            <DateTimePicker
                                id="selection_end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.selection_end_date)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.registration_begin_date")} </label>
                            <DateTimePicker
                                id="registration_begin_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.registration_begin_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.registration_end_date")} </label>
                            <DateTimePicker
                                id="registration_end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.registration_end_date)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.schedule_start_date")} </label>
                            <DateTimePicker
                                id="schedule_start_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.schedule_start_date)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.start_showing_venues_date")} </label>
                            <DateTimePicker
                                id="start_showing_venues_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone.name}
                                value={epochToMoment(entity.start_showing_venues_date)}
                            />
                        </div>
                    </div>
                </Panel>
                
                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default SummitForm;