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
import SimpleForm from '../../components/forms/simple-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicketType, resetTicketTypeForm, saveTicketType } from "../../actions/ticket-actions";

class EditTicketTypePage extends React.Component {

    componentWillMount () {
        let {entity} = this.props;
        let ticketTypeId = this.props.match.params.rsvp_question_id;

        if (!ticketTypeId) {
            this.props.resetTicketTypeForm();
        } else if (ticketTypeId != entity.id){
            this.props.getTicketType(ticketTypeId);
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let fields = [
            {type: 'text', name: 'name', label: T.translate("edit_ticket_type.name")},
            {type: 'text', name: 'external_id', label: T.translate("edit_ticket_type.external_id")},
            {type: 'textarea', name: 'description', label: T.translate("edit_ticket_type.description")}
        ];
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_ticket_type.ticket_type")}</h3>
                <hr/>
                {currentSummit &&
                <SimpleForm
                    history={this.props.history}
                    entity={entity}
                    errors={errors}
                    fields={fields}
                    onSubmit={this.props.saveTicketType}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTicketTypeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentTicketTypeState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicketType,
        resetTicketTypeForm,
        saveTicketType
    }
)(EditTicketTypePage);