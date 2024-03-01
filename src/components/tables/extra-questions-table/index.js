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

import React from 'react';
import T from 'i18n-react/dist/i18n-react';
import moment from 'moment-timezone';
import {Modal} from 'react-bootstrap';
import './styles.less';
import {SortableTable} from "openstack-uicore-foundation/lib/components";
import Swal from "sweetalert2";

const ExtraQuestionsTable = ({extraQuestions, onNew, onEdit, onDelete, onReorder}) => {


  const handleDelete = (questionId) => {
    const extraQuestion = extraQuestions.find(t => t.id === questionId);

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("generic_extra_question_list.remove_warning") + ' ' + extraQuestion.name,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function(result){
      if (result.value) {
        onDelete(questionId);
      }
    });
  }

  const columns = [
    { columnKey: 'type', value: T.translate("generic_extra_question_list.question_type")},
    { columnKey: 'label', value: T.translate("generic_extra_question_list.visible_question") },
    { columnKey: 'name', value: T.translate("generic_extra_question_list.question_id") }
  ];

  const table_options = {
    sortCol: 'order',
    sortDir: 'ASC',
    actions: {
      edit: { onClick: onEdit },
      delete: { onClick: handleDelete }
    }
  }

  return (
    <>
      <div className={'row'}>
        <div className="col-md-6 text-right col-md-offset-6">
          <button className="btn btn-primary right-space" onClick={onNew}>
            {T.translate("generic_extra_question_list.add_question")}
          </button>
        </div>
      </div>

      {extraQuestions.length === 0 &&
        <div>{T.translate("generic_extra_question_list.no_extra_questions")}</div>
      }

      {extraQuestions.length > 0 &&
        <SortableTable
          options={table_options}
          data={extraQuestions.sort((a,b) => a.order - b.order)}
          columns={columns}
          dropCallback={onReorder}
          orderField="order"
        />
      }
    </>
  );

}

export default ExtraQuestionsTable;

