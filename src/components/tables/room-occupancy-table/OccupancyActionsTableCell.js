import React from 'react';

export default class OccupancyActionsTableCell extends React.Component {

  constructor(props) {
    super(props);

  }

  render() {
    const {actions, id, value} = this.props;

    const style = {
      marginLeft: '10px',
      marginRight: '10px',
      width: '90px',
      display: 'inline-block',
      textAlign: 'center'
    };

    const lessDisable = value === 'EMPTY';
    const moreDisable = value === 'OVERFLOW';

    return (
      <td className="actions" key="actions">
        <button className="btn btn-default" onClick={actions.onLess.bind(this, id)} disabled={lessDisable}>
          <i className="fa fa-minus"/>
        </button>
        <span style={style}>{value}</span>
        <button className="btn btn-default" onClick={actions.onMore.bind(this, id)} disabled={moreDisable}>
          <i className="fa fa-plus"/>
        </button>
      </td>
    );
  }
};
