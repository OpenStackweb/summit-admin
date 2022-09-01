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
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/utils/methods'
import { Dropdown, DateTimePicker, SpeakerInput, CompanyInput, Input } from 'openstack-uicore-foundation/lib/components'
import { DiscountTicketTable } from '../tables/dicount-ticket-table';
import OwnerInput from "../inputs/owner-input";
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";

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

const BasePCForm = (props) => {

    let badge_features_ddl = props.summit.badge_features.map(f => ({label:f.name, value:f.id}));

    return (
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
                    <label> {T.translate("edit_promocode.valid_from_date")} (00:00 hrs)</label>
                    <DateTimePicker
                        id="valid_since_date"
                        onChange={props.handleChange}
                        format={{date: "YYYY-MM-DD", time: false}}
                        timezone={props.summit.time_zone_id}
                        value={epochToMomentTimeZone(props.entity.valid_since_date, props.summit.time_zone_id)}
                    />
                </div>
                <div className="col-md-4">
                    <label> {T.translate("edit_promocode.valid_until_date")} (00:00 hrs)</label>
                    <DateTimePicker
                        id="valid_until_date"
                        onChange={props.handleChange}
                        format={{date: "YYYY-MM-DD", time: false}}
                        timezone={props.summit.time_zone_id}
                        value={epochToMomentTimeZone(props.entity.valid_until_date, props.summit.time_zone_id)}
                    />
                </div>
            </div>
            <div className="row form-group">
                <div className="col-md-12">
                    <label> {T.translate("edit_promocode.badge_features")}</label>

                    <div className="form-check abc-checkbox">
                        <input type="checkbox" id="badge_features_apply_to_all_tix_retroactively" checked={props.entity.badge_features_apply_to_all_tix_retroactively}
                               onChange={props.handleChange} className="form-check-input"/>
                        <label className="form-check-label" htmlFor="badge_features_apply_to_all_tix_retroactively">
                            {T.translate("edit_promocode.badge_features_apply_to_all_tix_retroactively")}
                        </label>
                    </div>

                    <Dropdown
                        id="badge_features"
                        value={props.entity.badge_features}
                        onChange={props.handleChange}
                        placeholder={T.translate("edit_promocode.placeholders.select_badge_features")}
                        options={badge_features_ddl}
                        isMulti
                    />
                </div>
            </div>
        </>
    );
};

const GenericBasePCForm = (props) => {

    let ticket_types_ddl = props.summit.ticket_types.map(f => ({label:f.name, value:f.id}));

    return (
        <>
            <BasePCForm {...props} />
            <div className="row form-group">
                <div className="col-md-6">
                    <label> {T.translate("edit_promocode.allowed_ticket_types")}</label>
                    <Dropdown
                        id="allowed_ticket_types"
                        value={props.entity.allowed_ticket_types}
                        onChange={props.handleChange}
                        placeholder={T.translate("edit_promocode.placeholders.select_ticket_types")}
                        options={ticket_types_ddl}
                        isMulti
                    />
                </div>
            </div>
        </>
    );
};

const SpeakerBasePCForm = (props) => (
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

const MemberBasePCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-12">
                <OwnerInput
                    id="owner"
                    owner={props.entity.owner}
                    onChange={props.handleChange}
                    errors={{email: props.hasErrors('email'), first_name: props.hasErrors('first_name'), last_name: props.hasErrors('last_name')}}
                />
            </div>
        </div>
        <EmailRedeemForm entity={props.entity} handleChange={props.handleChange} handleSendEmail={props.handleSendEmail} />
    </>
);


const SponsorBasePCForm = (props) => (
    <>
        <div className="row form-group">
            <div className="col-md-6">
                <label> {T.translate("edit_promocode.company")} </label>
                <CompanyInput
                    id="sponsor"
                    value={props.entity.sponsor}
                    onChange={props.handleChange}
                    summitId={props.summit.id}
                    allowCreate
                    onCreate={props.onCreateCompany}
                    error={props.hasErrors('sponsor_id')}
                />
            </div>
        </div>
        <MemberBasePCForm {...props} />
    </>
);




const DiscountBasePCForm = (props) => (
    <>
        <BasePCForm {...props} />

        <div className="row form-group">
            <div className="col-md-4">
                <label>
                    {T.translate("edit_promocode.apply_to_all_tix_discounts")}
                </label>
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
                <label> {T.translate("edit_promocode.amount")} ($)</label>
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
                <label> {T.translate("edit_promocode.rate")} (% discount)</label>
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
            <>
                {props.entity.id !== 0 &&
                <DiscountTicketTable
                    ownerId={props.entity.id}
                    data={props.entity.ticket_types_rules}
                    ticketTypes={props.summit.ticket_types}
                />
                }
                {props.entity.id === 0 &&
                <p>Please save the promocode before adding rates to different ticket types</p>
                }
            </>
        }
    </>
);


