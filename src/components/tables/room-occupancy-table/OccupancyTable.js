import React from 'react';
import OccupancyTableHeading from './OccupancyTableHeading';
import OccupancyTableCell from './OccupancyTableCell';
import OccupancyTableRow from './OccupancyTableRow';
import OccupancyActionsTableCell from './OccupancyActionsTableCell';

import './occupancy-table.css';

const defaults = {
    sortFunc: (a,b) => (a < b ? -1 : (a > b ? 1 : 0)),
    sortable: false,
    sortCol: 0,
    sortDir: 1,
    colWidth: ''
}

const createRow = (row, columns, actions) => {

    var action_buttons = '';
    var cells = columns.map((col,i) => {
        let colClass = col.hasOwnProperty('className') ? col.className : '';

        return (
            <OccupancyTableCell key={'cell_'+i} className={colClass}>
                {row[col.columnKey]}
            </OccupancyTableCell>
        );
    });

    if (actions) {
        cells.push(<OccupancyActionsTableCell key='actions_cell' id={row['id']} value={row[actions.valueRow]} actions={actions}/>);
    }

    return cells;
};

const getSortDir = (columnKey, columnIndex, sortCol, sortDir) => {
    if(columnKey && (columnKey === sortCol)) {
        return sortDir;
    }
    if(sortCol === columnIndex) {
        return sortDir;
    }
    return null
};

const OccupancyTable = (props) => {
    let {options, columns} = props;

    return (
      <div className="occupancyTableWrapper">
        <table className={"table table-striped table-hover occupancyTable"}>
            <thead>
                <tr>
			    {columns.map((col,i) => {

                    let sortCol = options.hasOwnProperty('sortCol') ? options.sortCol : defaults.sortCol;
                    let sortDir = options.hasOwnProperty('sortDir') ? options.sortDir : defaults.sortDir;
                    let sortFunc = options.hasOwnProperty('sortFunc') ? options.sortFunc : defaults.sortFunc;
                    let sortable = col.hasOwnProperty('sortable') ? col.sortable : defaults.sortable;
                    let colWidth = col.hasOwnProperty('width') ? col.width : defaults.colWidth;
                    let colClass = col.hasOwnProperty('className') ? col.className : '';

                    return (
                        <OccupancyTableHeading
                            className={colClass}
                            onSort={props.onSort}
                            sortDir={getSortDir(col.columnKey, i, sortCol, sortDir)}
                            sortable={sortable}
                            sortFunc={sortFunc}
                            columnIndex={i}
                            columnKey={col.columnKey}
                            width={colWidth}
                            key={'heading_'+i}
                        >
                            {col.value}
                        </OccupancyTableHeading>
                    );
                })}
                {options.actions &&
                    <OccupancyTableHeading key='actions_heading' >
                        &nbsp;
                    </OccupancyTableHeading>
                }
                </tr>
            </thead>
            <tbody>
                {columns.length > 0 && props.data.map((row,i) => {
                    if(Array.isArray(row) && row.length !== columns.length) {
                        console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                        return <tr key={'row_'+i} />
                    }

                    return (
                        <OccupancyTableRow even={i%2 === 0} key={'row_'+i}>
                            {createRow(row, columns, options.actions)}
                        </OccupancyTableRow>
                    );
                })}
            </tbody>
        </table>
      </div>
    );
};

export default OccupancyTable;
