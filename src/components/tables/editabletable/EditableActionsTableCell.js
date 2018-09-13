import React from 'react';

export default class EditableActionsTableCell extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            is_editing: false
        }

    }

    onDelete(id, ev) {
        ev.preventDefault();
        this.props.actions.delete(id);
    }

    onSave(id, ev) {
        ev.preventDefault();

        this.setState({
            is_editing: false
        });

        this.props.actions.save(id);
    }

    onEdit(id, ev) {
        ev.preventDefault();

        this.setState({
            is_editing: true
        });

        this.props.actions.edit(id);
    }

    onCancel(id, ev) {
        ev.preventDefault();

        this.setState({
            is_editing: false
        });

        this.props.actions.cancel(id);
    }

    render() {
        let {actions, id} = this.props;

        if (this.state.is_editing) {
            return (
                <td className="row_actions">
                    <a href="" onClick={this.onSave.bind(this,id)} >
                        <i className="fa fa-floppy-o"></i>
                    </a>
                    <a href="" onClick={this.onCancel.bind(this,id)} >
                        <i className="fa fa-times"></i>
                    </a>
                </td>
            );
        } else {
            return (
                <td className="row_actions">
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
    }
};
