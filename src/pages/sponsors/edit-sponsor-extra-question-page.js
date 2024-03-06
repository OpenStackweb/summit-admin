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

import React, {useEffect} from 'react'
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import { getSponsorExtraQuestion, saveSponsorExtraQuestion, resetSponsorExtraQuestionForm, getExtraQuestionMeta, deleteSponsorExtraQuestionValue, saveSponsorExtraQuestionValue, updateSponsorExtraQuestionValueOrder } from "../../actions/sponsor-actions";
import ExtraQuestionForm from "../../components/forms/extra-question-form";
import Swal from "sweetalert2";

const EditSponsorExtraQuestionPage = ({ currentSummit, entity, errors, match, allClasses, ...props }) => {
    const extraQuestionId = match.params.extra_question_id;
    const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
    const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

    useEffect(() => {
      props.getExtraQuestionMeta();
    }, []);

    useEffect(() => {
      if (!extraQuestionId) {
        props.resetSponsorExtraQuestionForm();
      } else {
        props.getSponsorExtraQuestion(extraQuestionId);
      }
    }, [extraQuestionId]);


  const handleValueDelete = (valueId) => {
    const value = entity.values.find(v => v.id === valueId);

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("edit_sponsor.remove_value_warning") + ' ' + value.value,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function(result){
      if (result.value) {
        props.deleteSponsorExtraQuestionValue(entity.id, valueId);
      }
    });
  }

  const handleValueSave = (valueEntity) => {
    props.saveSponsorExtraQuestionValue(entity.id, valueEntity);
  }

  return (
    <div className="container">
      <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
      <h3>{title} {T.translate("edit_sponsor.extra_question")}</h3>
      <hr />
      {currentSummit &&
        <ExtraQuestionForm
          shouldAllowSubRules={false}
          shouldShowUsage={false}
          shouldShowPrintable={false}
          shouldShowEditable={false}
          questionClasses={allClasses}
          entity={entity}
          errors={errors}
          onValueDelete={handleValueDelete}
          onValueSave={handleValueSave}
          onSubmit={props.saveSponsorExtraQuestion}
          updateQuestionValueOrder={props.updateSponsorExtraQuestionValueOrder}
        />
      }
    </div>
  )
}

const mapStateToProps = ({ currentSummitState, currentSponsorExtraQuestionState }) => ({
  currentSummit: currentSummitState.currentSummit,
  ...currentSponsorExtraQuestionState
});

export default connect(
  mapStateToProps,
  {
    getExtraQuestionMeta,
    resetSponsorExtraQuestionForm,
    getSponsorExtraQuestion,
    saveSponsorExtraQuestion,
    deleteSponsorExtraQuestionValue,
    saveSponsorExtraQuestionValue,
    updateSponsorExtraQuestionValueOrder
  }
)(EditSponsorExtraQuestionPage);
