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
import T from "i18n-react/dist/i18n-react";
import RoomForm from '../../components/forms/room-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRoom, resetRoomForm, saveRoom } from "../../actions/location-actions";

class EditRoomPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            locationId: props.match.params.location_id,
            roomId: props.match.params.room_id
        }
    }

    componentWillReceiveProps(nextProps) {
        let {roomId, locationId} = this.state;

        let new_room_id = nextProps.match.params.room_id;
        let new_location_id = this.props.match.params.location_id;

        if(roomId != new_room_id || locationId != new_location_id) {

            this.setState({
                locationId: new_location_id,
                roomId: new_room_id
            });

            if(new_room_id && new_location_id) {
                this.props.getRoom(new_location_id, new_room_id);
            } else {
                this.props.resetRoomForm();
            }
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let locationId = this.props.match.params.location_id;
        let {currentSummit, allFloors} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        } else {
            if(allFloors.length == 0){
                this.props.getLocation(locationId);
            }
        }
    }

    componentDidMount () {
        let {currentSummit, errors} = this.props;
        let locationId = this.props.match.params.location_id;
        let roomId = this.props.match.params.room_id;

        if(currentSummit != null) {
            if (roomId != null && locationId != null) {
                this.props.getRoom(locationId, roomId);
            } else {
                this.props.resetRoomForm();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, allFloors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_room.room")}</h3>
                <hr/>
                {currentSummit &&
                <RoomForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    locationId={this.state.locationId}
                    allFloors={allFloors}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveRoom}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomState, currentLocationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    allFloors: currentLocationState.entity.floors,
    ...currentRoomState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRoom,
        resetRoomForm,
        saveRoom,
    }
)(EditRoomPage);