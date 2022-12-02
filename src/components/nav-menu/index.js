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
        };

        this.showMenu = this.showMenu.bind(this);
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

    showMenu(item) {
        const {currentSummit} = this.props;
        if (!currentSummit) return false;
        if (currentSummit.id === 0) return false;

        switch (item.name) {
            default:
                return true;
        }
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
                        memberObj={memberObj}
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
        const {currentSummit, member} = this.props;
        let memberObj = new Member(member);
        let summit_id = currentSummit.id;
        let canEditSummit = memberObj.canEditSummit();

        const globalItems = [
            {name: 'directory', iconClass: 'fa-fw fa-list-ul', linkUrl: 'directory'},
            {name: 'speakers', iconClass: 'fa-users', accessRoute: 'speakers',
                childs: [
                    {name:'speaker_list', linkUrl:`speakers`, accessRoute: 'speaker-list'},
                    {name:'merge_speakers', linkUrl:`speakers/merge`, accessRoute: 'speakers-merge'}
                ]
            },
            {name: 'companies', iconClass: 'fa fa-copyright', linkUrl: 'companies', accessRoute: 'companies'},
            {name: 'sponsorship_types', iconClass: 'fa fa-handshake-o', linkUrl: 'sponsorship-types', accessRoute: 'sponsorship-types'},
            {name: 'tags', iconClass: 'fa fa-tag', linkUrl: 'tags', accessRoute: 'tags'},
            {name: 'sponsored_projects', iconClass: 'fa fa-cubes', linkUrl: 'sponsored-projects', accessRoute: 'sponsored-projects',  exclusive: 'sponsored-projects'},
            {name: 'emails', iconClass: 'fa-envelope-o', accessRoute: 'emails',
                childs: [
                    {name:'email_templates', linkUrl:`emails/templates`},
                    {name:'sent_email', linkUrl:`emails/sent`},
                ]
            },
            {name: 'admin_access', iconClass: 'fa-arrow-circle-o-right', linkUrl: 'admin-access', accessRoute: 'admin-access'},
            {name: 'media_file_types', iconClass: 'fa-file-text-o', linkUrl: 'media-file-types', accessRoute: 'admin-access'},
        ];

        const summitItems = [
            {name: 'dashboard', iconClass: 'fa-dashboard', linkUrl: `summits/${summit_id}/dashboard`, accessRoute: 'summit-edit'},
            {name: 'events', iconClass: 'fa-calendar', accessRoute: 'events',
                childs: [
                    {name:'new_event', linkUrl:`summits/${summit_id}/events/new`},
                    {name:'event_list', linkUrl:`summits/${summit_id}/events`},
                    {name:'schedule', linkUrl:`summits/${summit_id}/events/schedule`},
                    {name:'event_types', linkUrl:`summits/${summit_id}/event-types`},
                    {name:'event_categories', linkUrl:`summits/${summit_id}/event-categories`},
                    {name:'event_category_groups', linkUrl:`summits/${summit_id}/event-category-groups`},
                    {name:'voteable_presentations', linkUrl:`summits/${summit_id}/voteable-presentations`},
                    {name:'media_uploads', linkUrl:`summits/${summit_id}/media-uploads`}
                ]
            },
            {name: 'attendees', iconClass: 'fa-users', accessRoute: 'attendees',
                childs: [
                    {name: 'attendee-list', linkUrl:`summits/${summit_id}/attendees`, accessRoute: 'attendees'},
                    {name:'badge_checkin', linkUrl:`summits/${summit_id}/attendees/checkin`}
                ]
            },
            {
                name: 'summit_speakers', iconClass: 'fa-users', accessRoute: 'events',
                childs: [
                    {name:'speakers', iconClass: 'fa-users', linkUrl:`summits/${summit_id}/speakers`, accessRoute: 'speakers'},
                    {name:'speaker_attendance', iconClass: 'fa-users', linkUrl:`summits/${summit_id}/speaker-attendances`, accessRoute: 'speakers'},
                    {name:'featured_speakers', iconClass: 'fa-star', linkUrl:`summits/${summit_id}/featured-speakers`, accessRoute: 'speakers'},
                ]
            },
            {name: 'track_chairs', iconClass: 'fa-user-circle-o', accessRoute: 'track-chairs',
                childs: [
                    {name:'track_chair_list', linkUrl:`summits/${summit_id}/track-chairs`},
                    {name:'progress_flags', linkUrl:`summits/${summit_id}/progress-flags`, accessRoute: 'progress-flags'},
                ]
            },
            {name: 'sponsors', iconClass: 'fa-handshake-o', accessRoute: 'sponsors',
                childs: [
                    {name:'sponsor_list', linkUrl:`summits/${summit_id}/sponsors`},
                    {name:'sponsorship_list', linkUrl:`summits/${summit_id}/sponsorships`},
                    {name:'badge_scans', linkUrl:`summits/${summit_id}/badge-scans`},
                ]
            },
            {name:'locations', iconClass: 'fa-map-marker', linkUrl:`summits/${summit_id}/locations`, accessRoute: 'locations'},
            {name: 'rsvps', iconClass: 'fa-user-plus', accessRoute: 'rsvp',
                childs: [
                    {name:'rsvp_template_list', linkUrl:`summits/${summit_id}/rsvp-templates`}
                ]
            },
            {name: 'purchase_orders', iconClass: 'fa-money', accessRoute: 'purchase-orders',
                childs: [
                    {name:'purchase_order_list', linkUrl:`summits/${summit_id}/purchase-orders`},
                    {name:'ticket_list', linkUrl:`summits/${summit_id}/tickets`},
                    {name:'order_extra_questions', linkUrl:`summits/${summit_id}/order-extra-questions`},
                    {name:'registration_stats', linkUrl:`summits/${summit_id}/registration-stats`},
                ]
            },
            {name: 'tickets', iconClass: 'fa-ticket', accessRoute: 'tickets',
                childs: [
                    {name:'registration_invitation_list', linkUrl:`summits/${summit_id}/registration-invitations`},
                    {name:'ticket_type_list', linkUrl:`summits/${summit_id}/ticket-types`},
                    {name:'promocode_list', linkUrl:`summits/${summit_id}/promocodes`},
                    {name:'tax_type_list', linkUrl:`summits/${summit_id}/tax-types`},
                    {name:'refund_policy_list', linkUrl:`summits/${summit_id}/refund-policies`},
                    {name:'payment_profiles_list', linkUrl:`summits/${summit_id}/payment-profiles`},
                    {name:'registration_companies_list', linkUrl:`summits/${summit_id}/registration-companies`},
                ]
            },
            {name: 'badges', iconClass: 'fa-id-card-o', accessRoute: 'badges',
                childs: [
                    {name:'badge_feature_list', linkUrl:`summits/${summit_id}/badge-features`},
                    {name:'access_level_list', linkUrl:`summits/${summit_id}/access-levels`},
                    {name:'view_type_list', linkUrl:`summits/${summit_id}/view-types`},
                    {name:'badge_type_list', linkUrl:`summits/${summit_id}/badge-types`},
                ]
            },
            {name: 'room_bookings', iconClass: 'fa-bookmark', linkUrl:`summits/${summit_id}/room-bookings`, accessRoute: 'room-bookings', exclusive: 'room-bookings'},
            {name: 'push_notifications', iconClass: 'fa-paper-plane', linkUrl:`summits/${summit_id}/push-notifications`, accessRoute: 'push-notifications' },
            {name: 'room_occupancy', iconClass: 'fa-male', linkUrl:`summits/${summit_id}/room-occupancy`, accessRoute: 'room-occupancy' },
            {name: 'tag_groups', iconClass: 'fa-tags', linkUrl:`summits/${summit_id}/tag-groups`, accessRoute: 'tag-groups' },
            {name: 'reports', iconClass: 'fa-list-ol', linkUrl:`summits/${summit_id}/reports`, accessRoute: 'reports' },
            {name: 'summitdocs', iconClass: 'fa-file-text', linkUrl:`summits/${summit_id}/summitdocs`, accessRoute: 'summitdocs' },
            {name: 'email_flow_events', iconClass: 'fa-envelope-o   ', linkUrl:`summits/${summit_id}/email-flow-events`, accessRoute: 'email-flow-events' },
            {   name: 'settings', iconClass: 'fa-cog', accessRoute: 'settings',
                childs: [
                    {name:'marketing', linkUrl:`summits/${summit_id}/marketing`},
                    {name:'schedule_settings', linkUrl:`summits/${summit_id}/schedule-settings`},
                ]
            },
        ];

        return (
            <Menu id="summit-admin-menu" isOpen={ menuOpen } onStateChange={ this.isMenuOpen } noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <div className="separator">
                    {T.translate('menu.general')}
                </div>
                {globalItems.map(it => {
                    return this.drawMenuItem(it, true, memberObj);
                })}

                {currentSummit.id !== 0 &&
                <div className="separator">
                    {currentSummit.name}
                    {canEditSummit &&
                    <a href="" className="edit-summit" onClick={(e) => this.onMenuItemClick(e, `summits/${summit_id}`)}>
                        <i className="fa fa-pencil-square-o"/>
                    </a>
                    }
                </div>
                }

                {summitItems.map(it => {
                    return this.drawMenuItem(it, this.showMenu(it), memberObj);
                })}

            </Menu>
        );
    }

}

export default withRouter(NavMenu);
