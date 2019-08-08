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
import { getAccessLevel, resetAccessLevelForm, saveAccessLevel } from "../../actions/badge-actions";

class EditAccessLevelPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount () {
        let accessLevelId = this.props.match.params.access_level_id;

        if (!accessLevelId) {
            this.props.resetAccessLevelForm();
        } else {
            this.props.getAccessLevel(accessLevelId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.access_level_id;
        let newId = newProps.match.params.access_level_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetAccessLevelForm();
            } else {
                this.props.getAccessLevel(newId);
            }
        }
    }

    handleSubmit(entity) {
        let {currentTemplate, currentQuestion} = this.props;
        //this.props.saveRsvpQuestionValue(currentTemplate.id, currentQuestion.id, entity);
    }

    render(){
        let {currentSummit, entity, errors, match, history} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        let fields = [
            {type: 'text', name: 'name', label: T.translate("edit_access_level.name")},
            {type: 'text', name: 'tag_name', label: T.translate("edit_access_level.tag_name")},
            {type: 'textarea', name: 'template_content', label: T.translate("edit_access_level.template_content")},
            {type: 'checkbox', name: 'is_default', label: T.translate("edit_access_level.default")}
        ];

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_access_level.access_level")}</h3>
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

const mapStateToProps = ({ currentSummitState, currentAccessLevelState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentAccessLevelState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAccessLevel,
        resetAccessLevelForm,
        saveAccessLevel,
    }
)(EditAccessLevelPage);
