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
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {Table} from "openstack-uicore-foundation/lib/components";
import {getTrackTimeframes, deleteTrackTimeframe} from "../../actions/track-timeframes-actions";

const TrackTimeframeListPage = ({currentSummit, match, history, tracksTimeframes, ...props}) => {
  
  useEffect(() => {
    props.getTrackTimeframes();
  }, []);
  const handleEdit = (track_id) => {
    history.push(`/app/summits/${currentSummit.id}/track-chairs/track-timeframes/${track_id}`);
  }
  
  const handleDelete = (trackId) => {
    const track = tracksTimeframes.find(t => t.id === trackId);
    
    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("track_timeframes.remove_warning") + ' ' + track.name,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function(result){
      if (result.value) {
        props.deleteTrackTimeframe(trackId);
      }
    });
  }
  
  const handleNew = () => {
    history.push(`/app/summits/${currentSummit.id}/track-chairs/track-timeframes/new`);
  }
  
  const columns = [
    { columnKey: 'name', value: T.translate("track_timeframes.track") },
    { columnKey: 'locationsStr', value: T.translate("track_timeframes.locations") },
  ];
  
  const table_options = {
    sortCol: 'name',
    sortDir: 1,
    actions: {
      edit: { onClick: handleEdit },
      delete: { onClick: handleDelete }
    }
  }
  
  return (
      <div className="container">
        <h3>Tracks with timeframes restrictions</h3>
        <div className="row">
          <div className="col-md-6 text-right col-md-offset-6">
            <button className="btn btn-primary right-space" onClick={handleNew}>
              {T.translate("track_timeframes.add_new")}
            </button>
          </div>
        </div>
        
        {tracksTimeframes.length === 0 &&
          <div>{T.translate("track_timeframes.no_items")}</div>
        }
  
        {tracksTimeframes.length > 0 &&
          <Table
            options={table_options}
            data={tracksTimeframes}
            columns={columns}
          />
        }
        
      </div>
  )
}

const mapStateToProps = ({currentSummitState, trackTimeframesListState}) => ({
  currentSummit: currentSummitState.currentSummit,
  ...trackTimeframesListState
});

export default connect(
  mapStateToProps,
  {getTrackTimeframes, deleteTrackTimeframe }
)(TrackTimeframeListPage);
