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
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import { queryTracks, queryGroups } from 'openstack-uicore-foundation/lib/utils/query-actions'
import {
    Input,
    TextEditor,
    SimpleLinkList,
    Dropdown,
    DateTimePicker
} from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";


class EventCategoryGroupForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTrackLink = this.handleTrackLink.bind(this);
        this.handleTrackUnLink = this.handleTrackUnLink.bind(this);
        this.handleAllowedGroupLink = this.handleAllowedGroupLink.bind(this);
        this.handleAllowedGroupUnLink = this.handleAllowedGroupUnLink.bind(this);
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
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'datetime') {
            value = value.unix();
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleTrackLink(value) {
        const {entity} = this.state;
        this.props.onTrackLink(entity.id, value);
    }

    handleTrackUnLink(valueId) {
        const {entity} = this.state;
        this.props.onTrackUnLink(entity.id, valueId);
    }

    handleAllowedGroupLink(value) {
        const {entity} = this.state;
        this.props.onAllowedGroupLink(entity.id, value);
    }

    handleAllowedGroupUnLink(valueId) {
        const {entity} = this.state;
        this.props.onAllowedGroupUnLink(entity.id, valueId);
    }

    shouldShowField(flag){
        const {entity} = this.state;
        if (!entity.class_name) return false;
        const class_name = this.props.allClasses.find(c => c.class_name === entity.class_name);

        return class_name[flag];
    }

    render() {
        const {entity, errors} = this.state;
        const { currentSummit, allClasses } = this.props;

        const tracksColumns = [
            { columnKey: 'name', value: T.translate("edit_event_category.name") },
            { columnKey: 'code', value: T.translate("edit_event_category.code") }
        ];

        const tracksOptions = {
            title: T.translate("edit_event_category_group.tracks"),
            valueKey: "name",
            labelKey: "name",
            actions: {
                search: (input, callback) => { queryTracks(currentSummit.id, input, callback) },
                delete: { onClick: this.handleTrackUnLink },
                add: { onClick: this.handleTrackLink }
            }
        };

        const allowedGroupsColumns = [
            { columnKey: 'title', value: T.translate("edit_event_category.name") },
            { columnKey: 'description', value: T.translate("edit_event_category.description") }
        ];

        const allowedGroupsOptions = {
            title: T.translate("edit_event_category_group.allowed_groups"),
            valueKey: "id",
            labelKey: "title",
            actions: {
                search: queryGroups,
                delete: { onClick: this.handleAllowedGroupUnLink },
                add: { onClick: this.handleAllowedGroupLink }
            }
        };

        const class_name_ddl = allClasses.map(i => ({label:i.class_name, value:i.class_name}));

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.class")} *</label>
                        <Dropdown
                            id="class_name"
                            disabled={entity.id !== 0}
                            value={entity.class_name}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event_category_group.placeholders.select_class")}
                            options={class_name_ddl}
                            error={hasErrors('class_name', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('name', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.color")} *</label>
                        <Input
                            id="color"
                            type="color"
                            value={entity.color}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.begin_attendee_voting_period_date")}</label>
                        <DateTimePicker
                            id="begin_attendee_voting_period_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.begin_attendee_voting_period_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.end_attendee_voting_period_date")}</label>
                        <DateTimePicker
                            id="end_attendee_voting_period_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}                            
                            value={epochToMomentTimeZone(entity.end_attendee_voting_period_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.max_attendee_votes")}</label>
                        <Input
                            id="max_attendee_votes"
                            type="number"
                            value={entity.max_attendee_votes}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                {this.shouldShowField('submission_begin_date') &&
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.submission_begin_date")}</label>
                        <DateTimePicker
                            id="submission_begin_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.submission_begin_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.submission_end_date")}</label>
                        <DateTimePicker
                            id="submission_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.submission_end_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.max_submission_allowed_per_user")}</label>
                        <Input
                            id="max_submission_allowed_per_user"
                            type="number"
                            value={entity.max_submission_allowed_per_user}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category_group.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={hasErrors('description', errors)}
                        />
                    </div>
                </div>

                <hr />
                {entity.id !== 0 &&
                <SimpleLinkList
                    values={entity.tracks}
                    columns={tracksColumns}
                    options={tracksOptions}
                />
                }
                <br />
                <br />
                {entity.id !== 0 && this.shouldShowField('allowed_groups') &&
                <SimpleLinkList
                    values={entity.allowed_groups}
                    columns={allowedGroupsColumns}
                    options={allowedGroupsOptions}
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

export default EventCategoryGroupForm;
