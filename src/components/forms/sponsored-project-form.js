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
import {Dropdown, SponsoredProjectInput, TextEditor, Input, UploadInput, SortableTable, Table} from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";

class SponsoredProjectForm extends React.Component {

    constructor(props) {
        super(props);

        if (props.parentProjectId) {
            props.getParentProject(props.parentProjectId);
        }

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadLogo = this.handleUploadLogo.bind(this);
        this.handleRemoveLogo = this.handleRemoveLogo.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEditSponsorshipType = this.handleEditSponsorshipType.bind(this);
        this.handleAddSponsorshipType = this.handleAddSponsorshipType.bind(this);
        this.handleAddSubproject = this.handleAddSubproject.bind(this);
        this.handleEditSubproject = this.handleEditSubproject.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
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

        if (ev.target.type === 'sponsoredprojectinput') {
            entity['parent_project_id'] = value;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleUploadLogo(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttachLogo(this.state.entity, formData, 'logo_url')
    }

    handleRemoveLogo() {
        this.props.onRemoveLogo(this.state.entity.id)
    }

    handleSubmit(publish, ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleEditSponsorshipType(id) {
        const { history, entity} = this.props;
        history.push(`/app/sponsored-projects/${entity.id}/sponsorship-types/${id}`);
    }

    handleAddSponsorshipType(ev) {
        const {history, entity} = this.props;
        history.push(`/app/sponsored-projects/${entity.id}/sponsorship-types/new`);
    }

    handleAddSubproject(ev) {
        const {history, entity} = this.props;
        history.push(`/app/sponsored-projects/new#parent_project_id=${entity.id}`);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getSponsoredProjects(term, page, perPage, order, orderDir);
    }

    handleEditSubproject(subprojectId) {
        const {history, getSponsoredProject} = this.props;
        getSponsoredProject(subprojectId);
        history.push(`/app/sponsored-projects/${subprojectId}`);
    }
    
    render() {
        const {entity, errors} = this.state;

        const { onSponsorshipTypeDelete, onSponsorshipTypeReorder, onSubprojectDelete, term } = this.props;

        let sponsorship_types_table_options = {
            actions: {
                edit: { onClick: this.handleEditSponsorshipType },
                delete: { onClick: onSponsorshipTypeDelete }
            }
        };

        let subprojects_table_options = {
            actions: {
                edit: { onClick: this.handleEditSubproject },
                delete: { onClick: onSubprojectDelete }
            }
        };

        let sortedTypes = [...entity.sponsorship_types];
        sortedTypes.sort(
            (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
        );

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("edit_sponsored_project.name") },
        ];

        return (
            <form className="sponsored-project-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_sponsored_project.name")} </label>
                        <Input className="form-control" id="name" value={entity.name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_active"
                                   checked={entity.is_active}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_active">
                                {T.translate("edit_sponsored_project.is_active")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="should_show_on_nav_bar"
                                   checked={entity.should_show_on_nav_bar}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="should_show_on_nav_bar">
                                {T.translate("edit_sponsored_project.should_show_on_nav_bar")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("edit_sponsored_project.site_url")} </label>
                        <Input className="form-control" id="site_url" value={entity.site_url} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsored_project.parent_project")}</label>
                        <SponsoredProjectInput
                            id="parent_project"
                            value={entity.parent_project}
                            onChange={this.handleChange}
                            error={hasErrors('parent_project', errors)}
                            isClearable={true}
                            placeholder={T.translate("edit_sponsored_project.placeholders.search_parent_project")}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_sponsored_project.description")} </label>
                        <TextEditor id="description" value={entity.description} onChange={this.handleChange} />
                    </div>
                </div>
                {entity.id !== 0 &&
                <>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <button className="btn btn-primary pull-right" onClick={this.handleAddSponsorshipType}>
                                {T.translate("edit_sponsored_project.add_sponsorship_type")}
                            </button>
                            <SortableTable
                                options={sponsorship_types_table_options}
                                data={sortedTypes}
                                columns={columns}
                                dropCallback={onSponsorshipTypeReorder}
                                orderField="order"
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <button className="btn btn-primary pull-right" onClick={this.handleAddSubproject}>
                                {T.translate("edit_sponsored_project.add_subproject")}
                            </button>
                            <Table
                                options={subprojects_table_options}
                                data={entity.sub_projects}
                                columns={columns}
                            />
                        </div>
                    </div>
                </>
                }
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_sponsored_project.logo")} </label>
                        <UploadInput
                            value={entity.logo_url}
                            handleUpload={this.handleUploadLogo}
                            handleRemove={this.handleRemoveLogo}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit.bind(this, false)}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default SponsoredProjectForm;
