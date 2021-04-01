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
import { Input, SortableTable } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


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

    handleEditQuestion(rsvpQuestionId,) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${entity.id}/questions/${rsvpQuestionId}`);
    }

    handleAddQuestion(ev) {
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${entity.id}/questions/new`);
    }

    render() {
        const {entity} = this.state;
        const { currentSummit, onQuestionDelete, onQuestionReorder } = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("edit_rsvp_template.name") },
            { columnKey: 'class_name', value: T.translate("edit_rsvp_template.class_name") }
        ];

        let table_options = {
            actions: {
                edit: { onClick: this.handleEditQuestion },
                delete: { onClick: onQuestionDelete }
            }
        };

        let sortedQuestions = [...entity.questions];
        sortedQuestions.sort(
            (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
        );

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
                            <input type="checkbox" id="is_enabled" checked={entity.is_enabled}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_enabled">
                                {T.translate("edit_rsvp_template.is_enabled")}
                            </label>
                        </div>
                    </div>
                </div>
                {entity.id !== 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <button className="btn btn-primary pull-right" onClick={this.handleAddQuestion}>
                            {T.translate("edit_rsvp_template.add_question")}
                        </button>
                        <SortableTable
                            options={table_options}
                            data={sortedQuestions}
                            columns={columns}
                            dropCallback={onQuestionReorder}
                            orderField="order"
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

export default RsvpTemplateForm;
