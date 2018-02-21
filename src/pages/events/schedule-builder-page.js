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
import ScheduleAdminDashBoard from '../../components/schedule-builder/schedule-admin-dashboard';
import { connect } from 'react-redux';
import '../../styles/schedule-builder-page.less';
import { getSummitById}  from '../../actions/summit-actions';

class ScheduleBuilderPage extends React.Component {

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit } = this.props;
        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    render(){
        let {currentSummit} = this.props;
        if(currentSummit == null) return null;
        return(
            <div>
                <ScheduleAdminDashBoard history={this.props.history} summit={currentSummit} pixelsPerMinute={16}/>
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