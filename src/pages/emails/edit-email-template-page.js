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
import EmailTemplateForm from '../../components/forms/email-template-form';
import { getSummitById }  from '../../actions/summit-actions';
import { RawHTML } from 'openstack-uicore-foundation/lib/components';
import { getEmailTemplate, resetTemplateForm, saveEmailTemplate, getAllClients, previewEmailTemplate } from "../../actions/email-actions";
import {Modal} from "react-bootstrap";
import QrReader from "react-qr-reader";
//import '../../styles/edit-email-template-page.less';

class EditEmailTemplatePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }

        this.handleRender = this.handleRender.bind(this);
    }

    componentWillMount () {
        let templateId = this.props.match.params.template_id;
        let {clients} = this.props;

        if (!templateId) {
            this.props.resetTemplateForm();
        } else {
            this.props.getEmailTemplate(templateId);
        }

        if (!clients) {
            this.props.getAllClients();
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.template_id;
        let newId = newProps.match.params.template_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetTemplateForm();
            } else {
                this.props.getEmailTemplate(newId);
            }
        }
    }

    handleRender() {
        const {entity, preview} = this.props;
        this.props.previewEmailTemplate(entity.id).then(() => this.setState({showModal: true}));
    }

    render(){
        let {currentSummit, entity, errors, match, clients, preview} = this.props;
        const {showModal} = this.state;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.identifier : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("emails.email_template")}</h3>
                <hr/>
                <EmailTemplateForm
                    currentSummit={currentSummit}
                    entity={entity}
                    clients={clients}
                    errors={errors}
                    onSubmit={this.props.saveEmailTemplate}
                    onRender={this.handleRender}
                />
                <Modal show={showModal} onHide={() => {this.setState({showModal: false})}} >
                    <Modal.Header closeButton>
                        <Modal.Title>Preview</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <RawHTML>{preview}</RawHTML>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>

        )
    }
}

const mapStateToProps = ({ currentSummitState, emailTemplateState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...emailTemplateState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEmailTemplate,
        resetTemplateForm,
        saveEmailTemplate,
        getAllClients,
        previewEmailTemplate
    }
)(EditEmailTemplatePage);