const MemberPCForm = (props) => (
    <>
        <MemberBasePCForm {...props} />
        <GenericBasePCForm {...props} />
    </>
);

const SpeakerPCForm = (props) => (
    <>
        <SpeakerBasePCForm {...props} />
        <GenericBasePCForm {...props} />
    </>
);

const SponsorPCForm = (props) => (
    <>
        <SponsorBasePCForm {...props} />
        <GenericBasePCForm {...props} />
    </>
);

const MemberDiscountPCForm = (props) => (
    <>
        <MemberBasePCForm {...props} />
        <DiscountBasePCForm {...props} />
    </>
);

const SpeakerDiscountPCForm = (props) => (
    <>
        <SpeakerBasePCForm {...props} />
        <DiscountBasePCForm {...props} />
    </>
);

const SponsorDiscountPCForm = (props) => (
    <>
        <SponsorBasePCForm {...props} />
        <DiscountBasePCForm {...props} />
    </>
);

const SummitPCForm = (props) => (
    <>
        <GenericBasePCForm {...props} />
    </>
);

const SummitDiscountPCForm = (props) => (
    <>
        <DiscountBasePCForm {...props} />
    </>
);




class PromocodeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleClassChange = this.handleClassChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSendEmail = this.handleSendEmail.bind(this);
        this.hasErrors = this.hasErrors.bind(this);
        this.handleBadgeFeatureLink = this.handleBadgeFeatureLink.bind(this);
        this.handleBadgeFeatureUnLink = this.handleBadgeFeatureUnLink.bind(this);
        this.queryBadgeFeatures = this.queryBadgeFeatures.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (id === 'apply_to_all_tix' && value === false) {
            entity.amount = 0;
            entity.rate = 0;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleClassChange(ev) {
        let entity = {...this.state.entity};
        let {allClasses} = this.props;
        let {value, id} = ev.target;

        entity.class_name = value;
        entity.type = null;
        entity.allowed_ticket_types = [];
        entity.ticket_types_rules = [];

        this.setState({entity: entity});
    }

    handleSendEmail(ev) {
        const {entity} = this.state;
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

    handleBadgeFeatureLink(valueId) {
        const {entity} = this.state;
        this.props.onBadgeFeatureLink(entity.id, valueId);
    }

    handleBadgeFeatureUnLink(valueId) {
        const {entity} = this.state;
        this.props.onBadgeFeatureUnLink(entity.id, valueId);
    }

    queryBadgeFeatures(input, callback) {
        const {currentSummit} = this.props;
        let badgeFeatures = [];

        badgeFeatures = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1)

        callback(badgeFeatures);
    }

    render() {
        const {entity} = this.state;
        const { currentSummit, allTypes, allClasses } = this.props;
        let promocode_class_ddl = allClasses.map(c => ({label: c.class_name, value: c.class_name}));
        let promocode_types_ddl = [];

        if (entity.class_name) {
            let classTypes = allClasses.find(c => c.class_name === entity.class_name).type;
            if (classTypes) {
                promocode_types_ddl = classTypes.map(t => ({label: t, value: t}));
            }
        }

        let badgeFeatureColumns = [
            { columnKey: 'name', value: T.translate("edit_promocode.name") },
            { columnKey: 'description', value: T.translate("edit_promocode.description") }
        ];

        let badgeFeatureOptions = {
            title: T.translate("edit_promocode.badge_features"),
            valueKey: "name",
            labelKey: "name",
            actions: {
                search: this.queryBadgeFeatures,
                delete: { onClick: this.handleBadgeFeatureUnLink },
                add: { onClick: this.handleBadgeFeatureLink }
            }
        };

        return (
            <form className="promocode-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_promocode.class_name")} *</label>
                        <Dropdown
                            id="type"
                            value={entity.class_name}
                            placeholder={T.translate("edit_promocode.placeholders.select_class_name")}
                            options={promocode_class_ddl}
                            onChange={this.handleClassChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    {promocode_types_ddl.length > 0 &&
                    <div className="col-md-3">
                        <label> {T.translate("edit_promocode.type")} *</label>
                        <Dropdown
                            id="type"
                            value={entity.type}
                            placeholder={T.translate("promocode_list.placeholders.select_type")}
                            options={promocode_types_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    }
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

                {entity.class_name === 'SPEAKER_PROMO_CODE' &&
                <SpeakerPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SPONSOR_PROMO_CODE' &&
                <SponsorPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    onCreateCompany={this.props.onCreateCompany}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'MEMBER_PROMO_CODE' &&
                <MemberPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SPEAKER_DISCOUNT_CODE' &&
                <SpeakerDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SPONSOR_DISCOUNT_CODE' &&
                <SponsorDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    onCreateCompany={this.props.onCreateCompany}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'MEMBER_DISCOUNT_CODE' &&
                <MemberDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SUMMIT_PROMO_CODE' &&
                <SummitPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SUMMIT_DISCOUNT_CODE' &&
                <SummitDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
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
