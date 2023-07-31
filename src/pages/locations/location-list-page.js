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

import React, {useEffect} from 'react'
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {SortableTable, SummitDropdown} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getLocations, deleteLocation, exportLocations, updateLocationOrder, copyLocations } from "../../actions/location-actions";

const LocationListPage = ({currentSummit, history, locations, totalLocations, allSummits, ...props}) => {
    const summits = allSummits.filter(s => s.id !== currentSummit.id);

    useEffect(() => {
        if(currentSummit) {
            props.getLocations();
        }
    }, [currentSummit?.id]);

    if(!currentSummit.id) return(<div />);

    const handleEdit = (locationId) => {
        history.push(`/app/summits/${currentSummit.id}/locations/${locationId}`);
    }

    const handleDelete = (locationId) => {
        const location = locations.find(p => p.id === locationId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("location_list.remove_warning") + ' ' + location.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                props.deleteLocation(locationId);
            }
        });
    }

    const handleNewLocation = (ev) => {
        history.push(`/app/summits/${currentSummit.id}/locations/new`);
    }

    const handleCopyLocations = (fromSummitId) => {
        props.copyLocations(fromSummitId);
    };

    const columns = [
        { columnKey: 'name', value: T.translate("location_list.name") },
        { columnKey: 'class_name', value: T.translate("location_list.class_name") }
    ];

    const table_options = {
        actions: {
            edit: { onClick: handleEdit },
            delete: { onClick: handleDelete }
        }
    }

    const sortedLocations = locations.sort((a, b) => a.order - b.order);

    return(
        <div className="container">
            <h3> {T.translate("location_list.location_list")} ({totalLocations})</h3>
            <div className={'row'}>
                <div className="col-md-6 col-md-offset-6 text-right">
                    <button className="btn btn-primary right-space" onClick={handleNewLocation}>
                        {T.translate("location_list.add_location")}
                    </button>
                    <SummitDropdown
                        summits={summits}
                        onClick={handleCopyLocations}
                        actionLabel={T.translate("event_category_list.copy_categories")}
                    />
                </div>
            </div>

            {locations.length === 0 &&
                <div className="no-items">{T.translate("location_list.no_items")}</div>
            }

            {locations.length > 0 &&
                <div>
                    <SortableTable
                        options={table_options}
                        data={sortedLocations}
                        columns={columns}
                        dropCallback={props.updateLocationOrder}
                        orderField="order"
                    />
                </div>
            }

        </div>
    )
}

const mapStateToProps = ({ currentSummitState, currentLocationListState, directoryState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    allSummits      : directoryState.allSummits,
    ...currentLocationListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocations,
        updateLocationOrder,
        deleteLocation,
        exportLocations,
        copyLocations
    }
)(LocationListPage);
