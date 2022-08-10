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
    RECEIVE_EVENT_MATERIAL,
    RESET_EVENT_MATERIAL_FORM,
    UPDATE_EVENT_MATERIAL,
} from '../../actions/event-material-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                          : 0,
    class_name                  : null,
    name                        : '',
    description                 : '',
    featured                    : 0,
    display_on_site             : 0,
    order                       : 0,
    link                        : '',
    file                        : null,
    file_link                   : '',
    has_file                    : false,
    youtube_id                  : '',
    media_upload_type_id        : 0,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const eventMaterialReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_MATERIAL_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_EVENT_MATERIAL: {
            let entity = {...payload};

            if (entity.link) entity.file_link = '';

            return {...state,  entity: entity, errors: {} };
        }
        break;
        case RECEIVE_EVENT_MATERIAL: {
            let entity = {...payload.material};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.media_upload_type) {
                entity.media_upload_type_id = entity.media_upload_type.id;
            }

            entity.file_link = '';

            if (entity.has_file) {
                entity.file_link = entity.link;
                entity.link = '';
            }

            if(entity.file_link) {
                const filename = entity.file_link.substring(entity.file_link.lastIndexOf("/") + 1, entity.file_link.length);
                entity.filename = filename;
                entity.private_url = entity.file_link;
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
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

export default eventMaterialReducer;
