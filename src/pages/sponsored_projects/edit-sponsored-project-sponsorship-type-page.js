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
import T from "i18n-react";
import SponsoredProjectSponsorshipTypeForm from "../../components/forms/sponsored-project-sponsorship-type-form";
import Swal from "sweetalert2";

import {
    saveSponsorshipType,
    updateSupportingCompanyOrder,
    deleteSupportingCompany
} from "../../actions/sponsored-project-actions";

class EditSponsoredProjectSponsorshipTypePage extends React.Component {

    constructor(props) {
        super(props);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.handleReorderSupportingCompany = this.handleReorderSupportingCompany.bind(this);
        this.handleDeleteSupportingCompany = this.handleDeleteSupportingCompany.bind(this);
    }

    handleDeleteSupportingCompany(id) {
        const {deleteSupportingCompany, entity, currentSponsoredProject} = this.props;
        let supportingCompany = entity.supporting_companies.find(q => q.id === id);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_sponsored_project_sponsorship_type.remove_supporting_company_warning") + ' ' + supportingCompany.company_name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSupportingCompany(currentSponsoredProject.id, entity.id, id);
            }
        });
    }

    handleReorderSupportingCompany(supportingCompanies, id, newOrder) {
        const {updateSupportingCompanyOrder, entity, currentSponsoredProject} = this.props;
        entity.supportingCompanies = [...supportingCompanies];
        this.setState({entity});
        updateSupportingCompanyOrder(supportingCompanies, currentSponsoredProject.id, entity.id, id, newOrder);
    }

    handleOnSubmit(entity){
        this.props.saveSponsorshipType(this.props.currentSponsoredProject.id, entity);
    }

    render(){
        const {entity, errors, history, currentSponsoredProject} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        return(
            <div className="container">
                <h3>{title} {T.translate("edit_sponsored_project_sponsorship_type.sponsorship_type")}</h3>
                <hr/>
                <SponsoredProjectSponsorshipTypeForm
                    history={history}
                    entity={entity}
                    project={currentSponsoredProject}
                    errors={errors}
                    onSupportingCompanyReorder={this.handleReorderSupportingCompany}
                    onSupportingCompanyDelete={this.handleDeleteSupportingCompany}
                    onSubmit={this.handleOnSubmit}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ sponsoredProjectState, sponsoredProjectSponsorshipTypeState }) => ({
    currentSponsoredProject : sponsoredProjectState.entity,
    ...sponsoredProjectSponsorshipTypeState
});

export default connect (
    mapStateToProps,
    {
        saveSponsorshipType,
        updateSupportingCompanyOrder,
        deleteSupportingCompany
    }
)(EditSponsoredProjectSponsorshipTypePage);