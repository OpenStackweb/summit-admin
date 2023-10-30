/**
 * Copyright 2022 OpenStack Foundation
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
import AuditLogs from "../../components/audit-logs";
import {Breadcrumb} from "react-breadcrumbs";

const AuditLogPage = ({totalLogEntries, match}) => {

    return(
      <div className="container">
          <Breadcrumb data={{ title: "Audit Logs", pathname: match.url }} />
          <h3> {T.translate("audit_log.log_entries")} ({totalLogEntries})</h3>
          <AuditLogs entityFilter={[`class_name==SummitEventAuditLog`]} />
      </div>
    )
}

const mapStateToProps = ({ auditLogState }) => ({
    ...auditLogState
})

export default connect (mapStateToProps, {})(AuditLogPage);
