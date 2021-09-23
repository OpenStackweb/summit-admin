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
import { Input, Dropdown } from 'openstack-uicore-foundation/lib/components'
import OwnerInput from "../inputs/owner-input";
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";

class TicketForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            canReassign: false,
            shouldShowSave: false
        };

        this.handlePromocodeClick = this.handlePromocodeClick.bind(this);
        this.handleOwnerClick = this.handleOwnerClick.bind(this);
        this.handleOrderClick = this.handleOrderClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleReassign = this.handleReassign.bind(this);
        this.handleAssign = this.handleAssign.bind(this);
        this.handleUpdateTicket = this.handleUpdateTicket.bind(this);
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

    handleUpdateTicket(ev){
        ev.preventDefault();

        this.props.onSaveTicket(this.props.order.id, {...this.state.entity, attendee_email: this.state.entity?.owner?.email})
            .then(() => this.setState({...this.state, shouldShowSave: false }));
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let {value, id} = ev.target;

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }
        let shouldShowSave = this.state.shouldShowSave;
        if(id === 'ticket_type_id'){
            shouldShowSave = true;
        }

        entity[id] = value;
        this.setState({...this.state, entity: entity, shouldShowSave:shouldShowSave});
    }

    handleReassign(ev) {
        ev.preventDefault();
        this.setState({canReassign: true});
    }

    handleAssign(ev) {
        const {entity, canReassign} = this.state;
        let {owner: prevOwner} = this.props.entity;
        ev.preventDefault();

        if (canReassign) {
            this.props.onReassing(
                entity.id,
                prevOwner.id,
                entity.attendee.first_name,
                entity.attendee.last_name,
                entity.attendee.email,
                entity.attendee_company
            );
            return;
        }

        this.props.onSaveTicket(entity.order_id, entity);
    }

    handleOwnerClick(ev) {
        const {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/attendees/${entity.owner.id}`);
    }

    handlePromocodeClick(ev) {
        const {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/promocodes/${entity.promo_code.id}`);
    }

    handleOrderClick(ev) {
        const {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${entity.order_id}`);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }
        return '';
    }

    render() {
        const {entity, canReassign, shouldShowSave} = this.state;
        const {order, ticketTypes} = this.props;
        const ticketTypes_ddl = ticketTypes.map(t => ({label: `${t.name} ($${t.cost})`, value: t.id}))

        return (
            <form className="ticket-form" onSubmit={(ev)=> ev.preventDefault()}>
                <input type="hidden" id="ticket_id" value={entity.id} />
                {!canReassign && entity.owner &&
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.attendee")}:&nbsp;</label>
                        <a href="" onClick={this.handleOwnerClick}>{entity.attendee_full_name}</a>
                    </div>
                    <div className="col-md-2">
                        <label> {T.translate("edit_ticket.company")}:&nbsp;</label>
                        <span>{entity.owner.company}</span>
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.email")}:&nbsp;</label>
                        <a href={`mailto:${entity.owner.email}`} target="_blank">{entity.owner.email}</a>
                    </div>
                    <div className="col-md-4">
                        { entity.is_active &&
                            <button onClick={this.handleReassign} className="btn btn-sm btn-default">
                                {T.translate("edit_ticket.reassign")}
                            </button>
                        }
                    </div>
                </div>
                }
                {(canReassign || !entity.owner) &&
                <div className="row form-group">
                    <div className="col-md-9">
                        <OwnerInput
                            id="attendee"
                            owner={entity.attendee}
                            onChange={this.handleChange}
                            errors={{email: this.hasErrors('attendee_email'), first_name: this.hasErrors('attendee_first_name'), last_name: this.hasErrors('attendee_last_name')}}
                        />
                    </div>
                    <div className="col-md-2">
                        <label> {T.translate("edit_ticket.company")}:&nbsp;</label>
                        <Input
                            id="attendee_company"
                            value={entity.attendee_company}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('attendee_company')}
                        />
                    </div>
                    <div className="col-md-1">
                        <br/>
                        <button onClick={this.handleAssign} className="btn btn-default">
                            {T.translate("edit_ticket.assign")}
                        </button>
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.type")}:&nbsp;</label>
                        <Dropdown
                            id="ticket_type_id"
                            value={entity.ticket_type_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_ticket.placeholders.select_ticket_type")}
                            options={ticketTypes_ddl}
                        />
                    </div>
                    <div className="col-md-9">
                        <label> {T.translate("edit_ticket.number")}:&nbsp;</label>
                        {entity.number}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.status")}:&nbsp;</label>
                        {entity.status}
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.promocode")}:&nbsp;</label>
                        {entity.promo_code ? (
                            <a href="" onClick={this.handlePromocodeClick}>{entity.promocode_name}</a>
                        ) : (
                            entity.promocode_name
                        )}
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_ticket.bought_date")}:&nbsp;</label>
                        {entity.bought_date}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.paid_amount")}:&nbsp;</label>
                        {entity.final_amount_formatted}
                    </div>
                    <div className="col-md-9">
                        <label> {T.translate("edit_ticket.order_number")}:&nbsp;</label>
                        <a href="" onClick={this.handleOrderClick}>{order.number}</a>
                    </div>
                </div>
                { entity.refunded_amount > 0.00 &&
                    <>
                    <div className="row form-group">
                        <div className="col-md-3">
                            <label> {T.translate("edit_ticket.refunded_amount")}:&nbsp;</label>
                            {entity.refunded_amount_formatted}
                        </div>
                        <div className="col-md-9">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-3">
                            <label> {T.translate("edit_ticket.paid_amount_adjusted")}:&nbsp;</label>
                            {entity.final_amount_adjusted_formatted}
                        </div>
                        <div className="col-md-9">
                            &nbsp;
                        </div>
                    </div>
                    </>
                }
                {entity.id > 0 && !canReassign && shouldShowSave &&
                    <div className="row form-group">
                        <div className="col-md-12 submit-buttons">
                            <input type="button" onClick={this.handleUpdateTicket}
                                   className="btn btn-primary pull-right"
                                   value={T.translate("general.save")}/>
                        </div>
                    </div>
                }
            </form>
        );
    }
}

export default TicketForm;
