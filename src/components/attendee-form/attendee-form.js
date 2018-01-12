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
import TextEditor from '../editor-input'
import MemberInput from '../member-input'
import CompanyInput from '../company-input'
import DateTimePicker from '../datetimepicker'
import Input from '../text-input'
import {findElementPos} from '../../utils/methods'


class AttendeeForm extends React.Component {
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
            errors: {...nextProps.errors}
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
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'memberinput') {
            entity.email = '';
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
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

        this.props.onSubmit(this.state.entity, this.props.history);
    }

    handlePresentationLink(event_id, ev) {
        let {currentSummit} = this.props;
        ev.preventDefault();
        let event_detail_url = currentSummit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');
        window.open(event_detail_url, '_blank');
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
        let { currentSummit } = this.props;

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("general.member")} *</label>
                        <MemberInput
                            id="member"
                            value={entity.member}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                        />
                    </div>
                </div>
                {entity.member != null &&
                <div>
                    <div className="row form-group">
                        <legend>{T.translate("edit_attendee.current_affiliation")}</legend>
                        <div className="col-md-3">
                            <label> {T.translate("edit_attendee.affiliation_title")} </label>
                            <Input className="form-control" id="affiliation_title" value={entity.affiliation.title} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label> {T.translate("edit_attendee.company")} </label>
                            <CompanyInput
                                id="sponsors"
                                value={entity.sponsors}
                                onChange={this.handleChange}
                                summitId={currentSummit.id}
                                multi={true}
                            />
                        </div>
                        <div className="col-md-2" style={{paddingTop: '24px'}}>
                            <DateTimePicker
                                id="affiliation_start_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                value={this.getFormattedTime(entity.affiliation.start_date)}
                                inputProps={{placeholder: T.translate("edit_attendee.placeholders.start_date")}}
                            />
                        </div>
                        <div className="col-md-2" style={{paddingTop: '24px'}}>
                            <DateTimePicker
                                id="affiliation_end_date"
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                value={this.getFormattedTime(entity.affiliation.end_date)}
                                inputProps={{placeholder: T.translate("edit_attendee.placeholders.end_date")}}
                            />
                        </div>
                        <div className="col-md-2">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="affiliation_current" checked={entity.affiliation.current}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label"
                                       htmlFor="affiliation_current"> {T.translate("edit_attendee.affiliation_current")} </label>
                            </div>
                        </div>
                    </div>
                    <div className="row form-group">
                        <legend>{T.translate("edit_attendee.attendee")}</legend>
                        <div className="col-md-3">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="attendee_shared_contact_info" checked={entity.shared_contact_info}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="attendee_shared_contact_info">
                                    {T.translate("edit_attendee.shared_contact_info")}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="attendee_checked_in" checked={entity.checked_in}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="attendee_checked_in">
                                    {T.translate("edit_attendee.checked_in")}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row form-group">
                        <legend>{T.translate("edit_attendee.tickets")}</legend>
                        <div className="col-md-4">

                        </div>
                    </div>
                    <div className="row form-group">
                        <legend>{T.translate("edit_attendee.rsvp")}</legend>
                        <div className="col-md-4">

                        </div>
                    </div>
                    <hr />
                    <div className="row form-group">
                        <legend>{T.translate("edit_attendee.speaker_details")}</legend>
                        <div className="col-md-4">

                        </div>
                    </div>

                </div>
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this, false)}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default AttendeeForm;