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
import { getSummitById }  from '../../actions/summit-actions';
import { getOrderExtraQuestionMeta, getOrderExtraQuestion, resetOrderExtraQuestionForm, saveOrderExtraQuestion, deleteOrderExtraQuestionValue, saveOrderExtraQuestionValue } from "../../actions/order-actions";
import Swal from "sweetalert2";

class EditOrderExtraQuestionPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleValueSave = this.handleValueSave.bind(this);
        this.handleValueDelete = this.handleValueDelete.bind(this);
    }

    componentWillMount () {
        let orderExtraQuestionId = this.props.match.params.order_extra_question_id;

        if (!orderExtraQuestionId) {
            this.props.resetOrderExtraQuestionForm();
        } else {
            this.props.getOrderExtraQuestion(orderExtraQuestionId);
        }

        this.props.getOrderExtraQuestionMeta();
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.order_extra_question_id;
        let newId = newProps.match.params.order_extra_question_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetOrderExtraQuestionForm();
            } else {
                this.props.getOrderExtraQuestion(newId);
            }
        }
    }

    handleValueDelete(valueId) {
        let {deleteOrderExtraQuestionValue, currentSummit, entity} = this.props;
        let value = entity.values.find(v => v.id == valueId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_order_extra_question.remove_value_warning") + ' ' + value.value,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteOrderExtraQuestionValue(entity.id, valueId);
            }
        });
    }

    handleValueSave(valueEntity) {
        let {entity, currentSummit} = this.props;
        this.props.saveOrderExtraQuestionValue(entity.id, valueEntity);
    }

    render(){
        let {currentSummit, entity, errors, match, allClasses} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_order_extra_question.order_extra_question")}</h3>
                <hr/>
                {currentSummit &&
                <ExtraQuestionForm
                    questionClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onValueDelete={this.handleValueDelete}
                    onValueSave={this.handleValueSave}
                    onSubmit={this.props.saveOrderExtraQuestion}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOrderExtraQuestionState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentOrderExtraQuestionState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getOrderExtraQuestion,
        getOrderExtraQuestionMeta,
        resetOrderExtraQuestionForm,
        deleteOrderExtraQuestionValue,
        saveOrderExtraQuestionValue,
        saveOrderExtraQuestion,
    }
)(EditOrderExtraQuestionPage);
