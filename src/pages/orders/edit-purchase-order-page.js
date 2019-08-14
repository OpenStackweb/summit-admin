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
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import { getSummitById }  from '../../actions/summit-actions';
import { getPurchaseOrder } from "../../actions/order-actions";

//import '../../styles/edit-purchase-order-page.less';

class EditPurchaseOrderPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount () {
        let new_order_id = this.props.match.params.purchase_order_id;

        this.props.getPurchaseOrder(new_order_id);
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.purchase_order_id;
        let newId = newProps.match.params.purchase_order_id;

        if (oldId != newId) {
            this.props.getPurchaseOrder(newId);
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.id : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_purchase_order.purchase_order")}</h3>
                <hr/>

                {`SHOW PURCHASE DETAILS`}
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPurchaseOrderState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentPurchaseOrderState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPurchaseOrder,
    }
)(EditPurchaseOrderPage);
