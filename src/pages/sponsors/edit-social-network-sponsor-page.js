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
import SponsorSocialNetworkForm from '../../components/forms/sponsor-social-network-form';
import { getSponsorSocialNetwork, saveSponsorSocialNetwork, resetSponsorSocialNetworkForm } from "../../actions/sponsor-actions";

class EditSocialNetworkSponsorPage extends React.Component {

    constructor(props) {
        const socialNetworkId = props.match.params.social_network_id;
        super(props);

        if (!socialNetworkId) {
            props.resetSponsorSocialNetworkForm();
        } else {
            props.getSponsorSocialNetwork(socialNetworkId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.social_network_id;
        const newId = this.props.match.params.social_network_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSponsorSocialNetworkForm();
            } else {
                this.props.getSponsorSocialNetwork(newId);
            }
        }
    }

    render() {
        const { currentSummit, entity, errors, match } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return (
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_sponsor.social_network")}</h3>
                <hr />
                {currentSummit &&
                    <SponsorSocialNetworkForm
                        entity={entity}
                        errors={errors}
                        onSubmit={this.props.saveSponsorSocialNetwork}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorSocialNetworkState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentSponsorSocialNetworkState
});

export default connect(
    mapStateToProps,
    {
        resetSponsorSocialNetworkForm,
        getSponsorSocialNetwork,
        saveSponsorSocialNetwork,
    }
)(EditSocialNetworkSponsorPage);
