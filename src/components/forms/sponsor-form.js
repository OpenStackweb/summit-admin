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
import { Dropdown, CompanyInput, MemberInput } from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class SponsorForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChangeMember = this.handleChangeMember.bind(this);
        this.handleChange = this.handleChange.bind(this);
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


    render() {
        const {entity} = this.state;
        const { currentSummit, sponsorships, onCreateCompany } = this.props;

        let sponsorship_ddl = sponsorships.map(s => ({label: s.name, value: s.id}));

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
                        <Dropdown
                            id="sponsorship_id"
                            value={entity.sponsorship_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_sponsor.placeholders.select_sponsorship")}
                            options={sponsorship_ddl}
                            error={this.hasErrors('sponsorship_id')}
                        />
                    </div>
                </div>
                {entity.id !== 0 &&
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

export default SponsorForm;
