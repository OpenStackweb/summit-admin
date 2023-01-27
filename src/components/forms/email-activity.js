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
import { Table } from 'openstack-uicore-foundation/lib/components';
import T from 'i18n-react/dist/i18n-react';

class EmailActivity extends React.Component {

    render() {
        let {emailActivity} = this.props;

        if(emailActivity.length === 0) return null;

        let columns = [
            { columnKey: 'template_identifier', value: T.translate("mail_activity.template_identifier")},
            { columnKey: 'subject', value: T.translate("mail_activity.subject") },
            { columnKey: 'sent_date', value: T.translate("mail_activity.sent_date") },
        ];

        let table_options = {
            actions:{ }
        };

        return (
            <div>
            <h4>{T.translate("mail_activity.mail_activity")}</h4>
            <hr/>
            <Table
                options={table_options}
                data={emailActivity}
                columns={columns}
            />
            </div>
        );
    }
}

export default EmailActivity;