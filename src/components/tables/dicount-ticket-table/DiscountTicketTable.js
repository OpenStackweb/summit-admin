import React from 'react';
import { connect } from 'react-redux';
import DiscountTicketActionsTableCell from './DiscountTicketActionsTableCell';
import { Dropdown, Input } from 'openstack-uicore-foundation/lib/components'
import { addDiscountTicket, deleteDiscountTicket } from "../../../actions/promocode-actions"
import T from "i18n-react/dist/i18n-react";

import './discountticket.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'

const createRow = (row, actions, ticketTypes) => {
    var cells = [];
    let ticketTypeName = row.ticket_type_id ? ticketTypes.find(tt => tt.value === row.ticket_type_id).label : '';

    cells = [
        <td key="ticket_type">{ticketTypeName}</td>,
        <td key="amount">{row.amount}</td>,
        <td key="rate">{row.rate}</td>
    ];

    if (actions) {
        cells.push(<DiscountTicketActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions}/>);
    }

    return cells;
};

const createNewRow = (row, actions, ticketTypes) => {
    let cells = [
        <td key="new_ticket_type">
            <Dropdown
                id="ticket_type_id"
                value={row.ticket_type_id}
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
            ticket_type_id: null,
            amount: 0,
            rate: 0,
        };

        this.state = {
            new_row: {...this.new_row}
        };

        this.actions = {};
        this.actions.delete = this.deleteClick.bind(this);

        this.newActions = {};
        this.newActions.save = this.saveNewRow.bind(this);
        this.newActions.handleChange = this.onChangeNewCell.bind(this);
    }

    deleteClick(id) {
        let row = this.props.data.find(r => r.id === id);
        this.props.deleteDiscountTicket(this.props.ownerId, id, row.ticket_type_id);
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
        this.props.addDiscountTicket(new_row);

        this.setState({new_row: {...this.new_row}});
    }

    render() {

        let {ticketTypes, data} = this.props;

        let ticket_types_ddl = ticketTypes.map(f => ({label:f.name, value:f.id}));

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
                        {data.map((row,i) => {
                            let rowClass = i%2 === 0 ? 'even' : 'odd';

                            return (
                                <tr id={row.id} key={'row_' + row.id} role="row" className={rowClass}>
                                    {createRow(row, this.actions, ticket_types_ddl)}
                                </tr>
                            );
                        })}

                        <tr id='new_row' key='new_row' className="odd">
                            {createNewRow(this.state.new_row, this.newActions, ticket_types_ddl)}
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
        deleteDiscountTicket
    }
)(DiscountTicketTable);
