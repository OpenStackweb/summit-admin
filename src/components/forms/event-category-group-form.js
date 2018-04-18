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
import {findElementPos, epochToMoment} from '../../utils/methods'
import Input from '../inputs/text-input'
import TextEditor from '../inputs/editor-input'
import SimpleLinkList from '../simple-link-list/index'
import Dropdown from '../inputs/dropdown'
import {queryTracks} from '../../actions/base-actions'


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
        this.handleTrackEdit = this.handleTrackEdit.bind(this);
        this.handleTrackUnLink = this.handleTrackUnLink.bind(this);
        this.getTracks = this.getTracks.bind(this);
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

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
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

    handleTrackLink(value) {
        let tracks = [...this.state.entity.tracks];
        tracks.push(value);

        let entity = {...this.state.entity, tracks: tracks};
        this.setState({entity: entity});

        this.props.onTrackLink(entity.id, value.id);
    }

    handleTrackUnLink(value, ev) {
        ev.preventDefault();

        let tracks = this.state.entity.tracks.filter(t => t.id != value);

        let entity = {...this.state.entity, tracks: tracks};
        this.setState({entity: entity});

        this.props.onTrackUnLink(entity.id, value);
    }

    handleTrackEdit() {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/new`);
    }

    getTracks (input) {
        let { currentSummit } = this.props;

        if (!input) {
            return Promise.resolve({ options: [] });
        }

        return queryTracks(currentSummit.id, input);
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let tracksColumns = [
            { columnKey: 'name', value: T.translate("edit_event_category.name") },
            { columnKey: 'code', value: T.translate("edit_event_category.code") }
        ];

        let class_name_ddl = ['PrivatePresentationCategoryGroup', 'PresentationCategoryGroup'].map(i => ({label:i, value:i}));

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.class")} *</label>
                        <Dropdown
                            id="class_name"
                            value={entity.class_name}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event_category_group.placeholders.select_class")}
                            options={class_name_ddl}
                            error={this.hasErrors('class_name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
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
                {entity.class_name == 'PrivatePresentationCategoryGroup' &&
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.submission_begin_date")}</label>
                        <DateTimePicker
                            id="submission_begin_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            value={epochToMoment(entity.submission_begin_date)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_group.submission_end_date")}</label>
                        <DateTimePicker
                            id="submission_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            value={epochToMoment(entity.submission_end_date)}
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
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>

                <hr />
                {entity.id != 0 &&
                <SimpleLinkList
                    title={T.translate("edit_event_category_group.tracks")}
                    values={entity.tracks}
                    columns={tracksColumns}
                    valueKey="name"
                    labelKey="name"
                    onEdit={this.handleTrackEdit}
                    onLink={this.handleTrackLink}
                    onUnLink={this.handleTrackUnLink}
                    queryOptions={this.getTracks}
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