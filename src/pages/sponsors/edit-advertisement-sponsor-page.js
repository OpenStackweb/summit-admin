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
import SponsorAdvertisementForm from '../../components/forms/sponsor-advertisement-form';
import { 
    getSponsorAdvertisement,
    saveSponsorAdvertisement,
    resetSponsorAdvertisementForm,
    submitSponsorAdvertisementImage,
    removeSponsorAdvertisementImage } from "../../actions/sponsor-actions";

class EditAdvertisementSponsorPage extends React.Component {

    constructor(props) {
        const advertisementId = props.match.params.advertisement_id;
        super(props);

        if (!advertisementId) {
            props.resetSponsorAdvertisementForm();
        } else {
            props.getSponsorAdvertisement(advertisementId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.advertisement_id;
        const newId = this.props.match.params.advertisement_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSponsorAdvertisementForm();
            } else {
                this.props.getSponsorAdvertisement(newId);
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
                <h3>{title} {T.translate("edit_sponsor.advertisement")}</h3>
                <hr />
                {currentSummit &&
                    <SponsorAdvertisementForm
                        entity={entity}
                        currentSummit={currentSummit}
                        errors={errors}
                        onAttach={this.props.submitSponsorAdvertisementImage}
                        onRemove={this.props.removeSponsorAdvertisementImage}
                        onSubmit={this.props.saveSponsorAdvertisement}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorAdvertisementState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentSponsorAdvertisementState
});

export default connect(
    mapStateToProps,
    {
        resetSponsorAdvertisementForm,
        getSponsorAdvertisement,
        saveSponsorAdvertisement,
        submitSponsorAdvertisementImage,
        removeSponsorAdvertisementImage
    }
)(EditAdvertisementSponsorPage);
