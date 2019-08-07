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
import {
    findElementPos,
    epochToMomentTimeZone,
    queryTicketTypes,
} from 'openstack-uicore-foundation/lib/methods'
import { Input, DateTimePicker, Dropdown } from 'openstack-uicore-foundation/lib/components';


class TicketTypeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

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

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let currency_ddl = currentSummit.supported_currencies.map(i => ({label:i, value:i}));

        return (
            <form className="ticket-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.external_id")}</label>
                        <Input
                            className="form-control"
                            error={this.hasErrors('external_id')}
                            id="external_id"
                            value={entity.external_id}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("edit_ticket_type.description")}</label>
                        <textarea
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.cost")}</label>
                        <Input
                            id="cost"
                            className="form-control"
                            error={this.hasErrors('cost')}
                            onChange={this.handleChange}
                            value={entity.cost}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.currency")}</label>
                        <Dropdown
                            id="currency"
                            value={entity.currency}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_ticket_type.placeholders.select_currency")}
                            options={currency_ddl}
                            error={this.hasErrors('currency')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.quantity_to_sell")}</label>
                        <Input
                            id="quantity_to_sell"
                            type="number"
                            className="form-control"
                            error={this.hasErrors('quantity_to_sell')}
                            onChange={this.handleChange}
                            value={entity.quantity_to_sell}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.max_quantity_to_sell_per_order")}</label>
                        <Input
                            id="max_quantity_to_sell_per_order"
                            type="number"
                            className="form-control"
                            error={this.hasErrors('max_quantity_to_sell_per_order')}
                            onChange={this.handleChange}
                            value={entity.max_quantity_to_sell_per_order}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.sale_start_date")}</label>
                        <DateTimePicker
                            id="sale_start_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.sale_start_date, currentSummit.time_zone_id)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket_type.sale_end_date")}</label>
                        <DateTimePicker
                            id="sale_end_date"
                            onChange={this.handleChange}
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timezone={currentSummit.time_zone_id}
                            value={epochToMomentTimeZone(entity.sale_end_date, currentSummit.time_zone_id)}
                        />
                    </div>
                </div>

                <hr />

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

export default TicketTypeForm;
