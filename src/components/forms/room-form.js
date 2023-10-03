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
import { Input, TextEditor, SimpleLinkList, Dropdown, UploadInput } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";
import HourIntervalInput from '../inputs/date-interval-input';

class RoomForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.queryAttributes = this.queryAttributes.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClearHours = this.handleClearHours.bind(this);
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

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
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

    handleClearHours() {
        let entity = {...this.state.entity};
        const { locationHours } = this.props;
        entity['opening_hour'] = locationHours.opening_hour || null;
        entity['closing_hour'] = locationHours.closing_hour || null;
        this.setState({entity: entity});
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    queryAttributes(input, callback) {
        const {currentSummit} = this.props;
        let attributeTypes = currentSummit.meeting_booking_room_allowed_attributes;
        let attributes = [];

        attributeTypes.forEach(type => {
            attributes = [...attributes, ...type.values];
        });

        attributes = attributes.map(attr => {
            let type = attributeTypes.find(at => at.id === attr.type_id);
            return ({...attr, label: `${type.type}: ${attr.value}`});
        });

        attributes = attributes.filter(at => at.label.toLowerCase().indexOf(input.toLowerCase()) !== -1);

        callback(attributes);
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
        const {entity} = this.state;
        let { allFloors, currentSummit, locationHours } = this.props;
        let floors_ddl = allFloors.map(f => ({label: f.name, value: f.id}));

        let attributeColumns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'type_name', value: T.translate("general.type") },
            { columnKey: 'value', value: T.translate("general.value") },
        ];

        let attributeOptions = {
            title: T.translate("edit_room.attribute_values"),
            valueKey: "id",
            labelKey: "label",
            defaultOptions: true,
            actions: {
                delete: { onClick: this.props.onAttributeUnLink},
                search: this.queryAttributes,
                add: { onClick: this.props.onAttributeLink }
            }
        };

        let roomAttributes = entity.attributes.map(attr => {
            let attributeTypes = currentSummit.meeting_booking_room_allowed_attributes;
            let type = attributeTypes.find(at => at.id === attr.type_id);

            return ({...attr, label: `${type.type}: ${attr.value}`, type_name: type.type});
        });

        let class_ddl = [
            {label: 'Room', value: 'SummitVenueRoom'},
            {label: 'Bookable Room', value: 'SummitBookableVenueRoom'},
        ];

        let currency_ddl = [
            {label: 'USD', value: 'USD'},
            {label: 'EUR', value: 'EUR'},
        ];

        let image_url = entity.image != null ? entity.image.url : '';

        return (
            <form className="room-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room.type")} *</label>
                        <Dropdown
                            id="class_name"
                            disabled={entity.id !== 0}
                            value={entity.class_name}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_room.placeholders.select_type")}
                            options={class_ddl}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room.capacity")}</label>
                        <Input
                            id="capacity"
                            type="number"
                            value={entity.capacity}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('capacity')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_room.floor")}</label>
                        <Dropdown
                            id="floor_id"
                            value={entity.floor_id}
                            placeholder={T.translate("edit_room.placeholders.select_floor")}
                            options={floors_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="override_blackouts" checked={entity.override_blackouts}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="override_blackouts">
                                {T.translate("edit_room.override_blackouts")}
                            </label>
                        </div>
                    </div>
                </div>
                { entity.class_name !== 'SummitBookableVenueRoom' &&
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("edit_location.open_hours")}</label>
                        <HourIntervalInput 
                            onChange={this.handleChange}
                            onClear={this.handleClearHours}
                            fromDate={entity.opening_hour || locationHours.opening_hour}
                            fromId='opening_hour'
                            toDate={entity.closing_hour || locationHours.closing_hour}
                            toId='closing_hour'
                            timezone={currentSummit.time_zone_id}
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_room.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>

                {entity.class_name === 'SummitBookableVenueRoom' &&
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_room.slot_cost")}</label>
                        <Input
                            id="time_slot_cost"
                            type="number"
                            value={entity.time_slot_cost}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('time_slot_cost')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label>{T.translate("edit_room.currency")}</label>
                        <Dropdown
                            id="currency"
                            options={currency_ddl}
                            onChange={this.handleChange}
                            value={entity.currency}
                        />
                    </div>
                </div>
                }

                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_room.image")} </label>
                        <UploadInput
                            value={image_url}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <br/>
                <hr/>

                {entity.class_name === 'SummitBookableVenueRoom' && entity.id !== 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <SimpleLinkList
                            values={roomAttributes}
                            columns={attributeColumns}
                            options={attributeOptions}
                        />
                        <br/>
                        <hr/>
                    </div>
                </div>
                }



                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this, false)}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                        {!entity.id &&
                        <input type="button" onClick={this.handleSubmit.bind(this, true)}
                               className="btn btn-primary pull-right" value={T.translate("general.save_and_add_next")}/>
                        }
                    </div>
                </div>
            </form>
        );
    }
}

export default RoomForm;
