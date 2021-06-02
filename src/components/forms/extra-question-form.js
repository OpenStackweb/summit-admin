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
import { Dropdown, Input, EditableTable, TextEditor } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";


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

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    shouldShowField(field){
        const {entity} = this.state;
        if (!entity.type) return false;
        const entity_type = this.props.questionClasses.find(c => c.type === entity.type);

        return (entity_type.hasOwnProperty(field) && entity_type[field]);
    }

    render() {
        const {entity, errors} = this.state;
        const { onValueDelete, onValueSave, questionClasses } = this.props;
        const question_class_ddl = questionClasses.map(c => ({label: c.type, value: c.type}));
        const question_usage_ddl = [
            {label: 'Order', value: 'Order'},
            {label: 'Ticket', value: 'Ticket'},
            {label: 'Both', value: 'Both'}
        ];

        const value_columns = [
            { columnKey: 'value', value: T.translate("question_form.value") },
            { columnKey: 'label', value: T.translate("question_form.visible_option") }
        ];

        const value_options = {
            noAlert: true,
            actions: {
                save: {onClick: onValueSave},
                delete: {onClick: onValueDelete}
            }
        };

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
                            error={hasErrors('name', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        {this.props.shouldShowUsage &&
                            <>
                                <label> {T.translate("question_form.usage")} *</label>
                                <Dropdown
                                id="usage"
                                value={entity.usage}
                                placeholder={T.translate("question_form.placeholders.select_usage")}
                                options={question_usage_ddl}
                                onChange={this.handleChange}
                                />
                            </>
                        }
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("question_form.visible_question")} *</label>
                        <TextEditor
                            id="label"
                            value={entity.label}
                            onChange={this.handleChange}
                            error={hasErrors('label', errors)}
                        />
                    </div>
                </div>
                {(entity.type === 'Text' || entity.type === 'TextArea') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("question_form.hint")} </label>
                        <Input
                            id="placeholder"
                            value={entity.placeholder}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('placeholder', errors)}
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    {this.props.shouldShowPrintable &&
                        <div className="col-md-3 checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="printable" checked={entity.printable}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="printable">
                                    {T.translate("question_form.printable")}
                                </label>
                            </div>
                        </div>
                    }
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

export default ExtraQuestionForm;
