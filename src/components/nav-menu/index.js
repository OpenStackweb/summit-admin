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
import Member from '../../models/member'

class NavMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            subMenuOpen: '',
            menuOpen: false
        }

        this.drawMenuItem = this.drawMenuItem.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.isMenuOpen = this.isMenuOpen.bind(this);
    }

    componentDidMount() {
        document.getElementById('page-wrap').addEventListener('click', this.closeMenu);
        document.getElementById('page-header').addEventListener('click', this.closeMenu);
    }

    componentWillUnmount() {
        document.getElementById('page-wrap').removeEventListener('click', this.closeMenu);
        document.getElementById('page-header').removeEventListener('click', this.closeMenu);
    }

    isMenuOpen(state) {
        this.setState({menuOpen: state.isOpen});
    }

    closeMenu() {
        this.setState({menuOpen: false});
    }

    toggleSubMenu(event, submenu) {
        event.preventDefault();
        this.setState({
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

    drawMenuItem(item, show, memberObj) {
        let {subMenuOpen} = this.state;
        let hasAccess = !item.hasOwnProperty('accessRoute') || memberObj.hasAccess(item.accessRoute);

        if (show && hasAccess) {
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
    }

    render() {
        let {menuOpen} = this.state;
        let {currentSummit, member} = this.props;
        let memberObj = new Member(member);
        let summit_id = currentSummit.id;
        let show = (summit_id !== 0);
        let canEditSummit = memberObj.canEditSummit();

        const globalItems = [
            {name: 'directory', iconClass: 'fa-fw fa-list-ul', linkUrl: 'directory'},
            {name: 'speakers', iconClass: 'fa-users', accessRoute: 'speakers',
                childs: [
                    {name:'speaker_list', linkUrl:`speakers`},
                    {name:'merge_speakers', linkUrl:`speakers/merge`}
                ]
            }
        ]

        const summitItems = [
            {name: 'dashboard', iconClass: 'fa-dashboard', linkUrl: `summits/${summit_id}/dashboard`, accessRoute: 'summit-edit'},
            {name: 'events', iconClass: 'fa-calendar', accessRoute: 'events',
                childs: [
                    {name:'new_event', linkUrl:`summits/${summit_id}/events/new`},
                    {name:'event_list', linkUrl:`summits/${summit_id}/events`},
                    {name:'schedule', linkUrl:`summits/${summit_id}/events/schedule`},
                    {name:'event_types', linkUrl:`summits/${summit_id}/event-types`},
                    {name:'event_categories', linkUrl:`summits/${summit_id}/event-categories`},
                    {name:'event_category_groups', linkUrl:`summits/${summit_id}/event-category-groups`}
                ]
            },
            {name: 'attendees', iconClass: 'fa-users', linkUrl:`summits/${summit_id}/attendees`, accessRoute: 'attendees' },
            {name:'speaker_attendance', iconClass: 'fa-users', linkUrl:`summits/${summit_id}/speaker-attendances`, accessRoute: 'speakers'},
            {name:'locations', iconClass: 'fa-map-marker', linkUrl:`summits/${summit_id}/locations`, accessRoute: 'locations'},
            {name: 'rsvps', iconClass: 'fa-user-plus', accessRoute: 'rsvp',
                childs: [
                    {name:'rsvp_template_list', linkUrl:`summits/${summit_id}/rsvp-templates`}
                ]
            },
            {name: 'tickets', iconClass: 'fa-ticket', accessRoute: 'tickets',
                childs: [
                    {name:'ticket_type_list', linkUrl:`summits/${summit_id}/ticket-types`},
                    {name:'promocode_list', linkUrl:`summits/${summit_id}/promocodes`}
                ]
            },
            {name: 'room_bookings', iconClass: 'fa-bookmark', linkUrl:`summits/${summit_id}/room-bookings`, accessRoute: 'room-bookings', exclusive: 'room-booking'},
            {name: 'push_notifications', iconClass: 'fa-paper-plane', linkUrl:`summits/${summit_id}/push-notifications`, accessRoute: 'push-notifications' },
            {name: 'room_occupancy', iconClass: 'fa-male', linkUrl:`summits/${summit_id}/room-occupancy`, accessRoute: 'room-occupancy' },
            {name: 'tag_groups', iconClass: 'fa-tags', linkUrl:`summits/${summit_id}/tag-groups`, accessRoute: 'tag-groups' },
            {name: 'reports', iconClass: 'fa-list-ol', linkUrl:`summits/${summit_id}/reports`, accessRoute: 'reports' },
        ];

        return (
            <Menu id="summit-admin-menu" isOpen={ menuOpen } onStateChange={ this.isMenuOpen } noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <div className="separator">
                    {T.translate('menu.general')}
                </div>
                {globalItems.map(it => {
                    return this.drawMenuItem(it, true, memberObj);
                })}

                {show &&
                <div className="separator">
                    {currentSummit.name} {T.translate('general.summit')}
                    {canEditSummit &&
                    <a href="" className="edit-summit" onClick={(e) => this.onMenuItemClick(e, `summits/${summit_id}`)}>
                        <i className="fa fa-pencil-square-o"></i>
                    </a>
                    }
                </div>
                }

                {summitItems.map(it => {
                    return this.drawMenuItem(it, show, memberObj);
                })}

            </Menu>
        );
    }

}

export default withRouter(NavMenu);
