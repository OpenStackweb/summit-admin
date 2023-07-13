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
import {
    Input,
    Panel,
    TextEditor,
    TagInput,
    UploadInput,
    AccessLevelsInput, SortableTable
} from 'openstack-uicore-foundation/lib/components'

import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";
import TrackDropdown from "../inputs/track-dropdown";

class EventCategoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'main',
            subtrack: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUploadPic = this.handleUploadPic.bind(this);
        this.handleRemovePic = this.handleRemovePic.bind(this);
        this.handleEditSubCategory = this.handleEditSubCategory.bind(this);
        this.handleLinkSubCategory = this.handleLinkSubCategory.bind(this);
        this.handleUnlinkSubCategory = this.handleUnlinkSubCategory.bind(this);
        this.handleUpdateSubCategoryOrder = this.handleUpdateSubCategoryOrder.bind(this);
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
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleRemovePic() {
        this.props.onRemoveImage(this.state.entity.id);
    }

    handleUploadPic(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onUploadImage(this.state.entity, formData);
    }

    toggleSection(section, ev) {
        const { showSection } = this.state;
        const newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({ showSection: newShowSection });
    }
    
    handleEditSubCategory(id) {
        const {history, currentSummit} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/${id}`);
    }
    
    handleLinkSubCategory() {
        const {entity, subtrack} = this.state;
        this.setState({subtrack: null});
        this.props.onLinkSubCategory(entity.id, subtrack);
    }
    
    handleUnlinkSubCategory(subtrackId) {
        const {entity} = this.state;
        this.props.onUnlinkSubCategory(entity.id, subtrackId);
    }
    
    handleUpdateSubCategoryOrder(subtracks, subtrackId, newOrder) {
        const {entity} = this.state;
        this.props.onUpdateSubCategoryOrder(entity.id, subtrackId, newOrder);
    }

    render() {
        const {entity, errors, showSection} = this.state;
        const { currentSummit } = this.props;
        
        const availableSubTracks = currentSummit.tracks.filter(t => {
            return !t.parent_id && !entity.subtracks.map(t => t.id).includes(t.id) && t.id !== entity.id
        })
    
        const table_options = {
            actions: {
                edit: {onClick: this.handleEditSubCategory},
                delete: { onClick: this.handleUnlinkSubCategory }
            }
        };
    
        const columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("event_category_list.name") },
            { columnKey: 'code', value: T.translate("event_category_list.code") },
            { columnKey: 'color', value: T.translate("event_category_list.color") }
        ];

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('name', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('code', errors)}
                        />
                    </div>
                    <div className="col-md-2">
                        <label> {T.translate("edit_event_category.color")} *</label>
                        <Input
                            id="color"
                            type="color"
                            value={entity.color}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-2">
                        <label> {T.translate("edit_event_category.text_color")} *</label>
                        <Input
                          id="text_color"
                          type="color"
                          value={entity.text_color}
                          onChange={this.handleChange}
                          className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={hasErrors('description', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_sessions")}</label>
                        <Input
                            type="number"
                            id="session_count"
                            value={entity.session_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('session_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_alternates")}</label>
                        <Input
                            type="number"
                            id="alternate_count"
                            value={entity.alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('alternate_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning")}</label>
                        <Input
                            type="number"
                            id="lightning_count"
                            value={entity.lightning_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('lightning_count', errors)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning_alternates")}</label>
                        <Input
                            type="number"
                            id="lightning_alternate_count"
                            value={entity.lightning_alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('lightning_alternate_count', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="voting_visible" checked={entity.voting_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="voting_visible">
                                {T.translate("edit_event_category.visible_voters")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="chair_visible" checked={entity.chair_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="chair_visible">
                                {T.translate("edit_event_category.visible_track_chairs")}
                            </label>
                        </div>
                    </div>
                </div>

                <hr />

                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.tags")} </label>
                        <TagInput
                            id="allowed_tags"
                            value={entity.allowed_tags}
                            summitId={currentSummit.id}
                            onChange={this.handleChange}
                            error={hasErrors('allowed_tags', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.allowed_access_levels")}&nbsp;
                            <i className="fa fa-info-circle" aria-hidden="true" title={T.translate("edit_event_category.allowed_access_levels_info")} />
                        </label>
                        <AccessLevelsInput
                            id="allowed_access_levels"
                            value={entity.allowed_access_levels}
                            summitId={currentSummit.id}
                            onChange={this.handleChange}
                            isMulti={true}
                            error={hasErrors('allowed_access_levels', errors)}
                        />
                    </div>
                </div>

                {entity.id !== 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.pic")}</label>
                        <UploadInput
                            value={entity.icon_url}
                            handleUpload={this.handleUploadPic}
                            handleRemove={ev => this.handleRemovePic()}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                }

                <Panel show={showSection === 'proposed_schedule_settings'} title={T.translate("edit_event_category.proposed_schedule_settings.title")}
                    handleClick={this.toggleSection.bind(this, 'proposed_schedule_settings')}>
                    <div className="row form-group">
                        <div className="col-md-4">
                            <label> {T.translate("edit_event_category.proposed_schedule_settings.transition_time")}</label>
                            <Input
                                type="number"
                                id="proposed_schedule_transition_time"
                                value={entity.proposed_schedule_transition_time}
                                onChange={this.handleChange}
                                placeholder={T.translate("edit_event_category.proposed_schedule_settings.placeholders.transition_time")}
                                className="form-control"
                                error={hasErrors('proposed_schedule_transition_time', errors)}
                            />
                        </div>
                    </div>
                </Panel>
    
                {!!entity.id && !entity.parent_id &&
                  <div>
                      <hr/>
                      <div className="row">
                          <div className="col-md pull-right btn-group subtrackddlgrp">
                              <TrackDropdown
                                onChange={ev => this.setState({subtrack: ev.target.value})}
                                tracks={availableSubTracks}
                                value={this.state.subtrack}
                                id="subtracks"
                                className="subtrackddl btn-group text-left"
                              />
                              <button
                                type="button"
                                className="btn btn-default add-button"
                                onClick={this.handleLinkSubCategory}
                                disabled={!this.state.subtrack}
                              >
                                  {T.translate("general.add")}
                              </button>
                          </div>
                      </div>
                      <div className="row form-group">
                          <div className="col-md-12">
                              <SortableTable
                                options={table_options}
                                data={entity.subtracks}
                                columns={columns}
                                dropCallback={this.handleUpdateSubCategoryOrder}
                                orderField="order"
                              />
                          </div>
                      </div>
                  </div>
        
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

export default EventCategoryForm;
