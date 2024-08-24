import React from "react";
import { Line } from "react-chartjs-2";

const StatisticsChart = ({ metrics }) => {
  const datasets = [];

  Object.entries(metrics).forEach(([projectId, projectMetrics]) => {
    Object.entries(projectMetrics).forEach(([version, data]) => {
      datasets.push(
        {
          label: `Project ${projectId} - ${version} - Training Accuracy`,
          data: data.training_accuracy,
          fill: false,
          borderColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(
            Math.random() * 256
          )},${Math.floor(Math.random() * 256)},1)`,
          borderWidth: 2,
        },
        {
          label: `Project ${projectId} - ${version} - Validation Accuracy`,
          data: data.validation_accuracy,
          fill: false,
          borderColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(
            Math.random() * 256
          )},${Math.floor(Math.random() * 256)},1)`,
          borderWidth: 2,
          borderDash: [5, 5],
        }
      );
    });
  });

  const labels =
    metrics[Object.keys(metrics)[0]][
      Object.keys(metrics[Object.keys(metrics)[0]])[0]
    ].epochs;

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Epochs",
        },
      },
      y: {
        title: {
          display: true,
          text: "Accuracy",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default StatisticsChart;
