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
import {findElementPos} from '../../utils/methods'
import Dropdown from '../inputs/dropdown'
import Input from '../inputs/text-input'


class LocationForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.shouldShowComponent = this.shouldShowComponent.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
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

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleTypeChange(ev) {
        let entity = {...this.state.entity};
        let {allClasses} = this.props;
        let {value, id} = ev.target;

        entity.type = value;
        entity.class_name = allClasses.find(c => c.type.indexOf(value) !== -1).class_name;

        this.setState({entity: entity});
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

    shouldShowComponent(component) {
        let {class_name} = this.state.entity;

        if (!class_name) return false;

        switch(component) {
            case 'speaker':
                return (class_name == 'SPEAKER_PROMO_CODE');
                break;
            case 'member':
                return (class_name == 'MEMBER_PROMO_CODE' || class_name == 'SPONSOR_PROMO_CODE');
                break;
            case 'sponsor':
                return (class_name == 'SPONSOR_PROMO_CODE');
                break;
            case 'name':
                return (class_name == 'MEMBER_PROMO_CODE' || class_name == 'SPONSOR_PROMO_CODE');
                break;
        }
    }

    render() {
        let {entity} = this.state;
        let { currentSummit, allTypes } = this.props;
        let location_types_ddl = allTypes.map(t => ({label: t, value: t}));

        return (
            <form className="location-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_location.type")} *</label>
                        <Dropdown
                            id="type"
                            value={entity.type}
                            placeholder={T.translate("location_list.placeholders.select_type")}
                            options={location_types_ddl}
                            onChange={this.handleTypeChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_location.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('code')}
                        />
                    </div>
                </div>
                {this.shouldShowComponent('sponsor') &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_location.sponsor")} </label>
                        <CompanyInput
                            id="sponsor"
                            value={entity.sponsor}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                            error={this.hasErrors('sponsor_id')}
                        />
                    </div>
                </div>
                }
                {this.shouldShowComponent('member') &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("general.member")} </label>
                        <MemberInput
                            id="owner"
                            value={entity.owner}
                            onChange={this.handleChange}
                            multi={false}
                            error={this.hasErrors('owner_id')}
                        />
                    </div>
                </div>
                }
                {this.shouldShowComponent('speaker') &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("general.speaker")} </label>
                        <SpeakerInput
                            id="speaker"
                            value={entity.speaker}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            multi={false}
                            error={this.hasErrors('speaker_id')}
                        />
                    </div>
                </div>
                }
                {this.shouldShowComponent('name') &&
                <div className="row form-group">
                    <div className="or-label col-md-12">{T.translate("edit_location.or")}</div>
                    <br/>
                    <div className="col-md-3">
                        <label> {T.translate("general.first_name")} </label>
                        <Input
                            id="first_name"
                            value={entity.first_name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('first_name')}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("general.last_name")} </label>
                        <Input
                            id="last_name"
                            value={entity.last_name}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("general.email")} </label>
                        <Input
                            id="email"
                            value={entity.email}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                }
                <div className="row form-group checkboxes-div">
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input disabled type="checkbox" id="email_sent" checked={entity.email_sent}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="email_sent">
                                {T.translate("edit_location.email_sent")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-check abc-checkbox">
                            <input disabled type="checkbox" id="redeemed" checked={entity.redeemed}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="redeemed">
                                {T.translate("edit_location.redeemed")}
                            </label>
                        </div>
                    </div>
                    {entity.id !== 0 && entity.email_sent === false &&
                    <div className="col-md-3">
                        <input type="button" onClick={this.handleSendEmail}
                               className="btn btn-default pull-right" value={T.translate("edit_location.send_email")}/>
                    </div>
                    }
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

export default LocationForm;