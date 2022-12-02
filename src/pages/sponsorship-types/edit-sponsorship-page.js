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
import SponsorshipForm from '../../components/forms/sponsorship-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getSponsorship, resetSponsorshipForm, saveSponsorship } from "../../actions/sponsorship-actions";

class EditSponsorshipPage extends React.Component {

    constructor(props) {
        const sponsorshipId = props.match.params.sponsorship_id;
        super(props);

        if (!sponsorshipId) {
            props.resetSponsorshipForm();
        } else {
            props.getSponsorship(sponsorshipId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsorship_id;
        const newId = this.props.match.params.sponsorship_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSponsorshipForm();
            } else {
                this.props.getSponsorship(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, history} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_sponsorship.sponsorship")}</h3>
                <hr/>
                {currentSummit &&
                <SponsorshipForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveSponsorship}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorshipState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentSponsorshipState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsorship,
        resetSponsorshipForm,
        saveSponsorship,
    }
)(EditSponsorshipPage);
