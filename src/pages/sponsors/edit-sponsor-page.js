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
import SponsorForm from '../../components/forms/sponsor-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getSponsor, resetSponsorForm, saveSponsor, getSummitSponsorships, addMemberToSponsor, removeMemberFromSponsor, createCompany } from "../../actions/sponsor-actions";

class EditSponsorPage extends React.Component {

    constructor(props) {
        const sponsorId = props.match.params.sponsor_id;
        super(props);

        if (!sponsorId) {
            props.resetSponsorForm();
        } else {
            props.getSponsor(sponsorId);
        }

        props.getSummitSponsorships();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsor_id;
        const newId = this.props.match.params.sponsor_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSponsorForm();
            } else {
                this.props.getSponsor(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, sponsorships} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.company.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_sponsor.sponsor")}</h3>
                <hr/>
                {currentSummit &&
                <SponsorForm
                    entity={entity}
                    currentSummit={currentSummit}
                    sponsorships={sponsorships}
                    errors={errors}
                    onCreateCompany={this.props.createCompany}
                    onAddMember={this.props.addMemberToSponsor}
                    onRemoveMember={this.props.removeMemberFromSponsor}
                    onSubmit={this.props.saveSponsor}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorState, currentSponsorshipListState }) => ({
    currentSummit : currentSummitState.currentSummit,
    sponsorships  : currentSponsorshipListState.sponsorships,
    ...currentSponsorState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsor,
        resetSponsorForm,
        saveSponsor,
        addMemberToSponsor,
        removeMemberFromSponsor,
        getSummitSponsorships,
        createCompany
    }
)(EditSponsorPage);
