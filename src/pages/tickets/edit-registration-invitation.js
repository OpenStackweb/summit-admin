/**
 * Copyright 2020 OpenStack Foundation
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
import { getSummitById }  from '../../actions/summit-actions';
import { getRegistrationInvitation ,
    resetRegistrationInvitationForm,
    saveRegistrationInvitation } from "../../actions/registration-invitation-actions";
import RegistrationInvitationForm from "../../components/forms/registration-invitation-form";
import {getSentEmailsByTemplatesAndEmail} from '../../actions/email-actions';
import { createTag } from '../../actions/tag-actions';
import RegistrationInvitationEmailActivity from "../../components/forms/registration-invitation-email-activity";

class EditRegistrationInvitationPage extends React.Component {

    componentDidMount () {
        const {getSentEmailsByTemplatesAndEmail} = this.props;
        let registrationInvitationId = this.props.match.params.registration_invitation_id;

        if (!registrationInvitationId) {
            this.props.resetRegistrationInvitationForm();
            return;
        }

        this.props.getRegistrationInvitation(registrationInvitationId).then((payload) => {
            getSentEmailsByTemplatesAndEmail(
                [
                    'SUMMIT_REGISTRATION_INVITE_REGISTRATION',
                    'SUMMIT_REGISTRATION_REINVITE_REGISTRATION'
                ],
                payload.email
            )
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.registration_invitation_id;
        const newId = this.props.match.params.registration_invitation_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetRegistrationInvitationForm();
            } else {
                this.props.getRegistrationInvitation(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, emailActivity} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.id : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_registration_invitation.registration_invitation")}</h3>
                <hr/>
                {currentSummit &&
                    <RegistrationInvitationForm
                        entity={entity}
                        errors={errors}
                        currentSummit={currentSummit}
                        onSubmit={this.props.saveRegistrationInvitation}
                        onCreateTag={this.props.createTag}
                    />
                }
                <RegistrationInvitationEmailActivity
                        emailActivity={emailActivity}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRegistrationInvitationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentRegistrationInvitationState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRegistrationInvitation,
        resetRegistrationInvitationForm,
        saveRegistrationInvitation,
        getSentEmailsByTemplatesAndEmail,
        createTag
    }
)(EditRegistrationInvitationPage);
