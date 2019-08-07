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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { Breadcrumb } from 'react-breadcrumbs';
import { EditableTable } from 'openstack-uicore-foundation/lib/components';
import { saveRefundPolicy, deleteRefundPolicy } from "../../actions/ticket-actions";

class RefundPolicyListPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {}
    }


    render(){
        let {currentSummit, match} = this.props;


        let value_columns = [
            { columnKey: 'name', value: T.translate("refund_policy_list.name") },
            { columnKey: 'rate', value: T.translate("refund_policy_list.rate") },
            { columnKey: 'days_before_event_start', value: T.translate("refund_policy_list.days_before") }
        ];

        let value_options = {
            actions: {
                save: {onClick: this.props.saveRefundPolicy},
                delete: {onClick: this.props.deleteRefundPolicy}
            }
        };

        if(!currentSummit.id) return (<div></div>);


        return(
            <>
                <Breadcrumb data={{ title: T.translate("refund_policy_list.refund_policies"), pathname: match.url }} ></Breadcrumb>
                <div className="container">
                    <h3> {T.translate("refund_policy_list.refund_policies")}</h3>
                    <div className={'row'}>
                        <div className="col-md-12">
                            <EditableTable
                                options={value_options}
                                data={currentSummit.refund_policies}
                                columns={value_columns}
                            />
                        </div>
                    </div>

                </div>
            </>
        )
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit   : currentSummitState.currentSummit
})

export default connect (
    mapStateToProps,
    {
        saveRefundPolicy,
        deleteRefundPolicy,
    }
)(RefundPolicyListPage);
