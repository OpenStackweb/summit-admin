import React from 'react'
import { slide as Menu } from 'react-burger-menu'
import { withRouter } from 'react-router-dom'

class NavMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            subMenuOpen: '',
            menuOpen: false
        }
    }

    toggleSubMenu(event, submenu) {
        event.preventDefault();
        this.setState({
            subMenuOpen: submenu
        });
    }

    onMenuItemClick(event, action){
        let { history, currentSummit } = this.props;
        event.preventDefault();
        this.setState({ ... this.state, menuOpen: false});
        switch(action){
            case 'directory':
                history.push(`/app/directory`);
                break;
            case 'dashboard':
                history.push(`/app/summits/${currentSummit.id}/dashboard`);
                break;
            case 'schedule':
                history.push(`/app/summits/${currentSummit.id}/events/schedule`);
                break;
            case 'new_event':
                history.push(`/app/summits/${currentSummit.id}/events/new`);
                break;
            case 'speakers':
                history.push(`/app/summits/${currentSummit.id}/speakers`);
                break;
        }
        return false;
    }

    render() {
        let {currentSummit} = this.props;
        if(!currentSummit) return null;
        return (
            <Menu isOpen={ this.state.menuOpen }  noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <a id="directory-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'directory')} >
                    <i className="fa fa-fw fa-list-ul" /> Directory
                </a>
                <a id="dashboard-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'dashboard')} href="#">
                    <i className="fa fa-dashboard" /> Dashboard
                </a>
                <a id="events-menu" className="menu-item" onClick={(e) => this.toggleSubMenu(e, 'events')} href="#">
                    <i className="fa fa-calendar" /> Events
                </a>
                {this.state.subMenuOpen == 'events' &&
                <div className="submenu">
                    <a id="schedule-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'schedule')} >
                        <i className="fa fa-chevron-right"/> Schedule
                    </a>
                    <a id="new-event-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'new_event')}>
                        <i className="fa fa-chevron-right"/> New Event
                    </a>
                </div>
                }
                <a id="speakers-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'speakers')}>
                    <i className="fa fa-users" /> Speakers
                </a>
            </Menu>
        );
    }

}

export default withRouter(NavMenu);