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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import {
    findElementPos,
} from 'openstack-uicore-foundation/lib/methods'
import { Input, Dropdown } from 'openstack-uicore-foundation/lib/components';

class PaymentProfileForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
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

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
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
        let application_type_ddl = [
            {label: 'Registration', value: 'Registration'},
            {label: 'Bookable Rooms', value: 'BookableRooms'},
        ];

        return (
            <form className="payment-profile-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_payment_profile.application_type")}</label>
                        <Dropdown
                            id="application_type"
                            value={entity.application_type}
                            onChange={this.handleChange}
                            options={application_type_ddl}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_payment_profile.provider")}</label>
                        <Input
                            className="form-control"
                            id="provider"
                            value={entity.provider}
                            readOnly={true}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="active" checked={entity.active}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="active">
                                {T.translate("edit_payment_profile.active")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="test_mode_enabled" checked={entity.test_mode_enabled}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="test_mode_enabled">
                                {T.translate("edit_payment_profile.test_mode_enabled")}
                            </label>
                            &nbsp;<i className="fa fa-info-circle pointable" aria-hidden="true" title={T.translate("edit_payment_profile.info_stripe_test_mode")}></i>
                        </div>
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="send_email_receipt" checked={entity.send_email_receipt}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="send_email_receipt">
                                {T.translate("edit_payment_profile.send_email_receipt")}
                            </label>
                            &nbsp;<i className="fa fa-info-circle pointable" aria-hidden="true" title={T.translate("edit_payment_profile.info_send_email_receipt")}></i>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_payment_profile.live_secret_key")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_payment_profile.info_stripe_keys")}></i>
                        <Input
                            id="live_secret_key"
                            className="form-control"
                            error={this.hasErrors('live_secret_key')}
                            onChange={this.handleChange}
                            value={entity.live_secret_key}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_payment_profile.live_publishable_key")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_payment_profile.info_stripe_keys")}></i>
                        <Input
                            id="live_publishable_key"
                            className="form-control"
                            error={this.hasErrors('live_publishable_key')}
                            onChange={this.handleChange}
                            value={entity.live_publishable_key}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_payment_profile.test_secret_key")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_payment_profile.info_stripe_keys")}></i>
                        <Input
                            id="test_secret_key"
                            className="form-control"
                            error={this.hasErrors('test_secret_key')}
                            onChange={this.handleChange}
                            value={entity.test_secret_key}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_payment_profile.test_publishable_key")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_payment_profile.info_stripe_keys")}></i>
                        <Input
                            id="test_publishable_key"
                            className="form-control"
                            error={this.hasErrors('test_publishable_key')}
                            onChange={this.handleChange}
                            value={entity.test_publishable_key}
                        />
                     </div>
                </div>
                <hr />
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

export default PaymentProfileForm;
