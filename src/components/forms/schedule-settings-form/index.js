/**
 * Copyright 2019 OpenStack Foundation
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

import React from 'react';
import T from 'i18n-react/dist/i18n-react';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css';
import {Dropdown, Input, SimpleLinkList} from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../../utils/methods";
import Switch from "react-switch";
import EditLabelSlider from "../../inputs/edit-label-slider";
import PreFilterInput from "./pre-filter-input";

class ScheduleSettingsForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };
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

    handleChange = ev => {
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};

        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    onSwitchChange = (id, val) => {
        const entity = {...this.state.entity};
        entity[id] = val;

        this.setState({entity});
    };

    onPreFilterChange = ev => {
        const entity = {...this.state.entity};
        const {value, id} = ev.target;

        entity.pre_filters.forEach(pf => {
            if (pf.type === id) {
                pf.values = value;
            }
        });

        this.setState({entity});
    }

    onFilterChange = (id, enabled, label) => {
        const entity = {...this.state.entity};

        entity.filters.forEach(f => {
            if (f.type === id) {
                f.is_enabled = enabled;
                f.label = label;
            }
        });

        this.setState({entity});
    };

    handleSubmit = ev => {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    render() {
        const {entity, errors} = this.state;
        const {summit} = this.props;
        const disabledPreFilters = ['CUSTOM_ORDER', 'ABSTRACT', 'DATE'];
        const enabledPreFilters = entity.pre_filters.filter(pf => !disabledPreFilters.includes(pf.type));

        const color_source_ddl = [
            {label: 'Category', value: 'TRACK'},
            {label: 'Category Groups', value: 'TRACK_GROUP'},
            {label: 'Activity Type', value: 'EVENT_TYPES'},
        ];

        return (
            <form className="schedule-settings-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_schedule_settings.key")}</label>
                        <Input
                            id="key"
                            className="form-control"
                            value={entity.key}
                            disabled
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_schedule_settings.enabled")}</label><br/>
                        <Switch
                            checked={entity.is_enabled}
                            onChange={val => {this.onSwitchChange('is_enabled', val)}}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            className="react-switch"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_schedule_settings.color_source")} *</label>
                        <Dropdown
                            id="color_source"
                            value={entity.color_source}
                            options={color_source_ddl}
                            onChange={this.handleChange}
                            disabled={!entity.is_enabled}
                        />
                    </div>
                    <div className="col-md-4">
                        <label>{T.translate("edit_schedule_settings.is_my_schedule")}</label><br/>
                        <Switch
                            checked={entity.is_my_schedule}
                            onChange={val => {this.onSwitchChange('is_my_schedule', val)}}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            className="react-switch"
                            disabled={!entity.is_enabled}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_schedule_settings.access_levels_only")}</label><br/>
                        <Switch
                            checked={entity.only_events_with_attendee_access}
                            onChange={val => {this.onSwitchChange('only_events_with_attendee_access', val)}}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            className="react-switch"
                            disabled={!entity.is_enabled}
                        />
                    </div>
                </div>
                <br/><br/>
                <legend>Filters</legend>
                <div className="row form-group">
                    {entity.filters.map(filter =>
                        <div className="col-md-6" key={filter.type}>
                            <EditLabelSlider
                                checked={filter.is_enabled}
                                id={filter.type}
                                value={filter.label}
                                onChange={this.onFilterChange}
                                disabled={!entity.is_enabled}
                            />
                        </div>
                    )}
                </div>
                <br/><br/>
                <legend>Pre Filters</legend>
                <div className="row form-group pre-filters">
                    {enabledPreFilters.map(pf =>
                        <div className="col-md-6" key={pf.type}>
                            <PreFilterInput type={pf.type} values={pf.values} onChange={this.onPreFilterChange} summit={summit} disabled={!entity.is_enabled} />
                        </div>
                    )}
                </div>
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

export default ScheduleSettingsForm;
