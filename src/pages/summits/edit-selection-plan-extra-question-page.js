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
import ExtraQuestionForm from '../../components/forms/extra-question-form';

import {
    getExtraQuestionMeta,
    resetSelectionPlanExtraQuestionForm,
    getSelectionPlanExtraQuestion,
    saveSelectionPlanExtraQuestion,
    deleteSelectionPlanExtraQuestion,
    updateSelectionPlanExtraQuestionOrder,
    saveSelectionPlanExtraQuestionValue,
    deleteSelectionPlanExtraQuestionValue
} from "../../actions/selection-plan-actions";
import Swal from "sweetalert2";

class EditSelectionPlanExtraQuestionPage extends React.Component {

    constructor(props) {
        const questionId = props.match.params.extra_question_id;
        const selectionPlanId = props.currentSelectionPlan.id;
        super(props);

        if (!questionId) {
            props.resetSelectionPlanExtraQuestionForm();
        } else {
            props.getSelectionPlanExtraQuestion(selectionPlanId, questionId);
        }

        props.getExtraQuestionMeta();

        this.handleValueSave = this.handleValueSave.bind(this);
        this.handleValueDelete = this.handleValueDelete.bind(this);
        this.onSaveSelectionPlanExtraQuestion = this.onSaveSelectionPlanExtraQuestion.bind(this);
    }

    onSaveSelectionPlanExtraQuestion(entity){
        const selectionPlanId = this.props.currentSelectionPlan.id;
        this.props.saveSelectionPlanExtraQuestion(selectionPlanId, entity);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.extra_question_id;
        const newId = this.props.match.params.extra_question_id;
        const selectionPlanId = this.props.currentSelectionPlan.id;
        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSelectionPlanExtraQuestionForm();
            } else {
                this.props.getSelectionPlanExtraQuestion(selectionPlanId, newId);
            }
        }
    }

    handleValueDelete(valueId) {
        const {deleteSelectionPlanExtraQuestionValue
            ,entity, currentSelectionPlan} = this.props;

        let value = entity.values.find(v => v.id === valueId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_order_extra_question.remove_value_warning") + ' ' + value.value,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSelectionPlanExtraQuestionValue(currentSelectionPlan.id, entity.id, valueId);
            }
        });
    }

    handleValueSave(valueEntity) {
        const {entity, currentSelectionPlan} = this.props;
        this.props.saveSelectionPlanExtraQuestionValue(currentSelectionPlan.id, entity.id, valueEntity);
    }

    render(){
        const {currentSummit, entity, errors, match, allClasses} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_order_extra_question.order_extra_question")}</h3>
                <hr/>
                {currentSummit &&
                <ExtraQuestionForm
                    shouldShowUsage={false}
                    shouldShowPrintable={false}
                    questionClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onValueDelete={this.handleValueDelete}
                    onValueSave={this.handleValueSave}
                    onSubmit={this.onSaveSelectionPlanExtraQuestion}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSelectionPlanState, currentSummitState, currentSelectionPlanExtraQuestionState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentSelectionPlan : currentSelectionPlanState.entity,
    ...currentSelectionPlanExtraQuestionState
});

export default connect (
    mapStateToProps,
    {
        getSelectionPlanExtraQuestion,
        getExtraQuestionMeta,
        saveSelectionPlanExtraQuestion,
        deleteSelectionPlanExtraQuestion,
        updateSelectionPlanExtraQuestionOrder,
        saveSelectionPlanExtraQuestionValue,
        deleteSelectionPlanExtraQuestionValue,
        resetSelectionPlanExtraQuestionForm
    }
)(EditSelectionPlanExtraQuestionPage);
