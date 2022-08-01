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
import { getSummitById } from '../../actions/summit-actions';
import ViewTypeForm from '../../components/forms/view-type-form';

import {
    getViewType, resetViewTypeForm,
    saveViewType,
} from "../../actions/badge-actions";

class EditViewPagePage extends React.Component {

    constructor(props) {
        const viewTypeId = props.match.params.view_type_id;
        super(props);

        if (!viewTypeId) {
            props.resetViewTypeForm();
        } else {
            props.getViewType(viewTypeId);
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.view_type_id;
        const newId = this.props.match.params.view_type_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetViewTypeForm();
            } else {
                this.props.getViewType(newId);
            }
        }
    }

    handleSubmit(entity) {
        this.props.saveViewType(entity);
    }

    render() {
        const { currentSummit, entity, errors, match, history } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        const fields = [
            { type: 'text', name: 'name', label: T.translate("edit_view_type.name") },
            { type: 'textarea', name: 'description', label: T.translate("edit_view_type.description") },
            { type: 'checkbox', name: 'is_default', label: T.translate("edit_view_type.is_default") },
        ];

        return (
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_view_type.view_type")}</h3>
                <hr />
                {currentSummit &&
                    <ViewTypeForm
                        history={this.props.history}
                        entity={entity}
                        errors={errors}
                        onSubmit={this.props.saveViewType}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentViewTypeState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentViewTypeState
});

export default connect(
    mapStateToProps,
    {
        getSummitById,
        getViewType,
        resetViewTypeForm,
        saveViewType,
    }
)(EditViewPagePage);
