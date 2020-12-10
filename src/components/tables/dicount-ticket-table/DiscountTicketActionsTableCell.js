import React from 'react';

export default class DiscountTicketActionsTableCell extends React.Component {

    onDelete(id, ev) {
        ev.preventDefault();
        this.props.actions.delete(id);
    }

    render() {
        let {actions, id} = this.props;

        return (
            <td className="actions">
                {'delete' in actions &&
                <a href="" onClick={this.onDelete.bind(this,id)} data-tip="delete" >
                    <i className="fa fa-trash-o"/>
                </a>
                }
            </td>
        );
    }
};
