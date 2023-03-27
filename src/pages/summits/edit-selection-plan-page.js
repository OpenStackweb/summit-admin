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
import T from "i18n-react/dist/i18n-react";
import SelectionPlanForm from '../../components/forms/selection-plan-form';
import {
    saveSelectionPlan,
    addTrackGroupToSelectionPlan,
    removeTrackGroupFromSelectionPlan,
    deleteSelectionPlanExtraQuestion,
    updateSelectionPlanExtraQuestionOrder,
    addEventTypeSelectionPlan,
    deleteEventTypeSelectionPlan,
    updateRatingTypeOrder,
    deleteRatingType,
    assignExtraQuestion2SelectionPlan,
    assignProgressFlag2SelectionPlan,
    updateProgressFlagOrder,
    unassignProgressFlagFromSelectionPlan,
    addAllowedMemberToSelectionPlan,
    removeAllowedMemberFromSelectionPlan,
    getAllowedMembers,
    importAllowedMembersCSV,
    saveSelectionPlanSettings
} from "../../actions/selection-plan-actions";
import Swal from "sweetalert2";

class EditSelectionPlanPage extends React.Component {

    constructor(props) {
        super(props);
        this.onAddNewExtraQuestion = this.onAddNewExtraQuestion.bind(this);
        this.onDeleteExtraQuestion = this.onDeleteExtraQuestion.bind(this);
        this.onEditExtraQuestion = this.onEditExtraQuestion.bind(this);
        this.onUpdateExtraQuestionOrder = this.onUpdateExtraQuestionOrder.bind(this);
        this.onAddRatingType = this.onAddRatingType.bind(this);
        this.onEditRatingType = this.onEditRatingType.bind(this);
        this.onDeleteRatingType = this.onDeleteRatingType.bind(this);
        this.onUpdateRatingTypeOrder = this.onUpdateRatingTypeOrder.bind(this);
        this.onAddProgressFlag = this.onAddProgressFlag.bind(this);
        this.onEditProgressFlag = this.onEditProgressFlag.bind(this);
        this.onUnassignProgressFlag = this.onUnassignProgressFlag.bind(this);
        this.onUpdateProgressFlagOrder = this.onUpdateProgressFlagOrder.bind(this);
    }

