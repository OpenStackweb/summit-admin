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
import { Dropdown, Input, UploadInputV2, TextEditor } from 'openstack-uicore-foundation/lib/components'
import { isEmpty, scrollToError, shallowEqual, hasErrors } from "../../utils/methods";


class EventCommentForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },            
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        const name = this.props.entity.id ? this.props.entity.name : this.props.event.title;
        const description = this.props.entity.id ? this.props.entity.description : this.props.event.description;

        scrollToError(this.props.errors);

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = { ...this.props.entity, name, description };
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = { ...this.props.errors };
        }

        if (!isEmpty(state)) {
            this.setState({ ...this.state, ...state })
        }
    }

    handleChange(ev) {
        const entity = { ...this.state.entity };
        const errors = { ...this.state.errors };
        let { value, id } = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({ entity: entity, errors: errors });
    }

    handleSubmit(ev) {
        const { entity } = this.state;
        ev.preventDefault();
        this.props.onSubmit(entity);
    }

    render() {
        const { entity, errors } = this.state;

        return (
            <form className="event-material-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_comment.owner_name")}</label>
                        <Input
                            id="owner_full_name"
                            value={entity.owner_full_name}
                            onChange={this.handleChange}
                            className="form-control"
                            disabled="true"
                            error={hasErrors('owner_full_name', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_activity" checked={entity.is_activity}
                                onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_activity">
                                {T.translate("edit_event_comment.is_activity")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_public" checked={entity.is_public}
                                onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_public">
                                {T.translate("edit_event_comment.is_public")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_comment.body")}</label>
                        <textarea
                            id="body"
                            value={entity.body}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('body', errors)}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                            className="btn btn-primary pull-right" value={T.translate("general.save")} />
                    </div>
                </div>
            </form>
        );
    }
}

export default EventCommentForm;
