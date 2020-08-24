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
import { Input, Dropdown, Table, Panel, MemberInput } from 'openstack-uicore-foundation/lib/components'
import { epochToMomentTimeZone, findElementPos } from 'openstack-uicore-foundation/lib/methods'
import OwnerInput from '../inputs/owner-input'


class PurchaseOrderForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'billing',
        };

        this.handleTicketEdit = this.handleTicketEdit.bind(this);
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

    handleTicketEdit(ticketId) {
        let {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${entity.id}/tickets/${ticketId}`);
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

        /*if (ev.target.type == 'ownerinput') {
            value =
        }*/

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};

        ev.preventDefault();

        this.props.onSubmit(entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    render() {
        let {entity, showSection} = this.state;
        let {currentSummit} = this.props;

        let ticket_columns = [
            { columnKey: 'number', value: T.translate("edit_purchase_order.ticket_number") },
            { columnKey: 'ticket_type_name', value: T.translate("edit_purchase_order.ticket_type_name") },
            { columnKey: 'owner_full_name', value: T.translate("edit_purchase_order.owner_full_name") },
            { columnKey: 'owner_email', value: T.translate("edit_purchase_order.owner_email") },
            { columnKey: 'final_amount_formatted', value: T.translate("edit_purchase_order.paid_amount_per_tix")}
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
                {entity.id != 0 &&
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
                    <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.status")}</label><br/>
                        {entity.status}
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_purchase_order.paid_amount")}</label><br/>
                        ${entity.amount}
                    </div>
                </div>
                }
                {entity.id == 0 &&
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
                <Panel show={showSection == 'billing'} title={T.translate("edit_purchase_order.billing")}
                       handleClick={this.toggleSection.bind(this, 'billing')}>
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
                       handleClick={this.toggleSection.bind(this, 'extra_questions')}>
                    <QuestionAnswersInput
                        id="extra_questions"
                        answers={entity.extra_questions}
                        questions={currentSummit.order_only_extra_questions}
                        onChange={this.handleChange}
                    />
                </Panel>
                }*/}

                {entity.id != 0 &&
                    <Table
                        options={ticket_options}
                        data={entity.tickets}
                        columns={ticket_columns}
                    />
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this)}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default PurchaseOrderForm;
