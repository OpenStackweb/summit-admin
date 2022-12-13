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

class SponsorSocialNetworkForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: { ...props.entity },
            errors: props.errors
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
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

    render() {
        const { entity, errors } = this.state;        

        return (
            <form className="material-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="sponsor-material-form form-group">
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_sponsor.link")} </label>
                            <Input className="form-control" id="link" value={entity.link} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("edit_sponsor.icon_css_class")} </label>
                            <Input className="form-control" id="icon_css_class" value={entity.icon_css_class} onChange={this.handleChange} />
                        </div>
                        <div className="col-md-4 checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="is_enabled" checked={entity.is_enabled}
                                    onChange={this.handleChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor="is_enabled">
                                    {T.translate("edit_sponsor.is_enabled")}
                                </label>
                            </div>
                        </div>
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

export default SponsorSocialNetworkForm;
