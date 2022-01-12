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
    RECEIVE_MEDIA_UPLOAD,
    RESET_MEDIA_UPLOAD_FORM,
    UPDATE_MEDIA_UPLOAD,
    MEDIA_UPLOAD_ADDED,
} from '../../actions/media-upload-actions';

import {RECEIVE_ALL_MEDIA_FILE_TYPES} from "../../actions/media-file-type-actions";

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    description         : '',
    type_id             : 0,
    max_size            : 0,
    is_mandatory        : false,
    private_storage_type: 'None',
    public_storage_type : 'None',
    presentation_types  : [],
    use_temporary_links_on_public_storage: false,
    temporary_links_public_storage_ttl:0,
};

const DEFAULT_STATE = {
    entity          : DEFAULT_ENTITY,
    media_file_types: [],
    errors          : {},
};

const mediaUploadReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_MEDIA_UPLOAD_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_ALL_MEDIA_FILE_TYPES: {
            let {data} = payload.response;
            let media_file_types = data.map(mft => {
                return {
                    value: mft.id,
                    label: mft.name,
                };
            });

            return {...state,  media_file_types };
        }
        break;
        case UPDATE_MEDIA_UPLOAD: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case MEDIA_UPLOAD_ADDED:
        case RECEIVE_MEDIA_UPLOAD: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, preview: null };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default mediaUploadReducer;
