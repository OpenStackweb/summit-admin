import React from 'react';
import AffiliationsActionsTableCell from './AffiliationsActionsTableCell';
import { CompanyInput, DateTimePicker } from 'openstack-uicore-foundation/lib/components'
import { epochToMoment, formatEpoch } from 'openstack-uicore-foundation/lib/methods'
import T from "i18n-react/dist/i18n-react";


import './affiliationstable.css';

const createRow = (row, actions) => {
    var cells = [];

    if (row.is_edit) {
        cells = [
            <td key="job_title">
                <input id="job_title" className="form-control" value={row.job_title} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>,
            <td key="organization">
                <CompanyInput
                    id="organization"
                    value={{name: row.organization.name, value: row.organization.id}}
                    onChange={actions.handleChange.bind(this, row.id)}
                    multi={false}
                />
            </td>,
            <td key="start_date">
                <DateTimePicker
                    id="start_date"
                    onChange={actions.handleChange.bind(this, row.id)}
                    format={{date:"YYYY-MM-DD", time: false}}
                    timezone={'UTC'}
                    value={epochToMoment(row.start_date)}
                />
            </td>,
            <td key="end_date">
                <DateTimePicker
                    id="end_date"
                    onChange={actions.handleChange.bind(this, row.id)}
                    format={{date:"YYYY-MM-DD", time: false}}
                    timezone={'UTC'}
                    value={epochToMoment(row.end_date)}
                />
            </td>,
            <td key="is_current">
                <input id="is_current" type="checkbox" checked={row.is_current} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>
        ]
    } else {
        cells = [
            <td key="job_title">{row.job_title}</td>,
            <td key="organization">{row.organization.name}</td>,
            <td key="start_date">{formatEpoch(row.start_date,"YYYY-MM-DD")}</td>,
            <td key="end_date">{formatEpoch(row.end_date,"YYYY-MM-DD")}</td>,
            <td key="is_current">{row.is_current ? 'Yes' : 'No'}</td>
        ]
    }


    if (actions) {
        cells.push(<AffiliationsActionsTableCell key={'actions_' + row.id} id={row.id} actions={actions}/>);
    }

    return cells;
};

const createNewRow = (row, addNew, handleChange) => {
    let cells = [
        <td key="new_job_title">
            <input id="job_title" className="form-control" value={row.job_title} onChange={handleChange}/>
        </td>,
        <td key="new_organization">
            <CompanyInput
                id="organization"
                value={row.organization}
                onChange={handleChange}
                multi={false}
            />
        </td>,
        <td key="new_start_date">
            <DateTimePicker
                id="start_date"
                onChange={handleChange}
                format={{date:"YYYY-MM-DD", time: false}}
                timezone={'UTC'}
                value={epochToMoment(row.start_date)}
            />
        </td>,
        <td key="new_end_date">
            <DateTimePicker
                id="end_date"
                onChange={handleChange}
                format={{date:"YYYY-MM-DD", time: false}}
                timezone={'UTC'}
                value={epochToMoment(row.end_date)}
            />
        </td>,
        <td key="new_is_current">
            <input id="is_current" type="checkbox" checked={row.is_current} onChange={handleChange}/>
        </td>
    ];

    cells.push(
        <td key='add_new'>
            <button className="btn btn-default" onClick={addNew}> Add </button>
        </td>
    );

    return cells;
};


export default class AffiliationsTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rows: props.data,
            new_row: {
                owner_id: this.props.ownerId,
                job_title: '',
                organization: {name: '', value: 0},
                start_date: '',
                end_date: '',
                is_current: 0
            }
        };

        this.actions = {};
        this.actions.edit = this.editRow.bind(this);
        this.actions.save = this.saveRow.bind(this);
        this.actions.delete = this.deleteClick.bind(this);
        this.actions.handleChange = this.onChangeCell.bind(this);
        this.actions.cancel = this.editRowCancel.bind(this);

        this.saveNewRow = this.saveNewRow.bind(this);
        this.handleNewChange = this.onChangeNewCell.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ rows: nextProps.data });
    }

    saveRow(id, ev) {
        const { rows } = this.state;
        let row = rows.find(r => r.id == id);
        row.is_edit = false;

        this.editing_row = null;

        this.setState({
            rows: rows
        });

        let affiliation = {...row};

        if (!affiliation.end_date || affiliation.is_current) {
            affiliation.end_date = null;
        }

        delete affiliation.last_edited;
        delete affiliation.is_edit;
        delete affiliation.created;

        this.props.onSave(affiliation);
    }

    deleteClick(id) {
        this.props.onDelete(this.props.ownerId, id);
    }

    editRow(id, ev) {
        const { rows } = this.state;
        let row = rows.find(r => r.id == id);

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

        let rowIdx = rows.findIndex(r => r.id == id);

        rows[rowIdx] = this.editing_row;

        this.setState({
            rows: rows
        });
    }

    onChangeCell(id, ev) {
        const { rows } = this.state;
        let field = ev.target;
        let row = rows.find(r => r.id == id);
        let value = field.value;

        if (field.type == 'checkbox') {
            value = field.checked;
        }

        if (ev.target.type == 'datetime') {
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

        if (field.type == 'checkbox') {
            value = field.checked;
        }

        if (ev.target.type == 'datetime') {
            value = value.valueOf() / 1000;
        }

        new_row[field.id] = value;

        this.setState({
            new_row: new_row
        });
    }

    saveNewRow(ev) {
        let new_row = {...this.state.new_row};
        new_row.owner_id = this.props.ownerId;

        this.props.onAdd(new_row);

        this.setState({
            new_row: {
                owner_id: this.props.ownerId,
                job_title: '',
                organization: {name: '', value: 0},
                start_date: '',
                end_date: '',
                is_current: 0
            }
        });
    }

    render() {

        return (
            <div>
                <table className="table table-striped table-bordered table-hover dataTable">
                    <thead>
                        <tr>
                            <th>{T.translate("affiliations.title")}</th>
                            <th>{T.translate("affiliations.organization")}</th>
                            <th>{T.translate("affiliations.start_date")}</th>
                            <th>{T.translate("affiliations.end_date")}</th>
                            <th>{T.translate("affiliations.is_current")}</th>
                            <th>{T.translate("affiliations.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.rows.map((row,i) => {
                            let rowClass = i%2 === 0 ? 'even' : 'odd';

                            return (
                                <tr id={row.id} key={'row_' + row.id} role="row" className={rowClass}>
                                    {createRow(row, this.actions)}
                                </tr>
                            );
                        })}

                        <tr id='new_row' key='new_row' className="odd">
                            {createNewRow(this.state.new_row, this.saveNewRow, this.handleNewChange)}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
};
