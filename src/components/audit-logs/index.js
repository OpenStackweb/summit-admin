import React, {useEffect} from "react";
import {FreeTextSearch, Table} from "openstack-uicore-foundation/lib/components";
import T from "i18n-react";
import {Pagination} from "react-bootstrap";
import {connect} from "react-redux";
import {clearAuditLogParams, getAuditLog} from "../../actions/audit-log-actions";

const AuditLogs = ({entityFilter = [], term, logEntries, perPage, lastPage, currentPage, order, orderDir, getAuditLog, clearAuditLogParams}) => {
  const audit_log_table_options = {
    sortCol: order,
    sortDir: orderDir,
    actions: {}
  };

  const audit_log_columns = [
    { columnKey: 'created', value: T.translate("audit_log.date"), sortable: true },
    { columnKey: 'action', value: T.translate("audit_log.action"), sortable: false },
    { columnKey: 'event_id', value: T.translate("audit_log.event"), sortable: true },
    { columnKey: 'user', value: T.translate("audit_log.user"), sortable: false }
  ];

  const handleSort = (index, key, dir, func) => {
    getAuditLog(entityFilter, term, currentPage, perPage, key, dir);
  };

  const handlePageChange = (page) => {
    getAuditLog(entityFilter, term, page, perPage, order, orderDir);
  };

  const handleSearch = (newTerm) => {
    getAuditLog(entityFilter, newTerm, currentPage, perPage, order, orderDir);
  };

  useEffect(() => {
    getAuditLog(entityFilter, term, 1, perPage, order, orderDir);

    return () => {
      clearAuditLogParams();
    }
  }, []);


  return (
    <>
      <div className={'row'}>
        <div className={'col-md-8'}>
          <FreeTextSearch
            value={term ?? ''}
            placeholder={T.translate("audit_log.placeholders.search_log")}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {logEntries.length === 0 &&
        <div>{T.translate("audit_log.no_log_entries")}</div>
      }

      {logEntries.length > 0 &&
        <>
          <Table
            options={audit_log_table_options}
            data={logEntries}
            columns={audit_log_columns}
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
        </>
      }
    </>
  )
}

const mapStateToProps = ({auditLogState}) => ({
  ...auditLogState,
});

export default connect(
  mapStateToProps,
  {
    getAuditLog,
    clearAuditLogParams
  }
)(AuditLogs);