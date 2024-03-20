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
import { Dropdown, Input, TagInput } from 'openstack-uicore-foundation/lib/components'
import {
    SpeakerPCForm, MemberPCForm, SponsorPCForm, MemberDiscountPCForm, SpeakerDiscountPCForm, SponsorDiscountPCForm,
    SummitPCForm, SummitDiscountPCForm, SpeakersPCForm, SpeakersDiscountPCForm
} from './forms';
import {isEmpty, scrollToError, shallowEqual, validateEmail} from "../../../utils/methods";
import { DEFAULT_ENTITY } from '../../../reducers/promocodes/promocode-reducer';
import FragmentParser from "../../../utils/fragmen-parser";


class PromocodeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.fragmentParser = new FragmentParser();

        this.handleClassChange = this.handleClassChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSendEmail = this.handleSendEmail.bind(this);
        this.hasErrors = this.hasErrors.bind(this);
        this.handleBadgeFeatureLink = this.handleBadgeFeatureLink.bind(this);
        this.handleBadgeFeatureUnLink = this.handleBadgeFeatureUnLink.bind(this);
        this.queryBadgeFeatures = this.queryBadgeFeatures.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNewTag = this.handleNewTag.bind(this);
        this.validate = this.validate.bind(this);
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
        let {value, id} = ev.target;

        entity = {...DEFAULT_ENTITY}
        entity.class_name = value;

        this.setState({entity: entity});
    }

    handleSendEmail(ev) {
        const {entity} = this.state;
        ev.preventDefault();

        this.props.onSendEmail(entity.id);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        const typeScope = this.fragmentParser.getParam('type');

        if (this.validate()) {
            this.props.onSubmit(this.state.entity, typeScope === 'sponsor');
        }
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    validate() {
        const {entity, errors} = this.state;
        const validEmail = validateEmail(entity.contact_email);

        if (entity.contact_email && !validEmail) {
            errors.contact_email = 'Please enter a valid email.'
            this.setState({errors});
            return false;
        }

        return true
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

    handleNewTag(newTag) {
        this.setState({...this.state, entity: {...this.state.entity, tags: [...this.state.entity.tags, {tag: newTag}]}})
    }

    render() {
        const {entity} = this.state;
        const { currentSummit, allClasses } = this.props;
        const typeScope = this.fragmentParser.getParam('type');

        let promocode_class_ddl = allClasses.map(c => ({label: c.class_name, value: c.class_name}));
        let promocode_types_ddl = [];

        if (typeScope === 'sponsor') {
            promocode_class_ddl = promocode_class_ddl.filter(pc => pc.value.includes('SPONSOR'));
        }

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
                    <div className="col-md-3">
                        <label> {T.translate("edit_promocode.tags")}</label>
                        <TagInput
                            id="tags"
                            clearable
                            isMulti
                            allowCreate
                            value={entity.tags}
                            onChange={this.handleChange}
                            onCreate={this.handleNewTag}
                            placeholder={T.translate("edit_promocode.placeholders.select_tags")}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_promocode.description")}</label>
                        <textarea
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            maxLength="255"
                            className="form-control"
                            error={this.hasErrors('description')}
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

                {['SUMMIT_PROMO_CODE','PRE_PAID_PROMO_CODE'].includes(entity.class_name) &&
                <SummitPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {['SUMMIT_DISCOUNT_CODE','PRE_PAID_DISCOUNT_CODE'].includes(entity.class_name) &&
                <SummitDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                />
                }

                {entity.class_name === 'SPEAKERS_PROMO_CODE' &&
                <SpeakersPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                    assignSpeaker={this.props.assignSpeaker}
                    getAssignedSpeakers={this.props.getAssignedSpeakers}
                    unAssignSpeaker={this.props.unAssignSpeaker}
                    resetPromocodeForm={this.props.resetPromocodeForm}
                />
                }

                {entity.class_name === 'SPEAKERS_DISCOUNT_CODE' &&
                <SpeakersDiscountPCForm
                    entity={entity}
                    summit={currentSummit}
                    handleChange={this.handleChange}
                    handleSendEmail={this.handleSendEmail}
                    badgeFeatureColumns={badgeFeatureColumns}
                    badgeFeatureOptions={badgeFeatureOptions}
                    hasErrors={this.hasErrors}
                    assignSpeaker={this.props.assignSpeaker}
                    getAssignedSpeakers={this.props.getAssignedSpeakers}
                    unAssignSpeaker={this.props.unAssignSpeaker}
                    resetPromocodeForm={this.props.resetPromocodeForm}
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
