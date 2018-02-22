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

import { createStore, applyMiddleware, compose} from 'redux';
import loggedUserReducer from './reducers/auth-reducer'
import baseReducer from './reducers/base-reducer'
import currentSummitReducer from './reducers/dashboard/current-summit-reducer';
import directoryReducer from './reducers/directory/directory-reducer';
import scheduleBuilderReducer from './reducers/events/schedule-builder-reducer';
import eventListReducer from './reducers/events/event-list-reducer';
import summitEventReducer from './reducers/events/summit-event-reducer';
import speakerListReducer from './reducers/speakers/speaker-list-reducer';
import speakerReducer from './reducers/speakers/speaker-reducer';
import speakerMergeReducer from './reducers/speakers/speaker-merge-reducer';
import summitEventBulkActionReducer from './reducers/events/summit-event-bulk-actions-reducer';
import attendeeListReducer from './reducers/attendees/attendee-list-reducer';
import attendeeReducer from './reducers/attendees/attendee-reducer';
import promocodeListReducer from './reducers/promocodes/promocode-list-reducer';
import promocodeReducer from './reducers/promocodes/promocode-reducer';
import speakerAttendanceListReducer from './reducers/speaker_attendance/speaker-attendance-list-reducer';
import speakerAttendanceReducer from './reducers/speaker_attendance/speaker-attendance-reducer';
import eventTypeListReducer from './reducers/events/event-type-list-reducer';
import eventTypeReducer from './reducers/events/event-type-reducer';
import eventCategoryListReducer from './reducers/events/event-category-list-reducer';
import eventCategoryReducer from './reducers/events/event-category-reducer';
import locationListReducer from './reducers/locations/location-list-reducer';
import locationReducer from './reducers/locations/location-reducer';


import thunk from 'redux-thunk';
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage' // default: localStorage if web, AsyncStorage if react-native

const config = {
    key: 'root',
    storage,
}

const reducers = persistCombineReducers(config, {
    loggedUserState: loggedUserReducer,
    baseState: baseReducer,
    directoryState: directoryReducer,
    currentSummitState: currentSummitReducer,
    currentScheduleBuilderState: scheduleBuilderReducer,
    currentSummitEventState: summitEventReducer,
    currentEventListState: eventListReducer,
    currentSpeakerListState: speakerListReducer,
    currentSpeakerState: speakerReducer,
    currentSpeakerMergeState: speakerMergeReducer,
    summitEventsBulkActionsState: summitEventBulkActionReducer,
    currentAttendeeListState: attendeeListReducer,
    currentAttendeeState: attendeeReducer,
    currentPromocodeListState: promocodeListReducer,
    currentPromocodeState: promocodeReducer,
    currentSpeakerAttendanceListState: speakerAttendanceListReducer,
    currentSpeakerAttendanceState: speakerAttendanceReducer,
    currentEventTypeListState: eventTypeListReducer,
    currentEventTypeState: eventTypeReducer,
    currentEventCategoryListState: eventCategoryListReducer,
    currentEventCategoryState: eventCategoryReducer,
    currentLocationListState: locationListReducer,
    currentLocationState: locationReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

const onRehydrateComplete = () => {
    // repopulate access token on global access variable
    window.accessToken = store.getState().loggedUserState.accessToken;
}

export const persistor = persistStore(store, null, onRehydrateComplete);
export default store;