/**
 * Copyright 2017 OpenStack Foundation
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
import { connect } from "react-redux";
import { Switch, Route } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import NoMatchPage from "../pages/no-match-page";
import EditOrderExtraQuestionPage from '../pages/orders/edit-order-extra-question-page';
import EditOrderExtraQuestionSubRulesPage from '../pages/orders/edit-order-extra-question-sub-rule-page';

import { resetOrderExtraQuestionForm, getOrderExtraQuestion } from "../actions/order-actions";

class OrderExtraQuestionIdLayout extends React.Component {

    constructor(props) {
        const orderExtraQuestionId = props.match.params.order_extra_question_id;
        super(props);

        if (!orderExtraQuestionId) {
            props.resetOrderExtraQuestionForm();
        } else {
            props.getOrderExtraQuestion(orderExtraQuestionId);
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.order_extra_question_id;
        const newId = this.props.match.params.order_extra_question_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetOrderExtraQuestionForm();
            } else {
                this.props.getOrderExtraQuestion(newId);
            }
        }
    }

    render() {
        let { match, currentExtraQuestion } = this.props;
        const breadcrumb = (currentExtraQuestion.id) ? currentExtraQuestion.name : T.translate("general.new");        

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/sub-rule`} render={
                        props => (
                            <div>
                            <Switch>
                            <Route strict exact path={`${props.match.url}/new`} component={EditOrderExtraQuestionSubRulesPage} />
                            <Route strict exact path={`${props.match.url}/:sub_rule_id(\\d+)`} component={EditOrderExtraQuestionSubRulesPage} />
                            <Route component={NoMatchPage} />
                            </Switch>
                            </div>
                            )}
                        />
                    <Route strict exact path={match.url} component={EditOrderExtraQuestionPage} />
                    <Route component={NoMatchPage} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState, currentOrderExtraQuestionState }) => ({
    currentSummit: currentSummitState.currentSummit,
    currentExtraQuestion: currentOrderExtraQuestionState.entity,
});

export default Restrict(connect(
    mapStateToProps,
    {
        resetOrderExtraQuestionForm,
        getOrderExtraQuestion
    }
)(OrderExtraQuestionIdLayout));



