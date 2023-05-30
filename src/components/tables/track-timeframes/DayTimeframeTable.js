import React from 'react';
import {connect} from 'react-redux';
import ActionsTableCell from './ActionsTableCell';
import {deleteDayTimeframe, saveDayTimeframe} from "../../../actions/track-timeframes-actions"
import T from "i18n-react/dist/i18n-react";
import ReactTooltip from "react-tooltip";
import {shallowEqual} from "../../../utils/methods";
import {DateTimePicker, Dropdown} from "openstack-uicore-foundation/lib/components";
import {parseLocationHour, epochToMomentTimeZone} from "openstack-uicore-foundation/lib/utils/methods";


import './styles.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'

const createRow = (row, actions, days, summitTZ) => {
  var cells = [];
  
  cells = [
    <td key="day">{epochToMomentTimeZone(row.day, summitTZ).format('MMM Do YYYY')}</td>,
    <td key="opening_hour">{row.opening_hour ? parseLocationHour(row.opening_hour) : 'N/A'}</td>,
    <td key="closing_hour">{row.closing_hour ? parseLocationHour(row.closing_hour) : 'N/A'}</td>,
  ]
  
  
  if (actions) {
    cells.push(<ActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions}/>);
  }
  
  return cells;
};

const createNewRow = (row, actions, days) => {
  let cells = [
    <td key="new_day">
      <Dropdown
        id="day"
        value={row.day}
        onChange={actions.handleChange}
        options={days}
      />
    </td>,
    <td key="new_opening_hour">
      <DateTimePicker
        id="opening_hour"
        onChange={actions.handleChange}
        format={{date:false, time: "HH:mm"}}
        value={row.opening_hour}
        utc={true}
      />
    </td>,
    <td key="new_closing_hour">
      <DateTimePicker
        id="closing_hour"
        onChange={actions.handleChange}
        format={{date:false, time: "HH:mm"}}
        value={row.closing_hour}
        utc={true}
      />
    </td>
  ];
  
  cells.push(
    <td key='add_new'>
      <button className="btn btn-default" onClick={actions.save}> Add</button>
    </td>
  );
  
  return cells;
};


class DayTimeframeTable extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.new_row = {
      day: null,
      opening_hour: null,
      closing_hour: null,
    };
    
    this.state = {
      rows: props.data,
      new_row: {...this.new_row},
    };
    
    this.actions = {};
    this.actions.delete = this.deleteClick.bind(this);
    
    this.newActions = {};
    this.newActions.save = this.saveNewRow.bind(this);
    this.newActions.handleChange = this.onChangeNewCell.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!shallowEqual(this.props.data, prevProps.data)) {
      this.setState({rows: this.props.data})
    }
  }
  
  deleteClick(id) {
    const {trackId, allowedLocationId} = this.props;
    this.props.deleteDayTimeframe(trackId, allowedLocationId, id);
  }
  
  onChangeNewCell(ev) {
    const {new_row} = this.state;
    let field = ev.target;
    
    new_row[field.id] = field.value;
  
    this.setState({
      new_row: new_row
    });
  }
  
  saveNewRow(ev) {
    const {trackId, allowedLocationId} = this.props;
    ev.preventDefault();
    const new_row = {...this.state.new_row};
    this.setState({new_row: {...this.new_row}});
    
    this.props.saveDayTimeframe(trackId, allowedLocationId, new_row);
  }
  
  render() {
    const {days, summitTZ} = this.props;
    const {rows, new_row} = this.state;
    
    return (
      <div>
        <table className="table table-striped table-bordered table-hover dayTimeframesTable">
          <thead>
          <tr>
            <th style={{width: '20%'}}>{T.translate("track_timeframes.day")}</th>
            <th style={{width: '30%'}}>{T.translate("track_timeframes.opening_hour")}</th>
            <th style={{width: '30%'}}>{T.translate("track_timeframes.closing_hour")}</th>
            <th style={{width: '20%'}}>&nbsp;</th>
          </tr>
          </thead>
          <tbody>
          {rows.map((row, i) => {
            let rowClass = i % 2 === 0 ? 'even' : 'odd';
            
            return (
              <tr id={row.id} key={'row_' + row.id} role="row" className={rowClass}>
                {createRow(row, this.actions, days, summitTZ)}
              </tr>
            );
          })}
          
          <tr id='new_row' key='new_row' className="odd">
            {createNewRow(new_row, this.newActions, days)}
          </tr>
          </tbody>
        </table>
        <ReactTooltip delayShow={10}/>
      </div>
    );
  }
};

const mapStateToProps = ({currentSummitState}) => ({
  locations: currentSummitState.currentSummit.locations,
})

export default connect(
  mapStateToProps,
  {
    saveDayTimeframe,
    deleteDayTimeframe,
  }
)(DayTimeframeTable);
