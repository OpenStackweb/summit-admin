import React from 'react';

export default class OccupancyActionsTableCell extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        let {actions, id, value} = this.props;

        let style = {
            marginLeft: '10px',
            marginRight: '10px',
            width: '45px',
            display: 'inline-block',
            textAlign: 'center'
        }

        return (
            <td className="actions" key="actions" style={{width: "140px"}}>
                <button className="btn btn-default" onClick={actions.onMore.bind(this, id)}>
                    <i className="fa fa-plus"></i>
                </button>
                <span style={style}>{value}</span>
                <button className="btn btn-default" onClick={actions.onLess.bind(this, id)}>
                    <i className="fa fa-minus"></i>
                </button>
            </td>
        );
    }
};
