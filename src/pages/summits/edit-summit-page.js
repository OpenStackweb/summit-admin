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
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import swal from "sweetalert2";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../../routes/restrict'
import SummitForm from '../../components/forms/summit-form';
import { getSummitById, resetSummitForm, saveSummit }  from '../../actions/summit-actions';
import { deleteSelectionPlan } from '../../actions/selection-plan-actions';
import { deleteRoomBookingAttributeType } from "../../actions/room-booking-actions";
import '../../styles/edit-summit-page.less';
import '../../components/form-validation/validate.less';


class EditSummitPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSPlanDelete = this.handleSPlanDelete.bind(this);
        this.handleAttributeTypeDelete = this.handleAttributeTypeDelete.bind(this);

    }

    handleSPlanDelete(selectionPlanId) {
        let {currentSummit, deleteSelectionPlan} = this.props;
        let selectionPlan = currentSummit.selection_plans.find(sp => sp.id == selectionPlanId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_summit.remove_sp_warning") + ' ' + selectionPlan.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSelectionPlan(selectionPlanId);
            }
        }).catch(swal.noop);
    }

    handleAttributeTypeDelete(attributeTypeId) {
        let {deleteRoomBookingAttributeType, currentSummit} = this.props;
        let roomBookingType = currentSummit.meeting_booking_room_allowed_attributes.find(rb => rb.id == attributeTypeId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("room_bookings.delete_booking_attribute_warning") + ' ' + roomBookingType.type,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRoomBookingAttributeType(attributeTypeId);
            }
        }).catch(swal.noop);
    }


    render(){
        let {currentSummit, errors, history} = this.props;

        return(
            <div className="container">
                <h3>{T.translate("general.summit")}</h3>
                <hr/>
                <SummitForm
                    history={history}
                    entity={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveSummit}
                    onSPlanDelete={this.handleSPlanDelete}
                    onAttributeTypeDelete={this.handleAttributeTypeDelete}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit: currentSummitState.currentSummit,
    errors: currentSummitState.errors
})

export default Restrict(connect (
    mapStateToProps,
    {
        getSummitById,
        saveSummit,
        resetSummitForm,
        deleteSelectionPlan,
        deleteRoomBookingAttributeType
    }
)(EditSummitPage), 'summit-edit');
