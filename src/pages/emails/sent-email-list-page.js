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

import React, {useEffect} from 'react'
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import {Pagination} from 'react-bootstrap';
import {FreeTextSearch, Table} from 'openstack-uicore-foundation/lib/components';
import {getSentEmails} from "../../actions/email-actions";
import {Breadcrumb} from "react-breadcrumbs";

const SentEmailListPage = ({
                             emails,
                             lastPage,
                             currentPage,
                             term,
                             order,
                             orderDir,
                             totalEmails,
                             match,
                             perPage,
                             ...props
                           }) => {
  useEffect(() => {
    props.getSentEmails();
  }, []);

  const handlePageChange = (newPage) => {
    props.getSentEmails(term, newPage, perPage, order, orderDir);
  };

  const handleSort = (index, key, dir, func) => {
    props.getSentEmails(term, currentPage, perPage, key, dir);
  };

  const handleSearch = (newTerm) => {
    props.getSentEmails(newTerm, 1, perPage, order, orderDir);
  };

  const columns = [
    {columnKey: 'id', value: T.translate("general.id"), sortable: true},
    {
      columnKey: 'template',
      value: T.translate("emails.email_templates"),
      styles: {wordBreak: 'break-all'},
      sortable: true
    },
    {columnKey: 'subject', value: T.translate("emails.subject")},
    {columnKey: 'from_email', value: T.translate("emails.from_email")},
    {columnKey: 'to_email', value: T.translate("emails.to_email")},
    {columnKey: 'sent_date', value: T.translate("emails.sent_date")},
  ];

  const table_options = {
    sortCol: order,
    sortDir: orderDir,
  };

  return (
    <div className="container">
      <Breadcrumb data={{title: T.translate("emails.sent"), pathname: match.url}}/>

      <h3> {T.translate("emails.email_list")} ({totalEmails})</h3>
      <div className={'row'}>
        <div className={'col-md-6'}>
          <FreeTextSearch
            value={term}
            placeholder={T.translate("emails.placeholders.search_emails")}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {emails.length === 0 &&
        <div>{T.translate("emails.no_emails")}</div>
      }

      {emails.length > 0 &&
        <div>
          <Table
            options={table_options}
            data={emails}
            columns={columns}
            onSort={handleSort}
          />
          <Pagination
            bsSize="medium"
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={10}
            items={lastPage}
            activePage={currentPage}
            onSelect={handlePageChange}
          />
        </div>
      }

    </div>
  )
}

const mapStateToProps = ({currentSummitState, sentEmailListState}) => ({
  currentSummit: currentSummitState.currentSummit,
  ...sentEmailListState
})

export default connect(
  mapStateToProps,
  {
    getSentEmails,
  }
)(SentEmailListPage);
