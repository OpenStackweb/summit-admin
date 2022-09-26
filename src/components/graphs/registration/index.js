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
import {Chart} from 'chart.js';
import styles from './index.module.less'

const starters = [[220,120,20],[120,220,20],[80,20,240],[220,20,120],[20,120,220],[20,210,90]];

const getRandomColors = (amount, starter) => {

  const starterColors = starters[starter];

  let incBase = starterColors[0] < 100 ? (255 - starterColors[0]) : starterColors[0];
  const incRed = Math.ceil(incBase / amount);

  incBase = starterColors[1] < 100 ? (255 - starterColors[1]) : starterColors[1];
  const incGreen = Math.ceil(incBase / amount);

  incBase = starterColors[2] < 100 ? (255 - starterColors[2]) : starterColors[2];
  const incBlue = Math.ceil(incBase / amount);


  return Array.apply(null, {length: amount}).map((v,i) => {
    let multiplier = starterColors[0] < 100 ? -1 : 1;
    const r = Math.ceil(starterColors[0] - (i * incRed * multiplier));
    multiplier = starterColors[1] < 100 ? -1 : 1;
    const g = Math.ceil(starterColors[1] - (i * incGreen * multiplier));
    multiplier = starterColors[2] < 100 ? -1 : 1;
    const b = Math.ceil(starterColors[2] - (i * incBlue * multiplier));

    return `rgb(${r}, ${g}, ${b})`;
  });
};

function createDonnutCanvas(arc, percent) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 100;
  canvas.height = 55;

  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${percent}%`, 32, 28);

  ctx.beginPath()
  ctx.fillStyle = arc?.options?.backgroundColor;
  ctx.arc(32, 25, 20, 0, (2 * Math.PI * percent / 100), false); // outer (filled)
  ctx.arc(32, 25, 14, (2 * Math.PI * percent / 100), 0, true); // inner (unfills it)
  ctx.fill();

  ctx.beginPath()
  ctx.arc(32, 25, 20, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.beginPath()
  ctx.arc(32, 25, 14, 0, Math.PI * 2, true);
  ctx.stroke();

  return canvas;
};

const Graph = ({title, subtitle = null, legendTitle= null, data, labels, colors = null, colorPalette = null}) => {
  const fillColors = useMemo(() => colors || getRandomColors(data.length, colorPalette), [colors, data.length]);

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
      padding: {top: 80, left: 80, right: 80, bottom: 80}
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
        title: {text: legendTitle, display: !!legendTitle},
        display: true,
        position: 'right',
        align: 'center',
        maxWidth: 450,
        labels: {
          usePointStyle: true,
          font: {size: 12, lineHeight: 2.5},
          padding: 35,
          boxHeight: 50,
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];

            return chart.data.labels.map((label, i) => {
              const dataItem = dataset.data[i];
              const color = dataset.backgroundColor[i];
              const arc = chart.getDatasetMeta(0).data[i];
              let percent = 0;

              if (dataItem.total) {
                percent = Math.round((dataItem.value / dataItem.total) * 100);
              } else if (dataItem.divider){
                percent = Math.round((dataItem.value / dataItem.divider) * 100);
              }

              return {
                text: dataItem.label || label,
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
      }
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
        <Pie data={chartData} width={600} height={600} options={chartOptions}/>
      </div>
    </div>
  );
};

export default Graph;