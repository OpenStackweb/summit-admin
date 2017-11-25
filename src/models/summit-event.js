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
import moment from 'moment';
import { PixelsPerMinute, DefaultEventMinutesDuration } from './../constants';

class SummitEvent {

    constructor(event){
        this.event = event;
    }

    getId(){
        return this.event.id;
    }

    isPublished(){
        return this.event.hasOwnProperty('published') && this.event.published;
    }

    getMinutesDuration(){
        if(this.event.hasOwnProperty('start_datetime') && this.event.hasOwnProperty('end_datetime') ) {
            let eventStartDateTime = moment(this.event.start_datetime, 'YYYY-MM-DD HH:mm');
            let eventEndDateTime = moment(this.event.end_datetime, 'YYYY-MM-DD HH:mm');
            return eventEndDateTime.diff(eventStartDateTime, 'minutes');
        }
        // default duration is 5 minutes

        return DefaultEventMinutesDuration;
    }

    isChildEvent(){
        return this.event.parentId > 0;
    }

    getParentId(){
        return this.event.parentId;
    }

    hasChilds(){
        return this.event.parentId == 0 && this.event.hasOwnProperty('subEvents') && this.event.subEvents.length > 0;
    }

    recalculateChilds(day, startTime){
        // we need to recalculate sub events
        let newStartDateTime    = moment(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
        let formerStartDateTime = moment(this.event.start_datetime, 'YYYY-MM-DD HH:mm');
        for(let subEvent of this.event.subEvents){
            let deltaMinutesStart     = moment.duration(newStartDateTime.diff(formerStartDateTime)).asMinutes();
            let subEventStartDateTime = moment(subEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let subEventEndDateTime   = moment(subEvent.end_datetime, 'YYYY-MM-DD HH:mm');
            let subEventMinutes       = moment.duration( subEventEndDateTime.diff(subEventStartDateTime)).asMinutes();
            let subEventNewStartTime  = subEventStartDateTime.add(deltaMinutesStart, 'minutes');
            subEventNewStartTime      = moment(subEventNewStartTime.format('HH:mm'), 'HH:mm');
            let newSubEventStartDate  = moment(day+' '+subEventNewStartTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
            let newSubEventEndDate    = moment(day+' '+subEventNewStartTime.format('HH:mm'), 'YYYY-MM-DD HH:mm').add(subEventMinutes, 'minutes');
            this.event.subEvents = this.event.subEvents.map(evt => { return evt.id === subEvent.id ?  {...subEvent,start_datetime:newSubEventStartDate, end_datetime:newSubEventEndDate}: evt; });
        }
    }

    canMoveMain(siblings, day, startTime){
        let duration       = DefaultEventMinutesDuration;
        // check if published to get real duration ...
        if(this.isPublished())
            duration = this.getMinutesDuration();

        let startDateTime   = moment(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
        let endDateTime     = moment(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
        endDateTime         = endDateTime.add(duration, 'minutes');

        // check siblings overlap
        for (let auxEvent of siblings.filter(item => item.id !== this.getId())) {
            let auxEventStartDateTime = moment(auxEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let auxEventEndDateTime   = moment(auxEvent.end_datetime, 'YYYY-MM-DD HH:mm');
            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        return true;
    }

    canMoveChild(parentEvent, day, startTime){
        let duration       = DefaultEventMinutesDuration;
        // check if published to get real duration ...
        if(this.isPublished())
            duration = this.getMinutesDuration();
        // check if published to get real duration ...
        let filteredEvents  = parentEvent.subEvents.filter( evt => { return evt.id !== this.event.id;});
        let parentStartDate = moment(parentEvent.start_datetime, 'YYYY-MM-DD HH:mm');
        let parentEndDate   = moment(parentEvent.end_datetime, 'YYYY-MM-DD HH:mm');

        let startDateTime   = moment(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
        let endDateTime     = moment(day+' '+ startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
        endDateTime         = endDateTime.add(duration, 'minutes');

        // check parent bounds
        if(startDateTime.isBefore(parentStartDate) || endDateTime.isAfter(parentEndDate))
            return false;

        // check siblings overlap
        for (let auxEvent of filteredEvents) {
            let auxEventStartDateTime = moment(auxEvent.start_datetime, 'YYYY-MM-DD HH:mm');
            let auxEventEndDateTime   = moment(auxEvent.end_datetime, 'YYYY-MM-DD HH:mm');
            // if time segments overlap
            if(auxEventStartDateTime.isBefore(endDateTime) && auxEventEndDateTime.isAfter(startDateTime))
                return false;
        }

        return true;
    }

    wasMain(){
        return this.event.hasOwnProperty('formerParentId') && this.event.formerParentId == 0;
    }

    wasChild(){
        return this.event.hasOwnProperty('formerParentId') && this.event.formerParentId > 0;
    }

    getFormerParentId(){
        return this.event.formerParentId;
    }

}

export default SummitEvent;