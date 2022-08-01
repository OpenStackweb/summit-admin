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
import BadgeTypeForm from '../../components/forms/badge-type-form';
import { getSummitById }  from '../../actions/summit-actions';
import {
    getAccessLevels,
    getBadgeFeatures,
    getBadgeType,
    getViewTypes,
    resetBadgeTypeForm,
    saveBadgeType,
    addAccessLevelToBadgeType,
    removeAccessLevelFromBadgeType,
    addFeatureToBadgeType,
    removeFeatureFromBadgeType,
    addViewTypeToBadgeType,
    removeViewTypeFromBadgeType,
} from "../../actions/badge-actions";

class EditBadgeTypePage extends React.Component {

    constructor(props) {
        const { currentSummit, match } = props;
        const badgeTypeId = match.params.badge_type_id;
        super(props);

        if (!badgeTypeId) {
            props.resetBadgeTypeForm();
        } else {
            props.getBadgeType(badgeTypeId);
        }

        if (!currentSummit.badge_features) props.getBadgeFeatures();
        if (!currentSummit.access_level_types) props.getAccessLevels();
        if (!currentSummit.view_types) props.getViewTypes();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.badge_type_id;
        const newId = this.props.match.params.badge_type_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetBadgeTypeForm();
            } else {
                this.props.getBadgeType(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, history} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_badge_type.badge_type")}</h3>
                <hr/>
                {currentSummit && currentSummit.badge_features && currentSummit.access_level_types &&
                <BadgeTypeForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onAccessLevelLink={this.props.addAccessLevelToBadgeType}
                    onAccessLevelUnLink={this.props.removeAccessLevelFromBadgeType}
                    onFeatureLink={this.props.addFeatureToBadgeType}
                    onFeatureUnLink={this.props.removeFeatureFromBadgeType}
                    onViewTypeLink={this.props.addViewTypeToBadgeType}
                    onViewTypeUnLink={this.props.removeViewTypeFromBadgeType}
                    onSubmit={this.props.saveBadgeType}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeTypeState, baseState }) => ({
    currentSummit : currentSummitState.currentSummit,
    loading: baseState.loading,
    ...currentBadgeTypeState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAccessLevels,
        getViewTypes,
        getBadgeFeatures,
        getBadgeType,
        resetBadgeTypeForm,
        saveBadgeType,
        addAccessLevelToBadgeType,
        removeAccessLevelFromBadgeType,
        addFeatureToBadgeType,
        removeFeatureFromBadgeType,
        addViewTypeToBadgeType,
        removeViewTypeFromBadgeType,
    }
)(EditBadgeTypePage);
