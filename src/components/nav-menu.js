import React from 'react'
import { slide as Menu } from 'react-burger-menu'

export default class NavMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            subMenuOpen: ''
        }
    }

    toggleSubMenu(e, submenu) {
        e.preventDefault();

        this.setState({
            subMenuOpen: submenu
        });
    }

    render() {
        if(!this.props.show) return null;
        return (
            <Menu noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <a id="directory-menu" className="menu-item" href="/app">
                    <i className="fa fa-fw fa-list-ul" /> Directory
                </a>
                <a id="dashboard-menu" className="menu-item" href="/app/dashboard">
                    <i className="fa fa-dashboard" /> Dashboard
                </a>
                <a id="events-menu" className="menu-item" onClick={(e) => this.toggleSubMenu(e, 'events')}>
                    <i className="fa fa-calendar" /> Events
                </a>
                {this.state.subMenuOpen == 'events' &&
                <div className="submenu">
                    <a id="schedule-menu" className="menu-item" href="/app/schedule">
                        <i className="fa fa-chevron-right"/> Schedule
                    </a>
                    <a id="new-event-menu" className="menu-item" href="/app/events/new">
                        <i className="fa fa-chevron-right"/> New Event
                    </a>
                </div>
                }
                <a id="speakers-menu" className="menu-item" href="/app/speakers">
                    <i className="fa fa-users" /> Speakers
                </a>
            </Menu>
        );
    }

}
