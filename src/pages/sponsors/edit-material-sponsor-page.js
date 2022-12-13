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
import SponsorMaterialForm from '../../components/forms/sponsor-material-form';
import { getSponsorMaterial, saveSponsorMaterial, resetSponsorMaterialForm } from "../../actions/sponsor-actions";

class EditMaterialSponsorPage extends React.Component {

    constructor(props) {
        const materialId = props.match.params.material_id;
        super(props);

        if (!materialId) {
            props.resetSponsorMaterialForm();
        } else {
            props.getSponsorMaterial(materialId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.material_id;
        const newId = this.props.match.params.material_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSponsorMaterialForm();
            } else {
                this.props.getSponsorMaterial(newId);
            }
        }
    }

    render() {
        const { currentSummit, entity, errors, match } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return (
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_sponsor.material")}</h3>
                <hr />
                {currentSummit &&
                    <SponsorMaterialForm
                        entity={entity}
                        currentSummit={currentSummit}
                        errors={errors}
                        onSubmit={this.props.saveSponsorMaterial}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorMaterialState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentSponsorMaterialState
});

export default connect(
    mapStateToProps,
    {
        resetSponsorMaterialForm,
        getSponsorMaterial,
        saveSponsorMaterial,
    }
)(EditMaterialSponsorPage);
