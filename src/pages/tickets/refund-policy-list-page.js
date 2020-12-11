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
import { getRefundPolicies, saveRefundPolicy, deleteRefundPolicy } from "../../actions/ticket-actions";

class RefundPolicyListPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getRefundPolicies();
        }
    }

    render(){
        const {currentSummit, match, refundPolicies, totalRefundPolicies} = this.props;


        let refund_columns = [
            { columnKey: 'name', value: T.translate("refund_policy_list.name") },
            { columnKey: 'refund_rate', value: T.translate("refund_policy_list.rate") },
            { columnKey: 'until_x_days_before_event_starts', value: T.translate("refund_policy_list.days_before") }
        ];

        let refund_options = {
            actions: {
                save: {onClick: this.props.saveRefundPolicy},
                delete: {onClick: this.props.deleteRefundPolicy}
            }
        };

        if(!currentSummit.id) return (<div />);


        return(
            <>
                <Breadcrumb data={{ title: T.translate("refund_policy_list.refund_policies"), pathname: match.url }} />
                <div className="container">
                    <h3> {T.translate("refund_policy_list.refund_policies")}</h3>
                    <p> {T.translate("refund_policy_list.warning")}</p>
                    <div className={'row'}>
                        <div className="col-md-12">
                            <EditableTable
                                options={refund_options}
                                data={refundPolicies}
                                columns={refund_columns}
                            />
                        </div>
                    </div>

                </div>
            </>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRefundPolicyListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentRefundPolicyListState
})

export default connect (
    mapStateToProps,
    {
        saveRefundPolicy,
        deleteRefundPolicy,
        getRefundPolicies
    }
)(RefundPolicyListPage);
