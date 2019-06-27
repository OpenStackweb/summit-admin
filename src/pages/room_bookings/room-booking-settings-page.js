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
import history from 'history'
import T from "i18n-react/dist/i18n-react";
import RoomBookingSettingsForm from '../../components/forms/room-booking-settings-form';
import { getSummitById, saveSummit }  from '../../actions/summit-actions';
import { deleteRoomBookingAttributeType } from "../../actions/room-booking-actions";

class RoomBookingSettingsPage extends React.Component {

    render(){
        let {currentSummit, history} = this.props;

        return(
            <div className="container">
                <h3>{T.translate("room_bookings.room_bookings")}</h3>
                <hr/>
                {currentSummit &&
                <RoomBookingSettingsForm
                    currentSummit={currentSummit}
                    history={history}
                    onSubmit={this.props.saveSummit}
                    onAttributeTypeDelete={this.props.deleteRoomBookingAttributeType}
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
        saveSummit,
        deleteRoomBookingAttributeType
    }
)(RoomBookingSettingsPage);
