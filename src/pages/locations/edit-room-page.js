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
import { Breadcrumb } from 'react-breadcrumbs';
import RoomForm from '../../components/forms/room-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getLocation, getRoom, resetRoomForm, saveRoom, addAttributeToRoom, removeAttributeFromRoom, attachRoomImage, deleteRoomImage } from "../../actions/location-actions";

class EditRoomPage extends React.Component {

    constructor(props) {
        const {currentLocation, match} = props;
        const roomId = match.params.room_id;
        super(props);

        if (!roomId || !currentLocation) {
            props.resetRoomForm();
        } else {
            props.getRoom(currentLocation.id, roomId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.room_id;
        const newId = this.props.match.params.room_id;
        const {currentLocation} = this.props;

        if (oldId !== newId && currentLocation) {
            this.props.getRoom(currentLocation.id, newId);
        }
    }

    render(){
        const {currentSummit, currentLocation, entity, errors, allFloors, match, attachRoomImage, deleteRoomImage} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_room.room")}</h3>
                <hr/>
                {currentSummit &&
                <RoomForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    locationId={currentLocation.id}
                    locationHours={{opening_hour: currentLocation.opening_hour, closing_hour: currentLocation.closing_hour}}
                    allFloors={allFloors}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveRoom}
                    onAttributeLink={(attribute) => {this.props.addAttributeToRoom(currentLocation.id, entity.id, attribute)}}
                    onAttributeUnLink={(attributeId) => {this.props.removeAttributeFromRoom(currentLocation.id, entity.id, attributeId)}}
                    onAttach={attachRoomImage}
                    onRemoveImage={deleteRoomImage}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomState, currentLocationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentLocation : currentLocationState.entity,
    allFloors: currentLocationState.entity.floors,
    ...currentRoomState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocation,
        getRoom,
        resetRoomForm,
        saveRoom,
        addAttributeToRoom,
        removeAttributeFromRoom,
        attachRoomImage,
        deleteRoomImage
    }
)(EditRoomPage);
