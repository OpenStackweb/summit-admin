import React from 'react';
import ActionsTableCell from './ActionsTableCell';
import T from "i18n-react/dist/i18n-react";
import ReactTooltip from "react-tooltip";
import {shallowEqual} from "../../../utils/methods";
import LocationDropdown from "../../inputs/location-dropdown";
import DayTimeframeTable from "./DayTimeframeTable";
import {epochToMomentTimeZone, parseLocationHour} from "openstack-uicore-foundation/lib/utils/methods";

import './styles.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'

const createRow = (row, actions, summitTZ) => {
  var cells = [];
  const timeframes = row.allowed_timeframes
    .sort((a,b) => a.day - b.day)
    .map(tf => {
      const open = tf.opening_hour ? parseLocationHour(tf.opening_hour) : 'N/A';
      const close = tf.closing_hour ? parseLocationHour(tf.closing_hour) : 'N/A';
      return `${epochToMomentTimeZone(tf.day, summitTZ).format('MMM Do YYYY')}: ${open} - ${close}`;
    })
    .join('\r\n');
  
  cells = [
    <td key="location_id">{row.location.name}</td>,
    <td key="days" style={{whiteSpace: 'pre'}}>{timeframes || 'all days'}</td>,
  ]
  
  
  if (actions) {
    cells.push(<ActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions} isEdit={row.is_edit}/>);
  }
  
  return cells;
};

const createNewRow = (row, actions, locations) => {
  let cells = [
    <td key="new_location_id">
      <LocationDropdown
        id="location_id"
        value={row.location_id}
        onChange={actions.handleChange}
        locations={locations}
      />
    </td>,
    <td key="new_days">
      {T.translate("track_timeframes.all_days")}
    </td>
  ];
  
  cells.push(
    <td key='add_new'>
      <button className="btn btn-default" onClick={actions.save}> Add</button>
    </td>
  );
  
  return cells;
};


class TrackTimeframeTable extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.new_row = {
      location_id: null,
      all_days: true,
    };
    
    this.state = {
      rows: props.data,
      new_row: {...this.new_row},
    };
    
    this.actions = {};
    this.actions.edit = this.editRow.bind(this);
    this.actions.delete = this.deleteClick.bind(this);
    this.actions.cancel = this.editRowCancel.bind(this);
    
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
    const {trackId} = this.props;
    this.props.onDelete(trackId, id);
  }
  
  editRow(id, ev) {
    const {rows} = this.state;
    rows.forEach(r => {
      r.is_edit = false;
    });
    let row = rows.find(r => r.id === id);
    
    row.is_edit = true;
    
    this.setState({
      rows: rows
    });
  }
  
  editRowCancel(id, ev) {
    const {rows} = this.state;
    rows.forEach(r => {
      r.is_edit = false;
    });
    
    this.setState({
      rows: rows
    });
  }
  
  onChangeNewCell(ev) {
    const {new_row} = this.state;
    let field = ev.target;
    let value = field.value;
    
    if (ev.target.type === 'datetime') {
      value = value.valueOf() / 1000;
    }
    
    new_row[field.id] = value;
    
    this.setState({
      new_row: new_row
    });
  }
  
  saveNewRow(ev) {
    const {trackId} = this.props;
    ev.preventDefault();
    const new_row = {...this.state.new_row};
    this.setState({new_row: {...this.new_row}});
    
    this.props.onSave(trackId, new_row.location_id);
  }
  
  render() {
    const {locations, days, trackId, summitTZ} = this.props;
    const {rows, new_row} = this.state;
    
    return (
      <div>
        <table className="table table-striped table-bordered table-hover trackTimeframesTable">
          <thead>
          <tr>
            <th style={{width: '40%'}}>{T.translate("track_timeframes.location")}</th>
            <th style={{width: '40%'}}>{T.translate("track_timeframes.timeframes")}</th>
            <th style={{width: '20%'}}>&nbsp;</th>
          </tr>
          </thead>
          <tbody>
          {rows.map((row, i) => {
            let rowClass = i % 2 === 0 ? 'even' : 'odd';
            
            return (
              <React.Fragment key={'row_' + row.id}>
                <tr id={row.id} role="row" className={rowClass}>
                  {createRow(row, this.actions, summitTZ)}
                </tr>
                {row.is_edit &&
                  <tr className="timeframesWrapper">
                    <td colSpan={3}>
                      <DayTimeframeTable
                        summitTZ={summitTZ}
                        trackId={trackId}
                        allowedLocationId={row.id}
                        days={days.filter(d => !row.allowed_timeframes.map(t => t.day).includes(d.value))}
                        data={row.allowed_timeframes.sort((a,b) => a.day - b.day)}
                      />
                    </td>
                  </tr>
                }
              </React.Fragment>
            );
          })}
          
          <tr id='new_row' key='new_row' className="odd">
            {createNewRow(new_row, this.newActions, locations)}
          </tr>
          </tbody>
        </table>
        <ReactTooltip delayShow={10}/>
      </div>
    );
  }
};

export default TrackTimeframeTable;
