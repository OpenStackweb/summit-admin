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
import React from 'react';
import moment from 'moment-timezone';

class ScheduleAdminEmptySpotsList extends React.Component
{


    render(){

        let {emptySpots, currentSummit, onClickSpot } = this.props;

        let emptySpotsItems = [];
        let lastLocation    = null;
        let idx             = 1;
        for(let spot of emptySpots){
            if(lastLocation == null || lastLocation.id != spot.location_id) {
                lastLocation = currentSummit.locations.filter((location) => location.id == spot.location_id).shift();
                emptySpotsItems.push(<li key={idx} className="empty-spot-location"><h2>{ lastLocation.name }</h2></li>)
                ++idx;
            }
            let start_date = moment.tz(spot.start_date * 1000, currentSummit.time_zone.name);
            let end_date   = moment.tz(spot.end_date * 1000, currentSummit.time_zone.name);

            emptySpotsItems.push(<li key={idx}><div title="Click to navigate to empty spot ..." className="empty-spot" onClick={() => onClickSpot(spot)}>
                From&nbsp;<span className="from">{start_date.format('YYYY-MM-DD hh:mm')}</span>
                To&nbsp;<span className="to">{end_date.format('YYYY-MM-DD hh:mm')}</span>
                &nbsp;-&nbsp;Empty Spot&nbsp;(<span className="gap">{spot.total_minutes} minutes</span>)
            </div>
            </li>);
            ++idx;
        }

        return (
            <ul className="empty-spots-list">
                {emptySpotsItems}
            </ul>
        )
    }
}

export default ScheduleAdminEmptySpotsList;