/**
 * Copyright 2018 OpenStack Foundation
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
import { Input, EditableTable } from 'openstack-uicore-foundation/lib/components'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/methods'


class RoomBookingAttributeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSaveAttribute = this.handleSaveAttribute.bind(this);
        this.handleDeleteAttribute = this.handleDeleteAttribute.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
        });
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let {value, id} = ev.target;

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

        entity[id] = value;
        this.setState({entity: entity});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};

        ev.preventDefault();

        this.props.onSubmit(entity);
    }

    handleSaveAttribute(attribute) {
        let entity = {...this.state.entity};
        this.props.onSaveAttribute(entity.id, attribute);
    }

    handleDeleteAttribute(attributeId) {
        let entity = {...this.state.entity};
        this.props.onDeleteAttribute(entity.id, attributeId);
    }


    render() {
        let {currentSummit, entity} = this.state;

        let value_columns = [
            { columnKey: 'value', value: T.translate("general.value") }
        ];

        let value_options = {
            actions: {
                save: {onClick: this.handleSaveAttribute},
                delete: {onClick: this.handleDeleteAttribute}
            }
        }

        return (
            <form className="room-booking-attribute-form">
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("general.type")} *</label>
                        <Input
                            id="type"
                            value={entity.type}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                {entity.id != 0 &&
                <div className="row">
                    <div className="col-md-12">
                        <label> {T.translate("general.values")} *</label>
                        <EditableTable
                            options={value_options}
                            data={entity.values}
                            columns={value_columns}
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

export default RoomBookingAttributeForm;
