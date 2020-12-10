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
import {
    Input,
    TextEditor,
    TagInput,
    Panel,
    SimpleLinkList,
    UploadInput
} from 'openstack-uicore-foundation/lib/components'
import {queryQuestions} from '../../actions/event-category-actions';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";


class EventCategoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showQuestions: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagLink = this.handleTagLink.bind(this);
        this.handleTagUnLink = this.handleTagUnLink.bind(this);
        this.handleEditQuestion = this.handleEditQuestion.bind(this);
        this.handleNewQuestion = this.handleNewQuestion.bind(this);
        this.handleUploadPic = this.handleUploadPic.bind(this);
        this.handleRemovePic = this.handleRemovePic.bind(this);
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

    toggleQuestions(ev) {
        ev.preventDefault();
        this.setState({showQuestions: !this.state.showQuestions});
    }

    handleEditQuestion(questionId) {
        const {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/${entity.id}/questions/${questionId}`);
    }

    handleNewQuestion(ev) {
        const {currentSummit, entity, history} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/event-categories/${entity.id}/questions/new`);
    }

    handleTagLink(value) {
        const tags = [...this.state.entity.tags];
        tags.push(value);

        let entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleTagUnLink(value) {
        const tags = this.state.entity.tags.filter(t => t.id !== value);
        const entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleRemovePic() {
        this.props.onRemoveImage(this.state.entity.id);
    }

    handleUploadPic(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onUploadImage(this.state.entity, formData);
    }

    render() {
        const {entity, showQuestions, errors} = this.state;
        const { currentSummit, onQuestionUnLink, onQuestionLink } = this.props;
        const { handleEditQuestion } = this;

        const questionColumns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'class_name', value: T.translate("edit_event_category_question.class") },
            { columnKey: 'name', value: T.translate("edit_event_category_question.name") },
            { columnKey: 'label', value: T.translate("edit_event_category_question.label") },
            { columnKey: 'is_mandatory', value: T.translate("edit_event_category_question.mandatory") }
        ];

        const questionOptions = {
            valueKey: "id",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                edit: {onClick: handleEditQuestion},
                delete: { onClick: onQuestionUnLink},
                search: queryQuestions,
                add: { onClick: onQuestionLink }
            }
        };

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('name', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('code', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.color")} *</label>
                        <Input
                            id="color"
                            type="color"
                            value={entity.color}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={hasErrors('description', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_sessions")}</label>
                        <Input
                            type="number"
                            id="session_count"
                            value={entity.session_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('session_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_alternates")}</label>
                        <Input
                            type="number"
                            id="alternate_count"
                            value={entity.alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('alternate_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning")}</label>
                        <Input
                            type="number"
                            id="lightning_count"
                            value={entity.lightning_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('lightning_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning_alternates")}</label>
                        <Input
                            type="number"
                            id="lightning_alternate_count"
                            value={entity.lightning_alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('lightning_alternate_count', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="voting_visible" checked={entity.voting_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="voting_visible">
                                {T.translate("edit_event_category.visible_voters")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="chair_visible" checked={entity.chair_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="chair_visible">
                                {T.translate("edit_event_category.visible_track_chairs")}
                            </label>
                        </div>
                    </div>
                </div>

                <hr />
                {entity.id !== 0 &&
                <Panel show={showQuestions} title={T.translate("edit_event_category.questions")}
                       handleClick={this.toggleQuestions.bind(this)}>
                    <button className="btn btn-primary pull-right left-space" onClick={this.handleNewQuestion}>
                        {T.translate("edit_event_category.add_question")}
                    </button>

                    <SimpleLinkList
                        values={entity.extra_questions}
                        columns={questionColumns}
                        options={questionOptions}
                    />
                </Panel>
                }

                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.tags")} </label>
                        <TagInput
                            id="allowed_tags"
                            value={entity.allowed_tags}
                            summitId={currentSummit.id}
                            onChange={this.handleChange}
                            error={hasErrors('allowed_tags', errors)}
                        />
                    </div>
                </div>

                {entity.id !== 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.pic")} </label>
                        <UploadInput
                            value={entity.icon_url}
                            handleUpload={this.handleUploadPic}
                            handleRemove={ev => this.handleRemovePic()}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
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

export default EventCategoryForm;