    onDeleteExtraQuestion(questionId){
        const {deleteSelectionPlanExtraQuestion, entity} = this.props;
        let extraQuestion = entity.extra_questions.find(t => t.id === questionId);
        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_selection_plan.extra_question_remove_warning") + ' ' + extraQuestion.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSelectionPlanExtraQuestion(entity.id, questionId);
            }
        });
    }

    onUpdateExtraQuestionOrder(questions, questionId, newOrder){
        const {entity} = this.props;
        this.props.updateSelectionPlanExtraQuestionOrder(entity.id, questions, questionId, newOrder);
    }

    onEditExtraQuestion(questionId){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/extra-questions/${questionId}`);
    }

    onAddNewExtraQuestion(){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/extra-questions/new`);
    }

    onAddRatingType(){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/rating-types/new`);
    }

    onEditRatingType(ratingTypeId){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/rating-types/${ratingTypeId}`);
    }

    onUpdateRatingTypeOrder(ratingTypes, ratingTypeId, newOrder){
        const {entity} = this.props;
        this.props.updateRatingTypeOrder(entity.id, ratingTypes, ratingTypeId, newOrder);
    }

    onDeleteRatingType(ratingTypeId){
        const {deleteRatingType, entity} = this.props;
        let ratingType = entity.track_chair_rating_types.find(t => t.id === ratingTypeId);
        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_selection_plan.rating_type_remove_warning") + ' ' + ratingType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRatingType(entity.id, ratingTypeId);
            }
        });
    }
    
    onAddProgressFlag(){
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/progress-flags`);
    }

    onEditProgressFlag(progressFlagId){
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/progress-flags#flag_id=${progressFlagId}`);
    }

    onUpdateProgressFlagOrder(progressFlags, progressFlagId, newOrder){
        const {entity} = this.props;
        this.props.updateProgressFlagOrder(entity.id, progressFlags, progressFlagId, newOrder);
    }

    onUnassignProgressFlag(progressFlagId){
        const {unassignProgressFlagFromSelectionPlan, entity} = this.props;
        let ratingType = entity.allowed_presentation_action_types.find(t => t.id === progressFlagId);
        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_selection_plan.presentation_action_type_remove_warning") + ' ' + ratingType.label,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                unassignProgressFlagFromSelectionPlan(entity.id, progressFlagId);
            }
        });
    }

    render(){
        const {currentSummit, entity, allowedMembers, errors, match, extraQuestionsOrder, extraQuestionsOrderDir} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_selection_plan.selection_plan")}</h3>
                <hr/>
                <SelectionPlanForm
                    entity={entity}
                    allowedMembers={allowedMembers}
                    currentSummit={currentSummit}
                    errors={errors}
                    extraQuestionsOrder={extraQuestionsOrder}
                    extraQuestionsOrderDir={extraQuestionsOrderDir}
                    onTrackGroupLink={this.props.addTrackGroupToSelectionPlan}
                    onTrackGroupUnLink={this.props.removeTrackGroupFromSelectionPlan}
                    onSubmit={this.props.saveSelectionPlan}
                    saveSelectionPlanSettings={this.props.saveSelectionPlanSettings}
                    updateExtraQuestionOrder={this.onUpdateExtraQuestionOrder}
                    onAddNewExtraQuestion={this.onAddNewExtraQuestion}
                    onDeleteExtraQuestion={this.onDeleteExtraQuestion}
                    onAddEventType={this.props.addEventTypeSelectionPlan}
                    onDeleteEventType={this.props.deleteEventTypeSelectionPlan}
                    onEditExtraQuestion={this.onEditExtraQuestion}
                    onAddRatingType={this.onAddRatingType}
                    onEditRatingType={this.onEditRatingType}
                    onUpdateRatingTypeOrder={this.onUpdateRatingTypeOrder}
                    onDeleteRatingType={this.onDeleteRatingType}
                    onAssignExtraQuestion2SelectionPlan={this.props.assignExtraQuestion2SelectionPlan}
                    onAddProgressFlag={this.onAddProgressFlag}
                    onEditProgressFlag={this.onEditProgressFlag}
                    onAssignProgressFlag2SelectionPlan={this.props.assignProgressFlag2SelectionPlan}
                    onUnassignProgressFlag={this.onUnassignProgressFlag}
                    onUpdateProgressFlagOrder={this.onUpdateProgressFlagOrder}
                    onAllowedMemberAdd={this.props.addAllowedMemberToSelectionPlan}
                    onAllowedMemberDelete={this.props.removeAllowedMemberFromSelectionPlan}
                    onAllowedMembersPageChange={this.props.getAllowedMembers}
                    onImportAllowedMembers={this.props.importAllowedMembersCSV}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSelectionPlanState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentSelectionPlanState
});

export default connect (
    mapStateToProps,
    {
        saveSelectionPlan,
        addTrackGroupToSelectionPlan,
        removeTrackGroupFromSelectionPlan,
        addEventTypeSelectionPlan,
        deleteEventTypeSelectionPlan,
        updateSelectionPlanExtraQuestionOrder,
        deleteSelectionPlanExtraQuestion,
        updateRatingTypeOrder,
        deleteRatingType,
        assignExtraQuestion2SelectionPlan,
        assignProgressFlag2SelectionPlan,
        updateProgressFlagOrder,
        unassignProgressFlagFromSelectionPlan,
        addAllowedMemberToSelectionPlan,
        removeAllowedMemberFromSelectionPlan,
        getAllowedMembers,
        importAllowedMembersCSV,
        saveSelectionPlanSettings
    }
)(EditSelectionPlanPage);
