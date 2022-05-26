import React from "react";
import {connect} from "react-redux";
import {Breadcrumb} from "react-breadcrumbs";
import {Redirect, Route, Switch} from "react-router-dom";
import EditRatingTypePage from "../pages/ranking/edit-rating-type-page";
import SelectionPlanRatingTypeIdLayout from "./selection-plan-rating-type-id-layout";

class SelectionPlanRatingTypesLayout extends React.Component {
    render(){
        const { match, currentSummit, currentSelectionPlan } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: 'Rating Types', pathname: match.url }} />
                <Switch>
                    <Route exact path={`${match.url}/:rating_type_id(\\d+)`} component={EditRatingTypePage}/>
                    <Route path={`${match.url}/:rating_type_id(\\d+)/score-types`} component={SelectionPlanRatingTypeIdLayout}/>
                    <Route exact strict path={`${match.url}/new`} component={EditRatingTypePage}/>
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
export default connect (mapStateToProps, {})(SelectionPlanRatingTypesLayout);