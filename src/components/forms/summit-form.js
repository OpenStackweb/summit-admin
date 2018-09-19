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
import moment from 'moment-timezone'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { findElementPos, epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'
import {
    DateTimePicker,
    Input,
    Panel,
    Dropdown,
    Table
} from 'openstack-uicore-foundation/lib/components'


class SummitForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            showSection: 'main',
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSPlanEdit = this.handleSPlanEdit.bind(this);
        this.handleSPlanAdd = this.handleSPlanAdd.bind(this);

    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: nextProps.errors
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
        let {errors} = this.state;
        let {value, id} = ev.target;

        if (ev.target.type == 'radio') {
            id = ev.target.name;
            value = (ev.target.value == 1);
        }

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handleSPlanEdit(selectionPlanId) {
        let {entity, history} = this.props;
        history.push(`/app/summits/${entity.id}/selection-plans/${selectionPlanId}`);
    }

    handleSPlanAdd(ev) {
        let {entity, history} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${entity.id}/selection-plans/new`);
    }

    render() {
        let {entity, showSection} = this.state;
        let {onSPlanDelete} = this.props;
        let time_zones_ddl = moment.tz.names().map(tz => ({label: tz, value: tz}));
        let dates_enabled = (entity.hasOwnProperty('time_zone_id') && entity.time_zone_id != '');

        let splan_columns = [
            { columnKey: 'name', value: T.translate("edit_summit.name") },
            { columnKey: 'enabled', value: T.translate("edit_summit.enabled") }
        ];

        let splan_table_options = {
            actions: {
                edit: { onClick: this.handleSPlanEdit },
                delete: { onClick: onSPlanDelete }
            }
        }

        return (
            <form>
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.name")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('name')}
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.eventbrite_id")} *</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('external_summit_id')}
                            id="external_summit_id"
                            value={entity.external_summit_id}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.max_submission_allowed_per_user")} *</label>
                        <Input
                            className="form-control"
                            type="number"
                            error={this.hasErrors('max_submission_allowed_per_user')}
                            id="max_submission_allowed_per_user"
                            value={entity.max_submission_allowed_per_user}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('link')}
                            id="link"
                            value={entity.link}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.registration_link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('registration_link')}
                            id="registration_link"
                            value={entity.registration_link}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.secondary_registration_link")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('secondary_registration_link')}
                            id="secondary_registration_link"
                            value={entity.secondary_registration_link}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.dates_label")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('dates_label')}
                            id="dates_label"
                            value={entity.dates_label}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_summit.secondary_registration_label")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('secondary_registration_label')}
                            id="secondary_registration_label"
                            value={entity.secondary_registration_label}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="active" checked={entity.active}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="active">
                                {T.translate("edit_summit.active")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="available_on_api" checked={entity.available_on_api}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="available_on_api">
                                {T.translate("edit_summit.available_on_api")}
                            </label>
                        </div>
                    </div>
                </div>

                <Panel show={showSection == 'dates'} title={T.translate("edit_summit.dates")}
                       handleClick={this.toggleSection.bind(this, 'dates')}>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.time_zone")} *</label>
                            <Dropdown
                                id="time_zone_id"
                                value={entity.time_zone_id}
                                onChange={this.handleChange}
                                options={time_zones_ddl}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.start_date")} </label>
                            <DateTimePicker
                                id="start_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                timeConstraints={{ hours: { min: 7, max: 22}}}
                                value={epochToMomentTimeZone(entity.start_date, entity.time_zone_id)}
                                error={this.hasErrors('start_date')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.end_date")} </label>
                            <DateTimePicker
                                id="end_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                timeConstraints={{ hours: { min: 7, max: 22}}}
                                value={epochToMomentTimeZone(entity.end_date, entity.time_zone_id)}
                                error={this.hasErrors('end_date')}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.registration_begin_date")} </label>
                            <DateTimePicker
                                id="registration_begin_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                value={epochToMomentTimeZone(entity.registration_begin_date, entity.time_zone_id)}
                                error={this.hasErrors('registration_begin_date')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.registration_end_date")} </label>
                            <DateTimePicker
                                id="registration_end_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                value={epochToMomentTimeZone(entity.registration_end_date, entity.time_zone_id)}
                                error={this.hasErrors('registration_end_date')}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.schedule_start_date")} </label>
                            <DateTimePicker
                                id="schedule_start_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                value={epochToMomentTimeZone(entity.schedule_start_date, entity.time_zone_id)}
                                error={this.hasErrors('schedule_start_date')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.start_showing_venues_date")} </label>
                            <DateTimePicker
                                id="start_showing_venues_date"
                                disabled={!dates_enabled}
                                onChange={this.handleChange}
                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                timezone={entity.time_zone_id}
                                value={epochToMomentTimeZone(entity.start_showing_venues_date, entity.time_zone_id)}
                                error={this.hasErrors('start_showing_venues_date')}
                            />
                        </div>
                    </div>

                    {entity.selection_plans.length > 0 &&
                    <div>
                        <input type="button" onClick={this.handleSPlanAdd}
                               className="btn btn-primary pull-right" value={T.translate("edit_summit.add_splan")}/>
                        <Table
                            options={splan_table_options}
                            data={entity.selection_plans}
                            columns={splan_columns}
                        />
                    </div>
                    }

                </Panel>

                <Panel show={showSection == 'calendar'} title={T.translate("edit_summit.calendar_sync")}
                       handleClick={this.toggleSection.bind(this, 'calendar')}>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.calendar_sync_name")}</label>
                            <Input
                                className="form-control"
                                error={this.hasErrors('calendar_sync_name')}
                                id="calendar_sync_name"
                                value={entity.calendar_sync_name}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit.calendar_sync_desc")}</label>
                            <Input
                                className="form-control"
                                error={this.hasErrors('calendar_sync_desc')}
                                id="calendar_sync_desc"
                                value={entity.calendar_sync_desc}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
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

export default SummitForm;
