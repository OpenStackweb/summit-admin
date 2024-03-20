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

import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {Pagination} from 'react-bootstrap';
import {
  Dropdown,
  Input,
  FreeTextSearch,
  SelectableTable,
} from 'openstack-uicore-foundation/lib/components';
import {
  getSponsorPromocodes,
  selectPromocode,
  unSelectPromocode,
  clearAllSelectedPromocodes,
  setCurrentFlowEvent,
  setSelectedAll,
  sendEmails,
  changeSearchTerm,
  exportSponsorPromocodes
} from "../../actions/sponsor-actions";

import {validateEmail} from '../../utils/methods';
import {Breadcrumb} from "react-breadcrumbs";

const fieldNames = [
  {columnKey: 'feature_types', value: 'feature_types'},
  {columnKey: 'ticket_types', value: 'ticket_types'},
  {columnKey: 'contact_email', value: 'contact_email'},
  {columnKey: 'notes', value: 'notes'}
]


const SponsorPromocodesListPage = ({currentSummit, promocodes, lastPage, currentPage, totalPromocodes, selectedAll, term, perPage, order, orderDir, selectedCount, currentFlowEvent, ...props}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [testRecipient, setTestRecipient] = useState('');

  useEffect(() => {
    if (currentSummit.id) {
      props.getSponsorPromocodes(term, 1, 10, order, orderDir)
    }
  }, [currentSummit.id]);

  const handleChangeFlowEvent = (ev) => {
    const {value, id} = ev.target;
     props.setCurrentFlowEvent(value);
  }

  const handleSendEmails = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!currentFlowEvent) {
      Swal.fire("Validation error", T.translate("sponsor_promocodes_list.select_template"), "warning");
      return false;
    }

    if (selectedCount === 0) {
      Swal.fire("Validation error", T.translate("sponsor_promocodes_list.select_items"), "warning");
      return false;
    }

    if (testRecipient !== '' && !validateEmail(testRecipient)) {
      Swal.fire("Validation error", T.translate("sponsor_promocodes_list.invalid_recipient_email"), "warning");
      return false
    }

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: `${T.translate("sponsor_promocodes_list.send_email_warning",
        {template: currentFlowEvent, qty: selectedCount})}
                ${testRecipient ? T.translate("sponsor_promocodes_list.email_test_recipient", {email: testRecipient}) : ''}
                ${T.translate("sponsor_promocodes_list.please_confirm")}`,
      type: "warning",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
      confirmButtonText: T.translate("sponsor_promocodes_list.send_emails"),
    }).then(function (result) {
      if (result.value) {
        const recipientEmail = testRecipient || null;
        props.sendEmails(recipientEmail);
      }
    })
  }

  const handleSelected = (promocodeId, isSelected) => {
    if (isSelected) {
      props.selectPromocode(promocodeId);
      return;
    }
    props.unSelectPromocode(promocodeId);
  }

  const handleSelectedAll = (ev) => {
    const selectedAll = ev.target.checked;
    props.setSelectedAll(selectedAll);

    if (!selectedAll) {
      //clear all selected
      props.clearAllSelectedPromocodes();
    }
  }

  const handleEdit = (promocodeId) => {
    props.history.push(`/app/summits/${currentSummit.id}/sponsors/promocodes/${promocodeId}`);
  }

  const handlePageChange = (page) => {
    props.getSponsorPromocodes(term, page, perPage, order, orderDir);
  }

  const handleSort = (index, key, dir, func) => {
    props.getSponsorPromocodes(term, currentPage, perPage, key, dir);
  }

  const handleSearch = (searchTerm) => {
    props.getSponsorPromocodes(searchTerm, currentPage, perPage, order, orderDir);
  }

  const handleColumnsChange = (ev) => {
    const {value} = ev.target;
    setSelectedColumns(value);
  }

  const handleTermChange = (term) => {
    props.changeSearchTerm(term);
  }

  const handleExport = () => {
    props.exportSponsorPromocodes(term, order, orderDir);
  }

  const handleNewPromocode = () => {
    props.history.push(`/app/summits/${currentSummit.id}/sponsors/promocodes/new#type=sponsor`);
  }

  let columns = [
    {columnKey: 'sponsor_company_name', value: T.translate("sponsor_promocodes_list.sponsor"), sortable: true},
    {columnKey: 'tier_name', value: T.translate("sponsor_promocodes_list.tier"), sortable: true},
    {columnKey: 'code', value: T.translate("sponsor_promocodes_list.code"), sortable: true},
    {
      columnKey: 'quantity_available',
      value: T.translate("sponsor_promocodes_list.quantity_available"),
      render: (row, val) => { return parseInt(val) === 0 ? T.translate("sponsor_promocodes_list.infinite") : val} ,
      sortable: true
    },
    {columnKey: 'quantity_used', value: T.translate("sponsor_promocodes_list.quantity_used"), sortable: true},
    {columnKey: 'email_sent', value: T.translate("sponsor_promocodes_list.email_sent"), sortable: true},
  ];

  const ddl_columns = [
    {value: 'feature_types', label: T.translate("sponsor_promocodes_list.feature_types")},
    {value: 'ticket_types', label: T.translate("sponsor_promocodes_list.ticket_types")},
    {value: 'contact_email', label: T.translate("sponsor_promocodes_list.contact_email")},
    {value: 'notes', label: T.translate("sponsor_promocodes_list.notes")},
  ];

  const table_options = {
    sortCol: order,
    sortDir: orderDir,
    actions: {
      edit: {
        onClick: handleEdit,
        onSelected: handleSelected,
        onSelectedAll: handleSelectedAll
      },
    },
    selectedAll: selectedAll,
  }

  if (!currentSummit.id) return (<div/>);

  const flowEventsDDL = [
    {label: '-- SELECT EMAIL EVENT --', value: ''},
    {label: 'SPONSOR_PROMOCODE_EMAIL', value: 'SUMMIT_REGISTRATION_SPONSOR_PROMO_CODE'}
  ];

  const showColumns = fieldNames
    .filter(f => selectedColumns.includes(f.columnKey))
    .map(f2 => (
      {
        columnKey: f2.columnKey,
        value: T.translate(`sponsor_promocodes_list.${f2.value}`),
        sortable: f2.sortable,
        title: f2.title
      }));

  columns = [...columns, ...showColumns];

  return (
    <div className="container">
      <Breadcrumb data={{ title: T.translate("sponsor_promocodes_list.promocodes"), pathname: props.match.url }} />
      <h3> {T.translate("sponsor_promocodes_list.promocodes_list")} ({totalPromocodes})</h3>
      <div className={'row'}>
        <div className={'col-md-8'}>
          <FreeTextSearch
            value={term ?? ''}
            placeholder={T.translate("sponsor_promocodes_list.placeholders.search_promocodes")}
            onSearch={handleSearch}
            onChange={handleTermChange}
          />
        </div>
      </div>

      {promocodes.length === 0 &&
        <div>{T.translate("sponsor_promocodes_list.no_sponsors")}</div>
      }

      <div className={'row'} style={{marginBottom: 15, marginTop: 15}}>
        <div className={'col-md-6'}>
          <Dropdown
            id="flow_event"
            value={currentFlowEvent}
            onChange={handleChangeFlowEvent}
            options={flowEventsDDL}
          />
        </div>
        <div className={'col-md-5'}>
          <Input
            id="testRecipient"
            value={testRecipient}
            onChange={(ev) => setTestRecipient(ev.target.value)}
            placeholder={T.translate("sponsor_promocodes_list.placeholders.test_recipient")}
            className="form-control"
          />
        </div>
        <div className={'col-md-1'}>
          <button className="btn btn-default right-space" onClick={handleSendEmails}>
            {T.translate("sponsor_promocodes_list.send_emails")}
          </button>
        </div>
      </div>

      <div className={'row'} style={{marginBottom: 15, marginTop: 15}}>
        <div className={'col-md-6'}>
          <label>{T.translate("event_list.select_fields")}</label>
          <Dropdown
            id="select_fields"
            placeholder={T.translate("sponsor_promocodes_list.placeholders.select_fields")}
            value={selectedColumns}
            onChange={handleColumnsChange}
            options={ddl_columns}
            isClearable={true}
            isMulti={true}
          />
        </div>
        <div className="col-md-6 text-right" style={{paddingTop: 25}}>
          <button className="btn btn-primary right-space" onClick={handleNewPromocode}>
            {T.translate("sponsor_promocodes_list.add_promocode")}
          </button>
          <button className="btn btn-default" onClick={handleExport} >
            {T.translate("general.export")}
          </button>
        </div>
      </div>

      {promocodes.length > 0 &&
        <div>
          {selectedCount > 0 &&
            <span><b>{T.translate("sponsor_promocodes_list.items_qty", {qty: selectedCount})}</b></span>
          }
          <SelectableTable
            options={table_options}
            data={promocodes}
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

const mapStateToProps = ({currentSummitState, currentSponsorPromocodeListState}) => ({
  currentSummit: currentSummitState.currentSummit,
  ...currentSponsorPromocodeListState,
})

export default connect(
  mapStateToProps,
  {
    getSponsorPromocodes,
    selectPromocode,
    unSelectPromocode,
    clearAllSelectedPromocodes,
    setCurrentFlowEvent,
    setSelectedAll,
    sendEmails,
    changeSearchTerm,
    exportSponsorPromocodes
  }
)(SponsorPromocodesListPage);
