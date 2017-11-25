import React from 'react'
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu'
import ScheduleBuilderPage from '../pages/schedule-builder-page';
import SummitDirectoryPage from '../pages/summit-directory-page';
import SummitDashboardPage from '../pages/summit-dashboard-page';
import { withRouter } from 'react-router-dom'
class PrimaryLayout extends React.Component {

    componentWillMount() {
        let { getUserInfo, match } = this.props;
        getUserInfo();
    }

    render(){
        let { getUserInfo, match, currentSummit } = this.props;
        return(
            <div className="primary-layout">
                <NavMenu currentSummit={currentSummit}/>
                <main id="page-wrap">
                    <Switch>
                        <Route exact path="/app/directory" component={SummitDirectoryPage}/>
                        <Route exact path="/app/summits/:summit_id/dashboard" component={SummitDashboardPage}/>
                        <Route exact path="/app/summits/:summit_id/events/schedule" component={ScheduleBuilderPage}/>
                        <Route render={props => (<Redirect to="/app/directory"/>)}/>
                    </Switch>
                </main>
            </div>
        );
    }

}

export default withRouter(PrimaryLayout)


