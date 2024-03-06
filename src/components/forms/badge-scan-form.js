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
import { Input } from 'openstack-uicore-foundation/lib/components';
import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set'
import ExtraQuestionsForm from 'openstack-uicore-foundation/lib/components/extra-questions';

import '../../styles/edit-badge-page.less';

class BadgeScanForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors
        };

        this.formRef = React.createRef();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChangeExtraQuestion = this.handleChangeExtraQuestion.bind(this);
    }

    handleSubmit(ev) {
        ev.preventDefault();

        // check current ( could not be rendered)
        if (this.formRef.current) {
            this.formRef.current.doSubmit()
            return;
        }

        // do regular submit

        this.props.onSubmit(this.state.entity);
    }

    handleCancel(ev) {
        const {history, currentSummit} = this.props;
        history.push(`/app/summits/${currentSummit.id}/badge-scans`);
    }

    componentDidUpdate(prevState) {
        const oldEntity = prevState.entity;
        const newEntity = this.props.entity;

        if (newEntity.id !== oldEntity.id) {
            this.setState({ ...this.state, entity: newEntity });
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

    handleChangeExtraQuestion(formValues) {
        const qs = new QuestionsSet(this.state.entity?.sponsor_extra_questions || {});
        const formattedAnswers = [];

        Object.keys(formValues).map(name => {
            let question = qs.getQuestionByName(name);
            const newQuestion = { question_id: question.id, answer: `${formValues[name]}` }
            formattedAnswers.push(newQuestion);
        });

        this.setState({
            ...this.state,
            entity: { ...this.state.entity, extra_questions: formattedAnswers },
            }, () => this.props.onSubmit(this.state.entity)
        );
    }

    render() {
        const { entity, errors } = this.state;

        return (
            <form className="material-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="sponsor-material-form form-group">
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_badge_scan.attendee_name")} </label>
                            <Input className="form-control" id="attendee_name" value={entity.attendee_full_name} disabled />
                        </div>
                        <div className="col-md-6">
                            <label> {T.translate("edit_badge_scan.attendee_company")} </label>
                            <Input className="form-control" id="attendee_company" value={entity.attendee_company} disabled />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_badge_scan.notes")} </label>
                            <textarea
                                id="notes"
                                value={entity.notes}
                                onChange={this.handleChange}
                                rows={6}
                                maxLength={500}
                                className="form-control"
                            />
                        </div>
                    </div>
                    {entity?.sponsor_extra_questions?.length > 0 &&
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label> {T.translate("edit_badge_scan.extra_questions")} </label>
                                <ExtraQuestionsForm
                                    readOnly={false}
                                    extraQuestions={entity.sponsor_extra_questions.sort((a, b) => a.order - b.order)}
                                    userAnswers={entity.extra_questions}
                                    onAnswerChanges={this.handleChangeExtraQuestion}
                                    ref={this.formRef}
                                    className="extra-questions-wrapper"
                                />
                            </div>
                        </div>
                    }
                </div>

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                            className="btn btn-primary pull-right" value={T.translate("general.save")} />
                        <input type="button" onClick={this.handleCancel}
                            className="btn btn-default right-space pull-right" value={T.translate("general.cancel")} />
                    </div>
                </div>
            </form>
        );
    }
}

export default BadgeScanForm;
