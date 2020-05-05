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
import {Switch, Route, withRouter, Redirect} from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import {connect} from "react-redux";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import NoMatchPage from "../pages/no-match-page";
import EmailTemplateListPage from "../pages/emails/email-template-list-page";
import EditEmailTemplatePage from "../pages/emails/edit-email-template-page";
import SentEmailListPage from "../pages/emails/sent-email-list-page";

class EmailLayout extends React.Component {

    render(){
        let { match, currentSummit } = this.props;

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("emails.email_templates"), pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route exact strict path={`${match.url}/templates`} component={EmailTemplateListPage}/>
                    <Route strict exact path={`${match.url}/templates/new`} component={EditEmailTemplatePage}/>
                    <Route path={`${match.url}/templates/:setting_id(\\d+)`} component={EditEmailTemplatePage}/>
                    <Route exact strict path={`${match.url}/sent`} component={SentEmailListPage}/>
                    <Redirect to={`/app/summits/${currentSummit.id}/emails/templates`} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState }) => ({
    ...currentSummitState
});

export default Restrict(connect (mapStateToProps, {})(EmailLayout), 'emails');


