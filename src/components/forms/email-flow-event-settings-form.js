/**
 * Copyright 2020 OpenStack Foundation
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
import React from 'react';
import T from 'i18n-react/dist/i18n-react';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css';
import { hasErrors, isEmpty, scrollToError, shallowEqual, validateEmail } from "../../utils/methods";
import { Input, UploadInput } from "openstack-uicore-foundation/lib/components";
import HexColorInput from '../inputs/hex-color-input';
import Swal from 'sweetalert2';

class EmailFlowEventSettingsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = { ...this.props.entity };
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = { ...this.props.errors };
        }

        if (!isEmpty(state)) {
            this.setState({ ...this.state, ...state })
        }
    }

    handleChange(ev) {
        const entity = { ...this.state.entity };
        const errors = { ...this.state.errors };
        let { value, id } = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';

        entity[id] = { ...entity[id], value };
        this.setState({ entity: entity, errors: errors });
    }

    handleUploadFile(file, props) {

        const { id } = props;

        let entity = { ...this.state.entity };

        entity[id].file = file;
        entity[id].file_preview = file.preview

        this.setState({ entity: entity });
    }

    handleRemoveFile(ev, data) {
        const { id } = data;
        let entity = { ...this.state.entity };

        entity[id].file_preview = '';
        
        if(entity[id].id){            
            entity[id].file = '';
            this.props.onDeleteImage(entity[id].id);
        }

        this.setState({ entity: entity });
    }

    handleSubmit(ev) {
        ev.preventDefault();

        // save only the settings with the following conditions
        const settingsToSave = Object.fromEntries(
            Object.entries(this.state.entity).filter(([key, values]) => {
              return (
                (values.type === 'TEXT' && (values.value !== '' || values.id)) ||
                (values.type === 'HEX_COLOR' && values.value !== '') ||
                (values.type === 'FILE' && values.file)
              );
            })
        );
        
        this.props.onSubmit(settingsToSave).then(() => {

            const success_message = {
                title: T.translate("general.done"),
                html: T.translate("email_flow_events_settings.email_template_settings_updated"),
                type: 'success'
            };

            Swal.fire(success_message);
        });
    }

    render() {
        const { entity, errors } = this.state;

        return (
            <form className="email-flow-event-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_generic_banner")}</label><br />
                        <UploadInput
                            id="EMAIL_TEMPLATE_GENERIC_BANNER"
                            value={entity?.EMAIL_TEMPLATE_GENERIC_BANNER?.file_preview || entity?.EMAIL_TEMPLATE_GENERIC_BANNER?.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_generic_speaker_banner")}</label><br />
                        <UploadInput
                            id="EMAIL_TEMPLATE_GENERIC_SPEAKER_BANNER"
                            value={entity?.EMAIL_TEMPLATE_GENERIC_SPEAKER_BANNER?.file_preview || entity?.EMAIL_TEMPLATE_GENERIC_SPEAKER_BANNER?.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                </div>
                <div className="row form-group">
                <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_ticket_top_graphic")}</label><br />
                        <UploadInput
                            id="EMAIL_TEMPLATE_TICKET_TOP_GRAPHIC"
                            value={entity?.EMAIL_TEMPLATE_TICKET_TOP_GRAPHIC?.file_preview || entity?.EMAIL_TEMPLATE_TICKET_TOP_GRAPHIC?.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_ticket_bottom_graphic")}</label><br />
                        <UploadInput
                            id="EMAIL_TEMPLATE_TICKET_BOTTOM_GRAPHIC"
                            value={entity?.EMAIL_TEMPLATE_TICKET_BOTTOM_GRAPHIC?.file_preview || entity?.EMAIL_TEMPLATE_TICKET_BOTTOM_GRAPHIC?.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                </div>

                <div className="row form-group">
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_generic_from")}</label><br />
                        <Input
                            id="EMAIL_TEMPLATE_GENERIC_FROM"
                            value={entity?.EMAIL_TEMPLATE_GENERIC_FROM?.value}
                            onChange={this.handleChange}
                            type="email"
                            className="form-control"
                        />
                    </div>
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_speakers_from")}</label><br />
                        <Input
                            id="EMAIL_TEMPLATE_SPEAKERS_FROM"
                            value={entity?.EMAIL_TEMPLATE_SPEAKERS_FROM?.value}
                            onChange={this.handleChange}
                            type="email"
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_primary_color")}</label><br />
                        <HexColorInput
                            onChange={this.handleChange}
                            id="EMAIL_TEMPLATE_PRIMARY_COLOR"
                            value={entity?.EMAIL_TEMPLATE_PRIMARY_COLOR?.value}
                            className="form-control" />
                    </div>
                    <div className='col-md-6'>
                        <label>{T.translate("email_flow_events_settings.email_template_secondary_color")}</label><br />
                        <HexColorInput
                            onChange={this.handleChange}
                            id="EMAIL_TEMPLATE_SECONDARY_COLOR"
                            value={entity?.EMAIL_TEMPLATE_SECONDARY_COLOR?.value}
                            className="form-control" />
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                            className="btn btn-primary pull-right" value={T.translate("general.save")} />
                    </div>
                </div>
            </form>
        );
    }
}

export default EmailFlowEventSettingsForm;
