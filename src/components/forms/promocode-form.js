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
import {findElementPos, epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/methods'
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

const BasePCForm = (props) => {

    let badge_features_ddl = props.summit.badge_features.map(f => ({label:f.name, value:f.id}));
    let badge_types_ddl = props.summit.badge_types.map(f => ({label:f.name, value:f.id}));

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
                <div className="col-md-4">
                    <label> {T.translate("edit_promocode.badge_type_id")}</label>
                    <Dropdown
                        id="badge_type_id"
                        value={props.entity.badge_type_id}
                        onChange={props.handleChange}
                        placeholder={T.translate("edit_promocode.placeholders.select_badge_type")}
                        options={badge_types_ddl}
                    />
                </div>
                <div className="col-md-8">
                    <label> {T.translate("edit_promocode.badge_features")}</label>
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


const SponsorBasePCForm = (props) => (
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
        <MemberBasePCForm {...props} />
    </>
);




const DiscountBasePCForm = (props) => (
    <>
        <BasePCForm {...props} />

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
        <DiscountTicketTable
            ownerId={props.entity.id}
            data={props.entity.allowed_ticket_types}
            ticketTypes={props.summit.ticket_types}
        />
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

        if (ev.target.type == 'datetime') {
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

    handleBadgeFeatureLink(value) {
        let {entity} = this.state;
        this.props.onBadgeFeatureLink(entity.id, value);
    }

    handleBadgeFeatureUnLink(valueId) {
        let {entity} = this.state;
        this.props.onBadgeFeatureUnLink(entity.id, valueId);
    }

    queryBadgeFeatures(input, callback) {
        let {currentSummit} = this.props;
        let badgeFeatures = [];

        badgeFeatures = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1)

        callback(badgeFeatures);
    }


    render() {
        let {entity} = this.state;
        let { currentSummit, allTypes, allClasses } = this.props;
        let promocode_class_ddl = allClasses.map(c => ({label: c.class_name, value: c.class_name}));
        let promocode_types_ddl = [];

        if (entity.class_name) {
            let classTypes = allClasses.find(c => c.class_name == entity.class_name).type;
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

                {entity.class_name == 'SPEAKER_PROMO_CODE' &&
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

                {entity.class_name == 'SPONSOR_PROMO_CODE' &&
                <SponsorPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'MEMBER_PROMO_CODE' &&
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

                {entity.class_name == 'SPEAKER_DISCOUNT_CODE' &&
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

                {entity.class_name == 'SPONSOR_DISCOUNT_CODE' &&
                <SponsorDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'MEMBER_DISCOUNT_CODE' &&
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

                {entity.class_name == 'SUMMIT_PROMO_CODE' &&
                <SummitPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name == 'SUMMIT_DISCOUNT_CODE' &&
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
