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
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';
import NoMatchPage from "../pages/no-match-page";
import EditSponsoredProjectSponsorshipTypeSupportingCompanyPage from "../pages/sponsored_projects/edit-sponsored-project-sponsorship-type-supporting-company-page";
import {
    getSupportingCompany,
    resetSupportingCompanyForm
} from "../actions/sponsored-project-actions";
import T from "i18n-react";

class SponsoredProjectSponsorshipTypeSupportingCompanyLayout extends React.Component {

    constructor(props) {
        super(props);

        const supporting_company_id = props.match.params.supporting_company_id;

        const {currentSponsoredProject, currentSponsorshipType} = this.props;

        if (!supporting_company_id || !currentSponsoredProject) {
            props.resetSupportingCompanyForm();
        } else {
            props.getSupportingCompany(currentSponsoredProject.id, currentSponsorshipType.id, supporting_company_id);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.supporting_company_id;
        const newId = this.props.match.params.supporting_company_id;

        if (oldId !== newId) {
            if (!newId) {
                props.resetSupportingCompanyForm();
            } else {
                const {currentSponsoredProject, currentSponsorshipType} = this.props;
                props.getSupportingCompany(currentSponsoredProject.id, currentSponsorshipType.id, newId);
            }
        }
    }

    render() {
        let {match, currentSupportingCompany} = this.props;
        let breadcrumb = currentSupportingCompany.id ? currentSupportingCompany.name : T.translate("general.new");
        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
                    <Route strict exact path={match.url} component={EditSponsoredProjectSponsorshipTypeSupportingCompanyPage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({   sponsoredProjectState,
                             sponsoredProjectSponsorshipTypeState,
                             sponsoredProjectSponsorshipTypeSupportingCompanyState}) => ({
    currentSponsoredProject : sponsoredProjectState.entity,
    currentSponsorshipType : sponsoredProjectSponsorshipTypeState.entity,
    currentSupportingCompany: sponsoredProjectSponsorshipTypeSupportingCompanyState.entity
});

export default connect (
    mapStateToProps,
    {
        getSupportingCompany,
        resetSupportingCompanyForm
    }
)(SponsoredProjectSponsorshipTypeSupportingCompanyLayout);





