import React from 'react';

export default class OccupancyActionsTableCell extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        let {actions, id, value} = this.props;
        return (
            <td className="actions" key="actions" style={{width: "140px"}}>
                <button className="btn btn-default" onClick={actions.onMore.bind(this, id)}>+</button>
                <span style={{marginLeft: "10px", marginRight: "10px"}}>{value}%</span>
                <button className="btn btn-default" onClick={actions.onLess.bind(this, id)}>-</button>
            </td>
        );
    }
};
