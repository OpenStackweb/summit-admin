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
import { Dropdown, SimpleLinkList } from 'openstack-uicore-foundation/lib/components';
import {shallowEqual} from "../../utils/methods";


class BadgeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
        };

        this.handleChangeBadgeType = this.handleChangeBadgeType.bind(this);
        this.handleFeatureLink = this.handleFeatureLink.bind(this);
        this.handleFeatureUnLink = this.handleFeatureUnLink.bind(this);
        this.queryFeatures = this.queryFeatures.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            this.setState({
                entity: {...this.props.entity},
            });
        }
    }

    handleChangeBadgeType(ev) {
        const entity = {...this.state.entity};
        const {value, id} = ev.target;

        entity[id] = value;
        this.setState({entity: entity});
        this.props.onTypeChange(entity);
    }

    handleFeatureLink(feature) {
        const {entity} = this.state;
        this.props.onFeatureLink(entity.ticket_id, feature);
    }

    handleFeatureUnLink(featureId) {
        const {entity} = this.state;
        this.props.onFeatureUnLink(entity.ticket_id, featureId);
    }

    queryFeatures(input, callback) {
        const {currentSummit} = this.props;
        const features = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1);
        callback(features);
    }

    render() {
        const {entity} = this.state;
        const { currentSummit, canPrint } = this.props;

        if (!currentSummit.badge_types || !currentSummit.badge_features) return (<div/>);

        const badgeType = currentSummit.badge_types.find(bt => bt.id === entity.type_id);
        const access_levels =  badgeType.access_levels.map(al => al.name).join(', ');

        const featuresColumns = [
            { columnKey: 'name', value: T.translate("edit_ticket.name") },
        ];

        const featuresOptions = {
            title: T.translate("edit_ticket.badge_features"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: this.queryFeatures,
                delete: { onClick: this.handleFeatureUnLink },
                add: { onClick: this.handleFeatureLink }
            }
        };

        const badge_type_ddl = currentSummit.badge_types.map(bt => ({label: bt.name, value: bt.id}));

        return (
            <form className="badge-form">
                <input type="hidden" id="badge_id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.type")}</label>
                        <Dropdown
                            id="type_id"
                            value={entity.type_id}
                            onChange={this.handleChangeBadgeType}
                            options={badge_type_ddl}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_ticket.access_levels")}:&nbsp;</label>
                        {access_levels}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.print_count")}:&nbsp;</label>
                        {entity.printed_times}
                    </div>
                    <div className="col-md-4">
                        <button onClick={this.props.onPrintBadge} disabled={!canPrint} className="btn btn-default">
                            {T.translate("edit_ticket.print")}
                        </button>
                    </div>
                </div>


                <hr />
                {entity.id !== 0 &&
                <SimpleLinkList
                    values={entity.features}
                    columns={featuresColumns}
                    options={featuresOptions}
                />
                }

            </form>
        );
    }
}

export default BadgeForm;
