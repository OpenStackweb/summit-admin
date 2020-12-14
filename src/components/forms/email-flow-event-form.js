/**
 * Copyright 2020 OpenStack Foundation
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
import T from 'i18n-react/dist/i18n-react';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css';
import EmailTemplateInput from "../inputs/email-template-input";
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class EmailFlowEventForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

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

    render() {
        const {entity} = this.state;

        return (
            <form className="email-flow-event-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_email_flow_event.flow_name")} *</label><br />
                        {entity.flow_name}
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_email_flow_event.event_type")} *</label><br />
                        {entity.event_type_name}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_email_flow_event.email_template_identifier")} *</label>
                        <EmailTemplateInput
                            id="email_template_identifier"
                            value={entity.email_template_identifier}
                            placeholder={T.translate("edit_email_flow_event.placeholders.select_template")}
                            onChange={this.handleChange}
                            plainValue
                        />
                    </div>
                </div>

                <hr />

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

export default EmailFlowEventForm;
