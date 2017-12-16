import React from 'react';
import TableHeading from './TableHeading';
import TableCell from './TableCell';
import TableRow from './TableRow';
import ActionsTableCell from './ActionsTableCell';
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
            <TableCell key={i}>
                {row[col.columnKey]}
            </TableCell>
        );
    });

    if (actions) {
        cells.push(<ActionsTableCell key='actions' id={row['id']} actions={actions}/>);
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

const Table = (props) => {
    let {options, columns} = props;

    return (
        <table className={"table table-striped " + props.className}>
            <thead>
                <tr>
			    {columns.map((col,i) => {

                    let sortCol = (typeof options.sortCol != 'undefined') ? options.sortCol : defaults.sortCol;
                    let sortDir = (typeof options.sortDir != 'undefined') ? options.sortDir : defaults.sortDir;
                    let sortFunc = (typeof options.sortFunc != 'undefined') ? options.sortFunc : defaults.sortFunc;
                    let sortable = (typeof col.sortable != 'undefined') ? col.sortable : defaults.sortable;
                    let colWidth = (typeof col.width != 'undefined') ? col.width : defaults.colWidth;

                    return (
                        <TableHeading
                            onSort={props.onSort}
                            sortDir={getSortDir(col.columnKey, i, sortCol, sortDir)}
                            sortable={sortable}
                            sortFunc={sortFunc}
                            columnIndex={i}
                            columnKey={col.columnKey}
                            width={colWidth}
                            key={i}
                        >
                            {col.value}
                        </TableHeading>
                    );
                })}
                {options.actions &&
                    <TableHeading key='actions' >
                        &nbsp;
                    </TableHeading>
                }
                </tr>
            </thead>
            <tbody>
                {columns.length > 0 && props.data.map((row,i) => {
                    if(Array.isArray(row) && row.length !== columns.length) {
                        console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                        return <tr />
                    }

                    return (
                        <TableRow even={i%2 === 0} key={i}>
                            {createRow(row, columns, options.actions)}
                        </TableRow>
                    );
                })}
            </tbody>
        </table>
    );
};

export default Table;
