import React from 'react';

export default class SortableActionsTableCell extends React.Component {

    constructor(props) {
        super(props);

    }

    onDelete(id, ev) {
        ev.preventDefault();
        this.props.actions.delete(id);
    }

    onEdit(id, ev) {
        ev.preventDefault();
        this.props.actions.edit(id);
    }

    render() {
        let {actions, id} = this.props;
        return (
            <td key='actions'>
                {'edit' in actions &&
                    <a href="" onClick={this.onEdit.bind(this,id)} >
                        <i className="fa fa-pencil-square-o"></i>
                    </a>
                }
                {'delete' in actions &&
                    <a href="" onClick={this.onDelete.bind(this,id)} >
                        <i className="fa fa-trash-o"></i>
                    </a>
                }
            </td>
        );
    }
};
