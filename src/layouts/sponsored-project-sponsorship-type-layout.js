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
import EditSponsoredProjectSponsorshipTypePage from "../pages/sponsored_projects/edit-sponsored-project-sponsorship-type-page";
import {getSponsorshipType, resetSponsorshipTypeForm} from "../actions/sponsored-project-actions";
import SponsoredProjectSponsorshipTypeSupportingCompanyLayout from "./sponsored-project-sponsorship-type-supporting-company-layout";
import T from "i18n-react";

class SponsoredProjectSponsorshipTypeLayout extends React.Component {

    constructor(props) {
        super(props);
        const sponsorship_id = props.match.params.sponsorship_id;

        const {currentSponsoredProject} = this.props;

        if (!sponsorship_id || !currentSponsoredProject) {
            props.resetSponsorshipTypeForm();
        } else {
            props.getSponsorshipType(currentSponsoredProject.id, sponsorship_id);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsorship_id;
        const newId = this.props.match.params.sponsorship_id;

        if (oldId !== newId) {
            if (!newId) {
                props.resetSponsorshipTypeForm();
            } else {
                const {currentSponsoredProject} = this.props;
                props.getSponsorshipType(currentSponsoredProject.id, newId);
            }
        }
    }

    render() {
        let {match, currentSponsorshipType} = this.props;
        let breadcrumb = currentSponsorshipType.id ? currentSponsorshipType.name : T.translate("general.new");
        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/supporting-companies`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_sponsored_project_sponsorship_type.supporting_companies"), pathname: match.url }} />
                                <Switch>
                                    <Route path={`${props.match.url}/:supporting_company_id(\\d+)`} component={SponsoredProjectSponsorshipTypeSupportingCompanyLayout} />
                                    <Route exact strict path={`${props.match.url}/new`} component={SponsoredProjectSponsorshipTypeSupportingCompanyLayout} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditSponsoredProjectSponsorshipTypePage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ sponsoredProjectState, sponsoredProjectSponsorshipTypeState }) => ({
    currentSponsoredProject : sponsoredProjectState.entity,
    currentSponsorshipType : sponsoredProjectSponsorshipTypeState.entity,
});

export default connect (
    mapStateToProps,
    {
        resetSponsorshipTypeForm,
        getSponsorshipType
    }
)(SponsoredProjectSponsorshipTypeLayout);





