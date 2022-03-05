import {
    authErrorHandler,
    createAction,
    getCSV,
    getRequest,
    startLoading, stopLoading
} from "openstack-uicore-foundation/lib/methods";

export const REQUEST_PRESENTATION_VOTES = 'REQUEST_PRESENTATION_VOTES';
export const RECEIVE_PRESENTATION_VOTES = 'RECEIVE_PRESENTATION_VOTES';

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
        fields: 'id,title,votes_count,voters.id,voters.first_name,voters.last_name,voters.email',
        relations: 'voters.none',
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

export const exportPresentationsVotes =   (
    order = 'votes_count',
    orderDir = 0,
    extraFilters = []
) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    let filter = ['published==1','votes_count>0'];
    const filename = currentSummit.name + '-voteable-presentations.csv';

    dispatch(startLoading());

    const params = {
        expand: 'voters',
        fields: 'id,title,votes_count,voters.id,voters.first_name,voters.last_name,voters.email',
        relations: 'voters.none',
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

    dispatch(getCSV(`${window.API_BASE_URL}/api/v2/summits/${currentSummit.id}/presentations/voteable/csv`, params, filename));

    dispatch(stopLoading());
}
