import React from 'react';
import { connect } from 'react-redux';
import DiscountTicketActionsTableCell from './DiscountTicketActionsTableCell';
import { Dropdown, Input } from 'openstack-uicore-foundation/lib/components'
import { epochToMoment, formatEpoch } from 'openstack-uicore-foundation/lib/methods'
import { addDiscountTicket, saveDiscountTicket, deleteDiscountTicket } from "../../../actions/promocode-actions"
import T from "i18n-react/dist/i18n-react";

import './discountticket.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'

const createRow = (row, actions, ticketTypes) => {
    var cells = [];
    var ticket_value = (row.ticket_type) ? row.ticket_type : null;

    if (row.is_edit) {
        cells = [
            <td key="ticket_type">
                <Dropdown
                    id="ticket_type"
                    value={ticket_value}
                    options={ticketTypes}
                    onChange={actions.handleChange.bind(this, row.id)}
                />
            </td>,
            <td key="amount">
                <Input
                    id="amount"
                    type="number"
                    min="0"
                    onChange={actions.handleChange.bind(this, row.id)}
                    value={row.amount}
                    disabled={row.rate > 0}
                />
            </td>,
            <td key="rate">
                <Input
                    id="rate"
                    type="number"
                    min="0"
                    max="100"
                    onChange={actions.handleChange.bind(this, row.id)}
                    value={row.rate}
                    disabled={row.amount > 0}
                />
            </td>
        ]
    } else {
        cells = [
            <td key="ticket_type">{row.ticket_type ? row.ticket_type.name : ''}</td>,
            <td key="amount">{row.amount}</td>,
            <td key="rate">{row.rate}</td>
        ]
    }


    if (actions) {
        cells.push(<DiscountTicketActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions}/>);
    }

    return cells;
};

const createNewRow = (row, actions, ticketTypes) => {
    let cells = [
        <td key="new_ticket_type">
            <Dropdown
                id="ticket_type"
                value={row.ticket_type}
                options={ticketTypes}
                onChange={actions.handleChange}
            />
        </td>,
        <td key="new_amount">
            <Input
                id="amount"
                min="0"
                onChange={actions.handleChange}
                type="number"
                value={row.amount}
                disabled={row.rate > 0}
            />
        </td>,
        <td key="new_rate">
            <Input
                id="rate"
                min="0"
                max="100"
                onChange={actions.handleChange}
                type="number"
                value={row.rate}
                disabled={row.amount > 0}
            />
        </td>
    ];

    cells.push(
        <td key='add_new'>
            <button className="btn btn-default" onClick={actions.save}> Add </button>
        </td>
    );

    return cells;
};


class DiscountTicketTable extends React.Component {

    constructor(props) {
        super(props);

        this.new_row = {
            owner_id: props.ownerId,
            ticket_type: null,
            amount: 0,
            rate: 0,
        };

        this.state = {
            rows: props.data,
            new_row: {...this.new_row}
        };

        this.actions = {};
        this.actions.edit = this.editRow.bind(this);
        this.actions.save = this.saveRow.bind(this);
        this.actions.delete = this.deleteClick.bind(this);
        this.actions.handleChange = this.onChangeCell.bind(this);
        this.actions.cancel = this.editRowCancel.bind(this);

        this.newActions = {};
        this.newActions.save = this.saveNewRow.bind(this);
        this.newActions.handleChange = this.onChangeNewCell.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ rows: nextProps.data, new_row: {...this.new_row} });
    }

    saveRow(id) {
        const { rows } = this.state;
        let row = rows.find(r => r.id == id);
        row.is_edit = false;

        this.editing_row = null;

        this.setState({
            rows: rows
        });

        this.props.saveDiscountTicket(row);
    }

    deleteClick(id) {
        this.props.deleteDiscountTicket(this.props.ownerId, id);
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

    onChangeCell(id, ev) {
        const { rows } = this.state;
        let field = ev.target;
        let row = rows.find(r => r.id == id);
        let value = field.value;

        row[field.id] = value;

        this.setState({
            rows: rows
        });
    }

    onChangeNewCell(ev) {
        const {new_row} = this.state;
        let field = ev.target;
        let value = field.value;

        new_row[field.id] = value;

        this.setState({
            new_row: new_row
        });
    }

    saveNewRow(ev) {
        ev.preventDefault();

        let new_row = {...this.state.new_row};
        new_row.owner_id = this.props.ownerId;

        this.props.addDiscountTicket(this.props.ownerId, new_row);
    }

    render() {

        let {ticketTypes} = this.props;

        return (
            <div>
                <table className="table table-striped table-bordered table-hover discountTicketTable">
                    <thead>
                        <tr>
                            <th style={{width: '20%'}}>{T.translate("discount_ticket.ticket_type")}</th>
                            <th style={{width: '15%'}}>{T.translate("discount_ticket.amount")}</th>
                            <th style={{width: '15%'}}>{T.translate("discount_ticket.rate")}</th>
                            <th style={{width: '10%'}}>{T.translate("discount_ticket.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.rows.map((row,i) => {
                            let rowClass = i%2 === 0 ? 'even' : 'odd';

                            return (
                                <tr id={row.id} key={'row_' + row.id} role="row" className={rowClass}>
                                    {createRow(row, this.actions, ticketTypes)}
                                </tr>
                            );
                        })}

                        <tr id='new_row' key='new_row' className="odd">
                            {createNewRow(this.state.new_row, this.newActions, ticketTypes)}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
};

export default connect (
    null,
    {
        addDiscountTicket,
        saveDiscountTicket,
        deleteDiscountTicket
    }
)(DiscountTicketTable);
