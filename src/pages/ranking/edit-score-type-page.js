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
import ScoreTypeForm from "../../components/forms/score-type-form";
import { getScoreType, resetScoreTypeForm, saveScoreType } from "../../actions/ranking-actions";

class EditScoreTypePage extends React.Component {
  constructor(props) {
    const scoreTypeId = props.match.params.score_type_id;

    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    if (!scoreTypeId) {
      props.resetScoreTypeForm();
    } else {
      props.getScoreType(this.props.ratingType.id, scoreTypeId);
    }
  }

  handleSubmit(entity) {
    const { saveScoreType, ratingType } = this.props;
    saveScoreType(entity, ratingType.id);
  }

  render() {
    const { currentSummit, entity, errors, match } = this.props;
    const title = entity.id ? T.translate("general.edit") : T.translate("general.add");
    const breadcrumb = entity.id ? entity.name : T.translate("general.new");

    return (
      <div className="container">
        <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
        <h3>
          {title} {T.translate("edit_score_type.score_type")}
        </h3>
        <hr />
        {currentSummit && <ScoreTypeForm entity={entity} errors={errors} onSubmit={this.handleSubmit} />}
      </div>
    );
  }
}

const mapStateToProps = ({ currentSummitState, ratingTypeState, scoreTypeState }) => ({
  currentSummit: currentSummitState.currentSummit,
  ratingType: ratingTypeState.entity,
  ...scoreTypeState,
});

export default connect(mapStateToProps, {
  getScoreType,
  resetScoreTypeForm,
  saveScoreType,
})(EditScoreTypePage);
