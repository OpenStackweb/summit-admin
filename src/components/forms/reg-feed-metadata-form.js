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
import { Input } from 'openstack-uicore-foundation/lib/components';
import { isEmpty, scrollToError, shallowEqual } from "../../utils/methods";

class RegFeedMetadataForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = { ...this.props.entity };
            state.errors = {};
        }

        if (!isEmpty(state)) {
            this.setState({ ...this.state, ...state })
        }
    }

    handleChange(ev) {

        let entity = { ...this.state.entity };
        let errors = { ...this.state.errors };
        let { value, id } = ev.target;

        errors[id] = '';
        entity[id] = value;

        this.setState({ entity: entity, errors: errors });
    }

    handleSubmit(ev) {
        let entity = { ...this.state.entity };
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    render() {
        const { entity, errors } = this.state;

        return (
            <form className="reg-feed-metadata-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_reg_feed_metadata.key")} *</label>
                        <Input
                            id="key"
                            className="form-control"
                            onChange={this.handleChange}
                            value={entity.key}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_reg_feed_metadata.value")} *</label>
                        <Input
                            id="value"
                            className="form-control"
                            onChange={this.handleChange}
                            value={entity.value}
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

export default RegFeedMetadataForm;
