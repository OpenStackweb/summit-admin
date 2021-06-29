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
import { getSummitById }  from '../../actions/summit-actions';
import BadgeFeatureTypeForm from '../../components/forms/badge-feature-type-form';

import { getBadgeFeature, resetBadgeFeatureForm,
    saveBadgeFeature, removeBadgeFeatureImage, uploadBadgeFeatureImage } from "../../actions/badge-actions";

class EditBadgeFeaturePage extends React.Component {

    constructor(props) {
        const badgeFeatureId = props.match.params.badge_feature_id;
        super(props);

        if (!badgeFeatureId) {
            props.resetBadgeFeatureForm();
        } else {
            props.getBadgeFeature(badgeFeatureId);
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.badge_feature_id;
        const newId = this.props.match.params.badge_feature_id;

        if (oldId !== newId) {
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
        const {currentSummit, entity, errors, match, history} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        const fields = [
            {type: 'text', name: 'name', label: T.translate("edit_badge_feature.name")},
            /*{type: 'text', name: 'tag_name', label: T.translate("edit_badge_feature.tag_name")},*/
            {type: 'textarea', name: 'description', label: T.translate("edit_badge_feature.description")},
            {type: 'textarea', name: 'template_content', label: T.translate("edit_badge_feature.template_content")},
        ];

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_badge_feature.badge_feature")}</h3>
                <hr/>
                {currentSummit &&
                <BadgeFeatureTypeForm
                    history={this.props.history}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveBadgeFeature}
                    onUploadImage={this.props.uploadBadgeFeatureImage}
                    onRemoveImage={this.props.removeBadgeFeatureImage}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeFeatureState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentBadgeFeatureState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getBadgeFeature,
        resetBadgeFeatureForm,
        saveBadgeFeature,
        removeBadgeFeatureImage,
        uploadBadgeFeatureImage
    }
)(EditBadgeFeaturePage);
