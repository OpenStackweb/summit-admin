import { createStore, applyMiddleware, compose} from 'redux';
import loggedUserReducer from './reducers/auth-reducer'
import baseReducer from './reducers/base-reducer'
import currentSummitReducer from './reducers/current-summit-reducer';
import directoryReducer from './reducers/directory-reducer';
import scheduleBuilderReducer from './reducers/schedule-builder-reducer';

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
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

export const persistor = persistStore(store);
export default store;