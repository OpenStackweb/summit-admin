/**
 * Copyright 2019 OpenStack Foundation
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
     RECEIVE_SUMMIT_SPONSORSHIP,
     RESET_SUMMIT_SPONSORSHIP_FORM,
     UPDATE_SUMMIT_SPONSORSHIP,
     SUMMIT_SPONSORSHIP_UPDATED,
     SUMMIT_SPONSORSHIP_ADDED,
     BADGE_IMAGE_ATTACHED,
     BADGE_IMAGE_DELETED
 } from '../../actions/sponsor-actions';
 
 import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
 import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
 
 export const DEFAULT_ENTITY = {
     id                                 : 0,
     name                               : '',
     order                              : 0,    
     widget_title                       : '',
     lobby_template                     : '',
     expo_hall_template                 : '',
     sponsor_page_template              : '',
     event_page_template                : '',
     sponsor_page_use_disqus_widget     : false,
     sponsor_page_use_live_event_widget : false,
     sponsor_page_use_schedule_widget   : false,
     sponsor_page_use_banner_widget     : false,
     should_display_on_expo_hall_page   : false,
     should_display_on_lobby_page       : false,
     type                               : null,
     badge_image                        : '',
     badge_image_alt_text               : '',
 }
 
 const DEFAULT_STATE = {
     entity      : DEFAULT_ENTITY,
     errors      : {}
 };
 
 const summitSponsorshipReducer = (state = DEFAULT_STATE, action) => {
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
         case RESET_SUMMIT_SPONSORSHIP_FORM: {
             return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
         }
         break;
         case UPDATE_SUMMIT_SPONSORSHIP: {
             return {...state,  entity: {...payload}, errors: {} };
         }
         break;
         case SUMMIT_SPONSORSHIP_ADDED:
         case RECEIVE_SUMMIT_SPONSORSHIP: {
             let entity = {...payload.response};
 
             for(var key in entity) {
                 if(entity.hasOwnProperty(key)) {
                     entity[key] = (entity[key] == null) ? '' : entity[key] ;
                 }
             }
 
             return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
         }
         break;
         case SUMMIT_SPONSORSHIP_UPDATED: {
             return state;
         }
         break;
         case BADGE_IMAGE_ATTACHED: {            
            const badge_image = payload.response.url;
            return {...state, entity: {...state.entity, badge_image }}
         }
         case BADGE_IMAGE_DELETED: {
            return {...state, entity: {...state.entity, badge_image: ''}}
         }
         case VALIDATE: {
             return {...state,  errors: payload.errors };
         }
         break;
         default:
             return state;
     }
 };
 
 export default summitSponsorshipReducer;
 