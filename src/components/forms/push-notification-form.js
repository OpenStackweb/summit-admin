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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { MemberInput, GroupInput, EventInput, Dropdown } from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class PushNotificationForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.shouldShowComponent = this.shouldShowComponent.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (id === 'channel') {
            entity.members = [];
            entity.event = {};
            entity.group = {};
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    shouldShowComponent(component) {
        let {platform} = this.state.entity;
        let {channel} = this.state.entity;

        if (!platform) return false;

        switch(component) {
            case 'channel':
                return (platform === 'MOBILE');
                break;
            case 'members':
                return (platform === 'MOBILE' && channel === 'MEMBERS');
                break;
            case 'event':
                return (platform === 'MOBILE' && channel === 'EVENT');
                break;
            case 'group':
                return (platform === 'MOBILE' && channel === 'GROUP');
                break;
        }
    }

    render() {
        const {entity} = this.state;
        const { currentSummit, channels, platforms } = this.props;

        let channel_ddl = channels.map(c => ({value: c, label: c}));
        let platform_ddl = platforms.map(p => ({value: p, label: p}));

        return (
            <form className="summit-attendee-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_push_notification.platform")} *</label>
                        <Dropdown
                            id="platform"
                            value={entity.platform}
                            options={platform_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    {this.shouldShowComponent('channel') &&
                    <div className="col-md-6">
                        <label> {T.translate("edit_push_notification.channel")} </label>
                        <Dropdown
                            id="channel"
                            value={entity.channel}
                            options={channel_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    }
                </div>

                <div className="row form-group">
                    {this.shouldShowComponent('members') &&
                    <div className="col-md-12">
                        <label> {T.translate("general.members")} *</label>
                        <MemberInput
                            id="members"
                            value={entity.members}
                            onChange={this.handleChange}
                            multi={true}
                            getOptionLabel={
                                (member) => {
                                    return member.hasOwnProperty("email") ?
                                        `${member.first_name} ${member.last_name} (${member.email})`:
                                        `${member.first_name} ${member.last_name} (${member.id})`;
                                }
                            }
                        />
                    </div>
                    }
                    {this.shouldShowComponent('event') &&
                    <div className="col-md-12">
                        <label> {T.translate("general.event")} *</label>
                        <EventInput
                            id="event"
                            summit={currentSummit}
                            value={entity.event}
                            onChange={this.handleChange}
                            onlyPublished={true}
                        />
                    </div>
                    }
                    {this.shouldShowComponent('group') &&
                    <div className="col-md-12">
                        <label> {T.translate("general.group")} *</label>
                        <GroupInput
                            id="group"
                            value={entity.group}
                            onChange={this.handleChange}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_push_notification.message")} </label>
                        <textarea
                            id="message"
                            value={entity.message}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default PushNotificationForm;
