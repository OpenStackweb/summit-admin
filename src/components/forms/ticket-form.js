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


class TicketForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
        };

        this.handleOwnerClick = this.handleOwnerClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleReassign = this.handleReassign.bind(this);
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

    handleReassign(memberId) {
        let entity = {...this.state.entity};

        this.props.onReassign(entity);
    }


    handleOwnerClick(ev) {
        let {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/attendees/${entity.owner.id}`);
    }


    render() {
        let {entity} = this.state;

        let canReassing = (entity.member_id && entity.member_id != entity.owner.member.id);

        return (
            <form className="ticket-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.attendee")}:&nbsp;</label>
                        <a href="" onClick={this.handleOwnerClick}>{entity.owner_full_name}</a>
                    </div>
                    <div className="col-md-6">
                        <MemberInput
                            id="member_id"
                            value={entity.owner.member}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-2">
                        <button onClick={this.handleReassign} className="btn btn-default" disabled={!canReassing}>
                            {T.translate("edit_ticket.reassign")}
                        </button>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.type")}:&nbsp;</label>
                        {entity.ticket_type.name}
                    </div>
                    <div className="col-md-8">
                        <label> {T.translate("edit_ticket.number")}:&nbsp;</label>
                        {entity.number}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.bought_date")}:&nbsp;</label>
                        {entity.bought_date}
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.status")}:&nbsp;</label>
                        {entity.status}
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.promocode")}:&nbsp;</label>
                        {entity.promocode_name}
                    </div>
                </div>



            </form>
        );
    }
}

export default TicketForm;
