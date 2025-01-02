'use client';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const SubscriberGraph = () => {
  const [data, setData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/subscribers');
      const result = await res.json();
      setData(result);
    }
    fetchData();
  }, []);

  // Detect and track Tailwind Dark Mode class
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode(); // Initial check

    // Listen for Tailwind dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!data) return <p className="text-center text-lg text-dark dark:text-light">Loading graph...</p>;

  // Chart Data
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Subscribers Over Time',
        data: data.map(item => item.count),
        fill: false,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#3B82F6',
      },
    ],
  };

  // Chart Options with Dynamic Tailwind Colors
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#ffffff' : '#000000', // White in dark mode, Black in light mode
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#ffffff' : '#000000', // White in dark mode, Black in light mode
          font: {
            size: 12,
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.2)',
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? '#ffffff' : '#000000', // White in dark mode, Black in light mode
          font: {
            size: 12,
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.2)',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <section className="w-full mt-16 px-2 md:px-10 py-4 rounded-lg mx-5 md:mx-10 text-dark dark:text-light">
      <div className="w-full h-[500px] md:h-[600px] rounded-md p-4 shadow-md border border-solid border-gray-200 dark:border-gray-700">
        <Line data={chartData} options={chartOptions} />
      </div>
    </section>
  );
};

export default SubscriberGraph;
