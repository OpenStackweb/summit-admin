/**
 * Copyright 2019 OpenStack Foundation
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

import React from 'react';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, Dropdown, RadioList, CheckboxList, RawHTML } from 'openstack-uicore-foundation/lib/components'
import '../../styles/question-answers-input.less';

export default class QuestionAnswersInput extends React.Component {

    constructor(props) {
        super(props);

        let answers = props.questions.map(q => {
            let defaultValue = (q.type === 'CheckBox') ? 'false' : '';
            let answer = props.answers.find(ans => ans.question_id === q.id);
            let value = answer ? answer.answer : defaultValue;
            return ({question_id: q.id, answer: value});
        });

        this.state = {
            answers: answers,
        };

        this.handleChange = this.handleChange.bind(this);
        this.getInput = this.getInput.bind(this);
    }

    handleChange(ev) {
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked ? "true" : "false";
        }

        if (ev.target.type === 'checkboxlist') {
            value = ev.target.value.join(',');
        }

        let answers = this.state.answers.map(ans => {
            let newValue = ans.answer;
            if (ans.question_id == id) newValue = `${value}`;

            return ({question_id: ans.question_id, answer: newValue})
        });

        let newEv = {
            target: {
                id: this.props.id,
                value: answers
            }
        };

        this.setState({ answers });

        this.props.onChange(newEv);
    }

    getInput(question, answerValue) {
        let questionValues = question.values;
        let label = question.label;
        if(question.mandatory){
            label = `${label}<span>&nbsp;*</span>`;
        }
        switch(question.type) {
            case 'Text':
                return (
                    <div>
                        <label><RawHTML>{label}</RawHTML></label>
                        <Input
                            id={question.id}
                            value={answerValue}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                );
            case 'TextArea':
                return (
                    <div>
                        <label><RawHTML>{label}</RawHTML></label>
                        <textarea
                            id={question.id}
                            value={answerValue}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                );
            case 'CheckBox':
                return (
                    <div className="form-check abc-checkbox">
                        <input type="checkbox" id={question.id} checked={(answerValue === "true")}
                               onChange={this.handleChange} className="form-check-input" />
                        <label className="form-check-label" htmlFor={question.id}>
                            <RawHTML>{label}</RawHTML>
                        </label>
                    </div>
                );
            case 'ComboBox':
                let value = answerValue ? questionValues.find(val => val.id === parseInt(answerValue)) : null;
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                return (
                    <div>
                        <label><RawHTML>{label}</RawHTML></label>
                        <Dropdown
                            id={question.id}
                            value={value}
                            options={questionValues}
                            onChange={this.handleChange}
                        />
                    </div>
                );
            case 'CheckBoxList':
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                answerValue = answerValue ? answerValue.split(',').map(ansVal => parseInt(ansVal)) : [];
                return (
                    <div>
                        <label><RawHTML>{label}</RawHTML></label>
                        <CheckboxList
                            id={question.id}
                            value={answerValue}
                            options={questionValues}
                            onChange={this.handleChange}
                            html
                        />
                    </div>
                );
            case 'RadioButtonList':
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                return (
                    <div>
                        <label><RawHTML>{label}</RawHTML></label>
                        <RadioList
                            id={question.id}
                            value={answerValue}
                            options={questionValues}
                            onChange={this.handleChange}
                            inline
                            html
                        />
                    </div>
                );
        }

    }

    render() {
        let { answers } = this.state;
        let { questions } = this.props;
        return (
            <div className="extra-questions">
                {questions.map( q => {
                    let answer = answers.find(ans => ans.question_id === q.id);
                    let answerValue = answer ? answer.answer : null;
                    return (
                        <div className="row form-group" key={`question_answer_${q.id}`}>
                            <div className="col-md-12">
                                {this.getInput(q, answerValue)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );

    }
}
