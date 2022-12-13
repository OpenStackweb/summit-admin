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
import SummitSponsorshipForm from '../../components/forms/summit-sponsorship-form';
import { 
    getSummitSponsorship,
    resetSummitSponsorshipForm, 
    saveSummitSponsorship, 
    uploadSponsorshipBadgeImage, 
    removeSponsorshipBadgeImage
} from "../../actions/sponsor-actions";

class EditSummitSponsorshipPage extends React.Component {

    constructor(props) {
        const sponsorshipId = props.match.params.sponsorship_type_id;
        super(props);

        if (!sponsorshipId) {
            props.resetSummitSponsorshipForm();
        } else {
            props.getSummitSponsorship(sponsorshipId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsorship_type_id;
        const newId = this.props.match.params.sponsorship_type_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSummitSponsorshipForm();
            } else {
                this.props.getSummitSponsorship(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, sponsorships, uploadSponsorshipBadgeImage, removeSponsorshipBadgeImage} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.type.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_summit_sponsorship.sponsorship")}</h3>
                <hr/>
                {currentSummit &&
                <SummitSponsorshipForm
                    entity={entity}
                    sponsorships={sponsorships}
                    currentSummit={currentSummit}
                    errors={errors}
                    onBadgeImageAttach={uploadSponsorshipBadgeImage}
                    onBadgeImageRemove={removeSponsorshipBadgeImage}
                    onSubmit={this.props.saveSummitSponsorship}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSummitSponsorshipState, currentSponsorshipListState }) => ({
    currentSummit : currentSummitState.currentSummit,
    sponsorships : currentSponsorshipListState.sponsorships,
    ...currentSummitSponsorshipState
});

export default connect (
    mapStateToProps,
    {
        getSummitSponsorship,
        resetSummitSponsorshipForm,
        saveSummitSponsorship,
        uploadSponsorshipBadgeImage,
        removeSponsorshipBadgeImage
    }
)(EditSummitSponsorshipPage);
