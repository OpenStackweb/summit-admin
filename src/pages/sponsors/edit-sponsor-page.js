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
import { getSponsor, resetSponsorForm, saveSponsor, getSponsorships } from "../../actions/sponsor-actions";

class EditSponsorPage extends React.Component {

    componentWillMount () {
        let sponsorId = this.props.match.params.sponsor_id;

        if (!sponsorId) {
            this.props.resetSponsorForm();
        } else {
            this.props.getSponsor(sponsorId);
        }

        this.props.getSponsorships();
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.sponsor_id;
        let newId = newProps.match.params.sponsor_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetSponsorForm();
            } else {
                this.props.getSponsor(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match, sponsorships} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_sponsor.sponsor")}</h3>
                <hr/>
                {currentSummit &&
                <SponsorForm
                    entity={entity}
                    currentSummit={currentSummit}
                    sponsorships={sponsorships}
                    errors={errors}
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
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsor,
        resetSponsorForm,
        saveSponsor,
        getSponsorships
    }
)(EditSponsorPage);
