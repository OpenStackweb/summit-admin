/**
 * Copyright 2019 OpenStack Foundation
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
import { Input, Dropdown, UploadInput } from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";
import SponsorshipTypeInput from '../inputs/sponsorship-input';


class SummitSponsorshipForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUploadBadgeImage = this.handleUploadBadgeImage.bind(this);
        this.handleRemoveBadgeImage = this.handleRemoveBadgeImage.bind(this);
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

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
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

    handleUploadBadgeImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onBadgeImageAttach(this.state.entity, formData);
    }

    handleRemoveBadgeImage() {        
        const entity = {...this.state.entity};
        entity['badge_image'] = '';
        this.setState({entity:entity});
        this.props.onBadgeImageRemove(entity.id);
    }


    render() {
        const {entity} = this.state;
        const { sponsorships } = this.props;

        const sponsorship_ddl = sponsorships.map(s => ({label: s.name, value: s.id}));

        const lobby_template_ddl = [
            {label: 'Big Images', value: 'big-images' },
            {label: 'Small Images', value: 'small-images' },
            {label: 'Horizontal Images', value: 'horizontal-images' },
            {label: 'Carousel', value: 'carousel' }
        ];

        const expo_hall_template_ddl = [
            {label: 'Big Images', value: 'big-images' },
            {label: 'Medium Images', value: 'medium-images' },
            {label: 'Small Images', value: 'small-images' },
        ];

        const sponsor_page_template_ddl = [
            {label: 'Big Header', value: 'big-header' },
            {label: 'Small Header', value: 'small-header' },                        
        ];

        const event_page_template_ddl = [
            {label: 'Big Images', value: 'big-images' },
            {label: 'Small Images', value: 'small-images' },
            {label: 'Horizontal Images', value: 'horizontal-images' },
        ];

        return (
            <form className="sponsorship-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsor.sponsorship_type")}</label>
                        <SponsorshipTypeInput
                            id="type" 
                            value={entity.type}
                            placeholder={T.translate("edit_sponsor.placeholders.sponsorship_type")}
                            key={JSON.stringify(entity.type)}
                            onChange={this.handleChange} />
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_summit_sponsorship.widget_title")}</label>
                        <Input
                            id="widget_title"
                            className="form-control"
                            error={this.hasErrors('widget_title')}
                            onChange={this.handleChange}
                            value={entity.widget_title}
                        />
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_summit_sponsorship.lobby_template")}</label>
                        <Dropdown
                            id="lobby_template"
                            value={entity.lobby_template}
                            key={JSON.stringify(entity.lobby_template)}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_summit_sponsorship.placeholders.select_lobby_template")}
                            options={lobby_template_ddl}
                            error={this.hasErrors('lobby_template')}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_summit_sponsorship.expo_hall_template")}</label>
                        <Dropdown
                            id="expo_hall_template"
                            value={entity.expo_hall_template}
                            key={JSON.stringify(entity.expo_hall_template)}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_summit_sponsorship.placeholders.select_expo_hall_template")}
                            options={expo_hall_template_ddl}
                            error={this.hasErrors('expo_hall_template')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_summit_sponsorship.event_page_template")}</label>
                        <Dropdown
                            id="event_page_template"
                            value={entity.event_page_template}
                            key={JSON.stringify(entity.event_page_template)}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_summit_sponsorship.placeholders.select_event_page_template")}
                            options={event_page_template_ddl}
                            error={this.hasErrors('event_page_template')}
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_summit_sponsorship.sponsor_page_template")}</label>
                        <Dropdown
                            id="sponsor_page_template"
                            value={entity.sponsor_page_template}
                            key={JSON.stringify(entity.sponsor_page_template)}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_summit_sponsorship.placeholders.select_sponsor_page_template")}
                            options={sponsor_page_template_ddl}
                            error={this.hasErrors('sponsor_page_template')}
                        />
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sponsor_page_use_disqus_widget" checked={entity.sponsor_page_use_disqus_widget}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="sponsor_page_use_disqus_widget">
                                {T.translate("edit_summit_sponsorship.sponsor_page_use_disqus_widget")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sponsor_page_use_live_event_widget" checked={entity.sponsor_page_use_live_event_widget}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="sponsor_page_use_live_event_widget">
                                {T.translate("edit_summit_sponsorship.sponsor_page_use_live_event_widget")}
                            </label>
                        </div>
                    </div>                    
                </div>

                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sponsor_page_use_banner_widget" checked={entity.sponsor_page_use_banner_widget}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="sponsor_page_use_banner_widget">
                                {T.translate("edit_summit_sponsorship.sponsor_page_use_banner_widget")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="sponsor_page_use_schedule_widget" checked={entity.sponsor_page_use_schedule_widget}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="sponsor_page_use_schedule_widget">
                                {T.translate("edit_summit_sponsorship.sponsor_page_use_schedule_widget")}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="row form-group">
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="should_display_on_expo_hall_page" checked={entity.should_display_on_expo_hall_page}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="should_display_on_expo_hall_page">
                                {T.translate("edit_summit_sponsorship.should_display_on_expo_hall_page")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="should_display_on_lobby_page" checked={entity.should_display_on_lobby_page}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="should_display_on_lobby_page">
                                {T.translate("edit_summit_sponsorship.should_display_on_lobby_page")}
                            </label>
                        </div>
                    </div>                    
                </div>

                {entity.id !== 0 &&
                <>
                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit_sponsorship.badge_image")} </label>
                            <UploadInput
                                value={entity.badge_image}
                                handleUpload={this.handleUploadBadgeImage}
                                handleRemove={this.handleRemoveBadgeImage}
                                className="dropzone col-md-6"
                                multiple={false}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="col-md-6">
                            <label> {T.translate("edit_summit_sponsorship.badge_alt")}</label>
                            <Input
                                id="badge_image_alt_text"
                                className="form-control"
                                error={this.hasErrors('badge_image_alt_text')}
                                onChange={this.handleChange}
                                value={entity.badge_image_alt_text}
                            />
                        </div>
                    </div>
                </>
                }

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

export default SummitSponsorshipForm;
