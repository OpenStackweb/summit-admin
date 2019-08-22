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
import {
    findElementPos,
    epochToMomentTimeZone,
    queryTicketTypes,
} from 'openstack-uicore-foundation/lib/methods'
import { Input, DateTimePicker, SimpleLinkList } from 'openstack-uicore-foundation/lib/components';


class TaxTypeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.queryTickets = this.queryTickets.bind(this);
        this.handleTicketLink = this.handleTicketLink.bind(this);
        this.handleTicketUnLink = this.handleTicketUnLink.bind(this);
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

    handleTicketLink(value) {
        let {entity} = this.state;
        this.props.onTicketLink(entity.id, value);
    }

    handleTicketUnLink(valueId) {
        let {entity} = this.state;
        this.props.onTicketUnLink(entity.id, valueId);
    }

    queryTickets(input, callback) {
        let {currentSummit} = this.props;
        let ticketTypes = [];

        ticketTypes = currentSummit.ticket_types.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1)

        callback(ticketTypes);
    }


    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let ticketColumns = [
            { columnKey: 'name', value: T.translate("edit_tax_type.name") },
            { columnKey: 'description', value: T.translate("edit_tax_type.description") }
        ];

        let ticketOptions = {
            title: T.translate("edit_tax_type.ticket_types"),
            valueKey: "name",
            labelKey: "name",
            actions: {
                search: this.queryTickets,
                delete: { onClick: this.handleTicketUnLink },
                add: { onClick: this.handleTicketLink }
            }
        };

        return (
            <form className="tax-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_tax_type.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>


                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_tax_type.rate")}</label>
                        <Input
                            className="form-control"
                            type="number"
                            error={this.hasErrors('rate')}
                            id="rate"
                            value={entity.rate}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_tax_type.tax_id")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('tax_id')}
                            id="tax_id"
                            value={entity.tax_id}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>


                <hr />
                {entity.id != 0 &&
                <SimpleLinkList
                    values={entity.ticket_types}
                    columns={ticketColumns}
                    options={ticketOptions}
                />
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

export default TaxTypeForm;
