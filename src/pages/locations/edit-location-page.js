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

import React from 'react'
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import swal from "sweetalert2";
import LocationForm from '../../components/forms/location-form';
import { getSummitById }  from '../../actions/summit-actions';
import {
    getLocation,
    resetLocationForm,
    saveLocation,
    updateLocationMap,
    updateAddress,
    deleteFloor,
    deleteRoom,
    deleteLocationImage,
    deleteLocationMap
} from "../../actions/location-actions";

import '../../styles/edit-location-page.less';

class EditLocationPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleFloorDelete = this.handleFloorDelete.bind(this);
        this.handleRoomDelete = this.handleRoomDelete.bind(this);
        this.handleImageDelete = this.handleImageDelete.bind(this);
        this.handleMapDelete = this.handleMapDelete.bind(this);
    }

    handleFloorDelete(floorId, ev) {
        let {deleteFloor, entity} = this.props;
        let floor = entity.floors.find(f => f.id == floorId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_location.remove_floor_warning") + ' ' + floor.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteFloor(entity.id, floorId);
            }
        }).catch(swal.noop);
    }

    handleRoomDelete(roomId, ev) {
        let {deleteRoom, entity} = this.props;
        let room = entity.rooms.find(r => r.id == roomId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_location.remove_room_warning") + ' ' + room.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRoom(entity.id, roomId);
            }
        }).catch(swal.noop);
    }

    handleImageDelete(imageId, ev) {
        let {deleteLocationImage, entity} = this.props;
        let image = entity.images.find(i => i.id == imageId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_location.remove_image_warning") + ' ' + image.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteLocationImage(entity.id, imageId);
            }
        }).catch(swal.noop);
    }

    handleMapDelete(mapId, ev) {
        let {deleteLocationMap, entity} = this.props;
        let map = entity.maps.find(m => m.id == mapId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_location.remove_map_warning") + ' ' + map.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteLocationMap(entity.id, mapId);
            }
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, allClasses, entity, errors, history, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_location.location")}</h3>
                <hr/>
                {currentSummit &&
                <LocationForm
                    history={history}
                    currentSummit={currentSummit}
                    allClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveLocation}
                    onMapUpdate={this.props.updateLocationMap}
                    onMarkerDragged={this.props.updateAddress}
                    onFloorDelete={this.handleFloorDelete}
                    onRoomDelete={this.handleRoomDelete}
                    onImageDelete={this.handleImageDelete}
                    onMapDelete={this.handleMapDelete}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentLocationState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocation,
        resetLocationForm,
        saveLocation,
        updateLocationMap,
        updateAddress,
        deleteFloor,
        deleteRoom,
        deleteLocationImage,
        deleteLocationMap
    }
)(EditLocationPage);
