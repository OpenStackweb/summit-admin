/**
 * Copyright 2020 OpenStack Foundation
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
import AdminAccessForm from '../../components/forms/admin-access-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getAdminAccess, resetAdminAccessForm, saveAdminAccess } from "../../actions/admin-access-actions";

//import '../../styles/edit-admin-access-page.less';


class EditAdminAccessPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};

        const accessId = props.match.params.access_id;

        if (!accessId) {
            props.resetAdminAccessForm();
        } else {
            props.getAdminAccess(accessId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.access_id;
        let newId = newProps.match.params.access_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetTemplateForm();
            } else {
                this.props.getAdminAccess(newId);
            }
        }
    }

    render(){
        let {entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.title : T.translate("general.new");

        return(
            <div className="container edit-admin-access-page">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("admin_access.admin_access")}</h3>
                <hr/>
                <AdminAccessForm
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveAdminAccess}
                />
            </div>

        )
    }
}

const mapStateToProps = ({ adminAccessState }) => ({
    ...adminAccessState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAdminAccess,
        resetAdminAccessForm,
        saveAdminAccess
    }
)(EditAdminAccessPage);
