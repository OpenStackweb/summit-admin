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

import React from "react";
import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


export default class ExportData extends React.Component {

    constructor(props) {
        super(props);

        this.renderData = this.renderData.bind(this);
    }

    renderData() {
        let {data} = this.props;

        let sheets = data.filter(it => it.data.length > 0).map((group, groupIdx) => {

            let columns = Object.keys(group.data[0]).map((col, colIdx) => {
               return (
                   <ExcelColumn key={'col_'+groupIdx+'_'+colIdx} label={col} value={col}/>
               ) ;
            });

            return (
                <ExcelSheet key={'grp_'+groupIdx} data={group.data} name={group.name}>
                    {columns}
                </ExcelSheet>
            );
        });

        return sheets;
    }

    render() {
        const {reportName} = this.props;
        const sheets = this.renderData();

        if (sheets.length === 0) return null;

        return (
            <ExcelFile filename={reportName} hideElement={true}>
                {sheets}
            </ExcelFile>
        );
    }
}
