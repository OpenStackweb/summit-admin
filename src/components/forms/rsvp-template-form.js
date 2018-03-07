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
import Input from '../inputs/text-input'
import SortableTable from "../table-sortable/SortableTable"


class RsvpTemplateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleEditQuestion = this.handleEditQuestion.bind(this);
        this.handleAddQuestion = this.handleAddQuestion.bind(this);
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

    handleEditQuestion(rsvpQuestionId,) {
        let {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${entity.id}/questions/${rsvpQuestionId}`);
    }

    handleAddQuestion(ev) {
        let {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${entity.id}/questions/new`);
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("edit_rsvp_template.name") },
            { columnKey: 'class_name', value: T.translate("edit_rsvp_template.class_name") }
        ];

        let table_options = {
            className: "table table-striped table-bordered table-hover dataTable",
            actions: {
                edit: { onClick: this.handleEditQuestion },
                delete: { onClick: this.props.onQuestionDelete }
            }
        }

        return (
            <form className="rsvp-template-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_rsvp_template.title")} *</label>
                        <Input
                            id="title"
                            value={entity.title}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('title')}
                        />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input disabled type="checkbox" id="is_enabled" checked={entity.is_enabled}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_enabled">
                                {T.translate("edit_rsvp_template.is_enabled")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <button className="btn btn-primary pull-right" onClick={this.handleAddQuestion}>
                            {T.translate("edit_rsvp_template.add_question")}
                        </button>
                        <SortableTable
                            options={table_options}
                            data={entity.questions}
                            columns={columns}
                            dropCallback={this.props.onQuestionReorder}
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

export default RsvpTemplateForm;