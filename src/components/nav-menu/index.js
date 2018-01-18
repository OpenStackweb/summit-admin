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
import SubMenuItem from './sub-menu-item'
import MenuItem from './menu-item'

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

    onMenuItemClick(event, url){
        let { history } = this.props;

        event.preventDefault();
        this.setState({menuOpen: false});


        history.push(`/app/${url}`);

    }

    render() {
        let {subMenuOpen} = this.state;
        let summit_id = this.props.currentSummit ? this.props.currentSummit.id : null;
        let show = summit_id !== null;

        let menu_items = [
            {name: 'directory', iconClass: 'fa-fw fa-list-ul', show: true, linkUrl: 'directory'},
            {name: 'dashboard', iconClass: 'fa-dashboard', show: show, linkUrl: `summits/${summit_id}/dashboard`},
            {name: 'events', iconClass: 'fa-calendar', show: show,
                childs: [
                    {name:'schedule', linkUrl:`summits/${summit_id}/events/schedule`},
                    {name:'new_event', linkUrl:`summits/${summit_id}/events/new`}
                ]
            },
            {name: 'speakers', iconClass: 'fa-users', show: show,
                childs: [
                    {name:'speaker_list', linkUrl:`summits/${summit_id}/speakers`},
                    {name:'merge_speakers', linkUrl:`summits/${summit_id}/speakers/merge`}
                ]
            },
            {name: 'attendees', iconClass: 'fa-users', show: show,
                childs: [
                    {name:'attendee_list', linkUrl:`summits/${summit_id}/attendees`}
                ]
            },
            {name: 'promocodes', iconClass: 'fa-ticket', show: show,
                childs: [
                    {name:'promocode_list', linkUrl:`summits/${summit_id}/promocodes`}
                ]
            },
        ];


        return (
            <Menu isOpen={ this.state.menuOpen }  noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                {menu_items.map(it => {
                    if (it.hasOwnProperty('childs')) {
                        return (
                            <SubMenuItem
                                key={it.name}
                                subMenuOpen={subMenuOpen}
                                {...it}
                                onClick={(e) => this.toggleSubMenu(e, it.name)}
                                onItemClick={this.onMenuItemClick.bind(this)}
                            />
                        )
                    } else {
                        return (
                            <MenuItem
                                key={it.name}
                                {...it}
                                onClick={(e) => this.onMenuItemClick(e, it.linkUrl)}
                            />
                        )
                    }
                })}

            </Menu>
        );
    }

}

export default withRouter(NavMenu);