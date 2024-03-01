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
import Swal from "sweetalert2";
import { Pagination } from 'react-bootstrap';
import { SortableTable, CompanyInput, MemberInput, Panel, TextEditor, Input, UploadInput, Table } from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";
import EventInput from '../inputs/event-input';
import SummitSponsorshipTypeInput from '../inputs/summit-sponsorship-type-input';
import ExtraQuestionsTable from "../tables/extra-questions-table";

class SponsorForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            showSection: '',
            errors: props.errors
        };

        this.handleChangeMember = this.handleChangeMember.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUploadHeaderImage = this.handleUploadHeaderImage.bind(this);
        this.handleUploadSideImage = this.handleUploadSideImage.bind(this);
        this.handleUploadHeaderMobileImage = this.handleUploadHeaderMobileImage.bind(this);
        this.handleUploadCarouselImage = this.handleUploadCarouselImage.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleAdvertisementAdd = this.handleAdvertisementAdd.bind(this);
        this.handleMaterialAdd = this.handleMaterialAdd.bind(this);
        this.handleSocialNetworkAdd = this.handleSocialNetworkAdd.bind(this);
        this.handleAdvertisementEdit = this.handleAdvertisementEdit.bind(this);
        this.handleMaterialEdit = this.handleMaterialEdit.bind(this);
        this.handleSocialNetworkEdit = this.handleSocialNetworkEdit.bind(this);
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

    handleChangeMember(ev) {
        let {onAddMember, onRemoveMember, entity} = this.props;

        let currentMembers = this.state.entity.members;
        let currentMemberIds = currentMembers.map(m => m.id);
        let newMembers = ev.target.value;
        let newMemberIds = newMembers.map(m => m.id);

        newMembers.forEach(mem => {
            if (!currentMemberIds.includes(mem.id)) {
                onAddMember(entity.id, mem);
            }
        });

        currentMemberIds.forEach(memId => {
            if (!newMemberIds.includes(memId)) {
                onRemoveMember(entity.id, memId);
            }
        });

    }

    handleUploadHeaderImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttachImage(this.state.entity, formData, 'header_image')
    }

    handleUploadHeaderMobileImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttachImage(this.state.entity, formData, 'header_mobile_image')
    }

    handleUploadSideImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttachImage(this.state.entity, formData, 'side_image')
    }

    handleUploadCarouselImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        this.props.onAttachImage(this.state.entity, formData, 'carousel')
    }

    handleRemoveFile(picAttr) {
        const entity = {...this.state.entity};
        entity[picAttr] = '';
        this.setState({entity:entity});
        this.props.onRemoveImage(entity, picAttr);
    }

    toggleSection(section, ev) {
        const {showSection} = this.state;
        const newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handlePageChange (page, collection) {
        const {entity} = this.state;
        switch(collection) {
            case 'ads': {
                const {entity: {ads_collection: {perPage}}} = this.state;
                this.props.getSponsorAdvertisements(entity.id, page, perPage);
            }
            break;
            case 'materials': {
                const {entity: {materials_collection: {perPage}}} = this.state;
                this.props.getSponsorMaterials(entity.id, page, perPage);
            }
            break;
            case 'social_networks': {
                const {entity: {social_networks_collection: {perPage}}} = this.state;
                this.props.getSponsorSocialNetworks(entity.id, page, perPage);
            }
            break;
            default:
                break;
        }
    }

    handleAdvertisementAdd(ev) {
        const {entity, history} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/ads/new`);
    }

    handleAdvertisementEdit(advertisementId) {
        const {entity, history} = this.props;
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/ads/${advertisementId}`);
    }

    handleMaterialAdd(ev) {
        const {entity, history} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/materials/new`);
    }

    handleMaterialEdit(materialId) {
        const {entity, history} = this.props;
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/materials/${materialId}`);
    }

    handleSocialNetworkAdd(ev) {
        const {entity, history} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/social-networks/new`);
    }

    handleSocialNetworkEdit(socialNetworkId) {
        const {entity, history} = this.props;
        history.push(`/app/summits/${entity.summit_id}/sponsors/${entity.id}/social-networks/${socialNetworkId}`);
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

    handleDelete(element, collection) {
        const {entity} = this.state;
        const {onAdvertisementDelete, onMaterialDelete, onSocialNetworkDelete } = this.props;

        let deleteElement = entity[`${collection}_collection`][`${collection}`].find(s => s.id === element);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate(`edit_sponsor.remove_warning_${collection}`) + ' ' + (deleteElement.name || deleteElement.link),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                collection === 'ads' ? onAdvertisementDelete(element)
                : collection === 'materials' ?
                onMaterialDelete(element)
                :
                onSocialNetworkDelete(element);
            }
        });
    }

    render() {
        const {entity, showSection} = this.state;
        const { currentSummit, onCreateCompany, canEditSponsors } = this.props;

        const advertisement_columns = [
            { columnKey: 'link', value: T.translate("edit_sponsor.link") },
            { columnKey: 'text', value: T.translate("edit_sponsor.text") },
            { columnKey: 'alt', value: T.translate("edit_sponsor.alt") }
        ];

        const advertisement_table_options = {
            actions: {
                edit: { onClick: this.handleAdvertisementEdit },
                delete: { onClick: (id) => this.handleDelete(id, 'ads') }
            }
        };

        const materials_columns = [
            { columnKey: 'link', value: T.translate("edit_summit.link") },
            { columnKey: 'name', value: T.translate("edit_summit.name") },
            { columnKey: 'type', value: T.translate("edit_sponsor.type") }
        ]

        const materials_table_options = {
            actions: {
                edit: { onClick: this.handleMaterialEdit },
                delete: { onClick: (id) => this.handleDelete(id, 'materials') }
            }
        }

        const social_networks_columns = [
            { columnKey: 'link', value: T.translate("edit_sponsor.link") },
            { columnKey: 'icon_css_class', value: T.translate("edit_sponsor.icon_css_class") },
            { columnKey: 'is_enabled', value: T.translate("edit_summit.enabled") }
        ];

        const social_networks_table_options = {
            actions: {
                edit: { onClick: this.handleSocialNetworkEdit },
                delete: { onClick: (id) => this.handleDelete(id, 'social_networks') }
            }
        }

        return (
            <form className="sponsor-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_sponsor.company")} </label>
                        <CompanyInput
                            id="company"
                            value={entity.company}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                            allowCreate
                            onCreate={onCreateCompany}
                            error={this.hasErrors('company_id')}
                        />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_published" checked={entity.is_published}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_published">
                                {T.translate("edit_sponsor.is_published")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_sponsor.sponsorship")}</label>
                        <SummitSponsorshipTypeInput
                            id="sponsorship"
                            value={entity.sponsorship}
                            key={JSON.stringify(entity.sponsorship)}
                            summitId={currentSummit.id}
                            onChange={this.handleChange} />
                    </div>
                </div>
                {entity.id !== 0 && canEditSponsors &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("general.member")} </label>
                        <MemberInput
                            id="members"
                            value={entity.members}
                            onChange={this.handleChangeMember}
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
                </div>
                }

                {entity.id !== 0 && canEditSponsors &&
                    <>
                    <hr/>
                    <Panel show={showSection === 'sponsor-page'} title={T.translate("edit_sponsor.sponsor_page")}
                        handleClick={this.toggleSection.bind(this, 'sponsor-page')}>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label> {T.translate("edit_sponsor.intro")} </label>
                                <TextEditor id="intro" value={entity.intro} onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label> {T.translate("edit_sponsor.marquee")} </label>
                                <textarea
                                    id="marquee"
                                    value={entity.marquee}
                                    onChange={this.handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-md-4">
                                <label> {T.translate("edit_sponsor.external_link")} </label>
                                <Input className="form-control" id="external_link" value={entity.external_link} onChange={this.handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label> {T.translate("edit_sponsor.video_link")} </label>
                                <Input className="form-control" id="video_link" value={entity.video_link} onChange={this.handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label> {T.translate("edit_sponsor.chat_link")} </label>
                                <Input className="form-control" id="chat_link" value={entity.chat_link} onChange={this.handleChange} />
                            </div>
                        </div>

                        <div className="row form-group">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> {T.translate("edit_sponsor.header_image")} </label>
                                        <UploadInput
                                            value={entity.header_image}
                                            handleUpload={this.handleUploadHeaderImage}
                                            handleRemove={ev => this.handleRemoveFile('header_image')}
                                            className="dropzone col-md-6"
                                            multiple={false}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <br />
                                <label> {T.translate("edit_sponsor.header_image_alt_text")} </label>
                                <Input className="form-control" id="header_image_alt_text" value={entity.header_image_alt_text} onChange={this.handleChange} />
                            </div>
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> {T.translate("edit_sponsor.header_image_mobile")} </label>
                                        <UploadInput
                                            value={entity.header_image_mobile}
                                            handleUpload={this.handleUploadHeaderMobileImage}
                                            handleRemove={ev => this.handleRemoveFile('header_image_mobile')}
                                            className="dropzone col-md-6"
                                            multiple={false}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <br />
                                <label> {T.translate("edit_sponsor.header_image_mobile_alt_text")} </label>
                                <Input className="form-control" id="header_image_mobile_alt_text" value={entity.header_image_mobile_alt_text} onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> {T.translate("edit_sponsor.side_image")} </label>
                                        <UploadInput
                                            value={entity.side_image}
                                            handleUpload={this.handleUploadSideImage}
                                            handleRemove={ev => this.handleRemoveFile('side_image')}
                                            className="dropzone col-md-6"
                                            multiple={false}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <br />
                                <label> {T.translate("edit_sponsor.side_image_alt_text")} </label>
                                <Input className="form-control" id="side_image_alt_text" value={entity.side_image_alt_text} onChange={this.handleChange} />
                            </div>
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> {T.translate("edit_sponsor.carousel_advertise_image")} </label>
                                        <UploadInput
                                            value={entity.carousel_advertise_image}
                                            handleUpload={this.handleUploadCarouselImage}
                                            handleRemove={ev => this.handleRemoveFile('carousel_advertise_image')}
                                            className="dropzone col-md-6"
                                            multiple={false}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <br />
                                <label> {T.translate("edit_sponsor.carousel_advertise_image_alt_text")} </label>
                                <Input className="form-control" id="carousel_advertise_image_alt_text" value={entity.carousel_advertise_image_alt_text} onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-md-4">
                                <label> {T.translate("edit_sponsor.featured_event")} </label>
                                <EventInput
                                    id="featured_event"
                                    value={entity.featured_event}
                                    key={JSON.stringify(entity.featured_event)}
                                    summitId={currentSummit.id}
                                    onChange={this.handleChange} />
                            </div>
                        </div>

                        <hr/>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label htmlFor="ads">
                                    {T.translate("edit_sponsor.advertisements")}
                                </label>
                                <input type="button" onClick={this.handleAdvertisementAdd}
                                    className="btn btn-primary pull-right" value={T.translate("edit_sponsor.add_advertisement")}/>
                                <SortableTable
                                    options={advertisement_table_options}
                                    data={entity.ads_collection.ads || []}
                                    columns={advertisement_columns}
                                    dropCallback={this.props.onSponsorAdsOrderUpdate}
                                    orderField="order"
                                />
                            </div>
                        </div>

                        <hr/>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label htmlFor="materials">
                                    {T.translate("edit_sponsor.materials")}
                                </label>
                                <input type="button" onClick={this.handleMaterialAdd}
                                    className="btn btn-primary pull-right" value={T.translate("edit_sponsor.add_materials")}/>
                                <SortableTable
                                    options={materials_table_options}
                                    data={entity.materials_collection.materials || []}
                                    columns={materials_columns}
                                    dropCallback={this.props.onSponsorMaterialOrderUpdate}
                                    orderField="order"
                                />
                            </div>
                        </div>

                        <hr/>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label htmlFor="social_networks">
                                    {T.translate("edit_sponsor.social_networks")}
                                </label>
                                <input type="button" onClick={this.handleSocialNetworkAdd}
                                    className="btn btn-primary pull-right" value={T.translate("edit_sponsor.add_social_networks")}/>
                                <Table
                                    options={social_networks_table_options}
                                    data={entity.social_networks_collection.social_networks || []}
                                    columns={social_networks_columns}
                                />
                                <Pagination
                                    bsSize="medium"
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    maxButtons={10}
                                    items={entity.social_networks_collection.lastPage}
                                    activePage={entity.social_networks_collection.currentPage}
                                    onSelect={(page) => this.handlePageChange(page, 'social_networks')}
                                />
                            </div>
                        </div>
                    </Panel>

                        <Panel show={showSection === 'extra-questions'} title={T.translate("edit_sponsor.extra_questions")}
                               handleClick={this.toggleSection.bind(this, 'extra-questions')}>
                            <ExtraQuestionsTable
                              extraQuestions={entity.extra_questions}
                              onNew={console.log}
                              onEdit={console.log}
                              onDelete={(questionId) => this.props.deleteExtraQuestion(entity.id, questionId)}
                              onReorder={(extraQuestions, questionId, order) => this.props.updateExtraQuestionOrder(extraQuestions, entity.id, questionId, order)}
                            />
                        </Panel>
                    </>
                }
                {canEditSponsors &&
                    <div className="row">
                        <div className="col-md-12 submit-buttons">
                            <input type="button" onClick={this.handleSubmit}
                                   className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                        </div>
                    </div>
                }
            </form>
        );
    }
}

export default SponsorForm;
