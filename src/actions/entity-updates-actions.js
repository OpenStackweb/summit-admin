import {getAccessTokenSafely} from "../utils/methods";
import {
    createAction,
    postRequest,
    startLoading,
    stopLoading
} from "openstack-uicore-foundation/lib/utils/actions";


export const PUB_ENTITY_UPDATE = 'PUB_ENTITY_UPDATE';

export const PUB_ENTITY_UPDATE_OPERATOR_INSERT = 'INSERT';
export const PUB_ENTITY_UPDATE_OPERATOR_UPDATE = 'UPDATE';
export const PUB_ENTITY_UPDATE_OPERATOR_DELETE = 'DELETE';
export const PUB_ENTITY_PRESENTATION_TYPE = 'Presentation'

export const publishEntityUpdate = (id, type = PUB_ENTITY_PRESENTATION_TYPE, operator = PUB_ENTITY_UPDATE_OPERATOR_INSERT) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();
    const { currentSummitState } = getState();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return postRequest(
        createAction(PUB_ENTITY_UPDATE),
        createAction(PUB_ENTITY_UPDATE),
        `${window.PUB_API_BASE_URL}/api/v1/summits/${currentSummit.id}/entity-updates`,
        {
            entity_id: id,
            entity_type: type,
            entity_operator: operator
        },
        (err, res) => (dispatch, state) => {
            dispatch(stopLoading())
        },
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}