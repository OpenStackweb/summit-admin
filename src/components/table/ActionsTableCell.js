import React from 'react';

export default class ActionsTableCell extends React.Component {

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
            <td className="actions" key="actions" style={{width:'60px'}}>
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
                {'custom' in actions && actions.custom.map(a =>
                    a.display(id) &&
                    <a href="" key={'custom_' + a.name} onClick={a.onClick.bind(this, id)}>
                        {a.icon}
                    </a>
                )}
            </td>
        );
    }
};
