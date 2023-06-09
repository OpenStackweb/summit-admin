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
import {
    Dropdown,
    Input,
    TextEditor,
    SortableTable
} from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";
import {ExtraQuestionsTypeAllowSubQuestion} from '../../utils/constants';
import {Modal} from "react-bootstrap";
import "./exxtra-questions-form.scss";

class ExtraQuestionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            currentEditValue: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNewSubQuestionRule = this.handleNewSubQuestionRule.bind(this);
        this.handleEditSubQuestionRule = this.handleEditSubQuestionRule.bind(this);
        this.handleDeleteSubQuestionRule = this.handleDeleteSubQuestionRule.bind(this);
        this.formatRuleConditionColumn = this.formatRuleConditionColumn.bind(this);
        this.formatRuleQuestionColumn = this.formatRuleQuestionColumn.bind(this);
        this.allowsSubQuestionRules = this.allowsSubQuestionRules.bind(this);
        this.handleEditValue = this.handleEditValue.bind(this);
        this.handleOnSaveQuestionValue = this.handleOnSaveQuestionValue.bind(this);
        this.handleChangeValue = this.handleChangeValue.bind(this);
        this.handleAddNewValue = this.handleAddNewValue.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
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

    handleChangeValue(ev) {
        const currentEditValue = {...this.state.currentEditValue};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        currentEditValue[id] = value;
        this.setState({...this.state, currentEditValue: currentEditValue});
    }

    handleEditValue(valueId) {
        const entity = {...this.state.entity};
        const entityValue = entity.values.find(v => v.id == valueId);
        if (!entityValue) return;
        this.setState({...this.state, currentEditValue: entityValue});
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

    handleOnSaveQuestionValue(ev) {
        ev.preventDefault();
        this.props.onValueSave(this.state.currentEditValue);
        this.setState({...this.state, currentEditValue: null});
    }

    handleAddNewValue(newValue) {
        this.props.onValueSave(newValue);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleNewSubQuestionRule(ev) {
        const {entity} = this.state;
        history.push(`/app/summits/${entity.summit_id}/order-extra-questions/${entity.id}/sub-rule/new`);
    }

    handleEditSubQuestionRule(ev) {
        const {entity} = this.state;
        history.push(`/app/summits/${entity.summit_id}/order-extra-questions/${entity.id}/sub-rule/${ev}`);
    }

    handleDeleteSubQuestionRule(ev) {
        this.props.onRuleDelete(ev);
    }

    formatRuleConditionColumn(item) {
        const {entity} = this.state;
        let values = entity.values.filter(v => item.answer_values.includes(`${v.id}`)).map(e => e.value);
        values = values.length > 1 ? values.join(` ${item.answer_values_operator} `) : values.join('');
        return `${item.visibility_condition === 'NotEqual' ? 'Not Equal' : 'Equal'} to ${values}`
    }

    formatRuleQuestionColumn(item) {
        const {summitExtraQuestions} = this.props;
        let question = summitExtraQuestions.find(e => e.id === item.sub_question_id);
        return `${item.visibility === 'Visible' ? 'Show' : 'Not Show'} ${question.name}`
    }

    shouldShowField(field) {
        const {entity} = this.state;
        if (!entity.type) return false;
        const entity_type = this.props.questionClasses.find(c => c.type == entity.type);
        return (entity_type?.hasOwnProperty(field) && entity_type[field]);
    }

    allowsSubQuestionRules(question) {
        return this.props.shouldAllowSubRules && ExtraQuestionsTypeAllowSubQuestion.includes(question.type)
    }

    handleNewQuestionValue(ev) {
        ev.preventDefault();
        const newValue = {...this.state.newValue};
        const {onValueSave} = this.props;
        onValueSave({
            label: newValue.question_value_label_new,
            value: newValue.question_value_val_new
        });
        this.setState({...this.state, newValue: {question_value_val_new: '', question_value_label_new: ''}});
    }

    render() {
        const {entity, errors, currentEditValue} = this.state;
        const {
            currentSummit = null,
            onValueDelete,
            onValueSave,
            questionClasses,
            updateSubQuestionRuleOrder,
            updateQuestionValueOrder
        } = this.props;
        const question_class_ddl = questionClasses.map(c => ({label: c.type, value: c.type}));

        const badge_features_ddl = currentSummit && currentSummit.badge_features && currentSummit.badge_features.length > 0 ? currentSummit.badge_features.map(f => ({
            label: f.name,
            value: f.id
        })) : [];
        const ticket_type_ddl = currentSummit && currentSummit.ticket_types && currentSummit.ticket_types.length > 0 ? currentSummit.ticket_types.map(tt => ({
            label: tt.name,
            value: tt.id
        })) : [];

        const question_usage_ddl = [
            {label: 'Order', value: 'Order'},
            {label: 'Ticket', value: 'Ticket'},
            {label: 'Both', value: 'Both'},
        ];

        const value_columns = [
            {
                columnKey: 'value',
                value: T.translate("question_form.value"),
            },
            {
                columnKey: 'label',
                value: T.translate("question_form.visible_option"),
            },
            {
                columnKey: 'is_default',
                value: T.translate("question_form.is_default"),
                render: (row, val) => { return val ?  T.translate("general.yes") : T.translate("general.no")},
                input: 'checkbox',
            },
        ];

        const value_options = {
            actions: {
                edit: {onClick: this.handleEditValue},
                delete: {onClick: onValueDelete},
                save: { onClick: this.handleAddNewValue}
            }
        };

        const sub_questions_columns = [
            {
                columnKey: 'value',
                value: T.translate("question_form.sub_question_condition"),
                render: (item) => this.formatRuleConditionColumn(item)
            },
            {
                columnKey: 'label',
                value: T.translate("question_form.sub_question_rule"),
                render: (item) => this.formatRuleQuestionColumn(item)
            }
        ];

        const sub_questions_options = {
            actions: {
                edit: {onClick: this.handleEditSubQuestionRule},
                delete: {onClick: this.handleDeleteSubQuestionRule}
            }
        }

        return (
            <>
                <form className="question-form">
                    <input type="hidden" id="id" value={entity.id}/>
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
                        {entity.type === 'CheckBoxList' &&
                        <div className="col-md-3">
                            <label>{T.translate("question_form.max_selected_values")}</label>
                            <Input
                                type="number"
                                id="max_selected_values"
                                value={entity.max_selected_values}
                                onChange={this.handleChange}
                            />
                        </div>
                        }
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
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="mandatory">
                                    {T.translate("question_form.mandatory")}
                                </label>
                            </div>
                        </div>
                        {this.props.shouldShowEditable &&
                        <div className="col-md-3 checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="is_editable" checked={entity.is_editable}
                                       onChange={this.handleChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor="is_editable">
                                    {T.translate("question_form.is_editable")}
                                </label>
                            </div>
                        </div>
                        }
                    </div>
                    <div className="row form-group">
                        {ticket_type_ddl.length > 0 &&
                        <div className="col-md-4">
                            <label>
                                {T.translate("question_form.allowed_ticket_types")} &nbsp;
                                <i className="fa fa-info-circle"
                                   title={T.translate("question_form.allowed_ticket_types_info")}/>
                            </label>
                            <Dropdown
                                id="allowed_ticket_types"
                                clearable
                                isMulti
                                value={entity.allowed_ticket_types}
                                onChange={this.handleChange}
                                options={ticket_type_ddl}
                            />
                        </div>
                        }
                        {badge_features_ddl.length > 0 &&
                        <div className="col-md-4">
                            <label>
                                {T.translate("question_form.allowed_badge_features_types")} &nbsp;
                                <i className="fa fa-info-circle"
                                   title={T.translate("question_form.allowed_badge_features_types_info")}/>
                            </label>
                            <Dropdown
                                id="allowed_badge_features_types"
                                clearable
                                isMulti
                                value={entity.allowed_badge_features_types}
                                onChange={this.handleChange}
                                options={badge_features_ddl}
                            />
                        </div>
                        }
                    </div>

                    {this.shouldShowField('values') && entity.id !== 0 &&
                    <>
                        <label>{T.translate("question_form.values")}</label>
                        <hr/>
                        {entity.values.length > 0 &&
                            <div className="row">
                                <div className="col-md-12">
                                    <SortableTable
                                        options={value_options}
                                        data={entity.values}
                                        columns={value_columns}
                                        dropCallback={updateQuestionValueOrder}
                                        orderField="order"
                                    />
                                </div>
                            </div>
                        }
                    </>
                    }
                    {entity.id !== 0 && this.allowsSubQuestionRules(entity) &&
                    <>
                        <hr/>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label> {T.translate("question_form.sub_questions_rules")}</label>
                                <button className="btn btn-primary pull-right left-space"
                                        onClick={this.handleNewSubQuestionRule}>
                                    {T.translate("question_form.sub_questions_rules_add")}
                                </button>
                                <br/><br/><br/>
                                {entity.sub_question_rules.length === 0 &&
                                <div>{T.translate("question_form.no_sub_questions_rules")}</div>
                                }
                                {entity.sub_question_rules.length > 0 &&
                                <SortableTable
                                    options={sub_questions_options}
                                    data={entity.sub_question_rules}
                                    columns={sub_questions_columns}
                                    dropCallback={updateSubQuestionRuleOrder}
                                    orderField="order"
                                />
                                }
                            </div>
                        </div>
                    </>
                    }

                    <div className="row">
                        <div className="col-md-12 submit-buttons">
                            <button  onClick={this.handleSubmit}
                                   className="btn btn-primary pull-right">
                                {T.translate("general.save")}
                            </button>
                        </div>
                    </div>
                </form>
                {currentEditValue != null &&
                <Modal className="modal_edit_value" show={true}
                       onHide={() => this.setState({...this.state, currentEditValue: null})}>
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("question_form.edit_value", {id: currentEditValue.id})}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row modal_edit_value_row">
                            <div className="col-md-12">
                                <input type="text" id="value"
                                       style={{width: '100%'}}
                                       placeholder={T.translate("question_form.value")}
                                       maxLength={255}
                                       value={currentEditValue.value} onChange={this.handleChangeValue}/>
                            </div>
                        </div>
                        <div className="row modal_edit_value_row">
                            <div className="col-md-12">
                                <textarea id="label"
                                          placeholder={T.translate("question_form.visible_option")}
                                          value={currentEditValue.label} onChange={this.handleChangeValue}/>
                            </div>
                        </div>
                        <div className="row modal_edit_value_row">
                            <div className="col-md-12 checkboxes-div">
                                <div className="form-check abc-checkbox">
                                    <input type="checkbox" id="is_default" checked={currentEditValue.is_default}
                                           onChange={this.handleChangeValue} className="form-check-input"/>
                                    <label className="form-check-label" htmlFor="is_default">
                                        {T.translate("question_form.is_default")}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={this.handleOnSaveQuestionValue}>
                            {T.translate("general.save")}
                        </button>
                    </Modal.Footer>
                </Modal>
                }
            </>
        );
    }
}

export default ExtraQuestionForm;
