/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import swal from "sweetalert2";
import SortableTable from "../../components/table-sortable/SortableTable";
import { getSummitById }  from '../../actions/summit-actions';
import { getLocations, deleteLocation, exportLocations, updateLocationOrder } from "../../actions/location-actions";

class LocationListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewLocation = this.handleNewLocation.bind(this);
        this.handleExport = this.handleExport.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getLocations();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getLocations();
        }
    }

    handleEdit(locationId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/${locationId}`);
    }

    handleExport(ev) {
        ev.preventDefault();
        this.props.exportLocations();
    }

    handleDelete(locationId, ev) {
        let {deleteLocation, locations} = this.props;
        let location = locations.find(p => p.id == locationId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("location_list.remove_warning") + ' ' + location.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteLocation(locationId);
            }
        }).catch(swal.noop);
    }

    handleNewLocation(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/locations/new`);
    }

    render(){
        let {currentSummit, locations, totalLocations} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("location_list.name") },
            { columnKey: 'class_name', value: T.translate("location_list.class_name") }
        ];

        let table_options = {
            className: "dataTable",
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(currentSummit == null) return null;

        locations = locations.sort(
            (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
        );

        return(
            <div className="container">
                <h3> {T.translate("location_list.location_list")} ({totalLocations})</h3>
                <div className={'row'}>
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewLocation}>
                            {T.translate("location_list.add_location")}
                        </button>
                        {/*<button className="btn btn-default" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>*/}
                    </div>
                </div>

                {locations.length == 0 &&
                <div>{T.translate("location_list.no_items")}</div>
                }

                {locations.length > 0 &&
                <div>
                    <SortableTable
                        options={table_options}
                        data={locations}
                        columns={columns}
                        dropCallback={this.props.updateLocationOrder}
                        orderField="order"
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentLocationListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocations,
        updateLocationOrder,
        deleteLocation,
        exportLocations
    }
)(LocationListPage);