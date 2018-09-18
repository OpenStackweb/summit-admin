import React from 'react';

export default class AffiliationsActionsTableCell extends React.Component {

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
                <td className="actions">
                    <a href="" onClick={this.onSave.bind(this,id)} data-tip="save" >
                        <i className="fa fa-floppy-o"></i>
                    </a>
                    <a href="" onClick={this.onCancel.bind(this,id)} data-tip="cancel" >
                        <i className="fa fa-times"></i>
                    </a>
                </td>
            );
        } else {
            return (
                <td className="actions">
                    {'edit' in actions &&
                        <a href="" onClick={this.onEdit.bind(this,id)} data-tip="edit" >
                            <i className="fa fa-pencil-square-o"></i>
                        </a>
                    }
                    {'delete' in actions &&
                        <a href="" onClick={this.onDelete.bind(this,id)} data-tip="delete" >
                            <i className="fa fa-trash-o"></i>
                        </a>
                    }
                </td>
            );
        }
    }
};
