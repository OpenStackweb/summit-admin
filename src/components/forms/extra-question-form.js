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
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'
import { Dropdown, Input, EditableTable } from 'openstack-uicore-foundation/lib/components'


class ExtraQuestionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

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

    shouldShowField(field){
        let {entity} = this.state;
        if (!entity.type) return false;
        let entity_type = this.props.questionClasses.find(c => c.type == entity.type);

        return (entity_type.hasOwnProperty(field) && entity_type[field]);
    }

    render() {
        let {entity} = this.state;
        let { onValueDelete, onValueSave, questionClasses } = this.props;
        let question_class_ddl = questionClasses.map(c => ({label: c.type, value: c.type}));
        let question_usage_ddl = [
            {label: 'Order', value: 'Order'},
            {label: 'Ticket', value: 'Ticket'},
            {label: 'Both', value: 'Both'}
        ];

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
                            id="type"
                            value={entity.type}
                            placeholder={T.translate("question_form.placeholders.select_type")}
                            options={question_class_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("question_form.question_id")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("question_form.usage")} *</label>
                        <Dropdown
                            id="usage"
                            value={entity.usage}
                            placeholder={T.translate("question_form.placeholders.select_usage")}
                            options={question_usage_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("question_form.visible_question")} *</label>
                        <Input
                            id="label"
                            value={entity.label}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('label')}
                        />
                    </div>
                    {(entity.type === 'Text' || entity.type === 'TextArea') &&
                    <div className="col-md-3">
                        <label> {T.translate("question_form.hint")} </label>
                        <Input
                            id="placeholder"
                            value={entity.placeholder}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('placeholder')}
                        />
                    </div>
                    }

                </div>
                <div className="row form-group">
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="printable" checked={entity.printable}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="printable">
                                {T.translate("question_form.printable")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="mandatory" checked={entity.mandatory}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="mandatory">
                                {T.translate("question_form.mandatory")}
                            </label>
                        </div>
                    </div>
                </div>


                {this.shouldShowField('values') && entity.id != 0 &&
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

export default ExtraQuestionForm;
