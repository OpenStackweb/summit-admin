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
import UploadInput from '../upload-input'
import Input from '../text-input'
import SummitDropdown from '../summit-dropdown'
import Select from 'react-select'
import {findElementPos} from '../../utils/methods'


class SpeakerForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSummit: null
        };

        this.getPresentations = this.getPresentations.bind(this);
        this.getAttendance = this.getAttendance.bind(this);
        this.getPromocodes = this.getPromocodes.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleSummit = this.toggleSummit.bind(this);
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

    handlePresentationLink(summit, event_id, ev) {
        ev.preventDefault();
        let event_detail_url = summit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');
        window.open(event_detail_url, '_blank');
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    getPresentations(summitId) {
        let presentations = this.state.entity.all_presentations.filter( p => p.summit_id === summitId );
        let {history} = this.props;

        return (
            <div>
                Presentations:
                {presentations.map(p =>
                <li key={'pres' + p.id}>
                    <a href="" onClick={() => {history.push(`/app/summits/${summitId}/events/${p.id}`)}} >
                        {p.title}
                    </a>
                    <i> - {p.status}</i>
                </li>
                )}
            </div>
        );
    }

    getAttendance(summitId) {
        let assistances = this.state.entity.summit_assistances.filter( a => a.summit_id === summitId );
        let {history} = this.props;

        return (
            <div>
                Attendance:
                {assistances.map(a =>
                <li key={'ass' + a.id}>
                    <a href="" onClick={() => {history.push(`/app/summits/${summitId}/attendance/${a.id}`)}} >
                        Ph:{a.on_site_phone ? a.on_site_phone : '-'}
                        {a.registered ? <i> - Registered </i> : ''}
                        {a.checked_in ? <i> - Checked in </i> :''}
                        {a.is_confirmed ? <i> - Confirmed </i> :''}
                    </a>
                </li>
                )}
            </div>
        );
    }

    getPromocodes(summitId) {
        let promocodes = this.state.entity.registration_codes.filter( r => r.summit_id === summitId );
        let {history, summits} = this.props;

        return (
            <div>
                Promocodes:
                {promocodes.map(p =>
                <li key={'prom' + p.id}>
                    <a href="" onClick={() => {history.push(`/app/summits/${summitId}/promocodes/${p.id}`)}} >
                        {p.code}
                    </a>
                    {p.email_sent ? <i> - Email Sent </i> : ''}
                    {p.redeemed ? <i> - Redeemed </i> : ''}
                </li>
                )}
                <li>
                    <SummitDropdown small summits={summits} actionLabel="Add" onClick={this.handlePresentationLink.bind(this, 1)} />
                </li>
            </div>
        );
    }

    toggleSummit(summitId, ev) {
        let {showSummit} = this.state;
        let newShowSummit = (showSummit === summitId) ? null : summitId;
        ev.preventDefault();

        this.setState({showSummit: newShowSummit});
    }

    render() {
        let {entity, showSummit} = this.state;
        let {summits} = this.props;

        let lastSummits = this.props.summits.sort(
            (a, b) => (a.start_date > b.start_date ? 1 : (a.start_date < b.start_date ? -1 : 0))
        ).slice(-3);

        return (
            <form className="summit-speaker-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("general.member")} *</label>
                        <MemberInput
                            id="member"
                            value={entity.member}
                            onChange={this.handleChange}
                            multi={false}
                        />
                    </div>
                    {entity.id != 0 &&
                    <div className="col-md-4">
                        <label> {T.translate("general.email")} </label>
                        <Input
                            className="form-control"
                            id="email"
                            disabled="true"
                            value={entity.email}
                            onChange={this.handleChange}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.title")} </label>
                        <Input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.first_name")} </label>
                        <Input className="form-control" id="first_name" value={entity.first_name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.last_name")} </label>
                        <Input className="form-control" id="last_name" value={entity.last_name} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.twitter")} </label>
                        <Input className="form-control" id="twitter" value={entity.twitter} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.irc")} </label>
                        <Input className="form-control" id="irc" value={entity.irc} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_speaker.bio")} </label>
                        <TextEditor id="bio" value={entity.bio} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_speaker.profile_pic")} </label>
                        <UploadInput
                            value={entity.pic}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <br/>
                <hr/>
                { lastSummits.map(s =>
                    <div key={'last-summits-' + s.id} className="panel-group summit-data">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h4 className="panel-title">
                                    <a className={showSummit == s.id ? 'collapsed' : ''} onClick={this.toggleSummit.bind(this, s.id)}>
                                        {s.name}
                                    </a>
                                </h4>
                            </div>
                            <div className="panel-collapse collapse in">
                                {showSummit === s.id &&
                                <div className="panel-body">
                                    {this.getPresentations(s.id)}
                                    {this.getAttendance(s.id)}
                                    {this.getPromocodes(s.id)}
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                )}

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

export default SpeakerForm;