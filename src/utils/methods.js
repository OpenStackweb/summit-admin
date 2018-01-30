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

import moment from 'moment-timezone';

export const findElementPos = (obj) => {
    var curtop = -70;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return [curtop];
    }
}

export const epochToMoment = (atime) => {
    if(!atime) return atime;
    atime = atime * 1000;
    return moment(atime);
}

export const epochToMomentTimeZone = (atime, time_zone) => {
    if(!atime) return atime;
    atime = atime * 1000;
    return moment(atime).tz(time_zone);
}

export const formatEpoch = (atime, format = 'M/D/YYYY h:mm a') => {
    if(!atime) return atime;
    return epochToMoment(atime).format(format);
}