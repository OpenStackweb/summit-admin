/**
 * Copyright 2022 OpenStack Foundation
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

import React, {useMemo} from 'react'
import {Pie} from "react-chartjs-2";
import Chart from 'chart.js/auto';
import {isMobile} from 'react-device-detect';
import {getRandomColors, createDonnutCanvas} from "../utils";
import styles from './index.module.less'


const PieGraph = ({title, subtitle = null, legendTitle= null, data, labels, colors = null, colorPalette = null}) => {
  const fillColors = useMemo(() => colors || getRandomColors(data.length, colorPalette), [colors, data.length]);
  const height = Math.max(600, labels.length * 68);
  const graphSize = isMobile ? { width: 400, height: height } : { width: 600, height: height };
  const legendPos = isMobile ? 'bottom' : 'right';
  const legendAlign = isMobile ? 'start' : 'center';
  const layoutPadding = isMobile ? { top: 10, left: 10, right: 10, bottom: 30 } : { top: 80, left: 30, right: 30, bottom: 80 };
  const titlePadding = isMobile ? { top: 10, left: 0, right: 0, bottom: 0 } : 0;
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: fillColors,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    layout: {
      padding: layoutPadding
    },
    parsing: {
      key: 'value'
    },
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => context.label || ''
        }
      },
      legend: {
        title: {text: legendTitle, display: !!legendTitle, padding: titlePadding},
        display: true,
        position: legendPos,
        align: legendAlign,
        maxWidth: 450,
        labels: {
          usePointStyle: true,
          font: {size: 12, lineHeight: 2.5},
          padding: 35,
          boxHeight: 60,
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];

            return chart.data.labels.map((label, i) => {
              const dataItem = dataset.data[i];
              const color = dataset.backgroundColor[i];
              const arc = chart.getDatasetMeta(0).data[i];
              let percent = 0;
              // we need this so that legend title is not cut off when labels are shorter that legend title
              const labelText = dataItem.label || label;
              const labelTextExt = legendTitle ? labelText.padEnd(legendTitle.length + 5) : labelText;

              if (dataItem.total) {
                percent = dataItem.total > 0 ? Math.round((dataItem.value / dataItem.total) * 100) : 100;
              } else if (dataItem.divider){
                percent = dataItem.divider > 0 ? Math.round((dataItem.value / dataItem.divider) * 100) : 100;
              }

              return {
                text: labelTextExt,
                fillStyle: color,
                fontColor: color,
                strokeStyle: color,
                hidden: chart._hiddenIndices[i],
                index: i,
                pointStyle: createDonnutCanvas(arc, percent),
              };
            }, this);
          }
        }
      },
    }
  };

  return (
    <div className={styles.wrapper}>
      <h5 className={styles.title}>{title}</h5>
      {subtitle &&
      <div className={styles.subtitle}>
        {subtitle.map(text => <p key={text}>{text}</p>)}
      </div>
      }
      <div>
        <Pie data={chartData} {...graphSize} options={chartOptions} />
      </div>
    </div>
  );
};

export default PieGraph;