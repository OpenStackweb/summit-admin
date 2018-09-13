import React from 'react';
import EditableTableHeading from './EditableTableHeading';
import EditableTableCell from './EditableTableCell';
import EditableActionsTableCell from './EditableActionsTableCell';
import EditableTableRow from './EditableTableRow';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import './datatables.css';

const defaults = {
    colWidth: ''
}

const createRow = (row, columns, actions) => {

    var action_buttons = '';
    var cells = columns.map((col,i) => {
        return (
            <EditableTableCell key={row['id'] + '_field' + i} name={col.columnKey} id={row.id} is_edit={row.is_edit} handleChange={actions.handleChange}>
                {row[col.columnKey]}
            </EditableTableCell>
        );
    });

    if (actions) {
        cells.push(<EditableActionsTableCell key={'actions_' + row['id']} id={row['id']} actions={actions}/>);
    }

    return cells;
};

const createNewRow = (columns, new_row, addNew, handleChange) => {

    var cells = columns.map((col,i) => {
        let cell_value = (typeof new_row[col.columnKey] !== 'undefined') ? new_row[col.columnKey] : '';
        return (
            <td key={'new_row_' + i}>
                <input className="form-control" id={ 'new_' + col.columnKey } name={col.columnKey} onChange={handleChange} value={cell_value} />
            </td>
        );
    });

    cells.push(
        <td key='add_new'>
            <button className="btn btn-default" onClick={addNew}> Add </button>
        </td>
    );

    return cells;
};


export default class EditableTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rows: props.data,
            new_row: {}
        };

        // we store the delete and save functions in props cause we need to extend them
        this.onSave = props.options.actions.save;

        this.actions = {...props.options.actions};
        this.actions.edit = this.editRow.bind(this);
        this.actions.save = this.saveRow.bind(this);
        this.actions.delete = this.deleteClick.bind(this);
        this.actions.handleChange = this.onChangeCell.bind(this);
        this.actions.cancel = this.editRowCancel.bind(this);

        this.saveNewRow = this.saveNewRow.bind(this);
        this.handleNewChange = this.onChangeNewCell.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.length !== this.state.rows.length) {
            this.setState({ rows: nextProps.data });
        }
    }

    saveRow(id, ev) {
        const { rows } = this.state;
        let row = rows.find(r => r.id == id);
        row.is_edit = false;

        this.editing_row = null;

        this.setState({
            rows: rows
        });

        this.onSave(row);
    }

    deleteClick(id, ev) {
        let onDelete = this.props.options.actions.delete.onClick;

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("general.remove_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                onDelete(id);
            }
        }).catch(swal.noop);
    }

    editRow(id, ev) {
        const { rows } = this.state;
        let row = rows.find(r => r.id == id);

        //save editing row for cancel
        this.editing_row = {...row};

        row.is_edit = true;

        this.setState({
            rows: rows
        });
    }

    editRowCancel(id, ev) {
        const { rows } = this.state;
        rows.forEach(r => {
            r.is_edit = false;
        });

        let rowIdx = rows.findIndex(r => r.id == id);

        rows[rowIdx] = this.editing_row;

        this.setState({
            rows: rows
        });
    }

    onChangeCell(ev) {
        const { rows } = this.state;
        let field = ev.target;
        let row = rows.find(r => r.id == field.id);

        row[field.name] = field.value;

        this.setState({
            rows: rows
        });
    }

    onChangeNewCell(ev) {
        const {new_row} = this.state;
        let field = ev.target;

        new_row[field.name] = field.value;

        this.setState({
            new_row: new_row
        });
    }

    saveNewRow(ev) {
        const {new_row} = this.state;
        this.state.onSave(new_row);

        this.setState({
            new_row: {}
        });
    }

    render() {
        let {options, columns } = this.props;
        return (
            <div>
                <table className={options.className}>
                    <thead>
                        <tr>
                            {columns.map((col,i) => {
                                let colWidth = (col.width) ? col.width : defaults.colWidth;
                                return (
                                    <EditableTableHeading width={colWidth} key={'heading_' + i} >
                                        {col.value}
                                    </EditableTableHeading>
                                );
                            })}
                            {this.actions &&
                                <EditableTableHeading key='actions_heading' >
                                    Actions
                                </EditableTableHeading>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {columns.length > 0 && this.state.rows.map((row,i) => {
                            if(Array.isArray(row) && row.length !== columns.length) {
                                console.warn(`Data at row ${i} is ${row.length}. It should be ${columns.length}.`);
                                return <tr />
                            }
                            return (
                                <EditableTableRow even={i%2 === 0} key={'row_' + row.id} id={row.id} >
                                    {createRow(row, columns, this.actions)}
                                </EditableTableRow>

                            );
                        })}
                        <EditableTableRow even={0} id='new_row' key='new_row'>
                            {createNewRow(columns, this.state.new_row, this.saveNewRow, this.handleNewChange)}
                        </EditableTableRow>
                    </tbody>
                </table>
            </div>
        );
    }
};
