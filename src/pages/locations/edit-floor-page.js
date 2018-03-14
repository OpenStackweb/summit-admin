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
import swal from "sweetalert2";
import FloorForm from '../../components/forms/floor-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getFloor, resetFloorForm, saveFloor, deleteRoom } from "../../actions/location-actions";

class EditFloorPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            floorId: props.match.params.floor_id,
            locationId: props.match.params.location_id
        }

        this.handleRoomDelete = this.handleRoomDelete.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        let {floorId, locationId} = this.state;

        let new_floor_id = nextProps.match.params.floor_id;
        let new_location_id = this.props.match.params.location_id;

        if(floorId != new_floor_id || locationId != new_location_id) {

            this.setState({
                floorId: new_floor_id,
                locationId: new_location_id
            });

            if(new_floor_id && new_location_id) {
                this.props.getFloor(new_location_id, new_floor_id);
            } else {
                this.props.resetFloorForm();
            }
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount () {
        let {currentSummit, errors} = this.props;
        let locationId = this.props.match.params.location_id;
        let floorId = this.props.match.params.floor_id;

        if(currentSummit != null) {
            if (floorId != null && locationId != null) {
                this.props.getFloor(locationId, floorId);
            } else {
                this.props.resetFloorForm();
            }
        }
    }

    handleRoomDelete(roomId, ev) {
        let {deleteRoom, entity} = this.props;
        let {locationId} = this.state;
        let room = entity.rooms.find(r => r.id == roomId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_location.remove_room_warning") + ' ' + room.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(){
            deleteRoom(locationId, roomId);
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_floor.floor")}</h3>
                <hr/>
                {currentSummit &&
                <FloorForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    locationId={this.state.locationId}
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

const mapStateToProps = ({ currentSummitState, currentFloorState }) => ({
    currentSummit : currentSummitState.currentSummit,
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