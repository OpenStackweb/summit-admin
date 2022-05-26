import React from "react";
import {connect} from "react-redux";
import {Breadcrumb} from "react-breadcrumbs";
import {Redirect, Route, Switch} from "react-router-dom";
import EditScoreTypePage from "../pages/ranking/edit-score-type-page";

class SelectionPlanRatingTypeIdLayout extends React.Component {
    render(){
        const { match, currentSummit, currentSelectionPlan } = this.props;
        let ratingTypeId = this.props.match.params.rating_type_id;

        return(
            <div>
                <Breadcrumb data={{ title: 'Score Types', pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/new`} component={EditScoreTypePage}/>
                    <Route path={`${match.url}/:score_type_id(\\d+)`} component={EditScoreTypePage}/>
                    <Redirect to={`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/rating-types/${ratingTypeId}`} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSelectionPlanState, currentSummitState }) => ({
    currentSelectionPlan: currentSelectionPlanState.entity,
    ...currentSummitState
})
export default connect (mapStateToProps, {})(SelectionPlanRatingTypeIdLayout);