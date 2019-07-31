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
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import TaxTypeForm from '../../components/forms/tax-type-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getTaxType, resetTaxTypeForm, saveTaxType, addTicketToTaxType, removeTicketFromTaxType } from "../../actions/tax-actions";

class EditTaxTypePage extends React.Component {

    componentWillMount () {
        let taxTypeId = this.props.match.params.tax_type_id;

        if (!taxTypeId) {
            this.props.resetTaxTypeForm();
        } else {
            this.props.getTaxType(taxTypeId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.tax_type_id;
        let newId = newProps.match.params.tax_type_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetTaxTypeForm();
            } else {
                this.props.getTaxType(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match, history} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_tax_type.tax_type")}</h3>
                <hr/>
                {currentSummit &&
                <TaxTypeForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onTicketLink={this.props.addTicketToTaxType}
                    onTicketUnLink={this.props.removeTicketFromTaxType}
                    onSubmit={this.props.saveTaxType}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTaxTypeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentTaxTypeState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTaxType,
        resetTaxTypeForm,
        saveTaxType,
        addTicketToTaxType,
        removeTicketFromTaxType
    }
)(EditTaxTypePage);
