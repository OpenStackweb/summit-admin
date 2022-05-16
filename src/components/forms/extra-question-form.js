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
import history from "../../history";
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Dropdown, Input, EditableTable, Table, TextEditor } from 'openstack-uicore-foundation/lib/components'
import { isEmpty, scrollToError, shallowEqual, hasErrors } from "../../utils/methods";
import { ExtraQuestionsTypeAllowSubQuestion } from '../../utils/constants';


class ExtraQuestionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNewSubQuestionRule = this.handleNewSubQuestionRule.bind(this);
        this.handleEditSubQuestionRule = this.handleEditSubQuestionRule.bind(this);
        this.handleDeleteSubQuestionRule = this.handleDeleteSubQuestionRule.bind(this);
        this.formatRuleConditionColumn = this.formatRuleConditionColumn.bind(this);
        this.formatRuleQuestionColumn = this.formatRuleQuestionColumn.bind(this);
        this.allowsSubQuestionRules = this.allowsSubQuestionRules.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = { ...this.props.entity };
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

        errors[id] = '';
        entity[id] = value;
        this.setState({ entity: entity, errors: errors });
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleNewSubQuestionRule(ev) {
        const { entity } = this.state;
        history.push(`/app/summits/${entity.summit_id}/order-extra-questions/${entity.id}/sub-rule/new`);
    }

    handleEditSubQuestionRule(ev) {
        const { entity } = this.state;
        history.push(`/app/summits/${entity.summit_id}/order-extra-questions/${entity.id}/sub-rule/${ev}`);
    }

    handleDeleteSubQuestionRule(ev) {
        this.props.onRuleDelete(ev);
    }

    formatRuleConditionColumn(item) {
        const { entity } = this.state;
        let values = entity.values.filter(v => item.answer_values.includes(`${v.id}`)).map(e => e.value);
        values = values.length > 1 ? values.join(` ${item.answer_values_operator} `) : values.join('');
        return `${item.visibility_condition === 'NotEqual' ? 'Not Equal' : 'Equal'} to ${values}`
    }

    formatRuleQuestionColumn(item) {
        const { summitExtraQuestions } = this.props;
        let question = summitExtraQuestions.find(e => e.id === item.sub_question_id);
        return `${item.visibility === 'Visible' ? 'Show' : 'Not Show'} ${question.name}`
    }

    shouldShowField(field) {
        const { entity } = this.state;
        if (!entity.type) return false;
        const entity_type = this.props.questionClasses.find(c => c.type == entity.type);
        return (entity_type.hasOwnProperty(field) && entity_type[field]);
    }

    allowsSubQuestionRules(question) {
        return ExtraQuestionsTypeAllowSubQuestion.includes(question.type)
    }

    render() {
        const { entity, errors } = this.state;
        const { onValueDelete, onValueSave, questionClasses } = this.props;
        const question_class_ddl = questionClasses.map(c => ({ label: c.type, value: c.type }));

        const question_usage_ddl = [
            { label: 'Order', value: 'Order' },
            { label: 'Ticket', value: 'Ticket' },
            { label: 'Both', value: 'Both' }
        ];

        const value_columns = [
            { columnKey: 'value', value: T.translate("question_form.value") },
            { columnKey: 'label', value: T.translate("question_form.visible_option") }
        ];

        const value_options = {
            noAlert: true,
            actions: {
                save: { onClick: onValueSave },
                delete: { onClick: onValueDelete }
            }
        };

        const sub_questions_columns = [
            { columnKey: 'value', value: T.translate("question_form.sub_question_condition"), render: (item) => this.formatRuleConditionColumn(item) },
            { columnKey: 'label', value: T.translate("question_form.sub_question_rule"), render: (item) => this.formatRuleQuestionColumn(item) }
        ];

        const sub_questions_options = {
            actions: {
                edit: { onClick: this.handleEditSubQuestionRule },
                delete: { onClick: this.handleDeleteSubQuestionRule }
            }
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
                                    onChange={this.handleChange} className="form-check-input" />
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
                                textArea
                            />
                        </div>
                    </div>
                }
                {entity.id !== 0 && this.allowsSubQuestionRules(entity) &&
                    <>
                        <hr />
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label> {T.translate("question_form.sub_questions_rules")}</label>
                                <button className="btn btn-primary pull-right left-space" onClick={this.handleNewSubQuestionRule}>
                                    {T.translate("question_form.sub_questions_rules_add")}
                                </button>
                                <br /><br /><br />
                                {entity.sub_question_rules.length === 0 &&
                                    <div>{T.translate("question_form.no_sub_questions_rules")}</div>
                                }
                                {entity.sub_question_rules.length > 0 &&
                                    <Table
                                        options={sub_questions_options}
                                        data={entity.sub_question_rules}
                                        columns={sub_questions_columns}
                                    />
                                }
                            </div>
                        </div>
                    </>
                }

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                            className="btn btn-primary pull-right" value={T.translate("general.save")} />
                    </div>
                </div>
            </form >
        );
    }
}

export default ExtraQuestionForm;
