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

import React from 'react';
import history from "../../../history";
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Modal } from 'react-bootstrap';
import { MemberInput, Dropdown } from 'openstack-uicore-foundation/lib/components'

export default class OrderComponent extends React.Component {

    handleOrderLink = (ev, order) => {
        const {summitId} = this.props;
        ev.preventDefault();
        history.push(`/app/summits/${summitId}/purchase-orders/${order.id}`);
    };

    render() {
        let {orders} = this.props;

        return (
            <div className="order-component">
                <div className="row form-group">
                    <div className="col-md-12">
                        <legend> {T.translate("edit_attendee.orders")} </legend>
                        {orders.map(o =>
                            <div key={'ord_' + o.id} className="btn-group btn-group-xs order-btn">
                                <a href="" className="order btn btn-default" onClick={ev => this.handleOrderLink(ev, o)}>
                                    {o.number}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

    }
}

