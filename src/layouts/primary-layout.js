import React from 'react'
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import ScheduleBuilderPage from '../pages/schedule-builder-page';
import SummitDirectoryPage from '../pages/summit-directory-page';

class PrimaryLayout extends React.Component {

    componentWillMount() {
        let { getUserInfo, match } = this.props;
        getUserInfo();
    }

    render(){
        let { getUserInfo, match } = this.props;
        return(
            <div className="primary-layout">
                <Menu noOverlay pageWrapId={ "page-wrap" } >
                    <a id="directory" className="menu-item" href="/app">
                        <i className="fa fa-fw fa-list-ul" /> Directory
                    </a>
                    <a id="dashboard" className="menu-item" href="/app">
                        <i className="fa fa-dashboard" /> Dashboard
                    </a>
                    <a id="schedule" className="menu-item" href="/app/schedule">
                        <i className="fa fa-calendar" /> Schedule
                    </a>
                </Menu>
                <main id="page-wrap">
                    <Switch>
                        <Route exact path="/app" component={SummitDirectoryPage}/>
                        <Route exact path="/app/schedule" component={ScheduleBuilderPage}/>
                        <Route render={props => (<Redirect to="/app"/>)}/>
                    </Switch>
                </main>
            </div>
        );
    }

}

export default PrimaryLayout;


