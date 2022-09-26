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
import {
    Dropdown,
    CountryDropdown,
    Input,
    TextEditor,
    Table,
    Panel,

} from 'openstack-uicore-foundation/lib/components';
import { GMap } from 'openstack-uicore-foundation/lib/components/google-map';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";

class LocationForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'main'
        };

        this.display                = this.display.bind(this);
        this.handleChange           = this.handleChange.bind(this);
        this.handleSubmit           = this.handleSubmit.bind(this);
        this.handleNewFloor         = this.handleNewFloor.bind(this);
        this.handleFloorEdit        = this.handleFloorEdit.bind(this);
        this.handleNewRoom          = this.handleNewRoom.bind(this);
        this.handleRoomEdit         = this.handleRoomEdit.bind(this);
        this.handleNewImage         = this.handleNewImage.bind(this);
        this.handleImageEdit        = this.handleImageEdit.bind(this);
        this.handleNewMap           = this.handleNewMap.bind(this);
        this.handleMapEdit          = this.handleMapEdit.bind(this);
        this.handleMarkerDragged    = this.handleMarkerDragged.bind(this);
        this.handleMapUpdate        = this.handleMapUpdate.bind(this);
        this.handleMapClick         = this.handleMapClick.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
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

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        let {allClasses} = this.props;
        ev.preventDefault();

        this.props.onSubmit(entity, allClasses);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    display(component) {
        let {class_name} = this.state.entity;
        if (!class_name) return false;

        let location_class = this.props.allClasses.find(c => c.class_name === class_name);

        return location_class.hasOwnProperty(component);
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handleNewFloor(ev) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/floors/new`);
    }

    handleFloorEdit(floorId) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/floors/${floorId}`);
    }

    handleNewRoom(ev) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/rooms/new`);
    }

    handleRoomEdit(roomId) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/rooms/${roomId}`);
    }

    handleNewImage(ev) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/images/new`);
    }

    handleImageEdit(imageId) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/images/${imageId}`);
    }

    handleNewMap(ev) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/maps/new`);
    }

    handleMapEdit(mapId) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${entity.id}/maps/${mapId}`);
    }

    handleMarkerDragged(lat, lng) {
        let entity = {...this.state.entity};
        entity.lat = lat;
        entity.lng = lng;

        this.props.onMarkerDragged(entity);
    }

    handleMapUpdate(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onMapUpdate(entity);
    }

    handleMapClick(lat, lng) {
        let entity = {...this.state.entity};
        entity.lat = lat;
        entity.lng = lng;

        this.props.onMarkerDragged(entity);
    }

    render() {
        const {entity, showSection} = this.state;
        const { currentSummit, allClasses } = this.props;
        let location_class_ddl = allClasses.map(l => ({label: l.class_name, value: l.class_name}));
        let airport_type_ddl = [ {label: 'International', value: 'International'}, {label: 'Domestic', value: 'Domestic'} ];
        let hotel_type_ddl = [ {label: 'Primary', value: 'Primary'}, {label: 'Alternate', value: 'Alternate'} ];
        let mapPin      = [];
        let mapCenter   = {lat: parseFloat(entity.lat), lng: parseFloat(entity.lng)};

        if (entity.lat && entity.lng) {
            mapPin.push({id: entity.id, lat: parseFloat(entity.lat), lng: parseFloat(entity.lng)});
        }


        let floor_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'number', value: T.translate("edit_location.number") }
        ];

        let floor_options = {
            actions: {
                edit: {onClick: this.handleFloorEdit},
                delete: { onClick: this.props.onFloorDelete }
            }
        }

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
        }

        let image_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") }
        ];

        let image_options = {
            actions: {
                edit: {onClick: this.handleImageEdit},
                delete: { onClick: this.props.onImageDelete }
            }
        }

        let map_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") },
        ];

        let map_options = {
            actions: {
                edit: {onClick: this.handleMapEdit},
                delete: { onClick: this.props.onMapDelete }
            }
        }

        return (
            <form className="location-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.type")} *</label>
                        <Dropdown id="class_name" value={entity.class_name} disabled={entity.id !== 0}
                            placeholder={T.translate("edit_location.placeholders.select_type")}
                            options={location_class_ddl} onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.name")} *</label>
                        <Input id="name" value={entity.name} onChange={this.handleChange} error={this.hasErrors('name')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.short_name")}</label>
                        <Input id="short_name" value={entity.short_name} onChange={this.handleChange} error={this.hasErrors('short_name')} />
                    </div>

                </div>
                {this.display('website_url') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_location.website")}</label>
                        <Input id="website_url" value={entity.website_url} onChange={this.handleChange}
                               error={this.hasErrors('website_url')}/>
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_location.description")} </label>
                        <TextEditor id="description" value={entity.description} onChange={this.handleChange} error={this.hasErrors('description')} />
                    </div>
                </div>

                <div className="row form-group checkboxes-div">
                    {this.display('display_on_site') &&
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="display_on_site" checked={entity.display_on_site}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="display_on_site">
                                {T.translate("edit_location.display_on_site")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.display('details_page') &&
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="details_page" checked={entity.details_page}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="details_page">
                                {T.translate("edit_location.details_page")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.display('is_main') &&
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_main" checked={entity.is_main}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_main">
                                {T.translate("edit_location.is_main")}
                            </label>
                        </div>
                    </div>
                    }
                </div>
                <div className="row form-group">
                    {this.display('location_message') &&
                    <div className="col-md-12">
                        <label> {T.translate("edit_location.location_message")}</label>
                        <TextEditor id="location_message" value={entity.location_message} onChange={this.handleChange}
                                    error={this.hasErrors('location_message')}/>
                    </div>
                    }
                </div>
                <div className="row form-group">
                    {this.display('capacity') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.capacity")}</label>
                        <Input type="number" id="capacity" value={entity.capacity} onChange={this.handleChange}
                               error={this.hasErrors('capacity')}/>
                    </div>
                    }
                    {this.display('booking_link') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.booking_link")}</label>
                        <Input id="booking_link" value={entity.booking_link} onChange={this.handleChange}
                               error={this.hasErrors('booking_link')}/>
                    </div>
                    }
                    {this.display('sold_out') &&
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sold_out" checked={entity.sold_out}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="sold_out">
                                {T.translate("edit_location.sold_out")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.display('hotel_type') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.type")} *</label>
                        <Dropdown id="hotel_type" value={entity.hotel_type} placeholder={T.translate("edit_location.placeholders.select_type")}
                                  options={hotel_type_ddl} onChange={this.handleChange}
                        />
                    </div>
                    }
                    {this.display('airport_type') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.type")} *</label>
                        <Dropdown id="airport_type" value={entity.airport_type} placeholder={T.translate("edit_location.placeholders.select_type")}
                                  options={airport_type_ddl} onChange={this.handleChange}
                        />
                    </div>
                    }
                </div>

                {this.display('address_1') &&
                <Panel show={showSection === 'address'} title={T.translate("edit_location.address")}
                       handleClick={this.toggleSection.bind(this, 'address')}>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.address_1")}</label>
                            <Input id="address_1" value={entity.address_1} onChange={this.handleChange}
                                   error={this.hasErrors('address_1')}/>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.address_2")}</label>
                            <Input id="address_2" value={entity.address_2} onChange={this.handleChange}
                                   error={this.hasErrors('address_2')}/>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.zipcode")}</label>
                            <Input id="zip_code" value={entity.zip_code} onChange={this.handleChange}
                                   error={this.hasErrors('zip_code')}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.city")}</label>
                            <Input id="city" value={entity.city} onChange={this.handleChange}
                                   error={this.hasErrors('city')}/>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.state")}</label>
                            <Input id="state" value={entity.state} onChange={this.handleChange}
                                   error={this.hasErrors('state')}/>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.country")}</label>
                            <CountryDropdown
                                id="country"
                                value={entity.country}
                                onChange={this.handleChange}
                                placeholder={T.translate("edit_location.placeholders.select_country")}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.lat")}</label>
                            <Input id="lat" value={entity.lat} onChange={this.handleChange}
                                   error={this.hasErrors('lat')}/>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_location.lng")}</label>
                            <Input id="lng" value={entity.lng} onChange={this.handleChange}
                                   error={this.hasErrors('lng')}/>
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-default update_map" onClick={this.handleMapUpdate}>
                                {T.translate("edit_location.update_map")}
                            </button>
                        </div>
                    </div>
                    <GMap
                        markers={mapPin}
                        center={mapCenter}
                        zoom={16}
                        draggable
                        onMarkerDragged={this.handleMarkerDragged}
                        onMapClick={this.handleMapClick}
                    />
                </Panel>
                }

                {this.display('floors') && entity.id !== 0 &&
                <Panel show={showSection === 'floors'} title={T.translate("edit_location.floors")}
                       handleClick={this.toggleSection.bind(this, 'floors')}>
                    <button className="btn btn-primary pull-right" onClick={this.handleNewFloor}>
                        {T.translate("edit_location.add_floor")}
                    </button>
                    <Table
                        options={floor_options}
                        data={entity.floors}
                        columns={floor_columns}
                    />
                </Panel>
                }

                {this.display('rooms') && entity.id !== 0 &&
                <Panel show={showSection === 'rooms'} id="rooms" title={T.translate("edit_location.rooms")}
                       handleClick={this.toggleSection.bind(this, 'rooms')}>
                    <button className="btn btn-primary pull-right" onClick={this.handleNewRoom}>
                        {T.translate("edit_location.add_room")}
                    </button>
                    <Table
                        options={room_options}
                        data={entity.rooms}
                        columns={room_columns}
                    />
                </Panel>
                }

                {this.display('images') && entity.id !== 0 &&
                <Panel show={showSection === 'images'} title={T.translate("edit_location.images")}
                       handleClick={this.toggleSection.bind(this, 'images')}>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <button className="btn btn-primary pull-right" onClick={this.handleNewImage}>
                                {T.translate("edit_location.add_image")}
                            </button>
                            <Table
                                options={image_options}
                                data={entity.images}
                                columns={image_columns}
                            />
                        </div>
                    </div>
                    <hr />
                    <div className="row form-group">
                        <div className="col-md-12">
                            <button className="btn btn-primary pull-right" onClick={this.handleNewMap}>
                                {T.translate("edit_location.add_map")}
                            </button>
                            <Table
                                options={map_options}
                                data={entity.maps}
                                columns={map_columns}
                            />
                        </div>
                    </div>
                </Panel>
                }

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

export default LocationForm;
