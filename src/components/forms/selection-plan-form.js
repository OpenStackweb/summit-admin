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
import {
    findElementPos,
    epochToMomentTimeZone,
    queryTrackGroups,
    queryGroups
} from 'openstack-uicore-foundation/lib/methods'
import { Input, DateTimePicker, SimpleLinkList } from 'openstack-uicore-foundation/lib/components';


class SelectionPlanForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleTrackGroupLink = this.handleTrackGroupLink.bind(this);
        this.handleTrackGroupUnLink = this.handleTrackGroupUnLink.bind(this);
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

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
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

    handleTrackGroupLink(value) {
        let {entity} = this.state;
        this.props.onTrackGroupLink(entity.id, value);
    }

    handleTrackGroupUnLink(valueId) {
        let {entity} = this.state;
        this.props.onTrackGroupUnLink(entity.id, valueId);
    }


    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let trackGroupsColumns = [
            { columnKey: 'name', value: T.translate("edit_selection_plan.name") },
            { columnKey: 'description', value: T.translate("edit_selection_plan.description") }
        ];

        let trackGroupsOptions = {
            title: T.translate("edit_selection_plan.track_groups"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: (input, callback) => { queryTrackGroups(currentSummit.id, input, callback); },
                delete: { onClick: this.handleTrackGroupUnLink },
                add: { onClick: this.handleTrackGroupLink }
            }
        };

        return (
            <form className="selection-plan-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_selection_plan.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_selection_plan.max_submissions")}</label>
                        <Input
                            className="form-control"
                            type="number"
                            error={this.hasErrors('max_submission_allowed_per_user')}
                            id="max_submission_allowed_per_user"
                            value={entity.max_submission_allowed_per_user}
                            onChange={this.handleChange}
                            min={0}
                        />
                    </div>
                    <div className="col-md-2 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_enabled" checked={entity.is_enabled}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_enabled">
                                {T.translate("edit_selection_plan.enabled")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="allow_new_presentations" checked={entity.allow_new_presentations}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="allow_new_presentations">
                                {T.translate("edit_selection_plan.allow_new_presentations")}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.submission_begin_date")} </label>
                        <DateTimePicker
                            id="submission_begin_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.submission_begin_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.submission_end_date")} </label>
                        <DateTimePicker
                            id="submission_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.submission_end_date, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.voting_begin_date")} </label>
                        <DateTimePicker
                            id="voting_begin_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.voting_begin_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.voting_end_date")} </label>
                        <DateTimePicker
                            id="voting_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.voting_end_date, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.selection_begin_date")} </label>
                        <DateTimePicker
                            id="selection_begin_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.selection_begin_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_selection_plan.selection_end_date")} </label>
                        <DateTimePicker
                            id="selection_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.selection_end_date, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>

                <hr />
                {entity.id != 0 &&
                <SimpleLinkList
                    values={entity.track_groups}
                    columns={trackGroupsColumns}
                    options={trackGroupsOptions}
                />
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

export default SelectionPlanForm;
