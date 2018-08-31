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
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'
import { Input, SpeakerInput } from 'openstack-uicore-foundation/lib/components'


class SpeakerAttendanceForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSendEmail = this.handleSendEmail.bind(this);
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

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSendEmail(ev) {
        let {entity} = this.state;
        ev.preventDefault();

        this.props.onSendEmail(entity.id);
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
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
            <form className="speaker-attendance-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("general.speaker")}: </label>
                        <SpeakerInput
                            id="speaker"
                            value={entity.speaker}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                            history={history}
                        />
                    </div>
                    {entity.id !== 0 && entity.email_sent === false &&
                    <div className="col-md-4 send-email-box">
                        <input type="button" onClick={this.handleSendEmail}
                               className="btn btn-default"
                               value={T.translate("edit_speaker_attendance.send_email")}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_speaker_attendance.on_site_phone")}</label>
                        <Input
                            id="on_site_phone"
                            value={entity.on_site_phone}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('code')}
                        />
                    </div>
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="registered" checked={entity.registered}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="registered">
                                {T.translate("edit_speaker_attendance.registered")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_confirmed" checked={entity.is_confirmed}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_confirmed">
                                {T.translate("edit_speaker_attendance.is_confirmed")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="checked_in" checked={entity.checked_in}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="checked_in">
                                {T.translate("edit_speaker_attendance.checked_in")}
                            </label>
                        </div>
                    </div>
                </div>

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

export default SpeakerAttendanceForm;
