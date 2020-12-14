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

import React from 'react'
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import RoomBookingAttributeForm from '../../components/forms/room-booking-attribute-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRoomBookingAttributeType, resetRoomBookingAttributeForm, saveRoomBookingAttributeType, saveRoomBookingAttribute, deleteRoomBookingAttribute } from "../../actions/room-booking-actions";

class EditRoomBookingAttributePage extends React.Component {

    constructor(props) {
        const attributeId = props.match.params.attribute_id;
        super(props);

        if (!attributeId) {
            props.resetRoomBookingAttributeForm();
        } else {
            props.getRoomBookingAttributeType(attributeId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.attribute_id;
        const newId = this.props.match.params.attribute_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetRoomBookingAttributeForm();
            } else {
                this.props.getRoomBookingAttributeType(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, match, errors} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        const breadcrumb = (entity.id) ? entity.type : `${T.translate("general.new")} ${T.translate("room_bookings.attribute")}`;

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("room_bookings.attribute_type")}</h3>
                <hr/>
                {currentSummit &&
                <RoomBookingAttributeForm
                    history={this.props.history}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveRoomBookingAttributeType}
                    onSaveAttribute={this.props.saveRoomBookingAttribute}
                    onDeleteAttribute={this.props.deleteRoomBookingAttribute}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomBookingAttributeTypeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentRoomBookingAttributeTypeState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRoomBookingAttributeType,
        resetRoomBookingAttributeForm,
        saveRoomBookingAttributeType,
        saveRoomBookingAttribute,
        deleteRoomBookingAttribute
    }
)(EditRoomBookingAttributePage);
