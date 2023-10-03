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

import React, { useEffect, useState } from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import { Input, Dropdown, MemberInput, DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import { getAvailableBookingDates, getDayFromReservation, isEmpty, scrollToError, shallowEqual } from "../../utils/methods";

import '../../styles/booking-room.less';

const RoomBookingForm = ({ history, entity, currentSummit, errors, availableSlots, onSubmit, getAvailableSlots }) => {
    const [stateEntity, setStateEntity] = useState({ ...entity });
    const [currentRoom, setCurrentRoom] = useState(null);
    const [bookingDate, setBookingDate] = useState(null);
    const [timeSlot, setTimeSlot] = useState(null);

    useEffect(() => {
        handleEntityChange(entity);
    }, [])

    useEffect(() => {
        if (!shallowEqual(stateEntity, entity)) handleEntityChange(entity);
    }, [entity]);

    const handleEntityChange = (newEntity) => {
        if (newEntity.id) {
            const currentRoom = currentSummit.locations.find(l => l.id === newEntity.room_id);
            const availableDates = getAvailableBookingDates(currentSummit);
            const bookingDate = getDayFromReservation(newEntity, availableDates);
            if (bookingDate) getAvailableSlots(currentRoom.id, bookingDate);
            setStateEntity({ ...newEntity });
            setCurrentRoom(currentRoom)
            setBookingDate(bookingDate);
            setTimeSlot(newEntity.start_datetime);
        } else {
            setStateEntity({ ...newEntity });
            setCurrentRoom(null);
            setBookingDate(null);
            setTimeSlot(null);
        }
    }

    const handleRoomChange = (ev) => {
        let { value, id } = ev.target;
        const currentRoom = currentSummit.locations.find(l => l.id === parseInt(value));
        setCurrentRoom(currentRoom);
    }

    const handleBookingDateChange = (ev) => {
        let { value } = ev.target;

        getAvailableSlots(currentRoom.id, value);

        setBookingDate(value);
        setTimeSlot(null);
    }

    const handleTimeSlotChange = (ev) => {
        let { value } = ev.target;
        setTimeSlot(value);
    }

    const handleChange = (ev) => {
        let entity = { ...stateEntity };
        let { value, id } = ev.target;

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        entity[id] = value;
        setStateEntity(entity)
    }

    const handleSubmit = (ev) => {
        ev.preventDefault();

        const { start_date, end_date } = availableSlots.find(e => e.start_date === timeSlot);

        let normalizedEntity = {
            id: stateEntity.id || null,
            room_id: currentRoom.id,
            start_datetime: start_date,
            end_datetime: end_date,
            owner_id: stateEntity.owner?.id,
            currency: currentRoom.currency,
            amount: currentRoom.time_slot_cost
        }

        onSubmit(normalizedEntity);
    }

    const hasErrors = (field) => {
        if (field in errors) {
            return errors[field];
        }

        return '';
    }

    let rooms_ddl = currentSummit.locations.filter(v => (v.class_name === 'SummitBookableVenueRoom')).map(l => {
        return { label: l.name, value: l.id };
    });

    const available_booking_dates_ddl = getAvailableBookingDates(currentSummit).map(v => ({ value: v.epoch, label: v.str }));

    const available_slots_ddl = availableSlots?.map(as => (
        {
            value: as.start_date,
            label: `${epochToMomentTimeZone(as.start_date, currentSummit.time_zone_id).format('h:mm a')} - 
                    ${epochToMomentTimeZone(as.end_date, currentSummit.time_zone_id).format('h:mm a')}
                    ${as.is_free ? '' : ' - Booked'}`,
            isDisabled: !as.is_free
        }
    ));

    console.log('STATE ENTITY...', stateEntity, currentRoom);

    return (
        <form className="room-booking-form">
            <input type="hidden" id="id" value={stateEntity.id} />
            <div className="row form-group">
                <div className="col-md-4">
                    <label> {T.translate("edit_room_booking.room")} </label>
                    <Dropdown
                        id="room_id"
                        value={stateEntity.room_id}
                        key={JSON.stringify(stateEntity.room_id)}
                        options={rooms_ddl}
                        placeholder={T.translate("edit_room_booking.placeholders.select_room")}
                        onChange={handleRoomChange}
                        error={hasErrors('room_id')}
                        isDisabled={stateEntity.id}
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
                                            {T.translate("edit_room_booking.cost")}: {`${currentRoom.currency} ${currentRoom.time_slot_cost}`}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="meeting-room-info col-xs-6">
                                            {T.translate("edit_room_booking.capacity")}: {currentRoom.capacity}
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
                                                {T.translate("edit_room_booking.floor")}: {currentRoom.floor?.name}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_room_booking.date")}</label>
                            <Dropdown
                                id="booking_dates"
                                value={bookingDate}
                                placeholder={T.translate("edit_room_booking.placeholders.select_date")}
                                options={available_booking_dates_ddl}
                                onChange={handleBookingDateChange}
                            />
                        </div>
                        {bookingDate &&
                            <div className="col-md-4">
                                <label> {T.translate("edit_room_booking.available_slots")}</label>
                                <Dropdown
                                    id="available_slots"
                                    value={timeSlot}
                                    placeholder={T.translate("edit_room_booking.placeholders.available_slots")}
                                    options={available_slots_ddl}
                                    onChange={handleTimeSlotChange}
                                />
                            </div>
                        }
                        <div className="col-md-4">
                            <label> {T.translate("edit_room_booking.owner")}</label>
                            <MemberInput
                                id="owner"
                                value={stateEntity.owner}
                                onChange={handleChange}
                                getOptionLabel={
                                    (member) => {
                                        return member.hasOwnProperty("email") ?
                                            `${member.first_name} ${member.last_name} (${member.email})` :
                                            `${member.first_name} ${member.last_name} (${member.id})`;
                                    }
                                }
                                isDisabled={stateEntity.id}
                            />
                        </div>
                    </div>
                </>
            }


            <div className="row">
                <div className="col-md-12 submit-buttons">
                    <input type="button" onClick={handleSubmit}
                        className="btn btn-primary pull-right" value={T.translate("general.save")} />
                </div>
            </div>
        </form>
    );
}

export default RoomBookingForm;
