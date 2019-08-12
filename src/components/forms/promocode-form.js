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
import { Dropdown, DateTimePicker, SpeakerInput, MemberInput, CompanyInput, Input } from 'openstack-uicore-foundation/lib/components'
import { DiscountTicketTable } from '../tables/dicount-ticket-table';

// FORM DEFS
const EmailRedeemForm = (props) => (
    <>
        <div className="row form-group checkboxes-div">
            <div className="col-md-3">
                <div className="form-check abc-checkbox">
                    <input disabled type="checkbox" id="email_sent" checked={props.entity.email_sent}
                           onChange={props.handleChange} className="form-check-input"/>
                    <label className="form-check-label" htmlFor="email_sent">
                        {T.translate("edit_promocode.email_sent")}
                    </label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check abc-checkbox">
                    <input disabled type="checkbox" id="redeemed" checked={props.entity.redeemed}
                           onChange={props.handleChange} className="form-check-input"/>
                    <label className="form-check-label" htmlFor="redeemed">
                        {T.translate("edit_promocode.redeemed")}
                    </label>
                </div>
            </div>
            {props.entity.id !== 0 &&
            <div className="col-md-3">
                <input type="button" onClick={props.handleSendEmail}
                       className="btn btn-default pull-right" value={T.translate("edit_promocode.send_email")}/>
            </div>
            }
        </div>
    </>
);

const SpeakerPCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-6">
                <label> {T.translate("general.speaker")} </label>
                <SpeakerInput
                    id="speaker"
                    value={props.entity.speaker}
                    onChange={props.handleChange}
                    summitId={props.summit.id}
                    error={props.hasErrors('speaker_id')}
                />
            </div>
        </div>
        <EmailRedeemForm entity={props.entity} handleChange={props.handleChange} handleSendEmail={props.handleSendEmail} />
    </>
);

const MemberPCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-6">
                <label> {T.translate("general.member")} </label>
                <MemberInput
                    id="owner"
                    value={props.entity.owner}
                    onChange={props.handleChange}
                    error={props.hasErrors('owner_id')}
                />
            </div>
        </div>
        <div className="row form-group">
            <div className="or-label col-md-12">{T.translate("edit_promocode.or")}</div>
            <br/>
            <div className="col-md-3">
                <label> {T.translate("general.first_name")} </label>
                <Input
                    id="first_name"
                    value={props.entity.first_name}
                    onChange={props.handleChange}
                    className="form-control"
                    error={props.hasErrors('first_name')}
                />
            </div>
            <div className="col-md-3">
                <label> {T.translate("general.last_name")} </label>
                <Input
                    id="last_name"
                    value={props.entity.last_name}
                    onChange={props.handleChange}
                    className="form-control"
                />
            </div>
            <div className="col-md-3">
                <label> {T.translate("general.email")} </label>
                <Input
                    id="email"
                    value={props.entity.email}
                    onChange={props.handleChange}
                    className="form-control"
                />
            </div>
        </div>
        <EmailRedeemForm entity={props.entity} handleChange={props.handleChange} handleSendEmail={props.handleSendEmail} />
    </>
);


const SponsorPCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-6">
                <label> {T.translate("edit_promocode.sponsor")} </label>
                <CompanyInput
                    id="sponsor"
                    value={props.entity.sponsor}
                    onChange={props.handleChange}
                    summitId={props.summit.id}
                    error={props.hasErrors('sponsor_id')}
                />
            </div>
        </div>
        <MemberPCForm {...props} />
    </>
);


const BadgeBasePCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.quantity_available")} </label>
                <Input
                    id="quantity_available"
                    type="number"
                    value={props.entity.quantity_available}
                    onChange={props.handleChange}
                    className="form-control"
                />
            </div>
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.quantity_used")}</label>
                <Input
                    id="quantity_used"
                    type="number"
                    value={props.entity.quantity_used || 0}
                    onChange={props.handleChange}
                    className="form-control"
                    disabled
                />
            </div>
        </div>
        <div className="row form-group">
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.valid_since_date")} *</label>
                <DateTimePicker
                    id="valid_since_date"
                    onChange={props.handleChange}
                    format={{date:"YYYY-MM-DD", time: false}}
                    timezone="UTC"
                    value={props.entity.valid_since_date}
                />
            </div>
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.valid_until_date")} *</label>
                <DateTimePicker
                    id="valid_until_date"
                    onChange={props.handleChange}
                    format={{date:"YYYY-MM-DD", time: false}}
                    timezone="UTC"
                    value={props.entity.valid_until_date}
                />
            </div>
        </div>
        <div className="row form-group">
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.badge_type_id")} *</label>
                <Dropdown
                    id="badge_type_id"
                    value={props.entity.badge_type_id}
                    onChange={props.handleChange}
                    placeholder={T.translate("edit_promocode.placeholders.select_badge_type")}
                    options={props.summit.badge_types}
                />
            </div>
            <div className="col-md-8">
                <label> {T.translate("edit_promocode.badge_features")} *</label>
                <Dropdown
                    id="badge_features"
                    value={props.entity.badge_features}
                    onChange={props.handleChange}
                    placeholder={T.translate("edit_promocode.placeholders.select_badge_features")}
                    options={props.summit.badge_features}
                    isMulti
                />
            </div>
        </div>
    </>
);

