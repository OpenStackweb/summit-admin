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
import TicketTypeForm from '../../components/forms/ticket-type-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicketType, resetTicketTypeForm, saveTicketType } from "../../actions/ticket-actions";
import { getBadgeTypes } from '../../actions/badge-actions'

class EditTicketTypePage extends React.Component {

    constructor(props) {
        const {currentSummit, match} = props;
        const ticketTypeId = match.params.ticket_type_id;
        super(props);

        if(currentSummit !== null) {
            props.getBadgeTypes();
        }

        if (!ticketTypeId) {
            props.resetTicketTypeForm();
        } else {
            props.getTicketType(ticketTypeId);
        }
    }

    componentWillReceiveProps(newProps) {
        const {currentSummit} = newProps;
        const oldId = this.props.match.params.ticket_type_id;
        const newId = newProps.match.params.ticket_type_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetTicketTypeForm();
            } else {
                this.props.getTicketType(newId);
            }
        }

        if (currentSummit && !currentSummit.badge_types) {
            this.props.getBadgeTypes();
        }
    }

    render(){
        const {currentSummit, entity, errors, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_ticket_type.ticket_type")}</h3>
                <hr/>
                {currentSummit &&
                <TicketTypeForm
                    entity={entity}
                    errors={errors}
                    currentSummit={currentSummit}
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
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicketType,
        resetTicketTypeForm,
        saveTicketType,
        getBadgeTypes
    }
)(EditTicketTypePage);
