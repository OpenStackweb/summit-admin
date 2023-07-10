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
import {Line} from "react-chartjs-2";
import Chart from 'chart.js/auto';
import {isMobile} from 'react-device-detect';
import styles from './index.module.less'


const LineGraph = ({title, data, labels, children}) => {
  const graphSize = isMobile ? { width: 400, height: (400 + (labels.length * 60)) } : { width: 600, height: 600 };
  const layoutPadding = isMobile ? { top: 10, left: 10, right: 10, bottom: 30 } : { top: 80, left: 80, right: 80, bottom: 80 };
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Attendees checked-in',
        data: data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    maintainAspectRatio: false,
    layout: {
      padding: layoutPadding
    },
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => context.value
        }
      },
    },
    scales: {
      y: {
        min: 0,
        max: Math.max(...data) + 2,
        ticks: {
          stepSize: 1
        }
      }
    }
  };
  
  return (
    <div className={styles.wrapper}>
      <h5 className={styles.title}>{title}</h5>
      {children}
      <div>
        <Line data={chartData} {...graphSize} options={chartOptions}/>
      </div>
    </div>
  );
};

export default LineGraph;