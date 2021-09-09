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
    TextEditor,
    UploadInput,
    Input,
    CountryDropdown,
    Dropdown,
    Table
} from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";
import {Pagination} from "react-bootstrap";


class CompanyForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            selectedSponsoredProject:null,
            selectedSponsorShipType: null,
            sponsorShipTypes:[],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadLogo = this.handleUploadLogo.bind(this);
        this.handleUploadBigLogo = this.handleUploadBigLogo.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectedSponsoredProject = this.handleSelectedSponsoredProject.bind(this);
        this.handleSelectedSponsorshipType = this.handleSelectedSponsorshipType.bind(this);
        this.onAddSponsorshipType = this.onAddSponsorshipType.bind(this);
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

        if (ev.target.type === 'memberinput') {
            entity.email = '';
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleUploadLogo(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData, 'logo')
    }

    handleUploadBigLogo(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData, 'big')
    }

    handleRemoveFile(picAttr) {
        const entity = {...this.state.entity};
        entity[picAttr] = '';
        this.setState({entity:entity});
    }

    handleSubmit(publish, ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleSelectedSponsoredProject(ev){
        const {sponsoredProjects} = this.props;
        let {value} = ev.target;

        console.log(`handleSelectedSponsoredProject ${value}`);

        let project = sponsoredProjects.find(e => e.id == value);

        this.setState({...this.state,
            selectedSponsoredProject : value,
            sponsorShipTypes :project ? project.sponsorship_types.map((s) => { return {label: s.name, value:s.id }}): [],
            selectedSponsorShipType:null
        });
    }

    handleSelectedSponsorshipType(ev){
        let {value, id} = ev.target;
        this.setState({...this.state, selectedSponsorShipType : value});
    }

    onAddSponsorshipType(ev){
        ev.preventDefault();
        let{selectedSponsoredProject, selectedSponsorShipType, entity} = this.state;
        if(!selectedSponsoredProject) return;
        if(!selectedSponsorShipType) return;
        this.props.addSponsoreProjectSponsorship(entity.id, selectedSponsoredProject, selectedSponsorShipType);
    }
    
    render() {
        const {entity} = this.state;
        const {sponsoredProjects} = this.props;

        const member_levels_ddl = [
            {label: 'Platinum', value: 'Platinum'},
            {label: 'Gold', value: 'Gold'},
            {label: 'StartUp', value: 'StartUp'},
            {label: 'Corporate', value: 'Corporate'},
            {label: 'Mention', value: 'Mention'},
            {label: 'None', value: 'None'},
        ];

        const sponsored_projects_ddl = sponsoredProjects && Array.isArray(sponsoredProjects) ? sponsoredProjects.map((sp) => { return {
                label: sp.name,
                value: sp.id,
            }
        }): [];

        const columns = [
            { columnKey: 'project_name', value: T.translate("edit_company.project_name") },
            { columnKey: 'name', value: T.translate("edit_company.sponsorship_type") }
        ];

        const table_options = {
            actions: {
                delete: { onClick: this.props.onDeleteSponsorship}
            }
        }

        return (
            <form className="company-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.name")} </label>
                        <Input className="form-control" id="name" value={entity.name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.url")} </label>
                        <Input className="form-control" id="url" value={entity.url} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.contact_email")} </label>
                        <Input className="form-control" id="contact_email" value={entity.contact_email} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.member_level")} </label>
                        <Dropdown
                            id="member_level"
                            value={entity.member_level}
                            placeholder={T.translate("edit_company.placeholders.member_level")}
                            options={member_levels_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.color")} </label>
                        <Input className="form-control" type="color" id="color" value={entity.color} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.admin_email")} </label>
                        <Input className="form-control" id="admin_email" value={entity.admin_email} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.city")} </label>
                        <Input className="form-control" id="city" value={entity.city} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.state")} </label>
                        <Input className="form-control" id="state" value={entity.state} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.country")} </label>
                        <CountryDropdown
                            id="country"
                            value={entity.country}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_company.placeholders.select_country")}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.industry")} </label>
                        <Input className="form-control" id="industry" value={entity.industry} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.products")} </label>
                        <Input className="form-control" id="products" value={entity.products} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_company.contributions")} </label>
                        <Input className="form-control" id="contributions" value={entity.contributions} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_company.description")} </label>
                        <TextEditor id="description" value={entity.description} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_company.overview")} </label>
                        <TextEditor id="overview" value={entity.overview} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_company.commitment")} </label>
                        <TextEditor id="commitment" value={entity.commitment} onChange={this.handleChange} />
                    </div>
                </div>
                {entity.id > 0 && window.APP_CLIENT_NAME == 'openstack' &&
                    <div className="row form-group">
                        <div className="col-md-4">
                            <Dropdown
                                id="sponsored_project"
                                options={sponsored_projects_ddl}
                                clearable
                                value={this.state.selectedSponsoredProject}
                                onChange={this.handleSelectedSponsoredProject}
                                placeholder={T.translate("edit_company.placeholders.sponsored_project")}
                            />
                        </div>
                        <div className="col-md-4">
                            <Dropdown
                                id="sponsorship_type"
                                clearable
                                value={this.state.selectedSponsorShipType}
                                options={this.state.sponsorShipTypes}
                                onChange={this.handleSelectedSponsorshipType}
                                placeholder={T.translate("edit_company.placeholders.sponsorship_type")}
                            />
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-primary right-space" onClick={this.onAddSponsorshipType}>
                                {T.translate("edit_company.add_project_sponsorship")}
                            </button>
                        </div>
                    </div>
                }
                {entity.project_sponsorships.length > 0 && window.APP_CLIENT_NAME == 'openstack' &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <Table
                                options={table_options}
                                data={entity.project_sponsorships.map((sp) => { return {...sp, project_name:sp.sponsored_project.name}}) }
                                columns={columns}
                            />
                        </div>
                    </div>
                }
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_company.logo")} </label>
                        <UploadInput
                            value={entity.logo}
                            handleUpload={this.handleUploadLogo}
                            handleRemove={ev => this.handleRemoveFile('logo')}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_company.big_logo")} </label>
                        <UploadInput
                            value={entity.big_logo}
                            handleUpload={this.handleUploadBigLogo}
                            handleRemove={ev => this.handleRemoveFile('big_logo')}
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

export default CompanyForm;
