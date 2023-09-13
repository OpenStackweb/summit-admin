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
import CreatableSelect from 'react-select/lib/Creatable';

class SponsorSocialNetworkForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {
                ...props.entity,
            },
            errors: props.errors,
            iconsDDL: [
                { label: 'Facebook', value: 'fa-facebook' },
                { label: 'Twitter', value: 'fa-twitter' },
                { label: 'Youtube', value: 'fa-youtube' },
                { label: 'Linkedin', value: 'fa-linkedin' },
            ]
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleNewSocialNetwork = this.handleNewSocialNetwork.bind(this);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    componentDidMount() {
        const { entity } = this.props;
        const { iconsDDL } = this.state;

        const customIcon = !iconsDDL.some(e => e.value === entity.icon_css_class);

        if(customIcon) {
            this.setState(({...this.state, iconsDDL: [...iconsDDL, { label: entity.icon_css_class, value: entity.icon_css_class }]}));
        }
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

        if (ev.target.id === 'icon_css_class') {
            // we need to map into value/label because of a bug in react-select 2
            // https://github.com/JedWatson/react-select/issues/2998        
            value = { label: ev.target.label, value: ev.target.value };
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({ ...this.state, entity: entity, errors: errors });
    }

    handleNewSocialNetwork(ev) {
        const entity = { ...this.state.entity };

        const newOption = { label: ev, value: ev }
        entity['icon_css_class'] = newOption;
        this.setState({ ...this.state, entity, iconsDDL: [...this.state.iconsDDL, newOption] })
    }

    render() {
        const { entity, errors, iconsDDL } = this.state;

        const theValue = (entity.icon_css_class instanceof Object || entity.icon_css_class == null) ? entity.icon_css_class : iconsDDL.find(opt => opt.value == entity.icon_css_class);

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
                            <CreatableSelect isClearable id="icon_css_class" value={theValue}
                                onChange={(ev) => this.handleChange({ target: { ...ev, id: 'icon_css_class' } })} onCreateOption={this.handleNewSocialNetwork}
                                options={iconsDDL} />
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
