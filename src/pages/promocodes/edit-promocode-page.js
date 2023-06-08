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

import React from 'react'
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import PromocodeForm from '../../components/forms/promocode-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getPromocode, 
    getPromocodeMeta, 
    resetPromocodeForm, 
    sendEmail, 
    addBadgeFeatureToPromocode, 
    removeBadgeFeatureFromPromocode, 
    savePromocode, 
    assignSpeaker,
    getAssignedSpeakers,
    unAssignSpeaker
} from "../../actions/promocode-actions";
import { getBadgeFeatures, getBadgeTypes } from '../../actions/badge-actions'
import '../../styles/edit-promocode-page.less';
import {createCompany} from "../../actions/sponsor-actions";

class EditPromocodePage extends React.Component {

    constructor(props) {
        const {currentSummit, match} = props;
        const promocodeId = match.params.promocode_id;
        super(props);

        if (!promocodeId) {
            props.resetPromocodeForm();
        } else {
            props.getPromocode(promocodeId);
        }

        props.getPromocodeMeta();
        if (!currentSummit.badge_features) props.getBadgeFeatures();
        if (!currentSummit.badge_types) props.getBadgeTypes()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.promocode_id;
        const newId = this.props.match.params.promocode_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetPromocodeForm();
            } else {
                this.props.getPromocode(newId);
            }
        }
    }

    render(){
        const {currentSummit, allTypes, allClasses, entity, errors, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.code : T.translate("general.new");

        if (!allClasses.length || !currentSummit.badge_features || !currentSummit.badge_types) {
            return (<div/>);
        }

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_promocode.promocode")}</h3>
                <hr/>
                {currentSummit &&
                <PromocodeForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    allTypes={allTypes}
                    allClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onSendEmail={this.props.sendEmail}
                    onBadgeFeatureLink={this.props.addBadgeFeatureToPromocode}
                    onBadgeFeatureUnLink={this.props.removeBadgeFeatureFromPromocode}
                    onCreateCompany={this.props.createCompany}
                    onSubmit={this.props.savePromocode}
                    assignSpeaker={this.props.assignSpeaker}
                    getAssignedSpeakers={this.props.getAssignedSpeakers}
                    unAssignSpeaker={this.props.unAssignSpeaker}
                    resetPromocodeForm={this.props.resetPromocodeForm}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPromocodeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentPromocodeState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPromocode,
        getPromocodeMeta,
        getBadgeFeatures,
        getBadgeTypes,
        resetPromocodeForm,
        sendEmail,
        createCompany,
        addBadgeFeatureToPromocode,
        removeBadgeFeatureFromPromocode,
        savePromocode,
        assignSpeaker,
        getAssignedSpeakers,
        unAssignSpeaker
    }
)(EditPromocodePage);
