'use client';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import "~/lib/chartSetup"; // Register Chart.js
import { useMemo } from "react";

export default function ChartsPage() {
  const data = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Sales",
          data: [12, 19, 3, 5, 2],
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1,
        },
      ],
    }),
    []
  );

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Chart.js Demo" },
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Chart.js Showcase</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Bar Chart</h2>
          <Bar data={data} options={options} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Line Chart</h2>
          <Line data={data} options={options} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Pie Chart</h2>
          <Pie data={data} options={options} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Doughnut Chart</h2>
          <Doughnut data={data} options={options} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Radar Chart</h2>
          <Radar data={data} options={options} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Polar Area Chart</h2>
          <PolarArea data={data} options={options} />
        </div>
      </div>
    </main>
  );
}
