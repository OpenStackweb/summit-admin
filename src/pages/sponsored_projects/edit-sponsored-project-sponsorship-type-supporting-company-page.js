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
import SponsoredProjectSponsorshipTypeSupportingCompanyForm from "../../components/forms/sponsored-project-sponsorship-type-supporting-company-form";
import Swal from "sweetalert2";

import {
    saveSupportingCompany,
} from "../../actions/sponsored-project-actions";
import SponsoredProjectSponsorshipTypeForm from "../../components/forms/sponsored-project-sponsorship-type-form";

class EditSponsoredProjectSponsorshipTypeSupportingCompanyPage extends React.Component {

    constructor(props) {
        super(props);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    handleOnSubmit(entity){
        this.props.saveSupportingCompany
        (
            this.props.currentSponsoredProject.id,
            this.props.currentSponsorshipType.id,
            entity
        );
    }

    render(){
        const {entity, errors, history, currentSponsoredProject} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        return(
            <div className="container">
                <h3>{title} {T.translate("edit_sponsored_project_sponsorship_type_supporting_company.supporting_company")}</h3>
                <hr/>
                <SponsoredProjectSponsorshipTypeSupportingCompanyForm
                    history={history}
                    entity={entity}
                    project={currentSponsoredProject}
                    errors={errors}
                    onSubmit={this.handleOnSubmit}
                />
            </div>
        )
    }
}

const mapStateToProps = ({   sponsoredProjectState,
                             sponsoredProjectSponsorshipTypeState,
                             sponsoredProjectSponsorshipTypeSupportingCompanyState}) => ({
    currentSponsoredProject : sponsoredProjectState.entity,
    currentSponsorshipType: sponsoredProjectSponsorshipTypeState.entity,
    ...sponsoredProjectSponsorshipTypeSupportingCompanyState
});

export default connect (
    mapStateToProps,
    {
        saveSupportingCompany
    }
)(EditSponsoredProjectSponsorshipTypeSupportingCompanyPage);