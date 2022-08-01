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
import T from 'i18n-react/dist/i18n-react';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css';
import { Input, SimpleLinkList } from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";

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
        this.handleViewTypeLink = this.handleViewTypeLink.bind(this);
        this.handleViewTypeUnLink = this.handleViewTypeUnLink.bind(this);
        this.queryViewTypes = this.queryViewTypes.bind(this);
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

    handleAccessLevelLink(accessLevel) {
        const {entity} = this.state;
        this.props.onAccessLevelLink(entity.id, accessLevel);
    }

    handleAccessLevelUnLink(accessLevelId) {
        const {entity} = this.state;
        this.props.onAccessLevelUnLink(entity.id, accessLevelId);
    }

    queryAccessLevels(input, callback) {
        const {currentSummit} = this.props;
        const accessLevels = currentSummit.access_level_types.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1);
        callback(accessLevels);
    }

    handleFeatureLink(feature) {
        const {entity} = this.state;
        this.props.onFeatureLink(entity.id, feature);
    }

    handleFeatureUnLink(featureId) {
        const {entity} = this.state;
        this.props.onFeatureUnLink(entity.id, featureId);
    }

    queryFeatures(input, callback) {
        const {currentSummit} = this.props;
        const features = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1);
        callback(features);
    }

    handleViewTypeLink(viewType) {
        const {entity} = this.state;
        this.props.onViewTypeLink(entity.id, viewType);
    }

    handleViewTypeUnLink(viewType) {
        const {entity} = this.state;        
        this.props.onViewTypeUnLink(entity.id, viewType);
    }

    queryViewTypes(input, callback) {
        const {currentSummit} = this.props;
        const ViewTypes = currentSummit.badge_view_types.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1);
        callback(ViewTypes);
    }


    render() {
        const {entity, errors} = this.state;
        const accessLevelColumns = [
            { columnKey: 'name', value: T.translate("edit_badge_type.name") },
        ];

        const accessLevelOptions = {
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

        const featuresColumns = [
            { columnKey: 'name', value: T.translate("edit_badge_type.name") },
        ];

        const featuresOptions = {
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

        const viewTypesColumns = [
            { columnKey: 'name', value: T.translate("edit_badge_type.name") },
        ];

        const viewTypesOptions = {
            title: T.translate("edit_badge_type.view_types"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: this.queryViewTypes,
                delete: { onClick: this.handleViewTypeUnLink },
                add: { onClick: this.handleViewTypeLink }
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
                            error={hasErrors('name', errors)}
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
                {entity.id !== 0 &&
                <SimpleLinkList
                    values={entity.access_levels}
                    columns={accessLevelColumns}
                    options={accessLevelOptions}
                />
                }

                <hr />
                {entity.id !== 0 &&
                <SimpleLinkList
                    values={entity.badge_features}
                    columns={featuresColumns}
                    options={featuresOptions}
                />
                }

                <hr />
                {entity.id !== 0 &&
                <SimpleLinkList
                    values={entity.allowed_view_types}
                    columns={viewTypesColumns}
                    options={viewTypesOptions}
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
