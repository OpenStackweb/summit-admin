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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {
    findElementPos,
    epochToMomentTimeZone,
    queryTicketTypes,
} from 'openstack-uicore-foundation/lib/methods'
import { Input, DateTimePicker, SimpleLinkList } from 'openstack-uicore-foundation/lib/components';


class BadgeTypeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleAccessLevelLink = this.handleAccessLevelLink.bind(this);
        this.handleAccessLevelUnLink = this.handleAccessLevelUnLink.bind(this);
        this.queryAccessLevels = this.queryAccessLevels.bind(this);
        this.handleFeatureLink = this.handleFeatureLink.bind(this);
        this.handleFeatureUnLink = this.handleFeatureUnLink.bind(this);
        this.queryFeatures = this.queryFeatures.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
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

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    handleAccessLevelLink(accessLevel) {
        let {entity} = this.state;
        this.props.onAccessLevelLink(entity.id, accessLevel);
    }

    handleAccessLevelUnLink(accessLevelId) {
        let {entity} = this.state;
        this.props.onAccessLevelUnLink(entity.id, accessLevelId);
    }

    queryAccessLevels(input, callback) {
        let {currentSummit} = this.props;
        let accessLevels = [];

        accessLevels = currentSummit.access_level_types.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1)

        callback(accessLevels);
    }

    handleFeatureLink(feature) {
        let {entity} = this.state;
        this.props.onFeatureLink(entity.id, feature);
    }

    handleFeatureUnLink(featureId) {
        let {entity} = this.state;
        this.props.onFeatureUnLink(entity.id, featureId);
    }

    queryFeatures(input, callback) {
        let {currentSummit} = this.props;
        let features = [];

        features = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1)

        callback(features);
    }


    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let accessLevelColumns = [
            { columnKey: 'name', value: T.translate("edit_badge_type.name") },
        ];

        let accessLevelOptions = {
            title: T.translate("edit_badge_type.access_levels"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: this.queryAccessLevels,
                delete: { onClick: this.handleAccessLevelUnLink },
                add: { onClick: this.handleAccessLevelLink }
            }
        };

        let featuresColumns = [
            { columnKey: 'name', value: T.translate("edit_badge_type.name") },
        ];

        let featuresOptions = {
            title: T.translate("edit_badge_type.badge_features"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: this.queryFeatures,
                delete: { onClick: this.handleFeatureUnLink },
                add: { onClick: this.handleFeatureLink }
            }
        };

        return (
            <form className="badge-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_badge_type.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_default" checked={entity.is_default}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_default">
                                {T.translate("edit_badge_type.default")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("edit_badge_type.description")}</label>
                        <textarea
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>


                <hr />
                {entity.id != 0 &&
                <SimpleLinkList
                    values={entity.access_levels}
                    columns={accessLevelColumns}
                    options={accessLevelOptions}
                />
                }

                <hr />
                {entity.id != 0 &&
                <SimpleLinkList
                    values={entity.badge_features}
                    columns={featuresColumns}
                    options={featuresOptions}
                />
                }

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

export default BadgeTypeForm;
