/**
 * Copyright 2023 OpenStack Foundation
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
import T from 'i18n-react/dist/i18n-react'
import { connect } from 'react-redux';
import {Dropdown, Input, TagInput, TicketTypesInput } from 'openstack-uicore-foundation/lib/components';
import PromoCodeInput from '../inputs/promo-code-input';
import BadgeFeatureInput from '../inputs/badge-feature-input';
import {queryMultiSpeakersPromocodes, resetPromoCodeSpecForm, updateSpecs} from '../../actions/promocode-specification-actions';
import {
    EXISTING_SPEAKERS_PROMO_CODE, 
    EXISTING_SPEAKERS_DISCOUNT_CODE,
    AUTO_GENERATED_SPEAKERS_PROMO_CODE,
    AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE
} from '../../actions/promocode-actions';
import {hasErrors} from "../../utils/methods";

class SpeakerPromoCodeSpecForm extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleNewTag = this.handleNewTag.bind(this);
    }

    componentDidMount() {
        this.props.resetPromoCodeSpecForm();
    }

    handleChange(ev) {
        const {promoCodeStrategy} = this.props;
        let entity = {...this.props.entity};
        let errors = {...this.props.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.props.updateSpecs(promoCodeStrategy, entity);
    }

    handleNewTag(newTag) {
        const {promoCodeStrategy} = this.props;
        let entity = {...this.props.entity};
        entity.tags = [...entity.tags, {tag: newTag}]
        this.props.updateSpecs(promoCodeStrategy, entity);
    }

    render() {
        const { entity, errors, promoCodeStrategy, summit } = this.props;

        let promoCodeTypeDDL = [
            { label: T.translate("promo_code_specification.select_promo_code_type"), value: '' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Alternate', value: 'alternate' },
        ];

        return (
            <form className="speakers-promo-code-spec-form">
                { [EXISTING_SPEAKERS_PROMO_CODE, EXISTING_SPEAKERS_DISCOUNT_CODE].includes(promoCodeStrategy) &&
                <>
                    <hr />
                    <div className="row form-group">
                        <div className="col-md-12">
                            <PromoCodeInput
                                id="existingPromoCode"
                                value={entity.existingPromoCode}
                                summitId={summit.id}
                                onChange={this.handleChange}
                                placeholder={promoCodeStrategy === 1 ? 
                                    T.translate("promo_code_specification.placeholders.speakers_promo_code") : 
                                    T.translate("promo_code_specification.placeholders.speakers_discount_code")}
                                customQueryAction={queryMultiSpeakersPromocodes}
                                isClearable={true}
                                error={hasErrors('existingPromoCode', errors)}
                            />
                        </div>
                    </div>
                    <hr />
                </>
                }
                { [AUTO_GENERATED_SPEAKERS_PROMO_CODE, AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE].includes(promoCodeStrategy) &&
                <>
                    <hr />
                    <div className="row form-group">
                        <div className="col-md-12">
                            <Dropdown
                                id="type"
                                value={entity.type}
                                onChange={this.handleChange}
                                options={promoCodeTypeDDL}
                                isClearable={true}
                                error={hasErrors('type', errors)}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                             <TagInput
                                id="tags"
                                clearable
                                isMulti
                                allowCreate
                                value={entity.tags}
                                onChange={this.handleChange}
                                onCreate={this.handleNewTag}
                                placeholder={T.translate("promo_code_specification.placeholders.tags")}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <BadgeFeatureInput
                                id="badgeFeatures"
                                value={entity.badgeFeatures}
                                summitId={summit.id}
                                onChange={this.handleChange}
                                placeholder={T.translate("promo_code_specification.placeholders.badge_features")}
                                isMulti={true}
                                isClearable={true}
                            />
                        </div>
                    </div>
                    {promoCodeStrategy === AUTO_GENERATED_SPEAKERS_PROMO_CODE &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <TicketTypesInput
                                id="ticketTypes"
                                value={entity.ticketTypes}
                                summitId={summit.id}
                                onChange={this.handleChange}
                                placeholder={T.translate("promo_code_specification.placeholders.ticket_types")}
                                isMulti={true}
                                isClearable={true}
                            />
                        </div>
                    </div>
                    }
                    {promoCodeStrategy === AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE &&
                    <>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <div className="form-check abc-checkbox">
                                    <input type="checkbox" id="applyToAllTix" checked={entity.applyToAllTix}
                                        onChange={this.handleChange} className="form-check-input"/>
                                    <label className="form-check-label" htmlFor="applyToAllTix">
                                        {T.translate("edit_promocode.apply_to_all_tix")}
                                    </label>
                                </div>
                            </div>
                        </div>
                        {!entity.applyToAllTix &&
                        <div className="row form-group">
                            <div className="col-md-12">
                                <TicketTypesInput
                                    id="ticketTypes"
                                    value={entity.ticketTypes}
                                    summitId={summit.id}
                                    onChange={this.handleChange}
                                    placeholder={T.translate("promo_code_specification.placeholders.ticket_types")}
                                    isMulti={true}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                        }
                        <div className="row form-group">
                            <div className="col-md-5">
                                <Input 
                                    id="amount" 
                                    value={entity.rate ? '' : entity.amount}
                                    readOnly={entity.rate}
                                    type="number" 
                                    className="form-control" 
                                    placeholder={T.translate("promo_code_specification.placeholders.amount")}
                                    onChange={this.handleChange}
                                    error={hasErrors('amount', errors)}
                                />
                            </div>
                            <div className="col-md-2">
                                OR
                            </div>
                            <div className="col-md-5">
                                <Input 
                                    id="rate" 
                                    value={entity.amount ? '' : entity.rate}
                                    readOnly={entity.amount}
                                    type="number" 
                                    className="form-control" 
                                    placeholder={T.translate("promo_code_specification.placeholders.rate")}
                                    onChange={this.handleChange}
                                    error={hasErrors('rate', errors)}
                                />
                            </div>
                        </div>
                    </>
                    }
                    <hr />
                </>
                }
            </form>
        );
    }
}

export default connect(
    null,
    {
        resetPromoCodeSpecForm,
        updateSpecs
    }
)(SpeakerPromoCodeSpecForm);