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
import { Switch, Route, withRouter } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import NoMatchPage from "../pages/no-match-page";
import EditSponsoredProjectPage from "../pages/sponsored_projects/edit-sponsored-project-page";
import SponsoredProjectSponsorshipTypeLayout from './sponsored-project-sponsorship-type-layout';
import {connect} from "react-redux";
import {getSponsoredProject, resetSponsoredProjectForm} from "../actions/sponsored-project-actions";

class SponsoredProjectLayoutId extends React.Component {

    constructor(props) {
        super(props);
        const projectId = props.match.params.sponsored_project_id;

        if (!projectId) {
            props.resetSponsoredProjectForm();
        } else {
            props.getSponsoredProject(projectId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.rsvp_template_id;
        const newId = this.props.match.params.rsvp_template_id;
        if (oldId !== newId) {
            if (!newId) {
                this.props.resetSponsoredProjectForm();
            } else {
                this.props.getSponsoredProject(newId);
            }
        }
    }

    render(){
        const { match, currentProject } = this.props;
        let projectId = match.params.sponsored_project_id;
        let breadcrumb = currentProject.id ? currentProject.name : T.translate("general.new");

        if (projectId && !currentProject.id) return (<div/>);

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/sponsorship-types`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_sponsored_project.sponsorship_types"), pathname: match.url }} />
                                <Switch>
                                    <Route path={`${props.match.url}/:sponsorship_id(\\d+)`} component={SponsoredProjectSponsorshipTypeLayout} />
                                    <Route exact strict path={`${props.match.url}/new`} component={SponsoredProjectSponsorshipTypeLayout} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditSponsoredProjectPage} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ sponsoredProjectState }) => ({
    currentProject : sponsoredProjectState.entity
});

export default connect (
    mapStateToProps,
    {
        getSponsoredProject,
        resetSponsoredProjectForm,
    }
)(SponsoredProjectLayoutId);


