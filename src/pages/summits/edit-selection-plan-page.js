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
} from "../../actions/selection-plan-actions";
import Swal from "sweetalert2";

class EditSelectionPlanPage extends React.Component {

    constructor(props) {
        super(props);
        this.onAddNewExtraQuestion = this.onAddNewExtraQuestion.bind(this);
        this.onDeleteExtraQuestion = this.onDeleteExtraQuestion.bind(this);
        this.onEditExtraQuestion = this.onEditExtraQuestion.bind(this);
        this.onUpdateExtraQuestionOrder = this.onUpdateExtraQuestionOrder.bind(this);
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

    onUpdateExtraQuestionOrder(questions, questionId){
        const {entity} = this.props;
        this.props.updateSelectionPlanExtraQuestionOrder(entity.id, questions, questionId);
    }

    onEditExtraQuestion(questionId){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/extra-questions/${questionId}`);
    }

    onAddNewExtraQuestion(){
        const {currentSummit, history, entity} = this.props;
        history.push(`/app/summits/${currentSummit.id}/selection-plans/${entity.id}/extra-questions/new`);
    }

    render(){
        const {currentSummit, entity, errors, match, extraQuestionsOrder, extraQuestionsOrderDir} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_selection_plan.selection_plan")}</h3>
                <hr/>
                <SelectionPlanForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    extraQuestionsOrder={extraQuestionsOrder}
                    extraQuestionsOrderDir={extraQuestionsOrderDir}
                    onTrackGroupLink={this.props.addTrackGroupToSelectionPlan}
                    onTrackGroupUnLink={this.props.removeTrackGroupFromSelectionPlan}
                    onSubmit={this.props.saveSelectionPlan}
                    updateExtraQuestionOrder={this.onUpdateExtraQuestionOrder}
                    onAddNewExtraQuestion={this.onAddNewExtraQuestion}
                    onDeleteExtraQuestion={this.onDeleteExtraQuestion}
                    onEditExtraQuestion={this.onEditExtraQuestion}
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
        updateSelectionPlanExtraQuestionOrder,
        deleteSelectionPlanExtraQuestion
    }
)(EditSelectionPlanPage);
