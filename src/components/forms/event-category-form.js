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
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import {
    Input,
    TextEditor,
    TagInput,
    Panel,
    Table,
    SimpleLinkList,
    UploadInput
} from 'openstack-uicore-foundation/lib/components'
import {queryQuestions} from '../../actions/event-category-actions';


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

    toggleQuestions(ev) {
        ev.preventDefault();
        this.setState({showQuestions: !this.state.showQuestions});
    }

    handleEditQuestion(questionId) {
        let {currentSummit, entity, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/${entity.id}/questions/${questionId}`);
    }

    handleNewQuestion(ev) {
        let {currentSummit, entity, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/event-categories/${entity.id}/questions/new`);
    }

    handleTagLink(value) {
        let tags = [...this.state.entity.tags];
        tags.push(value);

        let entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleTagUnLink(value) {
        let tags = this.state.entity.tags.filter(t => t.id != value);

        let entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleRemovePic(attr) {
        let entity = {...this.state.entity};
        entity[attr] = '';

        this.props.onRemoveImage(entity.id);

        this.setState({entity:entity});
    }

    handleUploadPic(file) {
        let entity = {...this.state.entity};

        entity.image = file.preview;
        this.setState({entity:entity});

        let formData = new FormData();
        formData.append('file', file);
        this.props.onUploadImage(this.state.entity, formData);
    }

    render() {
        let {entity, showQuestions} = this.state;
        let { currentSummit, onQuestionUnLink, onQuestionLink } = this.props;
        let { handleEditQuestion } = this;

        let questionColumns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'class_name', value: T.translate("edit_event_category_question.class") },
            { columnKey: 'name', value: T.translate("edit_event_category_question.name") },
            { columnKey: 'label', value: T.translate("edit_event_category_question.label") },
            { columnKey: 'is_mandatory', value: T.translate("edit_event_category_question.mandatory") }
        ];

        let questionOptions = {
            valueKey: "id",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                edit: {onClick: handleEditQuestion},
                delete: { onClick: onQuestionUnLink},
                search: queryQuestions,
                add: { onClick: onQuestionLink }
            }
        }

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
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('code')}
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
                            error={this.hasErrors('description')}
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
                            error={this.hasErrors('session_count')}
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
                            error={this.hasErrors('alternate_count')}
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
                            error={this.hasErrors('lightning_count')}
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
                            error={this.hasErrors('lightning_alternate_count')}
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
                {entity.id != 0 &&
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
                            error={this.hasErrors('allowed_tags')}
                        />
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.pic")} </label>
                        <UploadInput
                            value={entity.image}
                            handleUpload={this.handleUploadPic}
                            handleRemove={ev => this.handleRemovePic}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
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

export default EventCategoryForm;
