/**
 * Copyright 2019 OpenStack Foundation
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
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/methods'
import { Input, Dropdown, MemberInput, DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class RoomBookingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
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

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        let {locationId} = this.props;

        ev.preventDefault();

        this.props.onSubmit(locationId, entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        const {entity} = this.state;
        const {currentSummit} = this.props;

        let rooms_ddl = currentSummit.locations.filter(v => (v.class_name === 'SummitBookableVenueRoom')).map(l => {
            return {label: l.name, value: l.id};
        });

        let currency_ddl = [
            {label: 'USD', value: 'USD'},
            {label: 'EUR', value: 'EUR'},
        ];

        let status_ddl = [
            {label: 'Reserved', value: 'Reserved'},
            {label: 'Payed', value: 'Payed'},
            {label: 'Requested Refund', value: 'RequestedRefund'},
            {label: 'Refunded', value: 'Refunded'},
            {label: 'Canceled', value: 'Canceled'}
        ];

        return (
            <form className="room-booking-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.start")} *</label>
                        <DateTimePicker
                            id="start_datetime"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.start_datetime, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.end")} *</label>
                        <DateTimePicker
                            id="end_datetime"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.end_datetime, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.room")} </label>
                        <Dropdown
                            id="room_id"
                            value={entity.room_id}
                            options={rooms_ddl}
                            placeholder={T.translate("edit_room_booking.placeholders.select_room")}
                            onChange={this.handleChange}
                            error={this.hasErrors('room_id')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.status")}</label>
                        <Dropdown
                            id="status"
                            value={entity.status}
                            placeholder={T.translate("edit_room_booking.placeholders.select_status")}
                            options={status_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.owner")}</label>
                        <MemberInput
                            id="owner"
                            value={entity.owner}
                            onChange={this.handleChange}
                            getOptionLabel={
                                (member) => {
                                    return member.hasOwnProperty("email") ?
                                        `${member.first_name} ${member.last_name} (${member.email})`:
                                        `${member.first_name} ${member.last_name} (${member.id})`;
                                }
                            }
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.amount")}</label>
                        <Input
                            id="amount"
                            type="number"
                            value={entity.amount}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('amount')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room_booking.status")}</label>
                        <Dropdown
                            id="currency"
                            value={entity.currency}
                            placeholder={T.translate("edit_room_booking.placeholders.select_currency")}
                            options={currency_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>


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

export default RoomBookingForm;
