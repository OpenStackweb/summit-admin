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
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'
import { Input, EditableTable, Dropdown, TextEditor } from 'openstack-uicore-foundation/lib/components'


class EventCategoryQuestionForm extends React.Component {
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

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};

        ev.preventDefault();

        this.props.onSubmit(entity);
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
        let entity_type = this.props.allClasses.find(c => c.class_name == entity.class_name);

        return (entity_type.hasOwnProperty(field) && entity_type[field]);
    }

    render() {
        let {entity} = this.state;
        let {allClasses} = this.props;

        let value_columns = [
            { columnKey: 'label', value: T.translate("general.label") },
            { columnKey: 'value', value: T.translate("general.value") }
        ];

        let value_options = {
            actions: {
                save: {onClick: this.props.onSaveValue},
                delete: {onClick: this.props.onDeleteValue}
            }
        }

        let class_name_ddl = allClasses.map(i => ({label:i.class_name, value:i.class_name}));

        let values_ddl = entity.values.map(v => ({value: v.id, label: v.label}));

        return (
            <form className="event-category-question-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.class")} *</label>
                        <Dropdown
                            id="class_name"
                            disabled={entity.id != 0}
                            value={entity.class_name}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event_category_question.placeholders.select_class")}
                            options={class_name_ddl}
                            error={this.hasErrors('class_name')}
                            clearable
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.label")} *</label>
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
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_mandatory" checked={entity.is_mandatory}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_mandatory">
                                {T.translate("edit_event_category_question.mandatory")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_read_only" checked={entity.is_read_only}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_read_only">
                                {T.translate("edit_event_category_question.read_only")}
                            </label>
                        </div>
                    </div>
                    {this.shouldShowField('is_country_selector') &&
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_country_selector" checked={entity.is_country_selector}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_country_selector">
                                {T.translate("edit_event_category_question.country_selector")}
                            </label>
                        </div>
                    </div>
                    }
                    {this.shouldShowField('is_multi_select') &&
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_multi_select" checked={entity.is_multi_select}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_multi_select">
                                {T.translate("edit_event_category_question.multi_select")}
                            </label>
                        </div>
                    </div>
                    }
                </div>

                <div className="row form-group">
                    {this.shouldShowField('default_value_id') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.default_value")}</label>
                        <Dropdown
                            id="default_value_id"
                            value={entity.default_value_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_event_category_question.placeholders.select_default_value")}
                            options={values_ddl}
                            error={this.hasErrors('default_value_id')}
                        />
                    </div>
                    }
                    {this.shouldShowField('initial_value') &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.initial_value")}</label>
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
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category_question.empty_string")}</label>
                        <Input
                            id="empty_string"
                            value={entity.empty_string}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('empty_string')}
                        />
                    </div>
                    }
                </div>

                {this.shouldShowField('content') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category_question.content")} </label>
                        <TextEditor
                            id="content"
                            value={entity.content}
                            onChange={this.handleChange}
                            error={this.hasErrors('content')}
                        />
                    </div>
                </div>
                }

                {this.shouldShowField('values') && entity.id != 0 &&
                <div className="row">
                    <div className="col-md-12">
                        <EditableTable
                            options={value_options}
                            data={entity.values}
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

export default EventCategoryQuestionForm;
