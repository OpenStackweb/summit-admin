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
import {findElementPos} from '../../utils/methods'
import Dropdown from '../inputs/dropdown'
import Input from '../inputs/text-input'
import SortableTable from "../table-sortable/SortableTable"


class RsvpQuestionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleAddValue     = this.handleAddValue.bind(this);
        this.handleValueEdit    = this.handleValueEdit.bind(this);
        this.handleChange       = this.handleChange.bind(this);
        this.handleSubmit       = this.handleSubmit.bind(this);
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
        let {rsvpTemplateId} = this.props;

        ev.preventDefault();

        this.props.onSubmit(rsvpTemplateId, this.state.entity, this.props.history);
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

        return entity_type[field];
    }

    handleAddValue(ev) {
        let {currentSummit, history, entity, rsvpTemplateId} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${entity.id}/values/new`);
    }

    handleValueEdit(valueId) {
        let {currentSummit, rsvpTemplateId, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${entity.id}/values/${valueId}`);
    }

    render() {
        let {entity} = this.state;
        let { onValueDelete, allClasses } = this.props;
        let question_class_ddl = allClasses.map(c => ({label: c.class_name, value: c.class_name}));

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'value', value: T.translate("edit_rsvp_question.value") },
            { columnKey: 'label', value: T.translate("edit_rsvp_question.label") }
        ];

        let table_options = {
            className: "dataTable",
            actions: {
                edit: { onClick: this.handleValueEdit },
                delete: { onClick: onValueDelete }
            }
        }

        let question_values_ddl = [];
        if (entity.values.length > 0) {
            question_values_ddl = entity.values.map(v => ({label: v.value, value: v.id}));
        }

        return (
            <form className="rsvp-question-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_rsvp_question.class_name")} *</label>
                        <Dropdown
                            id="class_name"
                            value={entity.class_name}
                            placeholder={T.translate("edit_rsvp_question.placeholders.select_class")}
                            options={question_class_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("general.name")} </label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_rsvp_question.label")} </label>
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
                        <label> {T.translate("edit_rsvp_question.initial_value")} </label>
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
                        <label> {T.translate("edit_rsvp_question.empty_string")} </label>
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
                        <label> {T.translate("edit_rsvp_question.default_value_id")} </label>
                        <Dropdown
                            id="default_value_id"
                            value={entity.default_value_id}
                            placeholder={T.translate("edit_rsvp_question.placeholders.select_default")}
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
                                {T.translate("edit_rsvp_question.is_mandatory")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_read_only" checked={entity.is_read_only}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_read_only">
                                {T.translate("edit_rsvp_question.is_read_only")}
                            </label>
                        </div>
                    </div>
                </div>
                {this.shouldShowField('content') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_rsvp_question.content")} </label>
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
                {this.shouldShowField('values') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <button className="btn btn-primary pull-right" onClick={this.handleAddValue}>
                            {T.translate("edit_rsvp_question.add_value")}
                        </button>
                        <SortableTable
                            options={table_options}
                            data={entity.values}
                            columns={columns}
                            dropCallback={this.props.onValueReorder}
                            orderField="order"
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
                                {T.translate("edit_rsvp_question.is_country_selector")}
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
                                {T.translate("edit_rsvp_question.is_multi_select")}
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
                                {T.translate("edit_rsvp_question.use_chosen_plugin")}
                            </label>
                        </div>
                    </div>
                    }
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

export default RsvpQuestionForm;