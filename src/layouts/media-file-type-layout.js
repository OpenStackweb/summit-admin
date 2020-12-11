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
import {connect} from "react-redux";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import MediaFileTypeListPage from "../pages/media_file_types/media-file-type-list-page";
import EditMediaFileTypePage from "../pages/media_file_types/edit-media-file-type-page";

class MediaFileTypeLayout extends React.Component {

    render(){
        const { match } = this.props;

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("media_file_type.media_file_types"), pathname: match.url }} />

                <Switch>
                    <Route exact strict path={match.url} component={MediaFileTypeListPage}/>
                    <Route strict exact path={`${match.url}/new`} component={EditMediaFileTypePage}/>
                    <Route path={`${match.url}/:media_file_type_id(\\d+)`} component={EditMediaFileTypePage}/>
                    <Redirect to={`/app/media-file-types`} />
                </Switch>
            </div>
        );
    }

}

export default Restrict(connect (null, {})(MediaFileTypeLayout), 'admin-access');


