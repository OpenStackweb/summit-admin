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
    resetBadgeTypeForm,
    saveBadgeType,
    addAccessLevelToBadgeType,
    removeAccessLevelFromBadgeType,
    addFeatureToBadgeType,
    removeFeatureFromBadgeType
} from "../../actions/badge-actions";

class EditBadgeTypePage extends React.Component {

    componentWillMount () {
        let { currentSummit } = this.props;
        let badgeTypeId = this.props.match.params.badge_type_id;

        if (!badgeTypeId) {
            this.props.resetBadgeTypeForm();
        } else {
            this.props.getBadgeType(badgeTypeId);
        }

        if (!currentSummit.badge_features) this.props.getBadgeFeatures();
        if (!currentSummit.access_level_types) this.props.getAccessLevels();
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.badge_type_id;
        let newId = newProps.match.params.badge_type_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetBadgeTypeForm();
            } else {
                this.props.getBadgeType(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match, history} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_badge_type.badge_type")}</h3>
                <hr/>
                {currentSummit &&
                <BadgeTypeForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onAccessLevelLink={this.props.addAccessLevelToBadgeType}
                    onAccessLevelUnLink={this.props.removeAccessLevelFromBadgeType}
                    onFeatureLink={this.props.addFeatureToBadgeType}
                    onFeatureUnLink={this.props.removeFeatureFromBadgeType}
                    onSubmit={this.props.saveBadgeType}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeTypeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentBadgeTypeState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAccessLevels,
        getBadgeFeatures,
        getBadgeType,
        resetBadgeTypeForm,
        saveBadgeType,
        addAccessLevelToBadgeType,
        removeAccessLevelFromBadgeType,
        addFeatureToBadgeType,
        removeFeatureFromBadgeType
    }
)(EditBadgeTypePage);
