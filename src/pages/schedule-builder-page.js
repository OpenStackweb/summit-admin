import React from 'react'
import ScheduleAdminDashBoard from '../components/schedule-builder/schedule-admin-dashboard';
import { connect } from 'react-redux';
import '../styles/schedule-builder-page.less';

class ScheduleBuilderPage extends React.Component {
    render(){
        let {currentSummit} = this.props;
        return(
            <div>
                <ScheduleAdminDashBoard summit={currentSummit} pixelsPerMinute={16}/>
            </div>
        )
    }
}



const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit : currentSummitState.currentSummit,
})

export default connect (
    mapStateToProps,
    {

    }
)(ScheduleBuilderPage);