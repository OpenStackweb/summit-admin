/**
 * Copyright 2019 OpenStack Foundation
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
import { Breadcrumb } from 'react-breadcrumbs';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicket, refundTicket, reassignTicket } from "../../actions/ticket-actions";
import TicketForm from "../../components/forms/ticket-form";
import BadgeForm from "../../components/forms/badge-form";
import {getBadgeFeatures, getBadgeTypes, deleteBadge, addFeatureToBadge, removeFeatureFromBadge} from "../../actions/badge-actions";
import Swal from "sweetalert2";

//import '../../styles/edit-ticket-page.less';

class EditTicketPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleDeleteBadge = this.handleDeleteBadge.bind(this);
        this.handleRefundTicket = this.handleRefundTicket.bind(this);
    }

    componentWillMount () {
        let {currentSummit} = this.props;
        let new_ticket_id = this.props.match.params.ticket_id;

        this.props.getTicket(new_ticket_id);

        if (!currentSummit.badge_features.length) this.props.getBadgeFeatures();
        if (!currentSummit.badge_types.length) this.props.getBadgeTypes()
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.ticket_id;
        let newId = newProps.match.params.ticket_id;

        if (oldId != newId) {
            this.props.getTicket(newId);
        }
    }

    handleRefundTicket(ticket) {
        let {refundTicket} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_ticket.refund_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                refundTicket(ticket.id);
            }
        });
    }

    handleDeleteBadge(badge) {
        let {deleteBadge} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_ticket.remove_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteBadge(badge.id);
            }
        });
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let breadcrumb = `...${entity.number.slice(-20)}`;

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>
                    {T.translate("edit_ticket.ticket")}
                    <button className="btn btn-sm btn-primary pull-right" onClick={this.handleRefundTicket.bind(entity)}>
                        {T.translate("edit_ticket.refund_ticket")}
                    </button>
                </h3>
                <hr/>

                <TicketForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    onReassing={this.props.reassignTicket}
                />

                <br/>
                <br/>
                <br/>

                <h3>
                    {T.translate("edit_ticket.badge")}
                    <button className="btn btn-sm btn-danger pull-right" onClick={this.handleDeleteBadge.bind(entity.badge)}>
                        {T.translate("edit_ticket.delete_badge")}
                    </button>
                </h3>

                <hr/>

                {entity.badge &&
                <BadgeForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity.badge}
                    onFeatureLink={this.props.addFeatureToBadge}
                    onFeatureUnLink={this.props.removeFeatureFromBadge}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentOrderState, currentTicketState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentTicketState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicket,
        refundTicket,
        reassignTicket,
        deleteBadge,
        getBadgeFeatures,
        getBadgeTypes,
        addFeatureToBadge,
        removeFeatureFromBadge
    }
)(EditTicketPage);
