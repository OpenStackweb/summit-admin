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
import { Input, Dropdown, Table, Panel } from 'openstack-uicore-foundation/lib/components'
import OwnerInput from '../inputs/owner-input'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class PurchaseOrderForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'billing',
            addTicketTypeId : 0,
            addTicketQty: 0,
            addPromoCode: ''
        };
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

    handleTicketEdit = (ticketId) => {
        const {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${entity.id}/tickets/${ticketId}`);
    };

    handleChange = (ev) => {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        /*if (ev.target.type == 'ownerinput') {
            value =
        }*/

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    };

    handleSubmit = (ev) => {
        let entity = {...this.state.entity};
        ev.preventDefault();
        this.props.onSubmit(entity);
    };

    handleAddTickets = (ev) => {
        ev.preventDefault();

        let {addTicketTypeId, addTicketQty, addPromoCode, entity} = this.state;
        if(!entity || !addTicketTypeId || !addTicketQty) return;

        this.props.addTickets(entity.id, addTicketTypeId, addTicketQty, addPromoCode)
            .then(() => this.setState({
                addTicketTypeId : null,
                addTicketQty: 0,
                addPromoCode: ''
            }));
    };

    hasErrors = (field) => {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    };

    toggleSection = (section, ev) => {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    };

    render() {
        const {entity, showSection} = this.state;
        const {currentSummit} = this.props;

        let ticket_columns = [
            { columnKey: 'number', value: T.translate("edit_purchase_order.ticket_number") },
            { columnKey: 'ticket_type_name', value: T.translate("edit_purchase_order.ticket_type_name") },
            { columnKey: 'owner_link', value: T.translate("edit_purchase_order.attendee") },
            { columnKey: 'email_link', value: T.translate("edit_purchase_order.owner_email") },
            { columnKey: 'final_amount_formatted', value: T.translate("edit_purchase_order.paid_amount")},
            { columnKey: 'refunded_amount_formatted', value: T.translate("edit_purchase_order.refunded_amount")},
            { columnKey: 'final_amount_adjusted_formatted', value: T.translate("edit_purchase_order.paid_amount_adjusted")}
        ];

        let ticket_options = {
            actions: {
                edit:{ onClick: this.handleTicketEdit },
            }
        };

        let ticket_type_ddl = currentSummit.ticket_types.map(tt => ({label: tt.name, value: tt.id}));

        return (
            <form className="purchase-order-form">
                <input type="hidden" id="id" value={entity.id} />
                {entity.id !== 0 &&
                    <>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_purchase_order.number")}</label>
                            <Input
                                id="number"
                                value={entity.number}
                                onChange={this.handleChange}
                                className="form-control"
                                disabled
                            />
                        </div>
                        <div className="col-md-1">
                            <label> {T.translate("edit_purchase_order.status")}</label><br/>
                            {entity.status}
                        </div>
                        <div className="col-md-2">
                            <label> {T.translate("edit_purchase_order.credit_card_type")}</label><br/>
                            {entity?.credit_card_type}
                        </div>
                        <div className="col-md-3">
                            <label> {T.translate("edit_purchase_order.credit_card_4number")}</label><br/>
                            {entity?.credit_card_4number}
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.paid_amount")}:&nbsp;</label>
                        {entity.final_amount_formatted}
                        </div>
                        <div className="col-md-9">
                            &nbsp;
                        </div>
                    </div>
                        { entity.refunded_amount > 0.00 &&
                        <>
                            <div className="row form-group">
                                <div className="col-md-3">
                                    <label> {T.translate("edit_purchase_order.refunded_amount")}:&nbsp;</label>
                                    {entity.refunded_amount_formatted}
                                </div>
                                <div className="col-md-9">
                                    &nbsp;
                                </div>
                            </div>
                            <div className="row form-group">
                                <div className="col-md-3">
                                    <label> {T.translate("edit_purchase_order.paid_amount_adjusted")}:&nbsp;</label>
                                    {entity.final_amount_adjusted_formatted}
                                </div>
                                <div className="col-md-9">
                                    &nbsp;
                                </div>
                            </div>
                        </>
                        }
                    </>
                }
                {entity.id === 0 &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_purchase_order.ticket_type")}</label>
                        <Dropdown
                            id="ticket_type_id"
                            value={entity.ticket_type_id}
                            onChange={this.handleChange}
                            options={ticket_type_ddl}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.promo_code")}</label>
                        <Input
                            id="promo_code"
                            value={entity.promo_code}
                            onChange={this.handleChange}
                            type="text"
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.ticket_qty")}</label>
                        <Input
                            id="ticket_qty"
                            value={entity.ticket_qty}
                            onChange={this.handleChange}
                            type="number"
                            className="form-control"
                            min="1"
                            max="100"
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-9">
                        <OwnerInput
                            id="owner"
                            owner={entity.owner}
                            onChange={this.handleChange}
                            errors={{email: this.hasErrors('owner_email'), first_name: this.hasErrors('owner_first_name'), last_name: this.hasErrors('owner_last_name')}}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.owner_company")}</label>
                        <Input
                            id="owner_company"
                            value={entity.owner_company}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('owner_company')}
                        />
                    </div>
                </div>
                <Panel show={showSection === 'billing'} title={T.translate("edit_purchase_order.billing")}
                       handleClick={() => this.toggleSection( 'billing')}>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_1")}</label>
                        <Input
                            id="billing_address_1"
                            value={entity.billing_address_1}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_1')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_2")}</label>
                        <Input
                            id="billing_address_2"
                            value={entity.billing_address_2}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_2')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_zip_code")}</label>
                        <Input
                            id="billing_address_zip_code"
                            value={entity.billing_address_zip_code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_zip_code')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_city")}</label>
                        <Input
                            id="billing_address_city"
                            value={entity.billing_address_city}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_city')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_state")}</label>
                        <Input
                            id="billing_address_state"
                            value={entity.billing_address_state}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_state')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_purchase_order.billing_address_country_iso_code")}</label>
                        <Input
                            id="billing_address_country_iso_code"
                            value={entity.billing_address_country_iso_code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('billing_address_country_iso_code')}
                        />
                    </div>
                </div>
                </Panel>

                {/*{entity.id != 0 && currentSummit.order_only_extra_questions && currentSummit.order_only_extra_questions.length > 0 &&
                <Panel show={showSection == 'extra_questions'}
                       title={T.translate("edit_purchase_order.extra_questions")}
                       handleClick={() => this.toggleSection('extra_questions')}>
                    <QuestionAnswersInput
                        id="extra_questions"
                        answers={entity.extra_questions}
                        questions={currentSummit.order_only_extra_questions}
                        onChange={this.handleChange}
                    />
                </Panel>
                }*/}

                {entity.id !== 0 &&
                    <div>
                        <Table
                            options={ticket_options}
                            data={entity.tickets}
                            columns={ticket_columns}
                        />
                        <div className="row form-group add-tickets-wrapper">
                            <div className="col-md-5">
                                <label> {T.translate("edit_purchase_order.ticket_type")}</label>
                                <Dropdown
                                    clearable={true}
                                    options={ticket_type_ddl}
                                    value={this.state.addTicketTypeId}
                                    onChange={(ev)=>{
                                        this.setState({...this.state, addTicketTypeId: parseInt(ev.target.value)})
                                    }}
                                />
                            </div>
                            <div className="col-md-2">
                                <label> {T.translate("edit_purchase_order.promo_code")}</label>
                                <Input
                                    onChange={(ev)=>{
                                        this.setState({...this.state, addPromoCode: ev.target.value})
                                    }}
                                    value={this.state.addPromoCode}
                                    type="text"
                                    className="form-control"
                                />
                            </div>
                            <div className="col-md-3">
                                <label> {T.translate("edit_purchase_order.ticket_qty")}</label>
                                <Input
                                    onChange={(ev)=>{
                                        this.setState({...this.state, addTicketQty: parseInt(ev.target.value)})
                                    }}
                                    value={this.state.addTicketQty}
                                    type="number"
                                    className="form-control"
                                    min="1"
                                    max="100"
                                />
                            </div>
                            <div className="col-md-2">
                                <input type="button" onClick={this.handleAddTickets}
                                       className="btn btn-primary pull-right" value="Add Tickets" />
                            </div>
                        </div>
                    </div>
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

export default PurchaseOrderForm;
