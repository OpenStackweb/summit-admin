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
import CompanyForm from '../../components/forms/company-form';
import { getCompany, resetCompanyForm, saveCompany, attachLogo } from "../../actions/company-actions";
import '../../styles/edit-company-page.less';

class EditCompanyPage extends React.Component {

    constructor(props) {
        const companyId = props.match.params.company_id;
        super(props);

        if (!companyId) {
            props.resetCompanyForm();
        } else {
            props.getCompany(companyId);
        }
    }

    componentWillReceiveProps(newProps) {
        let companyId = this.props.match.params.company_id;
        let newCompanyId = newProps.match.params.company_id;

        if (companyId !== newCompanyId) {
            if (!newCompanyId) {
                this.props.resetCompanyForm();
            } else {
                this.props.getCompany(newCompanyId);
            }
        }
    }

    render(){
        let {entity, errors, summits, history, saveCompany, attachLogo, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_company.company")}</h3>
                <hr/>
                <CompanyForm
                    summits={summits}
                    history={history}
                    entity={entity}
                    errors={errors}
                    onSubmit={saveCompany}
                    onAttach={attachLogo}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentCompanyState }) => ({
    ...currentCompanyState
});

export default connect (
    mapStateToProps,
    {
        getCompany,
        resetCompanyForm,
        saveCompany,
        attachLogo
    }
)(EditCompanyPage);
