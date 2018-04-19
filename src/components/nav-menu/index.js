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

        this.drawMenuItem = this.drawMenuItem.bind(this);
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

    drawMenuItem(item) {
        let {subMenuOpen} = this.state;

        if (item.hasOwnProperty('childs')) {
            return (
                <SubMenuItem
                    key={item.name}
                    subMenuOpen={subMenuOpen}
                    {...item}
                    onClick={(e) => this.toggleSubMenu(e, item.name)}
                    onItemClick={this.onMenuItemClick.bind(this)}
                />
            )
        } else {
            return (
                <MenuItem
                    key={item.name}
                    {...item}
                    onClick={(e) => this.onMenuItemClick(e, item.linkUrl)}
                />
            )
        }
    }

    render() {
        let {menuOpen} = this.state;
        let {currentSummit} = this.props;
        let summit_id = currentSummit.id;
        let show = (summit_id !== 0);

        let global_items = [
            {name: 'directory', iconClass: 'fa-fw fa-list-ul', show: true, linkUrl: 'directory'},
            {name: 'speakers', iconClass: 'fa-users', show: true,
                childs: [
                    {name:'speaker_list', linkUrl:`speakers`},
                    {name:'merge_speakers', linkUrl:`speakers/merge`}
                ]
            }
        ]

        let summit_items = [
            {name: 'dashboard', iconClass: 'fa-dashboard', show: show, linkUrl: `summits/${summit_id}/dashboard`},
            {name: 'events', iconClass: 'fa-calendar', show: show,
                childs: [
                    {name:'event_list', linkUrl:`summits/${summit_id}/events`},
                    {name:'schedule', linkUrl:`summits/${summit_id}/events/schedule`},
                    {name:'event_types', linkUrl:`summits/${summit_id}/event-types`},
                    {name:'event_categories', linkUrl:`summits/${summit_id}/event-categories`},
                    {name:'event_category_groups', linkUrl:`summits/${summit_id}/event-category-groups`}
                ]
            },
            {name: 'attendees', iconClass: 'fa-users', show: show, linkUrl:`summits/${summit_id}/attendees` },
            {name:'speaker_attendance', iconClass: 'fa-users', linkUrl:`summits/${summit_id}/speaker-attendances`, show: show},
            {name:'locations', iconClass: 'fa-map-marker', linkUrl:`summits/${summit_id}/locations`, show: show},
            {name: 'rsvps', iconClass: 'fa-user-plus', show: show,
                childs: [
                    {name:'rsvp_template_list', linkUrl:`summits/${summit_id}/rsvp-templates`}
                ]
            },
            {name: 'tickets', iconClass: 'fa-ticket', show: show,
                childs: [
                    {name:'ticket_type_list', linkUrl:`summits/${summit_id}/ticket-types`},
                    {name:'promocode_list', linkUrl:`summits/${summit_id}/promocodes`}
                ]
            },
            {name: 'push_notifications', iconClass: 'fa-paper-plane', show: show, linkUrl:`summits/${summit_id}/push-notifications` },
        ];


        return (
            <Menu id="summit-admin-menu" isOpen={ menuOpen } noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <div className="separator">
                    {T.translate('menu.general')}
                </div>
                {global_items.map(it => {
                    return this.drawMenuItem(it);
                })}

                {show &&
                <div className="separator">
                    {currentSummit.name} {T.translate('general.summit')}
                </div>
                }

                {summit_items.map(it => {
                    return this.drawMenuItem(it);
                })}

            </Menu>
        );
    }

}

export default withRouter(NavMenu);