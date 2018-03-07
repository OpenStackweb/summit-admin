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

        this.shouldShowComponent = this.shouldShowComponent.bind(this);
        this.handleAddValue = this.handleAddValue.bind(this);
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

        this.props.onSubmit(this.state.entity, this.props.history);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    shouldShowComponent(component) {
        let {class_name} = this.state.entity;
        return true;
    }

    handleAddValue(ev) {
        let {currentSummit, history, entity, rsvpTemplateId} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${entity.id}/values/new`);
    }

    render() {
        let {entity} = this.state;
        let { currentSummit, allClasses } = this.props;
        let question_class_ddl = allClasses.map(c => ({label: c.name, value: c.id}));

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'value', value: T.translate("edit_rsvp_question.value") },
            { columnKey: 'label', value: T.translate("edit_rsvp_question.label") }
        ];

        let table_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            actions: {
                edit: { onClick: this.handleEditValue },
                delete: { onClick: this.props.onValueDelete }
            }
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
                    {this.shouldShowComponent('name') &&
                    <div className="col-md-3">
                        <label> {T.translate("edit_rsvp_question.default_value")} </label>
                        <Input
                            id="default_value"
                            value={entity.default_value}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('default_value')}
                        />
                    </div>
                    }
                    {this.shouldShowComponent('name') &&
                    <div className="col-md-3">
                        <label> {T.translate("edit_rsvp_question.default_value")} </label>
                        <Dropdown
                            id="default_value"
                            value={entity.default_value}
                            placeholder={T.translate("edit_rsvp_question.placeholders.select_default")}
                            options={question_class_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    }
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input disabled type="checkbox" id="is_mandatory" checked={entity.is_mandatory}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_mandatory">
                                {T.translate("edit_rsvp_question.is_mandatory")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input disabled type="checkbox" id="read_only" checked={entity.read_only}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="read_only">
                                {T.translate("edit_rsvp_question.read_only")}
                            </label>
                        </div>
                    </div>
                </div>

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