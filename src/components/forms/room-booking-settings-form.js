/**
 * Copyright 2018 OpenStack Foundation
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
import { Input, TextEditor, Panel, Table, DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'


class RoomBookingSettingsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            summit: {...props.currentSummit},
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAttributeEdit = this.handleAttributeEdit.bind(this);
        this.handleNewAttribute = this.handleNewAttribute.bind(this);
    }

    handleChange(ev) {
        let summit = {...this.state.summit};
        let {value, id} = ev.target;

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        summit[id] = value;
        this.setState({summit: summit});
    }

    handleSubmit(ev) {
        let summit = {...this.state.summit};

        ev.preventDefault();

        this.props.onSubmit(summit);
    }

    handleAttributeEdit(attributeId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/room-bookings/settings/attributes/${attributeId}`);
    }

    handleNewAttribute(ev) {
        ev.preventDefault();

        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/room-bookings/settings/attributes/new`);
    }

    handleAttributeTypeDelete(attributeTypeId) {
        let {onAttributeTypeDelete, currentSummit} = this.props;
        let roomBookingType = currentSummit.meeting_booking_room_allowed_attributes.find(rb => rb.id == attributeTypeId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("room_bookings.delete_booking_attribute_warning") + ' ' + roomBookingType.type,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                onAttributeTypeDelete(attributeTypeId);
            }
        }).catch(swal.noop);
    }

    render() {
        let {currentSummit} = this.props;
        let {summit} = this.state;

        let attribute_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'type', value: T.translate("general.type") },
            { columnKey: 'values', value: T.translate("general.values") },
        ];

        let attribute_options = {
            actions: {
                edit: {onClick: this.handleAttributeEdit},
                delete: { onClick: this.handleAttributeTypeDelete }
            }
        };

        let attributes = summit.meeting_booking_room_allowed_attributes.map(at => {
           return {id: at.id, type: at.type, values: at.values.map(v => v.value).join(' ,')}
        });

        return (
            <form className="room-booking-settings-form">
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("room_bookings.meeting_room_booking_start_time")} *</label>
                        <DateTimePicker
                            id="meeting_room_booking_start_time"
                            onChange={this.handleChange}
                            format={{date: false, time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(summit.meeting_room_booking_start_time, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("room_bookings.meeting_room_booking_end_time")} *</label>
                        <DateTimePicker
                            id="meeting_room_booking_end_time"
                            onChange={this.handleChange}
                            format={{date: false, time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(summit.meeting_room_booking_end_time, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("room_bookings.meeting_room_booking_slot_length")} *</label>
                        <Input
                            id="meeting_room_booking_slot_length"
                            type="number"
                            value={summit.meeting_room_booking_slot_length}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("room_bookings.meeting_room_booking_max_allowed")} *</label>
                        <Input
                            id="room_booking_limit"
                            type="number"
                            value={summit.meeting_room_booking_max_allowed}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row form-group">
                  <div className="col-md-12">
                      <button className="btn btn-primary pull-right left-space" onClick={this.handleNewAttribute}>
                          {T.translate("room_bookings.add_attribute")}
                      </button>
                      <Table
                          options={attribute_options}
                          data={attributes}
                          columns={attribute_columns}
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

export default RoomBookingSettingsForm;
