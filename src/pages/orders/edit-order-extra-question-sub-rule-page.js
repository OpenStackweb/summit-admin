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
import ExtraQuestionSubQuestionForm from '../../components/forms/extra-question-sub-question-form';
import {
    getOrderExtraQuestions,
    resetOrderExtraQuestionSubQuestionForm,
    getOrderExtraQuestionsSubQuestionsRule,
    saveOrderExtraQuestionsSubQuestionsRule,
    deleteOrderExtraQuestionsSubQuestionsRule
} from "../../actions/order-actions";
import Swal from "sweetalert2";

import '../../styles/edit-order-extra-questions-rule.less'

class EditOrderExtraQuestionSubRulesPage extends React.Component {

    constructor(props) {
        const subRuleId = props.match.params.sub_rule_id;
        const orderExtraQuestionId = props.currentExtraQuestion.id;
        super(props);

        if (!subRuleId) {
            props.resetOrderExtraQuestionSubQuestionForm();
        } else {
            if (props.extraQuestions.length === 0) props.getOrderExtraQuestions();
            props.getOrderExtraQuestionsSubQuestionsRule(orderExtraQuestionId, subRuleId);
        }

        this.handleRuleSave = this.handleRuleSave.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sub_rule_id;
        const newId = this.props.match.params.sub_rule_id;
        const orderExtraQuestionId = this.props.currentExtraQuestion.id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetOrderExtraQuestionSubQuestionForm();
            } else {
                this.props.getOrderExtraQuestionsSubQuestionsRule(orderExtraQuestionId, newId)
            }
        }
    }

    handleRuleSave(valueEntity) {
        this.props.saveOrderExtraQuestionsSubQuestionsRule(valueEntity);
    }

    render() {
        const { currentSummit, extraQuestions, currentExtraQuestion, entity, errors, match, allClasses } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.id : T.translate("general.new");

        return (
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_order_extra_question_sub_rule.order_extra_question_sub_rule")}</h3>
                <hr />
                {currentSummit &&
                    <ExtraQuestionSubQuestionForm
                        entity={entity}
                        currentExtraQuestion={currentExtraQuestion}
                        extraQuestions={extraQuestions}
                        onSubmit={this.handleRuleSave} />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOrderExtraQuestionListState, currentOrderExtraQuestionState, currentOrderExtraQuestionRuleState }) => ({
    currentSummit: currentSummitState.currentSummit,
    extraQuestions: currentOrderExtraQuestionListState.orderExtraQuestions,
    currentExtraQuestion: currentOrderExtraQuestionState.entity,
    ...currentOrderExtraQuestionRuleState
});

export default connect(
    mapStateToProps,
    {
        getOrderExtraQuestions,
        getOrderExtraQuestionsSubQuestionsRule,
        resetOrderExtraQuestionSubQuestionForm,
        saveOrderExtraQuestionsSubQuestionsRule,
        deleteOrderExtraQuestionsSubQuestionsRule,
    }
)(EditOrderExtraQuestionSubRulesPage);
