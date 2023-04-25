import React from 'react';
import { connect } from 'react-redux';
import AffiliationsActionsTableCell from './AffiliationsActionsTableCell';
import { DateTimePicker, OrganizationInput } from 'openstack-uicore-foundation/lib/components'
import { epochToMoment, formatEpoch } from 'openstack-uicore-foundation/lib/utils/methods'
import { addAffiliation, saveAffiliation, deleteAffiliation, addOrganization } from "../../../actions/member-actions"
import T from "i18n-react/dist/i18n-react";
import ReactTooltip from "react-tooltip";

import './affiliationstable.css';
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {shallowEqual} from "../../../utils/methods";

const createRow = (row, actions) => {
    var cells = [];
    var org_value = (row.organization) ? row.organization : null;

    if (row.is_edit) {
        cells = [
            <td key="job_title">
                <input id="job_title" className="form-control" value={row.job_title} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>,
            <td key="organization">
                <OrganizationInput
                    id="organization"
                    value={org_value}
                    onChange={actions.handleChange.bind(this, row.id)}
                    allowCreate
                    onCreate={actions.addOrganization}
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
            <td key="is_current" className="is-current-cell">
                <input id="is_current" type="checkbox" checked={row.is_current} onChange={actions.handleChange.bind(this, row.id)}/>
            </td>
        ]
    } else {
        cells = [
            <td key="job_title">{row.job_title}</td>,
            <td key="organization">{row.organization ? row.organization.name : ''}</td>,
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

const createNewRow = (row, actions) => {
    let cells = [
        <td key="new_job_title">
            <input id="job_title" className="form-control" value={row.job_title} onChange={actions.handleChange}/>
        </td>,
        <td key="new_organization">
            <OrganizationInput
                id="organization"
                value={row.organization}
                onChange={actions.handleChange}
                allowCreate
                onCreate={actions.addOrganization}
            />
        </td>,
        <td key="new_start_date">
            <DateTimePicker
                id="start_date"
                onChange={actions.handleChange}
                format={{date:"YYYY-MM-DD", time: false}}
                timezone={'UTC'}
                value={epochToMoment(row.start_date)}
            />
        </td>,
        <td key="new_end_date">
            <DateTimePicker
                id="end_date"
                onChange={actions.handleChange}
                format={{date:"YYYY-MM-DD", time: false}}
                timezone={'UTC'}
                value={epochToMoment(row.end_date)}
            />
        </td>,
        <td key="new_is_current" className="is-current-cell">
            <input id="is_current" type="checkbox" checked={row.is_current} onChange={actions.handleChange}/>
        </td>
    ];

    cells.push(
        <td key='add_new'>
            <button type="button" className="btn btn-default" onClick={actions.save}> Add </button>
        </td>
    );

    return cells;
};


class AffiliationsTable extends React.Component {

    constructor(props) {
        super(props);

        this.new_row = {
            owner_id: props.ownerId,
            job_title: '',
            organization: null,
            start_date: '',
            end_date: '',
            is_current: 0
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
        this.actions.addOrganization = props.addOrganization;

        this.newActions = {};
        this.newActions.save = this.saveNewRow.bind(this);
        this.newActions.handleChange = this.onChangeNewCell.bind(this);
        this.newActions.addOrganization = props.addOrganization;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!shallowEqual(this.props.data, prevProps.data)) {
            this.setState({rows: this.props.data})
        }

        if (this.props.ownerId !== prevProps.ownerId) {
            this.setState({owner_id: this.props.ownerId});
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

        this.props.saveAffiliation(row);
    }

    deleteClick(id) {
        this.props.deleteAffiliation(this.props.ownerId, id);
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

        if (field.type === 'checkbox') {
            value = field.checked;
        }

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

        if (field.type === 'checkbox') {
            value = field.checked;
        }

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

        let new_row = {...this.state.new_row};
        new_row.owner_id = this.props.ownerId;

        this.setState({ new_row: {...this.new_row }});

        this.props.addAffiliation(new_row);
    }

    render() {

        return (
            <div>
                <table className="table table-striped table-bordered table-hover affiliationsTable">
                    <thead>
                        <tr>
                            <th style={{width: '20%'}}>{T.translate("affiliations.title")}</th>
                            <th style={{width: '20%'}}>{T.translate("affiliations.organization")}</th>
                            <th style={{width: '15%'}}>{T.translate("affiliations.start_date")}</th>
                            <th style={{width: '15%'}}>{T.translate("affiliations.end_date")}</th>
                            <th style={{width: '10%'}}>{T.translate("affiliations.is_current")}</th>
                            <th style={{width: '10%'}}>{T.translate("affiliations.actions")}</th>
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
                            {createNewRow(this.state.new_row, this.newActions)}
                        </tr>
                    </tbody>
                </table>
                <ReactTooltip delayShow={10} />
            </div>
        );
    }
};

export default connect (
    null,
    {
        addAffiliation,
        saveAffiliation,
        deleteAffiliation,
        addOrganization
    }
)(AffiliationsTable);
