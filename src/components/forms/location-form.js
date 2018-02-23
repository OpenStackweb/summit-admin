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
import {findElementPos} from '../../utils/methods'
import Dropdown from '../inputs/dropdown'
import Input from '../inputs/text-input'
import TextEditor from '../inputs/editor-input'
import Table from "../table/Table";
import Panel from "../sections/panel";


class LocationForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'main'
        };

        this.shouldShowComponent = this.shouldShowComponent.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleTypeChange(ev) {
        let entity = {...this.state.entity};
        let {allClasses} = this.props;
        let {value, id} = ev.target;

        entity.type = value;
        entity.class_name = allClasses.find(c => c.type.indexOf(value) !== -1).class_name;

        this.setState({entity: entity});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    shouldShowComponent(component) {
        let {class_name} = this.state.entity;

        if (!class_name) return false;

        switch(component) {
            case 'speaker':
                return (class_name == 'SPEAKER_PROMO_CODE');
                break;
            case 'member':
                return (class_name == 'MEMBER_PROMO_CODE' || class_name == 'SPONSOR_PROMO_CODE');
                break;
            case 'sponsor':
                return (class_name == 'SPONSOR_PROMO_CODE');
                break;
            case 'name':
                return (class_name == 'MEMBER_PROMO_CODE' || class_name == 'SPONSOR_PROMO_CODE');
                break;
        }
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    render() {
        let {entity, showSection} = this.state;
        let { currentSummit, allTypes } = this.props;
        let location_types_ddl = allTypes.map(t => ({label: t, value: t}));

        let floor_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'number', value: T.translate("edit_location.number") }
        ];

        let floor_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            actions: {
                edit: {onClick: this.handleFloorEdit},
                delete: { onClick: this.handleFloorDelete }
            }
        }

        let room_columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'capacity', value: T.translate("edit_location.capacity") },
            { columnKey: 'floor', value: T.translate("edit_location.floor") }
        ];

        let room_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            actions: {
                edit: {onClick: this.handleRoomEdit},
                delete: { onClick: this.handleRoomDelete }
            }
        }

        return (
            <form className="location-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.type")} *</label>
                        <Dropdown id="type" value={entity.type} disabled={entity.id !== 0}
                            placeholder={T.translate("location_list.placeholders.select_type")}
                            options={location_types_ddl} onChange={this.handleTypeChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.name")} *</label>
                        <Input id="name" value={entity.name} onChange={this.handleChange} error={this.hasErrors('name')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.website")}</label>
                        <Input id="website" value={entity.website} onChange={this.handleChange} error={this.hasErrors('website')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_location.description")} </label>
                        <TextEditor id="description" value={entity.description} onChange={this.handleChange} error={this.hasErrors('description')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.address_1")}</label>
                        <Input id="address_1" value={entity.address_1} onChange={this.handleChange} error={this.hasErrors('address_1')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.address_2")}</label>
                        <Input id="address_2" value={entity.address_2} onChange={this.handleChange} error={this.hasErrors('address_2')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.zipcode")}</label>
                        <Input id="zipcode" value={entity.zipcode} onChange={this.handleChange} error={this.hasErrors('zipcode')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.city")}</label>
                        <Input id="city" value={entity.city} onChange={this.handleChange} error={this.hasErrors('city')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.state")}</label>
                        <Input id="state" value={entity.state} onChange={this.handleChange} error={this.hasErrors('state')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.country")}</label>
                        <Input id="country" value={entity.country} onChange={this.handleChange} error={this.hasErrors('country')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.lat")}</label>
                        <Input id="lat" value={entity.lat} onChange={this.handleChange} error={this.hasErrors('lat')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.lng")}</label>
                        <Input id="lng" value={entity.lng} onChange={this.handleChange} error={this.hasErrors('lng')} />
                    </div>
                </div>
                <div className="row form-group checkboxes-div">
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="display_on_site" checked={entity.display_on_site}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="display_on_site">
                                {T.translate("edit_location.display_on_site")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="details_page" checked={entity.details_page}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="details_page">
                                {T.translate("edit_location.details_page")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_main" checked={entity.is_main}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_main">
                                {T.translate("edit_location.is_main")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_location.location_message")}</label>
                        <TextEditor id="location_message" value={entity.location_message} onChange={this.handleChange} error={this.hasErrors('location_message')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.capacity")}</label>
                        <Input type="number" id="capacity" value={entity.capacity} onChange={this.handleChange} error={this.hasErrors('capacity')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_location.booking_link")}</label>
                        <Input id="booking_link" value={entity.booking_link} onChange={this.handleChange} error={this.hasErrors('booking_link')} />
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sold_out" checked={entity.sold_out}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="sold_out">
                                {T.translate("edit_location.sold_out")}
                            </label>
                        </div>
                    </div>
                </div>

                <Panel showSection={showSection} name="floors" title={T.translate("edit_location.floors")} handleClick={this.toggleSection.bind(this, 'floors')} >
                    <button className="btn btn-primary right-space" onClick={this.handleNewFloor}>
                        {T.translate("edit_location.add_floor")}
                    </button>
                    <Table
                        options={floor_options}
                        data={entity.floors}
                        columns={floor_columns}
                        className="dataTable"
                    />
                </Panel>

                <Panel showSection={showSection} name="rooms" title={T.translate("edit_location.rooms")} handleClick={this.toggleSection.bind(this, 'rooms')} >
                    <button className="btn btn-primary right-space" onClick={this.handleNewRoom}>
                        {T.translate("edit_location.add_room")}
                    </button>
                    <Table
                        options={room_options}
                        data={entity.rooms}
                        columns={room_columns}
                        className="dataTable"
                    />
                </Panel>

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