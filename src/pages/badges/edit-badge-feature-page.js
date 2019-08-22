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
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import { SimpleForm } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getBadgeFeature, resetBadgeFeatureForm, saveBadgeFeature } from "../../actions/badge-actions";

class EditBadgeFeaturePage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount () {
        let badgeFeatureId = this.props.match.params.badge_feature_id;

        if (!badgeFeatureId) {
            this.props.resetBadgeFeatureForm();
        } else {
            this.props.getBadgeFeature(badgeFeatureId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.badge_feature_id;
        let newId = newProps.match.params.badge_feature_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetBadgeFeatureForm();
            } else {
                this.props.getBadgeFeature(newId);
            }
        }
    }

    handleSubmit(entity) {
        this.props.saveBadgeFeature(entity);
    }

    render(){
        let {currentSummit, entity, errors, match, history} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        let fields = [
            {type: 'text', name: 'name', label: T.translate("edit_badge_feature.name")},
            /*{type: 'text', name: 'tag_name', label: T.translate("edit_badge_feature.tag_name")},*/
            {type: 'textarea', name: 'description', label: T.translate("edit_badge_feature.description")},
            {type: 'textarea', name: 'template_content', label: T.translate("edit_badge_feature.template_content")},
        ];

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_badge_feature.badge_feature")}</h3>
                <hr/>
                {currentSummit &&
                <SimpleForm
                    entity={entity}
                    errors={errors}
                    fields={fields}
                    onSubmit={this.handleSubmit}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeFeatureState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentBadgeFeatureState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getBadgeFeature,
        resetBadgeFeatureForm,
        saveBadgeFeature,
    }
)(EditBadgeFeaturePage);
