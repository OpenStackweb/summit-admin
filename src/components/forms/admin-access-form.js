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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Input, MemberInput, SummitInput} from 'openstack-uicore-foundation/lib/components'
import {scrollToError, hasErrors, shallowEqual, isEmpty} from "../../utils/methods";

class AdminAccessForm extends React.Component {
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
        const {value, id} = ev.target;

        errors[id] = '';
        entity[id] = value;

        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        const {entity} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity);
    }

    render() {
        const {entity, errors} = this.state;

        return (
            <form className="admin-access-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("admin_access.title")} *</label>
                        <Input
                            id="title"
                            value={entity.title}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('title', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("admin_access.members")} *</label>
                        <MemberInput
                            id="members"
                            value={entity.members}
                            getOptionLabel={
                                (member) => {
                                    return member.hasOwnProperty("email") ?
                                        `${member.first_name} ${member.last_name} (${member.email})`:
                                        `${member.first_name} ${member.last_name} (${member.id})`;
                                }
                            }
                            onChange={this.handleChange}
                            multi={true}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("admin_access.summits")} *</label>
                        <SummitInput
                            id="summits"
                            value={entity.summits}
                            onChange={this.handleChange}
                            multi={true}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")} />
                    </div>
                </div>
            </form>
        );
    }
}

export default AdminAccessForm;

