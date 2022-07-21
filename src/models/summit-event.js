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
import { DefaultEventMinutesDuration } from '../utils/constants';
import moment from 'moment-timezone'

class SummitEvent {

    constructor(event, summit = null){
        this._event  = event;
        this._summit = summit;
    }

    set summit(summit){
        this._summit = summit;
    }

    get summit(){
        return this._summit;
    }

    getId(){
        return this._event.id;
    }

    isPublished(){
        return this._event.hasOwnProperty('is_published') && this._event.is_published;
    }

    getMinutesDuration(){
        if(this._event.hasOwnProperty('start_date') && this._event.hasOwnProperty('end_date')  && this._event.start_date != null && this._event.end_date != null ) {
            let eventStartDateTime = moment(this._event.start_date * 1000).tz(this._summit.time_zone.name);
            let eventEndDateTime   = moment(this._event.end_date * 1000).tz(this._summit.time_zone.name);
            return eventEndDateTime.diff(eventStartDateTime, 'minutes');
        }
        // default

        return DefaultEventMinutesDuration;
    }

    canMove(siblings, day, startTime){
        let duration       = DefaultEventMinutesDuration;
        // check if published to get real duration ...
        if(this.isPublished())
            duration = this.getMinutesDuration();

        let startDateTime   = moment.tz(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        let endDateTime     = moment.tz(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        endDateTime         = endDateTime.add(duration, 'minutes');

        // check siblings overlap
        for (let auxEvent of siblings.filter(item => item.id !== this.getId())) {
            let auxEventStartDateTime = moment(auxEvent.start_date * 1000).tz(this._summit.time_zone.name);
            let auxEventEndDateTime   = moment(auxEvent.end_date * 1000).tz(this._summit.time_zone.name);
            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        return true;
    }

    calculateNewDates(day, startTime, minutes){
        let newStarDateTime = moment.tz(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name);
        let newEndDateTime  = moment.tz(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm', this._summit.time_zone.name).add(minutes, 'minutes');
        return [newStarDateTime, newEndDateTime];
    }

    isValidEndDate(endDate){
        if(endDate == null) return true;
        let startDate       = moment.tz(this._event.start_date * 1000, this._summit.time_zone.name);
        endDate             = moment.tz(endDate * 1000, this._summit.time_zone.name);
        let summitEndDate   = moment.tz(this._summit.end_date * 1000, this._summit.time_zone.name);
        return endDate.isAfter(startDate) && (endDate.isBefore(summitEndDate) || endDate.isSame(summitEndDate));
    }

    isValidStartDate(startDate){
        if(startDate == null) return true;
        startDate           = moment.tz(startDate* 1000, this._summit.time_zone.name);
        let endDate         = moment.tz(this._event.end_date * 1000, this._summit.time_zone.name);
        let summitStartDate = moment.tz(this._summit.start_date * 1000, this._summit.time_zone.name);
        return moment.isMoment(startDate) && startDate.isAfter(summitStartDate) && startDate.isBefore(endDate);
    }

    isValidTitle(title){
        return title.trim() !== '';
    }

    isValid(){
        return this.isValidTitle(this._event.title)
            && this.isValidStartDate(this._event.start_date)
            && this.isValidEndDate(this._event.end_date);
    }

}

export default SummitEvent;
