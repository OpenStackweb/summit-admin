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
import EventMaterialForm from '../../components/forms/event-material-form';
import { getEventMaterial, resetEventMaterialForm, saveEventMaterial, saveSlide } from "../../actions/event-material-actions";
//import '../../styles/edit-event-material-page.less';

class EditEventMaterialPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount () {
        let materialId = this.props.match.params.material_id;

        if (!materialId) {
            this.props.resetEventMaterialForm();
        } else {
            this.props.getEventMaterial(materialId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.material_id;
        let newId = newProps.match.params.material_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetEventMaterialForm();
            } else {
                this.props.getEventMaterial(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match, event} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        if (!event) return(<div></div>);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_event_material.material")}</h3>
                <hr/>
                {currentSummit &&
                <EventMaterialForm
                    currentSummit={currentSummit}
                    entity={entity}
                    event={event}
                    errors={errors}
                    onSubmit={this.props.saveEventMaterial}
                    onSubmitSlide={this.props.saveSlide}
                />
                }
            </div>

        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventMaterialState, currentSummitEventState }) => ({
    currentSummit : currentSummitState.currentSummit,
    event: currentSummitEventState.entity,
    ...currentEventMaterialState
})

export default connect (
    mapStateToProps,
    {
        getEventMaterial,
        resetEventMaterialForm,
        saveEventMaterial,
        saveSlide,
    }
)(EditEventMaterialPage);
