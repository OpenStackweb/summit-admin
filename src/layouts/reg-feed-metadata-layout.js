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
import {Switch, Route, Redirect} from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import EditRegFeedMetadataPage from '../pages/summits/edit-reg-feed-metadata-page';
import {connect} from "react-redux";


class RegFeedMetadataLayout extends React.Component {

    render(){
        const { match, currentSummit } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("edit_reg_feed_metadata.reg_feed_metadata"), pathname: match.url }} />
                <Switch>
                    <Route strict exact path={`${match.url}/new`} component={EditRegFeedMetadataPage} />
                    <Route path={`${match.url}/:reg_feed_metadata_id(\\d+)`} component={EditRegFeedMetadataPage} />
                    <Redirect to={`/app/summits/${currentSummit.id}`} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState }) => ({
    ...currentSummitState
});

export default connect (mapStateToProps, {})(RegFeedMetadataLayout);
