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
import { findElementPos, epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'
import { Dropdown, CompanyInput, MemberInput } from 'openstack-uicore-foundation/lib/components';


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

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'datetime') {
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
        let {entity} = this.state;
        let { currentSummit, sponsorships, onCreateCompany } = this.props;

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
                {entity.id != 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("general.member")} </label>
                        <MemberInput
                            id="members"
                            value={entity.members}
                            onChange={this.handleChangeMember}
                            multi={true}
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
