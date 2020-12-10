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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { RawHTML } from 'openstack-uicore-foundation/lib/components'
import Select from 'react-select'


class RsvpForm extends React.Component {
    constructor(props) {
        super(props);
    }

    renderQuestion(q) {
        switch(q.class_name) {
            case 'RSVPMemberEmailQuestionTemplate':
            case 'RSVPMemberFirstNameQuestionTemplate':
            case 'RSVPMemberLastNameQuestionTemplate':
            case 'RSVPTextBoxQuestionTemplate':
                return (<input className="form-control" />);
                break;
            case 'RSVPTextAreaQuestionTemplate':
                return (<textarea className="form-control" />);
                break;
            case 'RSVPLiteralContentQuestionTemplate':
                return (<div><RawHTML>{q.value}</RawHTML></div>);
                break;
            case 'RSVPCheckBoxListQuestionTemplate':
                return (
                    <div>
                        {q.values.map(v =>
                            <div className="checkboxes-div" key={'checkbox_'+v.id}>
                                <div className="form-check abc-checkbox">
                                    <input type="checkbox" className="form-check-input" id={'cb_'+v.id} />
                                    <label className="form-check-label" htmlFor={'cb_'+v.id}>
                                        {v.label}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>);
                break;
            case 'RSVPRadioButtonListQuestionTemplate':
                return (
                    <div>
                        {q.values.map(v =>
                            <div className="checkboxes-div" key={'radio_'+v.id}>
                                <div className="form-check abc-radio">
                                    <input type="radio" name={'radio_'+q.id} className="form-check-input" id={'rd_'+v.id} />
                                    <label className="form-check-label" htmlFor={'rd_'+v.id}>
                                        {v.label}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>);
                break;
            case 'RSVPDropDownQuestionTemplate':
                let values = (q.is_country_selector) ? q.values.map(v => ({value:v.id, label: v.value})) : q.values;

                if (q.is_multiselect) {
                    return (
                        <Select
                            placeholder={q.empty_string}
                            options={values}
                            isMulti
                        />
                    );
                } else {
                    return (
                        <Select
                            placeholder={q.empty_string}
                            options={values}
                        />
                    );
                }
                break;
        }
    }


    render() {
        let { questions } = this.props;


        return (
            <form className="rsvp-form">
                {questions.map(q =>
                    <div key={'question_'+q.id} className="row form-group">
                        <div className="col-md-12">
                            <label><RawHTML>{q.label}</RawHTML></label>
                            {this.renderQuestion(q)}
                        </div>
                    </div>
                )}
            </form>
        );
    }
}

export default RsvpForm;
