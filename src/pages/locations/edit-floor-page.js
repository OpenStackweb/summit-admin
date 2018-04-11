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
import swal from "sweetalert2";
import FloorForm from '../../components/forms/floor-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getFloor, resetFloorForm, saveFloor, deleteRoom } from "../../actions/location-actions";

class EditFloorPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleRoomDelete = this.handleRoomDelete.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let {entity} = this.props;
        let {currentLocation} = nextProps;

        let new_floor_id = nextProps.match.params.floor_id;

        if(entity.id != new_floor_id) {
            if(new_floor_id) {
                this.props.getFloor(currentLocation.id, new_floor_id);
            } else {
                this.props.resetFloorForm();
            }
        }
    }

    componentWillMount () {
        let {currentSummit, currentLocation, errors} = this.props;
        let floorId = this.props.match.params.floor_id;

        if(currentSummit != null) {
            if (floorId != null && currentLocation != null) {
                this.props.getFloor(currentLocation.id, floorId);
            } else {
                this.props.resetFloorForm();
            }
        }
    }

    handleRoomDelete(roomId, ev) {
        let {deleteRoom, entity, currentLocation} = this.props;
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
                deleteRoom(currentLocation.id, roomId);
            }
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, currentLocation, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_floor.floor")}</h3>
                <hr/>
                {currentSummit &&
                <FloorForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    locationId={currentLocation.id}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveFloor}
                    onRoomDelete={this.handleRoomDelete}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationState, currentFloorState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentLocation : currentLocationState.entity,
    ...currentFloorState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getFloor,
        resetFloorForm,
        saveFloor,
        deleteRoom
    }
)(EditFloorPage);