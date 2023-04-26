import React from 'react';
import { connect } from 'react-redux';
import BannersActionsTableCell from './BannersActionsTableCell';
import { DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import {saveBanner, deleteBanner, publishDate} from "../../../actions/signage-actions"
import T from "i18n-react/dist/i18n-react";
import ReactTooltip from "react-tooltip";

import './bannerstable.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {shallowEqual} from "../../../utils/methods";

const createRow = (row, actions, summitTz) => {
    var cells = [];

    if (row.is_edit) {
        cells = [
            <td key="id">{row.id}</td>,
            <td key="title">
                <input id="title" className="form-control" value={row.title} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>,
            <td key="content">
                <input id="content" className="form-control" value={row.content} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>,
            <td key="type">
                {row.type}
            </td>,
            <td key="location_id">
                {row.floor_loc}
            </td>,
            <td key="start_date">
                <DateTimePicker
                    id="start_date"
                    onChange={actions.handleChange.bind(this, row.id)}
                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                    timezone={summitTz}
                    value={epochToMomentTimeZone(row.start_date, summitTz)}
                />
            </td>,
            <td key="end_date">
                <DateTimePicker
                    id="end_date"
                    onChange={actions.handleChange.bind(this, row.id)}
                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                    timezone={summitTz}
                    value={epochToMomentTimeZone(row.end_date, summitTz)}
                />
            </td>
        ]
    } else {
        cells = [
            <td key="id">{row.id}</td>,
            <td key="title">{row.title}</td>,
            <td key="content">{row.content}</td>,
            <td key="type">{row.type}</td>,
            <td key="location_id">{row.floor_loc}</td>,
            <td key="start_date">{row.start_date_str}</td>,
            <td key="end_date">{row.end_date_str}</td>
        ]
    }


    if (actions) {
        cells.push(<BannersActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions}/>);
    }

    return cells;
};

const createNewRow = (row, actions, summitTz, roomName) => {
    let cells = [
        <td key="new_id">TBD</td>,
        <td key="new_title">
            <input id="title" className="form-control" value={row.title} onChange={actions.handleChange}/>
        </td>,
        <td key="new_content">
            <input id="content" className="form-control" value={row.content} onChange={actions.handleChange}/>
        </td>,
        <td key="new_type">
            Primary
        </td>,
        <td key="new_location_id">
            {roomName}
        </td>,
        <td key="new_start_date">
            <DateTimePicker
                id="start_date"
                onChange={actions.handleChange}
                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                timezone={summitTz}
                value={epochToMomentTimeZone(row.start_date, summitTz)}
            />
        </td>,
        <td key="new_end_date">
            <DateTimePicker
                id="end_date"
                onChange={actions.handleChange}
                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                timezone={summitTz}
                value={epochToMomentTimeZone(row.end_date, summitTz)}
            />
        </td>
    ];

    cells.push(
        <td key='add_new'>
            <button className="btn btn-default" onClick={actions.save}> Add </button>
        </td>
    );

    return cells;
};


class BannersTable extends React.Component {

    constructor(props) {
        super(props);

        this.new_row = {
            title: '',
            content: '',
            type: 'Primary',
            start_date: '',
            end_date: '',
            class_name: 'ScheduledSummitLocationBanner',
            enabled: true,
        };

        this.state = {
            rows: props.data,
            new_row: {...this.new_row},
        };

        this.actions = {};
        this.actions.edit = this.editRow.bind(this);
        this.actions.save = this.saveRow.bind(this);
        this.actions.delete = this.deleteClick.bind(this);
        this.actions.handleChange = this.onChangeCell.bind(this);
        this.actions.cancel = this.editRowCancel.bind(this);
        this.actions.jump = this.jumpTo.bind(this);

        this.newActions = {};
        this.newActions.save = this.saveNewRow.bind(this);
        this.newActions.handleChange = this.onChangeNewCell.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!shallowEqual(this.props.data, prevProps.data)) {
            this.setState({rows: this.props.data})
        }
    }

    saveRow(id) {
        const { rows } = this.state;
        let row = rows.find(r => r.id === id);
        row.is_edit = false;

        this.editing_row = null;

        this.setState({
            rows: rows
        });

        this.props.saveBanner(row);
    }

    deleteClick(id) {
        this.props.deleteBanner(id);
    }

    editRow(id, ev) {
        const { rows } = this.state;
        let row = rows.find(r => r.id === id);

        //save editing row for cancel
        this.editing_row = {...row};

        row.is_edit = true;

        this.setState({
            rows: rows
        });
    }

    editRowCancel(id, ev) {
        const { rows } = this.state;
        rows.forEach(r => {
            r.is_edit = false;
        });

        let rowIdx = rows.findIndex(r => r.id === id);

        rows[rowIdx] = this.editing_row;

        this.setState({
            rows: rows
        });
    }

    onChangeCell(id, ev) {
        const { rows } = this.state;
        let field = ev.target;
        let row = rows.find(r => r.id === id);
        let value = field.value;

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        row[field.id] = value;

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
        ev.preventDefault();
        const new_row = {...this.state.new_row};
        this.setState({ new_row: {...this.new_row }});

        this.props.saveBanner(new_row);
    }
    
    jumpTo(id) {
        const { rows } = this.state;
        const row = rows.find(r => r.id === id);
        this.props.publishDate(row.start_date);
    }

    render() {
        const {room, summitTz} = this.props;
        
        return (
            <div>
                <table className="table table-striped table-bordered table-hover bannersTable">
                    <thead>
                        <tr>
                            <th style={{width: '5%'}}>{T.translate("signage.id")}</th>
                            <th style={{width: '15%'}}>{T.translate("signage.title")}</th>
                            <th style={{width: '20%'}}>{T.translate("signage.content")}</th>
                            <th style={{width: '10%'}}>{T.translate("signage.type")}</th>
                            <th style={{width: '15%'}}>{T.translate("signage.floor_loc")}</th>
                            <th style={{width: '15%'}}>{T.translate("signage.start_date")}</th>
                            <th style={{width: '15%'}}>{T.translate("signage.end_date")}</th>
                            <th style={{width: '5%'}}>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.rows.map((row,i) => {
                            let rowClass = i%2 === 0 ? 'even' : 'odd';

                            return (
                                <tr id={row.id} key={'row_' + row.id} role="row" className={rowClass}>
                                    {createRow(row, this.actions, summitTz)}
                                </tr>
                            );
                        })}

                        <tr id='new_row' key='new_row' className="odd">
                            {createNewRow(this.state.new_row, this.newActions, summitTz, room.name)}
                        </tr>
                    </tbody>
                </table>
                <ReactTooltip delayShow={10} />
            </div>
        );
    }
};

const mapStateToProps = ({ currentSummitState }) => ({
    summitTz: currentSummitState.currentSummit.time_zone_id,
})

export default connect (
  mapStateToProps,
    {
        saveBanner,
        deleteBanner,
        publishDate
    }
)(BannersTable);
