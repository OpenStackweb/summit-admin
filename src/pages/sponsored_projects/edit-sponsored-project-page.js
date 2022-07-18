/**
 * Copyright 2017 OpenStack Foundation
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
import SponsoredProjectForm from '../../components/forms/sponsored-project-form';
import {
    saveSponsoredProject,
    deleteSponsorshipType,
    updateSponsorShipTypeOrder,
    attachLogo,
    removeLogo
} from "../../actions/sponsored-project-actions";
import '../../styles/edit-company-page.less';
import Swal from "sweetalert2";

class EditSponsoredProjectPage extends React.Component {

    constructor(props) {
        super(props);
        this.handleDeleteSponsorshipType = this.handleDeleteSponsorshipType.bind(this);
        this.handleReorderSponsorshipType = this.handleReorderSponsorshipType.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsored_project_id;
        const newId = this.props.match.params.sponsored_project_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetSponsoredProjectForm();
            } else {
                this.props.getSponsoredProject(newId);
            }
        }
    }

    handleDeleteSponsorshipType(id) {
        const {deleteSponsorshipType, entity} = this.props;
        let sponsorshipType = entity.sponsorship_types.find(q => q.id === id);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_sponsored_project.remove_sponsorship_type_warning") + ' ' + sponsorshipType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSponsorshipType(entity.id, id);
            }
        });
    }

    handleReorderSponsorshipType(sponsorshipTypes, id, newOrder) {
        const {updateSponsorShipTypeOrder, entity} = this.props;

        entity.sponsorship_types = [...sponsorshipTypes];

        this.setState({entity});
        updateSponsorShipTypeOrder(sponsorshipTypes, entity.id, id, newOrder);
    }

    render(){
        const {entity, errors, summits, history, saveSponsoredProject, attachLogo, removeLogo} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_sponsored_project.sponsored_project")}</h3>
                <hr/>
                <SponsoredProjectForm
                    summits={summits}
                    history={history}
                    entity={entity}
                    errors={errors}
                    onSponsorshipTypeReorder={this.handleReorderSponsorshipType}
                    onSponsorshipTypeDelete={this.handleDeleteSponsorshipType}
                    onSubmit={saveSponsoredProject}
                    onAttachLogo={attachLogo}
                    onRemoveLogo={removeLogo}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ sponsoredProjectState }) => ({
    ...sponsoredProjectState
});

export default connect (
    mapStateToProps,
    {
        saveSponsoredProject,
        deleteSponsorshipType,
        updateSponsorShipTypeOrder,
        attachLogo,
        removeLogo
    }
)(EditSponsoredProjectPage);