const BadgePCForm = (props) => (
    <>
        <BadgeBasePCForm {...props} />
        <div className="row form-group">
            <div className="col-md-6">
                <label> {T.translate("edit_promocode.allowed_ticket_types")} *</label>
                <Dropdown
                    id="allowed_ticket_types"
                    value={props.entity.allowed_ticket_types}
                    onChange={props.handleChange}
                    placeholder={T.translate("edit_promocode.placeholders.select_ticket_types")}
                    options={props.summit.ticket_types}
                    isMulti
                />
            </div>
        </div>
    </>
);

const DiscountPCForm = (props) => (
    <>
        <BadgeBasePCForm {...props} />

        <div className="row form-group">
            <div className="col-md-4">
                <div className="form-check abc-checkbox">
                    <input type="checkbox" id="apply_to_all_tix" checked={props.entity.apply_to_all_tix}
                           onChange={props.handleChange} className="form-check-input"/>
                    <label className="form-check-label" htmlFor="apply_to_all_tix">
                        {T.translate("edit_promocode.apply_to_all_tix")}
                    </label>
                </div>
            </div>
        </div>
        {props.entity.apply_to_all_tix &&
        <div className="row form-group">
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.amount")} </label>
                <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={props.entity.amount}
                    onChange={props.handleChange}
                    className="form-control"
                    disabled={props.entity.rate > 0}
                />
            </div>
            <div className="col-md-2 text-center">
                <label> {T.translate("edit_promocode.or")} </label>
            </div>
            <div className="col-md-4">
                <label> {T.translate("edit_promocode.rate")} </label>
                <Input
                    id="rate"
                    type="number"
                    min="0"
                    max="100"
                    value={props.entity.rate}
                    onChange={props.handleChange}
                    className="form-control"
                    disabled={props.entity.amount > 0}
                />
            </div>
        </div>
        }
        {!props.entity.apply_to_all_tix &&
        <DiscountTicketTable
            ownerId={props.entity.id}
            data={props.entity.allowed_ticket_types}
            ticketTypes={props.summit.ticket_types}
        />
        }
    </>
);




class PromocodeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSendEmail = this.handleSendEmail.bind(this);
        this.hasErrors = this.hasErrors.bind(this);
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

        if (id == 'apply_to_all_tix' && value == false) {
            entity.amount = 0;
            entity.rate = 0;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleTypeChange(ev) {
        let entity = {...this.state.entity};
        let {allClasses} = this.props;
        let {value, id} = ev.target;

        // tmp for testing
        allClasses.push({class_name: 'BADGE_PROMO_CODE', type: ['BADGE']});
        allClasses.push({class_name: 'DISCOUNT_PROMO_CODE', type: ['DISCOUNT']});

        entity.type = value;
        entity.class_name = allClasses.find(c => c.type.indexOf(value) !== -1).class_name;

        this.setState({entity: entity});
    }

    handleSendEmail(ev) {
        let {entity} = this.state;
        ev.preventDefault();

        this.props.onSendEmail(entity.id);
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
        let { currentSummit, allTypes } = this.props;
        let promocode_types_ddl = allTypes.map(t => ({label: t, value: t}));

        // tmp for testing
        promocode_types_ddl.push({label: 'BADGE', value: 'BADGE'});
        promocode_types_ddl.push({label: 'DISCOUNT', value: 'DISCOUNT'});

        return (
            <form className="promocode-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_promocode.type")} *</label>
                        <Dropdown
                            id="type"
                            value={entity.type}
                            placeholder={T.translate("promocode_list.placeholders.select_type")}
                            options={promocode_types_ddl}
                            onChange={this.handleTypeChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_promocode.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('code')}
                        />
                    </div>
                </div>

                {entity.class_name == 'SPEAKER_PROMO_CODE' &&
                <SpeakerPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'SPONSOR_PROMO_CODE' &&
                <SponsorPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'MEMBER_PROMO_CODE' &&
                <MemberPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'BADGE_PROMO_CODE' &&
                <BadgePCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'DISCOUNT_PROMO_CODE' &&
                <DiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    hasErrors={this.hasErrors}
                />
                }


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

export default PromocodeForm;
