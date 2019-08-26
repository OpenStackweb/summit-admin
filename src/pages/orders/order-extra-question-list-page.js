/**
 * Copyright 2019 OpenStack Foundation
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
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { SortableTable } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getOrderExtraQuestions, deleteOrderExtraQuestion, updateOrderExtraQuestionOrder } from "../../actions/order-actions";

class OrderExtraQuestionListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewOrderExtraQuestion = this.handleNewOrderExtraQuestion.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getOrderExtraQuestions();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getOrderExtraQuestions();
        }
    }

    handleEdit(order_extra_question_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/order-extra-questions/${order_extra_question_id}`);
    }

    handleDelete(orderExtraQuestionId) {
        let {deleteOrderExtraQuestion, orderExtraQuestions} = this.props;
        let orderExtraQuestion = orderExtraQuestions.find(t => t.id == orderExtraQuestionId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("order_extra_question_list.remove_warning") + ' ' + orderExtraQuestion.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteOrderExtraQuestion(orderExtraQuestionId);
            }
        });
    }

    handleNewOrderExtraQuestion(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/order-extra-questions/new`);
    }

    render(){
        let {currentSummit, orderExtraQuestions, order, orderDir, totalOrderExtraQuestions} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("order_extra_question_list.name"), sortable: true },
            { columnKey: 'rate', value: T.translate("order_extra_question_list.rate") },
            { columnKey: 'badge_id', value: T.translate("order_extra_question_list.badge_id") }
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div></div>);

        return(
            <div className="container">
                <h3> {T.translate("order_extra_question_list.order_extra_questions")} ({totalOrderExtraQuestions})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewOrderExtraQuestion}>
                            {T.translate("order_extra_question_list.add_question")}
                        </button>
                    </div>
                </div>

                {orderExtraQuestions.length == 0 &&
                <div>{T.translate("order_extra_question_list.no_order_extra_questions")}</div>
                }

                {orderExtraQuestions.length > 0 &&
                <SortableTable
                    options={table_options}
                    data={orderExtraQuestions}
                    columns={columns}
                    dropCallback={this.props.updateOrderExtraQuestionOrder}
                    orderField="order"
                />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOrderExtraQuestionListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentOrderExtraQuestionListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getOrderExtraQuestions,
        updateOrderExtraQuestionOrder,
        deleteOrderExtraQuestion
    }
)(OrderExtraQuestionListPage);
