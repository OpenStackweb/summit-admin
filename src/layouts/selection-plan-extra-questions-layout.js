import React from "react";
import {connect} from "react-redux";
import {Breadcrumb} from "react-breadcrumbs";
import T from "i18n-react";
import {Redirect, Route, Switch} from "react-router-dom";
import NoMatchPage from "../pages/no-match-page";
import EditSelectionPlanExtraQuestionPage from "../pages/summits/edit-selection-plan-extra-question-page";

class SelectionPlanExtraQuestionsLayout extends React.Component {
    render(){
        const { match, currentSummit, currentSelectionPlan } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: 'Extra Questions', pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/:extra_question_id(\\d+)`} component={EditSelectionPlanExtraQuestionPage}/>
                    <Route exact strict path={`${match.url}/new`} component={EditSelectionPlanExtraQuestionPage}/>
                    <Redirect to={`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}`} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSelectionPlanState, currentSummitState }) => ({
    currentSelectionPlan   : currentSelectionPlanState.entity,
    ...currentSummitState
})
export default connect (mapStateToProps, {})(SelectionPlanExtraQuestionsLayout);