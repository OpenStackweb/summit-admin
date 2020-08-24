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
import { Input, Dropdown, SimpleLinkList, MemberInput } from 'openstack-uicore-foundation/lib/components'
import OwnerInput from "../inputs/owner-input";


class TicketForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            canReassign: false,
        };

        this.handlePromocodeClick = this.handlePromocodeClick.bind(this);
        this.handleOwnerClick = this.handleOwnerClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleReassign = this.handleReassign.bind(this);
        this.handleAssign = this.handleAssign.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
        });
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let {value, id} = ev.target;

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        entity[id] = value;
        this.setState({entity: entity});
    }

    handleReassign(ev) {
        ev.preventDefault();
        this.setState({canReassign: true});
    }

    handleAssign(ev) {
        let {entity, canReassign} = this.state;
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
        } else {
            this.props.onSaveTicket(entity.order_id, entity);
        }
    }


    handleOwnerClick(ev) {
        let {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/attendees/${entity.owner.id}`);
    }

    handlePromocodeClick(ev) {
        let {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/promocodes/${entity.promo_code.id}`);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }


    render() {
        let {entity, canReassign} = this.state;
        let member = entity.member ? entity.member : (entity.owner ? entity.owner.member : null);

        return (
            <form className="ticket-form">
                <input type="hidden" id="ticket_id" value={entity.id} />
                {!canReassign && entity.owner &&
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.attendee")}:&nbsp;</label>
                        <a href="" onClick={this.handleOwnerClick}>{entity.attendee_full_name}</a>
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.company")}:&nbsp;</label>
                        <span>{entity.owner.company}</span>
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_ticket.email")}:&nbsp;</label>
                        <span>{entity.owner.email}</span>
                    </div>
                    <div className="col-md-2">
                        <button onClick={this.handleReassign} className="btn btn-default">
                            {T.translate("edit_ticket.reassign")}
                        </button>
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
                        {entity.ticket_type ? entity.ticket_type.name : ''}
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
                </div>



            </form>
        );
    }
}

export default TicketForm;
