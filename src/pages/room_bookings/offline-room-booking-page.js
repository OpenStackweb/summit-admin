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
import { getOfflineBookingRoomAvailability, resetRoomBookingForm, saveOfflineRoomBooking } from "../../actions/room-booking-actions";
import OfflineRoomBookingForm from '../../components/forms/offline-room-booking-form';

class OfflineRoomBookingPage extends React.Component {

    constructor(props) {
        super(props);

        props.resetRoomBookingForm();
    }

    render() {
        const { currentSummit, entity, errors, available_slots, match } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return (
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("offline_room_booking.room_booking")}</h3>
                <hr />
                {currentSummit &&
                    <OfflineRoomBookingForm
                        history={this.props.history}
                        entity={entity}
                        currentSummit={currentSummit}
                        errors={errors}
                        availableSlots={available_slots}
                        onSubmit={this.props.saveOfflineRoomBooking}
                        getAvailableSlots={this.props.getOfflineBookingRoomAvailability}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOfflineRoomBookingReducer }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentOfflineRoomBookingReducer
});

export default connect(
    mapStateToProps,
    {
        getOfflineBookingRoomAvailability,
        resetRoomBookingForm,
        saveOfflineRoomBooking
    }
)(OfflineRoomBookingPage);
