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

import React from 'react';
import history from "../../../history";
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Modal } from 'react-bootstrap';
import { MemberInput, Dropdown } from 'openstack-uicore-foundation/lib/components'

export default class TicketComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            showAddModal: false,
            editTicket: null,
            newTicket: {external_order_id: '', external_attendee_id: '', ticket_type_id: 0},
            newOwner: null,
        };

        this.handleMemberChange = this.handleMemberChange.bind(this);
        this.handleTicketSave = this.handleTicketSave.bind(this);
        this.handleTicketChange = this.handleTicketChange.bind(this);
        this.handleTicketReassign = this.handleTicketReassign.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);

    }

    onEdit(ticket, ev)  {
        ev.preventDefault();
        this.setState({showEditModal: true, editTicket: ticket});
    }

    onDelete(ticket_id, ev)  {
        let {onDelete, attendeeId} = this.props;
        ev.preventDefault();
        let msg = {
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_attendee.remove_ticket_from_attendee"),
            type: 'warning'
        };

        Swal.fire(msg).then(function(){
            onDelete(attendeeId, ticket_id);
        });
    }

    onAdd(ev)  {
        ev.preventDefault();
        this.setState({showAddModal: true});
    }

    onCloseModal(ev)  {
        this.setState({showEditModal: false, showAddModal: false});
    }

    handleMemberChange(ev) {
        this.setState({
            newOwner: ev.target.value
        });
    }

    handleTicketReassign(ev) {
        let {onReassign, attendeeId} = this.props;
        let newOwner = {...this.state.newOwner};
        let editTicket = {...this.state.editTicket};

        this.setState({
            showEditModal: false,
            newOwner: null,
            editTicket: null
        });

        onReassign(attendeeId, newOwner.id, editTicket.id);
    }

    handleTicketSave(ev) {
        let {onSave, attendeeId} = this.props;
        let newTicket = {...this.state.newTicket};

        this.setState({
            showAddModal: false,
            newTicket: {external_order_id: '', external_attendee_id: '', ticket_type_id: 0}
        });

        onSave(attendeeId, newTicket);
    }

    handleTicketChange(ev) {
        let newTicket = {...this.state.newTicket};
        let {value, id} = ev.target;

        newTicket[id] = value;
        this.setState({newTicket: newTicket});
    }

    handleTicketLink = (ev, ticket) => {
        const {summit} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${summit.id}/purchase-orders/${ticket.order_id}/tickets/${ticket.id}`);
    };

    render() {
        let {tickets, summit} = this.props;
        let {showEditModal, showAddModal, editTicket, newTicket} = this.state;

        let ticket_types_ddl = summit.ticket_types.map(
            t => {
                return {label: t.name, value: t.id}
            }
        );

        return (
            <div className="ticket-component">
                <div className="row form-group">
                    <div className="col-md-12">
                        <legend>
                            {T.translate("edit_attendee.tickets")}
                            <a href="" className="btn btn-default btn-xs add-ticket pull-right" onClick={this.onAdd}>
                                {T.translate("edit_attendee.add_ticket")}
                            </a>
                        </legend>
                        {tickets.map(t =>
                            <div key={'tix_' + t.id} className="btn-group btn-group-xs ticket-btn">
                                <a href="" className="ticket btn btn-default" onClick={ev => this.handleTicketLink(ev, t)}>
                                    {t.external_order_id || t.number}
                                </a>
                                {t.is_active &&
                                    <a href="#" className="del-ticket btn btn-success"
                                       onClick={ev => this.handleTicketLink(ev, t)}>
                                        <i className="fa fa-check"/>
                                    </a>
                                }
                                {!t.is_active &&
                                <a href="#" className="del-ticket btn btn-danger"
                                   title={T.translate("edit_attendee.inactive_ticket")}
                                   onClick={ev => this.handleTicketLink(ev, t)}>
                                    <i className="fa fa-ban"/>
                                </a>
                                }
                                {this.props.onDelete &&
                                <a href="#" className="del-ticket btn btn-danger"
                                   onClick={this.onDelete.bind(this, t.id)}>
                                    <i className="fa fa-trash-o"/>
                                </a>
                                }
                            </div>
                        )}
                    </div>
                </div>
                <Modal show={showEditModal} onHide={this.onCloseModal} dialogClassName="ticket-edit-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("edit_attendee.ticket_details")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {editTicket &&
                        <div className="row">
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.ticket_type")}</label><br/>
                                <div>{summit.ticket_types.find(t => t.id === editTicket.ticket_type_id).name}</div>
                            </div>
                            { summit.external_registration_feed_type === 'none' &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.badge_type")}</label><br/>
                                <div>{editTicket.badge.type.name}</div>
                            </div>
                            }
                            { summit.external_registration_feed_type === 'none' && editTicket.hasOwnProperty("promo_code") &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.promo_code")}</label><br/>
                                <div>{editTicket.promo_code.code}</div>
                            </div>
                            }
                            { summit.external_registration_feed_type !== 'none' &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.eb_order_number")}</label><br/>
                                <div>{editTicket.external_order_id}</div>
                            </div>
                            }
                            { summit.external_registration_feed_type !== 'none' &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.eb_attendee_id")}</label><br/>
                                <div>{editTicket.external_attendee_id}</div>
                            </div>
                            }
                        </div>
                        }
                        {editTicket &&
                        <div className="row">
                            <div className="col-md-12">
                                <label>{T.translate("edit_attendee.ticket_number")}</label>
                                <div>{editTicket.number}</div>
                            </div>
                        </div>
                        }
                        <br/>
                        <div className="row">
                            <div className="col-md-8">
                                <label>{T.translate("edit_attendee.assign_to_member")}</label><br/>
                                <MemberInput
                                    id="member"
                                    getOptionLabel={
                                        (member) => {
                                            return member.hasOwnProperty("email") ?
                                                `${member.first_name} ${member.last_name} (${member.email})`:
                                                `${member.first_name} ${member.last_name} (${member.id})`;
                                        }
                                    }
                                    value={this.state.newOwner}
                                    onChange={this.handleMemberChange}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleTicketReassign}>
                            {T.translate("general.save")}
                        </button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showAddModal} onHide={this.onCloseModal} dialogClassName="ticket-add-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("edit_attendee.new_ticket")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className={summit.external_registration_feed_type === 'none' ? 'col-md-6' : 'col-md-4' }>
                                <label>{T.translate("edit_attendee.ticket_type")}</label>
                                <Dropdown
                                    id="ticket_type_id"
                                    placeholder={T.translate("edit_attendee.placeholders.select_ticket_type")}
                                    options={ticket_types_ddl}
                                    onChange={this.handleTicketChange}
                                    value={newTicket ? newTicket.ticket_type_id : ''}
                                />
                            </div>
                            {summit.external_registration_feed_type === 'none' &&
                            <div className="col-md-6">
                                <label>{T.translate("edit_attendee.promo_code")}</label><br/>
                                <input
                                    id="promo_code"
                                    className="form-control"
                                    onChange={this.handleTicketChange}
                                    value={newTicket ? newTicket.promo_code : ''}
                                />
                            </div>
                            }
                            {summit.external_registration_feed_type !== 'none' &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.eb_order_number")}</label><br/>
                                <input
                                    id="external_order_id"
                                    className="form-control"
                                    onChange={this.handleTicketChange}
                                    value={newTicket ? newTicket.external_order_id : ''}
                                />
                            </div>
                            }
                            {summit.external_registration_feed_type !== 'none' &&
                            <div className="col-md-4">
                                <label>{T.translate("edit_attendee.eb_attendee_id")}</label><br/>
                                <input
                                    id="external_attendee_id"
                                    className="form-control"
                                    onChange={this.handleTicketChange}
                                    value={newTicket ? newTicket.external_attendee_id : ''}
                                />
                            </div>
                            }
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleTicketSave}>
                            {T.translate("general.save")}
                        </button>
                    </Modal.Footer>
                </Modal>


            </div>
        );

    }
}

