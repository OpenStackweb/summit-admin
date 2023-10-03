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

export const DefaultEventMinutesDuration       = 10;
export const ScheduleEventsSearchResultMaxPage = 25;
export const PresentationTypeClassName         = 'PRESENTATION_TYPE'

export const ExtraQuestionsTypeAllowSubQuestion = ['ComboBox','CheckBoxList' , 'RadioButtonList', 'CountryComboBox'];

export const SubQuestionAnswerValuesOperators    = [{ value: 'And', label: 'And' }, { value: 'Or', label: 'Or' }];
export const SubQuestionVisibilityOptions        = [{ value: 'Visible', label: 'Show' }, { value: 'NotVisible', label: 'Hide' }];
export const SubQuestionVisibilityConditions     = [{ value: 'Equal', label: 'Equal' }, { value: 'NotEqual', label: 'Not Equal' }];

export const MaxTextLengthForTicketTypesOnTable  = 70;
export const MaxTextLengthForTagsOnTable         = 70;

export const TBALocation = {id : 0, name : 'TBD', class_name: 'SummitVenue'};

export const SpeakersSources = {
    speakers: 'speakers',
    submitters: 'submitters',
    submitters_no_speakers: 'submitters_no_speakers'
};


export const HAS_TICKETS = 'HAS_TICKETS';
export const HAS_NO_TICKETS = 'HAS_NO_TICKETS';

// we need it lowercase for reports
export const ALL_FILTER = "all";
export const OR_FILTER = "any";

export const ReservationStatusPaid = 'Paid';

export const ReservationStatusRequestedRefund = 'RequestedRefund';

export const EMAIL_TEMPLATE_TYPE_HTML = "html";
export const EMAIL_TEMPLATE_TYPE_MJML = "mjml";
