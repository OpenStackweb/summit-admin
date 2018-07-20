import React from 'react';
import OccupancyTableHeading from './OccupancyTableHeading';
import OccupancyTableCell from './OccupancyTableCell';
import OccupancyTableRow from './OccupancyTableRow';
import OccupancyActionsTableCell from './OccupancyActionsTableCell';

import './datatables.css';

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
        return (
            <OccupancyTableCell key={'cell_'+i}>
                {row[col.columnKey]}
            </OccupancyTableCell>
        );
    });

    if (actions) {
        cells.push(<OccupancyActionsTableCell key='actions_cell' id={row['id']} value={row['value']} actions={actions}/>);
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
        <table className={"table table-striped table-hover " + options.className}>
            <thead>
                <tr>
			    {columns.map((col,i) => {

                    let sortCol = (typeof options.sortCol != 'undefined') ? options.sortCol : defaults.sortCol;
                    let sortDir = (typeof options.sortDir != 'undefined') ? options.sortDir : defaults.sortDir;
                    let sortFunc = (typeof options.sortFunc != 'undefined') ? options.sortFunc : defaults.sortFunc;
                    let sortable = (typeof col.sortable != 'undefined') ? col.sortable : defaults.sortable;
                    let colWidth = (typeof col.width != 'undefined') ? col.width : defaults.colWidth;

                    return (
                        <OccupancyTableHeading
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
    );
};

export default OccupancyTable;
