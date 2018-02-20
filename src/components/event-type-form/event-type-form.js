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
import Dropdown from '../dropdown'
import Input from '../text-input'


class EventTypeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

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

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

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

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;
        let event_types_ddl = [{label: 'Presentation', value: 'PRESENTATION_TYPE'}, {label: 'Event', value: 'EVENT_TYPE'}];

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_type.class")} *</label>
                        <Dropdown
                            id="class_name"
                            value={entity.class_name}
                            placeholder={T.translate("edit_event_type.placeholders.select_class")}
                            options={event_types_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>

                    {entity.class_name == 'PRESENTATION_TYPE' &&
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="should_be_available_on_cfp" checked={entity.should_be_available_on_cfp}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="should_be_available_on_cfp">
                                {T.translate("edit_event_type.available_cfp")}
                            </label>
                        </div>
                    </div>
                    }
                    {entity.class_name == 'EVENT_TYPE' &&
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="allows_attachment" checked={entity.allows_attachment}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="allows_attachment">
                                {T.translate("edit_event_type.allows_attachment")}
                            </label>
                        </div>
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_type.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_type.color")}</label>
                        <Input
                            id="color"
                            type="color"
                            value={entity.color}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('color')}
                        />
                    </div>
                </div>
                <div className="row form-group checkboxes-div">
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="black_out_times" checked={entity.black_out_times}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="black_out_times">
                                {T.translate("edit_event_type.black_out_times")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="use_sponsors" checked={entity.use_sponsors}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="use_sponsors">
                                {T.translate("edit_event_type.use_sponsors")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="are_sponsors_mandatory" checked={entity.are_sponsors_mandatory}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="are_sponsors_mandatory">
                                {T.translate("edit_event_type.are_sponsors_mandatory")}
                            </label>
                        </div>
                    </div>
                </div>

                {entity.class_name == 'PRESENTATION_TYPE' &&
                <div>
                    <hr/>
                    <div className="row form-group checkboxes-div">
                        <div className="col-md-4">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="use_speakers" checked={entity.use_speakers}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="use_speakers">
                                    {T.translate("edit_event_type.use_speakers")}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="are_speakers_mandatory"
                                       checked={entity.are_speakers_mandatory}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="are_speakers_mandatory">
                                    {T.translate("edit_event_type.are_speakers_mandatory")}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_type.min_speakers")}</label>
                            <Input
                                id="min_speakers"
                                type="number"
                                value={entity.min_speakers}
                                onChange={this.handleChange}
                                className="form-control"
                                error={this.hasErrors('min_speakers')}
                            />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_type.max_speakers")}</label>
                            <Input
                                id="max_speakers"
                                type="number"
                                value={entity.max_speakers}
                                onChange={this.handleChange}
                                className="form-control"
                                error={this.hasErrors('max_speakers')}
                            />
                        </div>
                    </div>
                    <hr/>
                    <div className="row form-group checkboxes-div">
                        <div className="col-md-4">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="use_moderator" checked={entity.use_moderator}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="use_moderator">
                                    {T.translate("edit_event_type.use_moderator")}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="is_moderator_mandatory"
                                       checked={entity.is_moderator_mandatory}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="is_moderator_mandatory">
                                    {T.translate("edit_event_type.moderator_mandatory")}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_type.moderator_label")}</label>
                            <Input
                                id="moderator_label"
                                value={entity.moderator_label}
                                onChange={this.handleChange}
                                className="form-control"
                                error={this.hasErrors('moderator_label')}
                            />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_type.min_moderators")}</label>
                            <Input
                                id="min_moderators"
                                type="number"
                                value={entity.min_moderators}
                                onChange={this.handleChange}
                                className="form-control"
                                error={this.hasErrors('min_moderators')}
                            />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_type.max_moderators")}</label>
                            <Input
                                id="max_moderators"
                                type="number"
                                value={entity.max_moderators}
                                onChange={this.handleChange}
                                className="form-control"
                                error={this.hasErrors('max_moderators')}
                            />
                        </div>
                    </div>
                </div>
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

export default EventTypeForm;