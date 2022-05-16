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
import { getSummitById } from '../../actions/summit-actions';
import {
    getOrderExtraQuestionMeta,
    getOrderExtraQuestion,
    resetOrderExtraQuestionForm,
    saveOrderExtraQuestion,
    deleteOrderExtraQuestionValue,
    saveOrderExtraQuestionValue,
    deleteOrderExtraQuestionsSubQuestionsRule
} from "../../actions/order-actions";
import Swal from "sweetalert2";

class EditOrderExtraQuestionPage extends React.Component {

    constructor(props) {
        super(props);

        props.getOrderExtraQuestionMeta();

        this.handleValueSave = this.handleValueSave.bind(this);
        this.handleValueDelete = this.handleValueDelete.bind(this);
        this.handleRuleDelete = this.handleRuleDelete.bind(this);
    }

    handleValueDelete(valueId) {
        const { deleteOrderExtraQuestionValue, currentSummit, entity } = this.props;
        let value = entity.values.find(v => v.id === valueId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_order_extra_question.remove_value_warning") + ' ' + value.value,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function (result) {
            if (result.value) {
                deleteOrderExtraQuestionValue(entity.id, valueId);
            }
        });
    }

    handleRuleDelete(valueId) {
        const { deleteOrderExtraQuestionsSubQuestionsRule, entity } = this.props;
        let value = entity.sub_question_rules.find(v => v.id === valueId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_order_extra_question_sub_rule.remove_rule_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function (result) {
            if (result.value) {
                deleteOrderExtraQuestionsSubQuestionsRule(entity.id, valueId);
            }
        });
    }

    handleValueSave(valueEntity) {
        const { entity, currentSummit } = this.props;
        this.props.saveOrderExtraQuestionValue(entity.id, valueEntity);
    }

    render() {
        const { currentSummit, entity, errors, allClasses } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return (
            <div className="container">
                <h3>{title} {T.translate("edit_order_extra_question.order_extra_question")}</h3>
                <hr />
                {currentSummit &&
                    <ExtraQuestionForm
                        questionClasses={allClasses}
                        entity={entity}
                        errors={errors}
                        shouldShowUsage={true}
                        shouldShowPrintable={true}
                        summitExtraQuestions={currentSummit.order_extra_questions}
                        onValueDelete={this.handleValueDelete}
                        onValueSave={this.handleValueSave}
                        onRuleDelete={this.handleRuleDelete}
                        onSubmit={this.props.saveOrderExtraQuestion}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOrderExtraQuestionState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentOrderExtraQuestionState
});

export default connect(
    mapStateToProps,
    {
        getSummitById,
        getOrderExtraQuestion,
        getOrderExtraQuestionMeta,
        resetOrderExtraQuestionForm,
        deleteOrderExtraQuestionValue,
        saveOrderExtraQuestionValue,
        saveOrderExtraQuestion,
        deleteOrderExtraQuestionsSubQuestionsRule
    }
)(EditOrderExtraQuestionPage);
