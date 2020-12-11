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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, TextEditor, Panel, Table, UploadInput } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class FloorForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showRooms: false,
        };

        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRoomEdit = this.handleRoomEdit.bind(this);
        this.handleNewRoom = this.handleNewRoom.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(prevProps.entity.id !== this.props.entity.id) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(continueAdding, ev) {
        let entity = {...this.state.entity};
        let {locationId} = this.props;

        ev.preventDefault();

        this.props.onSubmit(locationId, entity, continueAdding);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    toggleRooms(ev) {
        ev.preventDefault();

        this.setState({showRooms: !this.state.showRooms});
    }

    handleRoomEdit(roomId) {
        const {currentSummit, locationId, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/rooms/${roomId}`);
    }

    handleNewRoom(ev) {
        ev.preventDefault();

        const {currentSummit, locationId, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/rooms/new`);
    }

    handleUploadFile(file) {
        let entity = {...this.state.entity};
        let {locationId} = this.props;

        let formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(locationId, entity, formData);
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};
        let {locationId} = this.props;

        entity.image = '';
        this.setState({entity});
        this.props.onRemoveImage(locationId, entity.id);
    }

    render() {
        const {entity, showRooms} = this.state;

        let room_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'capacity', value: T.translate("edit_location.capacity") },
            { columnKey: 'floor_name', value: T.translate("edit_location.floor") }
        ];

        let room_options = {
            actions: {
                edit: {onClick: this.handleRoomEdit},
                delete: { onClick: this.props.onRoomDelete }
            }
        };

        let image_url = entity.image != null ? entity.image.url : '';

        return (
            <form className="floor-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_floor.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_floor.number")}</label>
                        <Input
                            id="number"
                            type="number"
                            value={entity.number}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('number')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_floor.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_floor.image")} </label>
                        <UploadInput
                            value={entity.image}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <br/>

                {entity.id !== 0 &&
                <Panel show={showRooms} title={T.translate("edit_location.rooms")}
                                     handleClick={this.toggleRooms.bind(this)}>
                    <button className="btn btn-primary pull-right left-space" onClick={this.handleNewRoom}>
                        {T.translate("edit_location.add_room")}
                    </button>
                    <Table
                        options={room_options}
                        data={entity.rooms}
                        columns={room_columns}
                    />
                </Panel>
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this, false)}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                        {!entity.id &&
                        <input type="button" onClick={this.handleSubmit.bind(this, true)}
                               className="btn btn-default pull-right" value={T.translate("general.save_and_add_next")}/>
                        }
                    </div>
                </div>
            </form>
        );
    }
}

export default FloorForm;
