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
import { Breadcrumb } from 'react-breadcrumbs';
import CompanyForm from '../../components/forms/company-form';
import { getCompany, resetCompanyForm, saveCompany, attachLogo } from "../../actions/company-actions";
import {getSponsoredProjects, saveSupportingCompany, deleteSupportingCompany } from "../../actions/sponsored-project-actions";
import '../../styles/edit-company-page.less';
import Swal from "sweetalert2";

class EditCompanyPage extends React.Component {

    constructor(props) {
        const companyId = props.match.params.company_id;
        super(props);

        if (!companyId) {
            props.resetCompanyForm();
        } else {
            props.getCompany(companyId);
        }
        if(window.APP_CLIENT_NAME == 'openstack')
            props.getSponsoredProjects("",1, 100);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.company_id;
        const newId = this.props.match.params.company_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetCompanyForm();
            } else {
                this.props.getCompany(newId);
            }
        }
    }

    render(){
        const { entity,
            errors,
            summits,
            history,
            saveCompany,
            attachLogo,
            match,
            sponsoredProjects,
            deleteSupportingCompany,
            saveSupportingCompany
        } = this.props;

        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_company.company")}</h3>
                <hr/>
                <CompanyForm
                    summits={summits}
                    history={history}
                    entity={entity}
                    errors={errors}
                    onSubmit={saveCompany}
                    onAttach={attachLogo}
                    sponsoredProjects={sponsoredProjects}
                    onDeleteSponsorship={(id) => {

                        let sponsorship = entity.project_sponsorships.find( (ps) => ps.id == id);
                        if(!sponsorship) return;
                        let supportingCompany = sponsorship.supporting_companies.find( (sc) => sc.company_id == entity.id);
                        if(!supportingCompany) return;

                        Swal.fire({
                            title: T.translate("general.are_you_sure"),
                            text: T.translate("edit_company.delete_supporting_company_warning"),
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: T.translate("general.yes_delete")
                        }).then((result) => {
                            if (result.value) {
                                deleteSupportingCompany
                                (
                                    sponsorship.sponsored_project.id,
                                    id,
                                    supportingCompany.id
                                );
                            }
                        });

                    }}

                    addSponsoreProjectSponsorship={(companyId, selectedSponsoredProject, selectedSponsorShipType ) => {
                        saveSupportingCompany(
                            selectedSponsoredProject,
                            selectedSponsorShipType,
                            {
                                id: 0,
                                company: {id: companyId}
                            }
                        )
                    }}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentCompanyState, sponsoredProjectListState }) => ({
    ...currentCompanyState,
    sponsoredProjects: sponsoredProjectListState.sponsoredProjects,
});

export default connect (
    mapStateToProps,
    {
        getCompany,
        resetCompanyForm,
        saveCompany,
        attachLogo,
        getSponsoredProjects,
        saveSupportingCompany,
        deleteSupportingCompany,
    }
)(EditCompanyPage);
