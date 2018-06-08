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
import SelectionPlanForm from '../../components/forms/selection-plan-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getSelectionPlan, resetSelectionPlanForm, saveSelectionPlan, addTrackGroupToSelectionPlan, removeTrackGroupFromSelectionPlan } from "../../actions/selection-plan-actions";

class EditSelectionPlanPage extends React.Component {

    componentWillMount () {
        let {entity} = this.props;
        let selectionPlanId = this.props.match.params.selection_plan_id;

        if (!selectionPlanId) {
            this.props.resetSelectionPlanForm();
        } else if (selectionPlanId != entity.id){
            this.props.getSelectionPlan(selectionPlanId);
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_selection_plan.selection_plan")}</h3>
                <hr/>
                <SelectionPlanForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onTrackGroupLink={this.props.addTrackGroupToSelectionPlan}
                    onTrackGroupUnLink={this.props.removeTrackGroupFromSelectionPlan}
                    onSubmit={this.props.saveSelectionPlan}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSelectionPlanState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentSelectionPlanState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSelectionPlan,
        resetSelectionPlanForm,
        saveSelectionPlan,
        addTrackGroupToSelectionPlan,
        removeTrackGroupFromSelectionPlan
    }
)(EditSelectionPlanPage);