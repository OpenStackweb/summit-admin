import React from 'react';

export default class ActionsTableCell extends React.Component {

    constructor(props) {
        super(props);

    }

    shouldDisplayAction(action) {
        let {id} = this.props;

        if (!action.hasOwnProperty('display')) {
            return true;
        } else {
            return action.display(id);
        }
    }

    render() {
        let {actions, id} = this.props;
        return (
            <td className="actions" key="actions" style={{width:'60px'}}>
                {actions.hasOwnProperty('edit') && this.shouldDisplayAction(actions.edit) &&
                    <a href="" onClick={actions.edit.onClick.bind(this, id)} >
                        <i className="fa fa-pencil-square-o"></i>
                    </a>
                }
                {actions.hasOwnProperty('delete') && this.shouldDisplayAction(actions.delete)  &&
                    <a href="" onClick={actions.delete.onClick.bind(this, id)} >
                        <i className="fa fa-trash-o"></i>
                    </a>
                }
                {'custom' in actions && actions.custom.map(a =>
                    this.shouldDisplayAction(a, id) &&
                    <a href="" key={'custom_' + a.name} onClick={a.onClick.bind(this, id)}>
                        {a.icon}
                    </a>
                )}
            </td>
        );
    }
};
