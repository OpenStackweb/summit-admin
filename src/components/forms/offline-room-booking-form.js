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
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import { Input, Dropdown, MemberInput, DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import { getAvailableBookingDates, isEmpty, scrollToError, shallowEqual } from "../../utils/methods";

import '../../styles/offline-booking-room.less';


class NewRoomBookingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors,
            currentRoom: null,
            bookingDate: null,
            timeSlot: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleBookingDateChange = this.handleBookingDateChange.bind(this);
        this.handleTimeSlotChange = this.handleTimeSlotChange.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = { ...this.props.entity };
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = { ...this.props.errors };
        }

        if (!isEmpty(state)) {
            this.setState({ ...this.state, ...state })
        }
    }

    handleRoomChange(ev) {
        const { currentSummit } = this.props;
        let entity = { ...this.state.entity };
        let errors = { ...this.state.errors };
        let { value, id } = ev.target;

        const currentRoom = currentSummit.locations.find(l => l.id === parseInt(value));

        errors[id] = '';
        entity[id] = value;
        this.setState({ entity: entity, errors: errors, currentRoom: currentRoom });
    }

    handleBookingDateChange(ev) {
        const { currentRoom } = this.state;
        let { value } = ev.target;

        this.props.getAvailableSlots(currentRoom.id, value);

        this.setState({ ...this.state, bookingDate: value });
    }

    handleTimeSlotChange(ev) {        
        let { value } = ev.target;
        this.setState({ ...this.state, timeSlot: value });
    }

    handleChange(ev) {
        let entity = { ...this.state.entity };
        let errors = { ...this.state.errors };
        let { value, id } = ev.target;

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({ entity: entity, errors: errors });
    }

    handleSubmit(ev) {
        let { entity, currentRoom, timeSlot } = this.state;
        const { availableSlots } = this.props;

        ev.preventDefault();

        const {start_date, end_date} = availableSlots.find(e => e.start_date === timeSlot);

        let normalizedEntity = {
            room_id: entity.room_id, 
            start_datetime: start_date,
            end_datetime: end_date,
            owner_id: entity.owner?.id,
            currency: currentRoom.currency,
            amount: currentRoom.time_slot_cost}

        this.props.onSubmit(normalizedEntity);
    }

    hasErrors(field) {
        let { errors } = this.state;
        if (field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        const { entity, currentRoom, bookingDate, timeSlot } = this.state;
        const { currentSummit, availableSlots } = this.props;

        let rooms_ddl = currentSummit.locations.filter(v => (v.class_name === 'SummitBookableVenueRoom')).map(l => {
            return { label: l.name, value: l.id };
        });

        const available_booking_dates_ddl = getAvailableBookingDates(currentSummit).map(v => ({ value: v.epoch, label: v.str }));        

        const available_slots_ddl = availableSlots?.filter(as => as.is_free === true).map((as, index) => (
            {   
                value: as.start_date,
                label: `${epochToMomentTimeZone(as.start_date, currentSummit.time_zone_id).format('h:mm a')} - 
                        ${epochToMomentTimeZone(as.end_date, currentSummit.time_zone_id).format('h:mm a')}`
            }
        ));

        return (
            <form className="room-booking-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("offline_room_booking.room")} </label>
                        <Dropdown
                            id="room_id"
                            value={entity.room_id}
                            options={rooms_ddl}
                            placeholder={T.translate("offline_room_booking.placeholders.select_room")}
                            onChange={this.handleRoomChange}
                            error={this.hasErrors('room_id')}
                        />
                    </div>
                </div>
                {currentRoom?.id &&
                    <>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <div className="meeting-room">
                                    <div className="meeting-room-image">
                                        <img src={currentRoom.image?.url} />
                                    </div>
                                    <div className="meeting-room-body">
                                        <div className="meeting-room-header row">
                                            <div className="col-xs-10">
                                                <div className="meeting-room-title">{currentRoom.name}</div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="meeting-room-info col-xs-12">
                                                {T.translate("offline_room_booking.cost")}: {`${currentRoom.currency} ${currentRoom.time_slot_cost}`}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="meeting-room-info col-xs-6">
                                                {T.translate("offline_room_booking.capacity")}: {currentRoom.capacity}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="meeting-room-amenities col-xs-12">
                                                {currentRoom.attributes.length > 0 ? currentRoom.attributes.map(a => `${a.type.type}: ${a.value}`).join(' | ') : ''}
                                            </div>
                                        </div>
                                        {currentRoom.floor &&
                                            <div className="row">
                                                <div className="meeting-room-info col-xs-12">
                                                    {T.translate("offline_room_booking.floor")}: {currentRoom.floor?.name}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row form-group">                            
                            <div className="col-md-4">
                                <label> {T.translate("offline_room_booking.date")}</label>
                                <Dropdown
                                    id="booking_dates"
                                    value={bookingDate}
                                    placeholder={T.translate("offline_room_booking.placeholders.select_date")}
                                    options={available_booking_dates_ddl}
                                    onChange={this.handleBookingDateChange}
                                />
                            </div>
                            {bookingDate &&
                                <div className="col-md-4">
                                    <label> {T.translate("offline_room_booking.available_slots")}</label>
                                    <Dropdown
                                        id="available_slots"
                                        value={timeSlot}
                                        placeholder={T.translate("offline_room_booking.placeholders.select_status")}
                                        options={available_slots_ddl}
                                        onChange={this.handleTimeSlotChange}
                                    />
                                </div>
                            }
                            <div className="col-md-4">
                                <label> {T.translate("offline_room_booking.owner")}</label>
                                <MemberInput
                                    id="owner"
                                    value={entity.owner}
                                    onChange={this.handleChange}
                                    getOptionLabel={
                                        (member) => {
                                            return member.hasOwnProperty("email") ?
                                                `${member.first_name} ${member.last_name} (${member.email})` :
                                                `${member.first_name} ${member.last_name} (${member.id})`;
                                        }
                                    }
                                />
                            </div>
                        </div>                        
                    </>
                }


                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                            className="btn btn-primary pull-right" value={T.translate("general.save")} />
                    </div>
                </div>
            </form>
        );
    }
}

export default NewRoomBookingForm;
