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

class ScheduleAdminEmptySpotsList extends React.Component
{

    render(){

        let {emptySpots} = this.props;


        return (
            <ul>
                {
                    emptySpots.map((spot, idx) => (
                        <li>
                            <div>
                                {spot.location_id}
                                {spot.start_date}
                                {spot.end_date}
                                {spot.total_minutes}
                            </div>
                        </li>
                    ))
                }
            </ul>
        )
    }
}

export default ScheduleAdminEmptySpotsList;