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


class SpeakerForm extends React.Component {
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
        this.setState({entity: entity, errors: errors});
    }

    handleUploadFile(file) {
        console.log('file uploaded');
        let formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.props.currentSummit.id, this.state.entity, formData)
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

    handlePresentationLink(ev) {
        let {entity} = this.state;
        let {currentSummit, history} = this.props;

        ev.preventDefault();

        let event_id = entity.id;
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
        let registration_code = '', on_site_phone = '', registered = false, checked_in = false, confirmed = false;


        if (Object.keys(entity.registration_code).length) {
            registration_code = entity.registration_code.code;
        }

        if (Object.keys(entity.summit_assistance).length) {
            on_site_phone = entity.summit_assistance.on_site_phone;
            registered = entity.summit_assistance.registered;
            checked_in = entity.summit_assistance.checked_in;
            confirmed = entity.summit_assistance.confirmed;
        }

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.member")} *</label>
                        <Input
                            className="form-control"
                            id="member_id"
                            value={entity.member_id}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.email")} </label>
                        <Input
                            className="form-control"
                            id="email"
                            disabled="true"
                            value={entity.email}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.registration_code")} </label>
                        <Input
                            className="form-control"
                            id="registration_code"
                            value={registration_code}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="registered" checked={registered} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="allow_feedback"> {T.translate("titles.registered")} </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="checked_id" checked={checked_in} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="checked_id"> {T.translate("titles.checked_id")} </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="confirmed" checked={confirmed} onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="confirmed"> {T.translate("titles.confirmed")} </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.title")} </label>
                        <Input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.first_name")} </label>
                        <Input className="form-control" id="first_name" value={entity.first_name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.last_name")} </label>
                        <Input className="form-control" id="last_name" value={entity.last_name} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("titles.on_site_phone")} </label>
                        <Input className="form-control" id="on_site_phone" value={on_site_phone} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.twitter_name")} </label>
                        <Input className="form-control" id="twitter_name" value={entity.twitter_name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("titles.irc_name")} </label>
                        <Input className="form-control" id="irc_name" value={entity.irc_name} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("titles.bio")} </label>
                        <TextEditor id="bio" value={entity.bio} onChange={this.handleChange} />
                    </div>
                </div>
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


                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this, false)}
                               className="btn btn-primary pull-right" value={T.translate("titles.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default SpeakerForm;