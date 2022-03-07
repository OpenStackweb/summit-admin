import {
    authErrorHandler,
    createAction,
    getCSV,
    getRequest,
    startLoading, stopLoading
} from "openstack-uicore-foundation/lib/methods";

export const REQUEST_PRESENTATION_VOTES = 'REQUEST_PRESENTATION_VOTES';
export const RECEIVE_PRESENTATION_VOTES = 'RECEIVE_PRESENTATION_VOTES';
export const REQUEST_ATTENDEES_VOTES = 'REQUEST_ATTENDEES_VOTES';
export const RECEIVE_ATTENDEES_VOTES = 'RECEIVE_ATTENDEES_VOTES';
export const CLEAR_VOTES = 'CLEAR_VOTES';

export const getPresentationsVotes =
    (
        page = 1,
        perPage = 10,
        order = 'votes_count',
        orderDir = 0,
        extraFilters = []
    ) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    let filter = ['published==1','votes_count>0'];

    dispatch(startLoading());

    const params = {
        expand: 'voters',
        fields: 'id,title,votes_count,custom_order',
        relations: 'none',
        page: page,
        per_page: perPage,
        access_token: accessToken,
    };

    if(extraFilters.length > 0){
        filter = [...filter, ...extraFilters];
    }

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }
    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_PRESENTATION_VOTES),
        createAction(RECEIVE_PRESENTATION_VOTES),
        `${window.API_BASE_URL}/api/v2/summits/${currentSummit.id}/presentations/voteable`,
        authErrorHandler,
        {order, orderDir, summitId : currentSummit.id }
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
};

export const getAttendeeVotes =
    (
        page = 1,
        perPage = 10,
        order = 'presentation_votes_count',
        orderDir = 0,
        extraFilters = []
    ) => (dispatch, getState) => {

        const {loggedUserState, currentSummitState} = getState();
        const {accessToken} = loggedUserState;
        const {currentSummit} = currentSummitState;
        let filter = ['presentation_votes_count>0'];

        dispatch(startLoading());

        const params = {
            expand: 'presentation_votes,presentation_votes.presentation',
            fields: 'first_name,last_name,votes_count,presentation_votes.presentation.id,presentation_votes.presentation.title',
            relations: 'presentation_votes,presentation_votes.presentation.none',
            page: page,
            per_page: perPage,
            access_token: accessToken,
        };

        if(extraFilters.length > 0){
            filter = [...filter, ...extraFilters];
        }

        if (filter.length > 0) {
            params['filter[]'] = filter;
        }
        // order
        if (order != null && orderDir != null) {
            const orderDirSign = (orderDir === 1) ? '+' : '-';
            params['order'] = `${orderDirSign}${order}`;
        }

        return getRequest(
            createAction(REQUEST_ATTENDEES_VOTES),
            createAction(RECEIVE_ATTENDEES_VOTES),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees`,
            authErrorHandler,
            {order, orderDir, summitId : currentSummit.id }
        )(params)(dispatch).then((data) => {
                dispatch(stopLoading());
                return data.response;
            }
        );
    };

export const clearVotesReport = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_VOTES)());
}
