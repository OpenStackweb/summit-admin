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


export const groupByDate = function(array, prop, sortBy) {
    let grouped_unordered = array.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});

    const grouped_ordered = {};
    Object.keys(grouped_unordered)
        .sort( (a,b) => {
            let compare_a = grouped_unordered[a][0][sortBy];
            let compare_b = grouped_unordered[b][0][sortBy];
            return (compare_a > compare_b ? 1 : (compare_a < compare_b ? -1 : 0));
        } )
        .forEach(function(key) {
            grouped_ordered[key] = grouped_unordered[key];
        });

    return grouped_ordered;
};
