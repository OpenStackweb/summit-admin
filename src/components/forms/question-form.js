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
import { Dropdown, Input, EditableTable } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class QuestionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange       = this.handleChange.bind(this);
        this.handleSubmit       = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(prevProps.entity.id !== this.props.entity.id) {
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
        let {ownerId} = this.props;

        ev.preventDefault();

        this.props.onSubmit(ownerId, this.state.entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    shouldShowField(field){
        let {entity} = this.state;
        if (!entity.class_name) return false;
        let entity_type = this.props.questionClasses.find(c => c.class_name === entity.class_name);

        return (entity_type.hasOwnProperty(field) && entity_type[field]);
    }

    render() {
        let {entity} = this.state;
        let { onValueDelete, onValueSave, questionClasses } = this.props;
        let question_class_ddl = questionClasses.map(c => ({label: c.class_name, value: c.class_name}));

        let value_columns = [
            { columnKey: 'value', value: T.translate("question_form.value") },
            { columnKey: 'label', value: T.translate("question_form.visible_option") }
        ];

        let value_options = {
            noAlert: true,
            actions: {
                save: {onClick: onValueSave},
                delete: {onClick: onValueDelete}
            }
        }

        let question_values_ddl = [];
        if (entity.values.length > 0) {
            question_values_ddl = entity.values.map(v => ({label: v.value, value: v.id}));
        }

        let sortedValues = [];
        if (this.shouldShowField('values')) {
            sortedValues = [...entity.values];
            sortedValues.sort(
                (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
            );
        }

        return (
            <form className="question-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("question_form.question_type")} *</label>
                        <Dropdown
                            id="class_name"
                            value={entity.class_name}
                            placeholder={T.translate("question_form.placeholders.select_type")}
                            options={question_class_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("question_form.question_id")} </label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("question_form.visible_question")} </label>
                        <Input
                            id="label"
                            value={entity.label}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('label')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    {this.shouldShowField('initial_value') &&
                    <div className="col-md-3">
                        <label> {T.translate("question_form.initial_value")} </label>
                        <Input
                            id="initial_value"
                            value={entity.initial_value}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('initial_value')}
                        />
                    </div>
                    }
                    {this.shouldShowField('empty_string') &&
                    <div className="col-md-3">
                        <label> {T.translate("question_form.hint")} </label>
                        <Input
                            id="empty_string"
                            value={entity.empty_string}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('empty_string')}
                        />
                    </div>
                    }
                    {this.shouldShowField('default_value_id') &&
                    <div className="col-md-3">
                        <label> {T.translate("question_form.default_value_id")} </label>
                        <Dropdown
                            id="default_value_id"
                            value={entity.default_value_id}
                            placeholder={T.translate("question_form.placeholders.select_default")}
                            options={question_values_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    }
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_mandatory" checked={entity.is_mandatory}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_mandatory">
                                {T.translate("question_form.is_mandatory")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_read_only" checked={entity.is_read_only}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_read_only">
                                {T.translate("question_form.is_read_only")}
                            </label>
                        </div>
                    </div>
                </div>
                {this.shouldShowField('content') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("question_form.content")} </label>
                        <Input
                            id="content"
                            value={entity.content}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('content')}
                        />
                    </div>
                </div>
                }

                <div className="row form-group">
                    {this.shouldShowField('is_country_selector') &&
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_country_selector" checked={entity.is_country_selector}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_country_selector">
                                {T.translate("question_form.is_country_selector")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.shouldShowField('is_multiselect') &&
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_multiselect" checked={entity.is_multiselect}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_multiselect">
                                {T.translate("question_form.is_multi_select")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.shouldShowField('use_chosen_plugin') &&
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="use_chosen_plugin" checked={entity.use_chosen_plugin}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="use_chosen_plugin">
                                {T.translate("question_form.use_chosen_plugin")}
                            </label>
                        </div>
                    </div>
                    }
                </div>

                {this.shouldShowField('values') && entity.id !== 0 &&
                <div className="row">
                    <div className="col-md-12">
                        <EditableTable
                            options={value_options}
                            data={sortedValues}
                            columns={value_columns}
                        />
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

export default QuestionForm;
