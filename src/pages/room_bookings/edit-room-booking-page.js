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
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import { getSummitById }  from '../../actions/summit-actions';
import { getRoomBooking, resetRoomBookingForm, saveRoomBooking } from "../../actions/room-booking-actions";
import RoomBookingForm from "../../components/forms/room-booking-form";

class EditRoomBookingPage extends React.Component {

    componentWillMount () {
        let roomBookingId = this.props.match.params.room_booking_id;

        if (!roomBookingId) {
            this.props.resetRoomBookingForm();
        } else {
            this.props.getRoomBooking(roomBookingId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.room_booking_id;
        let newId = newProps.match.params.room_booking_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetRoomBookingForm();
            } else {
                this.props.getRoomBooking(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let fields = [
            {type: 'text', name: 'name', label: T.translate("edit_room_booking.name")},
            {type: 'text', name: 'external_id', label: T.translate("edit_room_booking.external_id")},
            {type: 'textarea', name: 'description', label: T.translate("edit_room_booking.description")}
        ];
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_room_booking.room_booking")}</h3>
                <hr/>
                {currentSummit &&
                <RoomBookingForm
                    history={this.props.history}
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveRoomBooking}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomBookingState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentRoomBookingState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRoomBooking,
        resetRoomBookingForm,
        saveRoomBooking
    }
)(EditRoomBookingPage);
