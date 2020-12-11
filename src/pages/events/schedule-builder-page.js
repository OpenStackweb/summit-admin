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
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import ScheduleAdminDashBoard from '../../components/schedule-builder/schedule-admin-dashboard';
import { connect } from 'react-redux';
import '../../styles/schedule-builder-page.less';
import { getSummitById}  from '../../actions/summit-actions';

class ScheduleBuilderPage extends React.Component {


    render(){
        const {currentSummit, match} = this.props;
        if(!currentSummit.id) return(<div />);

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("schedule.schedule"), pathname: match.url }} />
                <ScheduleAdminDashBoard history={this.props.history} summit={currentSummit} pixelsPerMinute={3}/>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit : currentSummitState.currentSummit
});

export default connect (
    mapStateToProps,
    {
        getSummitById
    }
)(ScheduleBuilderPage);
