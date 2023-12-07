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
import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import {TicketTypesInput, Input, TagInput} from 'openstack-uicore-foundation/lib/components';
import {hasErrors, isEmpty, scrollToError, shallowEqual} from "../../utils/methods";
import AcceptanceCriteriaDropdown from "../inputs/acceptance-criteria-dropdown";
import InvitationStatusDropdown from "../inputs/invitation-status-dropdown";

class RegistrationInvitationForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNewTag = this.handleNewTag.bind(this);
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

    handleNewTag(newTag) {
        this.setState({...this.state, entity: {...this.state.entity, tags: [...this.state.entity.tags, {tag: newTag}]}})
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
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

    render() {
        const {entity, errors} = this.state;
        const { currentSummit } = this.props;
        
        return (
            <form className="registration-invitation-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_registration_invitation.first_name")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_registration_invitation.first_name_info")}/>
                        <Input
                            id="first_name"
                            className="form-control"
                            onChange={this.handleChange}
                            value={entity.first_name}
                            error={hasErrors('first_name', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_registration_invitation.last_name")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_registration_invitation.last_name_info")}/>
                        <Input
                            id="last_name"
                            className="form-control"
                            error={hasErrors('last_name', errors)}
                            onChange={this.handleChange}
                            value={entity.last_name}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_registration_invitation.email")}</label>
                        &nbsp;<i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_registration_invitation.email_info")}/>
                        <Input
                          id="email"
                          className="form-control"
                          error={hasErrors('email', errors)}
                          onChange={this.handleChange}
                          value={entity.email}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_registration_invitation.acceptance_criteria")}</label>
                        <AcceptanceCriteriaDropdown
                            id="acceptance_criteria"
                            value={entity.acceptance_criteria}
                            onChange={this.handleChange}
                            error={hasErrors('acceptance_criteria', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_registration_invitation.status")}</label>
                        <InvitationStatusDropdown
                          id="status"
                          value={entity.status}
                          onChange={this.handleChange}
                          error={hasErrors('status', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_registration_invitation.allowed_ticket_types")}&nbsp;
                            <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_registration_invitation.allowed_ticket_types_info")} />
                        </label>
                        <TicketTypesInput
                            id="allowed_ticket_types"
                            value={entity.allowed_ticket_types}
                            summitId={currentSummit.id}
                            onChange={this.handleChange}
                            isMulti={true}
                            audience='WithInvitation'
                            version='v2'
                            error={hasErrors('allowed_ticket_types', errors)}
                            optionsLimit={10}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_registration_invitation.tags")}</label>
                        <TagInput
                            id="tags"
                            clearable
                            isMulti
                            allowCreate
                            value={entity.tags}
                            onChange={this.handleChange}
                            onCreate={this.handleNewTag}
                            placeholder={T.translate("edit_registration_invitation.placeholders.tags")}
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

export default RegistrationInvitationForm;