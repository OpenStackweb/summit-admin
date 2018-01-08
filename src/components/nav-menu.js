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
import T from 'i18n-react/dist/i18n-react'
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
        this.setState({ ...this.state,
            subMenuOpen: submenu,
            menuOpen: true
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
            case 'speaker_list':
                history.push(`/app/summits/${currentSummit.id}/speakers`);
                break;
            case 'merge_speakers':
                history.push(`/app/summits/${currentSummit.id}/speakers/merge`);
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
                    <i className="fa fa-fw fa-list-ul" />
                    {T.translate("menu.directory")}
                </a>
                <a id="dashboard-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'dashboard')} href="#">
                    <i className="fa fa-dashboard" />
                    {T.translate("menu.dashboard")}
                </a>
                <a id="events-menu" className="menu-item" onClick={(e) => this.toggleSubMenu(e, 'events')} href="#">
                    <i className="fa fa-calendar" />
                    {T.translate("menu.events")}
                </a>
                {this.state.subMenuOpen == 'events' &&
                <div className="submenu">
                    <a id="schedule-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'schedule')} >
                        <i className="fa fa-chevron-right"/>
                        {T.translate("menu.schedule")}
                    </a>
                    <a id="new-event-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'new_event')}>
                        <i className="fa fa-chevron-right"/>
                        {T.translate("menu.new_event")}
                    </a>
                </div>
                }
                <a id="speakers-menu" className="menu-item" onClick={(e) => this.toggleSubMenu(e,'speakers')}>
                    <i className="fa fa-users" />
                    {T.translate("general.speakers")}
                </a>
                {this.state.subMenuOpen == 'speakers' &&
                <div className="submenu">
                    <a id="speakers-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'speaker_list')} >
                        <i className="fa fa-chevron-right"/>
                        {T.translate("menu.speaker_list")}
                    </a>
                    <a id="merge-speakers-menu" className="menu-item" onClick={(e) => this.onMenuItemClick(e,'merge_speakers')}>
                        <i className="fa fa-chevron-right"/>
                        {T.translate("menu.merge_speakers")}
                    </a>
                </div>
                }
            </Menu>
        );
    }

}

export default withRouter(NavMenu);