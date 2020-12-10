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
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getTaxTypes, deleteTaxType } from "../../actions/tax-actions";

class TaxTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewTaxType = this.handleNewTaxType.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getTaxTypes();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id !== newProps.currentSummit.id) {
            this.props.getTaxTypes();
        }
    }

    handleEdit(tax_type_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/tax-types/${tax_type_id}`);
    }

    handleDelete(taxTypeId) {
        let {deleteTaxType, taxTypes} = this.props;
        let taxType = taxTypes.find(t => t.id === taxTypeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("tax_type_list.remove_warning") + ' ' + taxType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteTaxType(taxTypeId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        this.props.getTaxTypes(key, dir);
    }

    handleNewTaxType(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/tax-types/new`);
    }

    render(){
        let {currentSummit, taxTypes, order, orderDir, totalTaxTypes} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("tax_type_list.name"), sortable: true },
            { columnKey: 'rate', value: T.translate("tax_type_list.rate") },
            { columnKey: 'tax_id', value: T.translate("tax_type_list.tax_id") }
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container">
                <h3> {T.translate("tax_type_list.tax_type_list")} ({totalTaxTypes})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewTaxType}>
                            {T.translate("tax_type_list.add_tax_type")}
                        </button>
                    </div>
                </div>

                {taxTypes.length === 0 &&
                <div>{T.translate("tax_type_list.no_tax_types")}</div>
                }

                {taxTypes.length > 0 &&
                    <Table
                        options={table_options}
                        data={taxTypes}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTaxTypeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentTaxTypeListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTaxTypes,
        deleteTaxType
    }
)(TaxTypeListPage);
