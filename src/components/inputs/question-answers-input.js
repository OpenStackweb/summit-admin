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
import { Input, Dropdown, RadioList, CheckboxList } from 'openstack-uicore-foundation/lib/components'
import T from "i18n-react/dist/i18n-react";

export default class QuestionAnswersInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getInput = this.getInput.bind(this);
    }

    handleChange(ev) {
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'radio') {
            id = ev.target.name;
            value = (ev.target.value == 1);
        }

        let answers = this.props.answers.map(ans => {
            let newValue = ans.value;
            if (ans.question.id == id) newValue = value;

            return ({question_id: ans.question.id, answer: newValue})
        });

        let newEv = {
            target: {
                id: this.props.id,
                value: answers
            }
        };

        this.props.onChange(newEv);
    }

    getInput(answer) {
        let question = answer.question;
        let questionValues = question.values;

        switch(question.type) {
            case 'Text':
                return (
                    <div>
                        <label> {question.label} </label>
                        <Input
                            id={question.id}
                            value={answer.value}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                );
            case 'TextArea':
                return (
                    <div>
                        <label> {question.label} </label>
                        <textarea
                            id={question.id}
                            value={answer.value}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                );
            case 'CheckBox':
                return (
                    <div className="form-check abc-checkbox">
                        <input type="checkbox" id={question.id} checked={answer.value}
                               onChange={this.handleChange} className="form-check-input" />
                        <label className="form-check-label" htmlFor={question.id}>
                            {question.label}
                        </label>
                    </div>
                );
            case 'ComboBox':
                let value = questionValues.find(val => val.id == parseInt(answer.value));
                return (
                    <div>
                        <label> {question.label} </label>
                        <Dropdown
                            id={question.id}
                            value={value}
                            options={questionValues}
                            onChange={this.handleChange}
                        />
                    </div>
                );
            case 'CheckBoxList':
                return (
                    <div>
                        <label> {question.label} </label>
                        <CheckboxList
                            id={question.id}
                            value={answer.value}
                            options={questionValues}
                            onChange={this.handleChange}
                        />
                    </div>
                );
            case 'RadioButtonList':
                return (
                    <div>
                        <label> {question.label} </label>
                        <RadioList
                            id={question.id}
                            value={answer.value}
                            options={questionValues}
                            onChange={this.handleChange}
                        />
                    </div>
                );
        }

    }

    render() {

        let {onChange, answers } = this.props;

        return (
            <div>
                {answers.map( ans =>
                    <div className="row form-group" key={`question_answer_${ans.id}`}>
                        <div className="col-md-12">
                            {this.getInput(ans)}
                        </div>
                    </div>
                )}
            </div>
        );

    }
}
