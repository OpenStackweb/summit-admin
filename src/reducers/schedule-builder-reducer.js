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
import
{
    REQUEST_UNSCHEDULE_EVENTS_PAGE,
    RECEIVE_UNSCHEDULE_EVENTS_PAGE,
    REQUEST_PUBLISH_EVENT,
    LOGOUT_USER,
    SET_CURRENT_SUMMIT
} from '../actions';
import moment from 'moment';
import SummitEvent from '../models/summit-event';

const DEFAULT_STATE = {
    scheduleEvents:  [],
    unScheduleEvents: [],
    childScheduleEvents:[],
};

const scheduleBuilderReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_UNSCHEDULE_EVENTS_PAGE:
            let { data } = payload.response;
            return {...state,  unScheduleEvents:data };
        case REQUEST_PUBLISH_EVENT:
            let { event, startTime, day, minutes } = payload;

            let eventModel        = new SummitEvent(event);
            let eventStarDateTime = moment(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm');
            let eventEndDateTime  = moment(day+' '+startTime.format('HH:mm'), 'YYYY-MM-DD HH:mm').add(minutes, 'minutes');
            console.log(`publishing event ${event.title} - ${event.id} - start date ${eventStarDateTime.format()} - end date ${eventEndDateTime.format()}`);
            // published
            if(eventModel.isPublished()){
                if(eventModel.isChildEvent()){
                    event = {...event,
                        start_datetime: eventStarDateTime.valueOf(),
                        end_datetime: eventEndDateTime.valueOf(),
                    };

                    // remove from schedule events (possible)
                    let scheduleEvents = state.scheduleEvents.filter(evt => evt.id !== event.id);

                    // update parent sub events ...
                    scheduleEvents = scheduleEvents.map(
                        evt => {
                            return evt.id === event.parentId ? // found parent
                                {
                                    ...evt,
                                    // update sub event
                                    subEvents: evt.subEvents.map(subEvent => { return subEvent.id === event.id ?  event: subEvent; } )
                                }
                                : evt;
                        }
                    );
                    // update child events
                    let childScheduleEvents = state.childScheduleEvents.map(evt => { return evt.id === event.id ?  event: evt; });

                    if(eventModel.wasMain()){
                        // add to parent sub events
                        let {formerParentId, ...eventClone} = event; // remove formerParentId attr
                        scheduleEvents = scheduleEvents.map(evt => { return evt.id === eventClone.parentId ?  {...evt, subEvents: [...evt.subEvents,
                            {...eventClone,
                                start_datetime: eventStarDateTime.valueOf(),
                                end_datetime: eventEndDateTime.valueOf(),
                                published: true,
                            }
                        ] }: evt; });

                        childScheduleEvents = [...childScheduleEvents, {...eventClone,
                            start_datetime: eventStarDateTime.valueOf(),
                            end_datetime: eventEndDateTime.valueOf(),
                            published: true,
                        }]
                    }

                    return {...state, scheduleEvents, childScheduleEvents};
                }

                if(eventModel.hasChilds()){
                    eventModel.recalculateChilds(day, startTime);
                }

                // former child event
                if(eventModel.wasChild()){
                    // remove child from parent
                    let scheduleEvents      = state.scheduleEvents.map(item => eventModel.getFormerParentId() === item.id ? {...item, subEvents: item.subEvents.filter(subEvent => { return subEvent.id !== event.id } )} : item );
                    // remove from child
                    let childScheduleEvents = state.childScheduleEvents.filter( item => item.id !== event.id);
                    // add to main schedule events
                    let {formerParentId, ...eventClone} = event; // remove formerParentId attr
                    scheduleEvents    = [...scheduleEvents, {...eventClone,  start_datetime: eventStarDateTime.valueOf(), end_datetime: eventEndDateTime.valueOf(), published: true, subEvents: [],}];
                    return {...state, scheduleEvents, childScheduleEvents};
                }

                let scheduleEvents = state.scheduleEvents.map(evt => { return evt.id === event.id ?  {...event, start_datetime: eventStarDateTime.valueOf(), end_datetime: eventEndDateTime.valueOf(), published: true}: evt; })
                return {...state, scheduleEvents};
            }

            // not published

            // remove from no scheduled events
            let unScheduleEvents =  state.unScheduleEvents.filter(item => event.id !== item.id);
            if(eventModel.isChildEvent()){
                // add to parent sub-collection
                let scheduleEvents = state.scheduleEvents.map(evt => { return evt.id === event.parentId ?  {...evt, subEvents: [...evt.subEvents,
                    {...event,
                        start_datetime: eventStarDateTime.valueOf(),
                        end_datetime: eventEndDateTime.valueOf(),
                        published: true,
                    }
                ] }: evt; });


                return {...state,
                    scheduleEvents,
                    unScheduleEvents,
                    childScheduleEvents: [...state.childScheduleEvents, {...event,
                        start_datetime: eventStarDateTime.valueOf(),
                        end_datetime: eventEndDateTime.valueOf(),
                        published: true,
                    }]
                };
            }
            // main
            return {...state,
                scheduleEvents: [...state.scheduleEvents,
                    {...event,
                        start_datetime: eventStarDateTime.valueOf(),
                        end_datetime: eventEndDateTime.valueOf(),
                        published: true,
                        subEvents: [],
                    }
                ],
                unScheduleEvents
            };
        case LOGOUT_USER:
        case SET_CURRENT_SUMMIT:
            return DEFAULT_STATE;
        default:
            return state;
    }
};

export default scheduleBuilderReducer;
