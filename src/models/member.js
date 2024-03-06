/**
 * Copyright 2018 OpenStack Foundation
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

import access from 'js-yaml-loader!../access-routes.yml';

class Member {

    constructor(member){
        this._member = member;
    }

    hasAccess(accessRoute) {
        if (!access.hasOwnProperty(accessRoute)) return true;

        if (!this._member) return false;

        for (var i in this._member.groups) {
            if (access[accessRoute].includes(this._member.groups[i].code)) return true;
        }

        return false;
    }

    canEditSummit() {
        for (var i in this._member.groups) {
            if (access['summit-edit'].includes(this._member.groups[i].code)) return true;
        }

        return false;
    }

    canAddSummits(){
        for (var i in this._member.groups) {
            if (access['summit-add'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canDeleteSummits(){
        for (var i in this._member.groups) {
            if (access['summit-delete'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canDeleteSpeakers(){
        for (var i in this._member.groups) {
            if (access['speakers-delete'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canEditSpeakers(){
        for (var i in this._member.groups) {
            if (access['speakers-edit'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canAddSpeakers(){
        for (var i in this._member.groups) {
            if (access['speakers-add'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canAddSponsors(){
        for (var i in this._member.groups) {
            if (access['sponsors-add'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canEditSponsors(){
        for (var i in this._member.groups) {
            if (access['sponsors-edit'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canDeleteSponsors(){
        for (var i in this._member.groups) {
            if (access['sponsors-delete'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canEditBadgeScans(){
        for (var i in this._member.groups) {
            if (access['badge-scans-edit'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }

    canEditSponsorExtraQuestions(){
        for (var i in this._member.groups) {
            if (access['sponsors-extra-questions-edit'].includes(this._member.groups[i].code)) return true;
        }
        return false;
    }
}

export default Member;
