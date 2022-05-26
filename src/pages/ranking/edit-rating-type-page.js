/**
 * Copyright 2022 OpenStack Foundation
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

import React from "react";
import { connect } from "react-redux";
import { Breadcrumb } from "react-breadcrumbs";
import T from "i18n-react/dist/i18n-react";
import RatingTypeForm from "../../components/forms/rating-type-form";
import { getSummitById } from "../../actions/summit-actions";
import { getRatingType, resetRatingTypeForm, saveRatingType, deleteScoreType, updateScoreTypeOrder } from "../../actions/ranking-actions";
import Swal from "sweetalert2";

class EditRatingTypePage extends React.Component {
  constructor(props) {
    const ratingTypeId = props.match.params.rating_type_id;
    super(props);

    if (!ratingTypeId) {
      props.resetRatingTypeForm();
    } else {
      props.getRatingType(ratingTypeId);
    }

    this.handleAddScoreType = this.handleAddScoreType.bind(this);
    this.handleDeleteScoreType = this.handleDeleteScoreType.bind(this);
    this.handleEditScoreType = this.handleEditScoreType.bind(this);
    this.handleUpdateScoreTypeOrder = this.handleUpdateScoreTypeOrder.bind(this);
  }

  handleAddScoreType() {
    const { currentSummit, currentSelectionPlan, history, entity } = this.props;
    history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/rating-types/${entity.id}/score-types/new`);
  }

  handleEditScoreType(scoreTypeId){
    const { currentSummit, currentSelectionPlan, history, entity } = this.props;
    history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/rating-types/${entity.id}/score-types/${scoreTypeId}`);
  }

  handleDeleteScoreType(scoreTypeId) {
    const { entity, deleteScoreType } = this.props;
    let value = entity.score_types.find((v) => v.id === scoreTypeId);
    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: `${T.translate("edit_rating_type.remove_score_type_warning")} "${value.name}"`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete"),
    }).then(function (result) {
      if (result.value) {
        deleteScoreType(entity.id, scoreTypeId);
      }
    });
  }

  handleUpdateScoreTypeOrder(scoreTypes, scoreTypeId, newOrder){
    const {entity} = this.props;
    this.props.updateScoreTypeOrder(entity.id, scoreTypes, scoreTypeId, newOrder);
  }

  render() {
    const { currentSummit, entity, errors, match } = this.props;
    const title = entity.id ? T.translate("general.edit") : T.translate("general.add");
    const breadcrumb = entity.id ? entity.name : T.translate("general.new");

    return (
      <div className="container">
        <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
        <h3>
          {title} {T.translate("edit_rating_type.rating_type")}
        </h3>
        <hr />
        {currentSummit && (
          <RatingTypeForm
            entity={entity}
            errors={errors}
            onAddScoreType={this.handleAddScoreType}
            onDeleteScoreType={this.handleDeleteScoreType}
            onEditScoreType={this.handleEditScoreType}
            onUpdateScoreTypeOrder={this.handleUpdateScoreTypeOrder}
            onSubmit={this.props.saveRatingType}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ currentSummitState, currentSelectionPlanState, ratingTypeState }) => ({
  currentSummit: currentSummitState.currentSummit,
  currentSelectionPlan: currentSelectionPlanState.entity,
  ...ratingTypeState,
});

export default connect(mapStateToProps, {
  getSummitById,
  getRatingType,
  resetRatingTypeForm,
  saveRatingType,
  deleteScoreType,
  updateScoreTypeOrder
})(EditRatingTypePage);
