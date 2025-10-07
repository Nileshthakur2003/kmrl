"use client";

import { useState, useEffect } from "react";

const NUM_TRAINSETS = 25;

function createDefaultTrainsets() {
  const trainsets = [];
  for (let i = 1; i <= NUM_TRAINSETS; i++) {
    trainsets.push({
      id: `TS-${i}`,
      fitness: "Yes",
      job: "Closed",
      branding: 2,
      mileage: Math.floor(Math.random() * 20000),
      cleaning: "Yes",
      bay: ((i % 10) + 1).toString(),
    });
  }
  return trainsets;
}

export default function TrainsetSimulator() {
  const [trainsets, setTrainsets] = useState(createDefaultTrainsets());
  const [results, setResults] = useState([]);

  // Handle input changes
  function updateTrainset(index, field, value) {
    const newTrainsets = [...trainsets];
    newTrainsets[index] = { ...newTrainsets[index], [field]: value };
    setTrainsets(newTrainsets);
  }

  function scoreTrainset(data) {
    let score = 0;
    let alerts = [];

    if (data.fitness !== "Yes") {
      alerts.push("Missing Fitness Certificate");
      score -= 100;
    } else {
      score += 20;
    }

    if (data.job === "Open") {
      alerts.push("Open Job-Card");
      score -= 50;
    } else {
      score += 15;
    }

    score += Number(data.branding) * 10;

    const avgMileage = 10000;
    const mileageDiff = Math.abs(avgMileage - data.mileage);
    score += Math.max(0, 20 - mileageDiff / 500);

    if (data.cleaning === "Yes") {
      score += 15;
    } else {
      alerts.push("No Cleaning Slot");
      score -= 10;
    }

    score += (11 - Number(data.bay)) * 2;

    return { score, alerts };
  }

  function runSimulation() {
    const res = trainsets.map((ts) => {
      const { score, alerts } = scoreTrainset(ts);
      return { ...ts, score, alerts };
    });
    res.sort((a, b) => b.score - a.score);
    setResults(res);
  }

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="max-w-full overflow-x-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kochi Metro Trainset Induction Simulator</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-6">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Trainset ID</th>
            <th className="border border-gray-300 p-2">Fitness Certificates</th>
            <th className="border border-gray-300 p-2">Job-Card Status</th>
            <th className="border border-gray-300 p-2">Branding Priority</th>
            <th className="border border-gray-300 p-2">Mileage (km)</th>
            <th className="border border-gray-300 p-2">Cleaning Slot</th>
            <th className="border border-gray-300 p-2">Bay Position</th>
          </tr>
        </thead>
        <tbody>
          {trainsets.map((ts, i) => (
            <tr key={ts.id} className="text-center">
              <td className="border border-gray-300 p-1">{ts.id}</td>
              <td className="border border-gray-300 p-1">
                <select
                  value={ts.fitness}
                  onChange={(e) => updateTrainset(i, "fitness", e.target.value)}
                  className="w-full"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </td>
              <td className="border border-gray-300 p-1">
                <select
                  value={ts.job}
                  onChange={(e) => updateTrainset(i, "job", e.target.value)}
                  className="w-full"
                >
                  <option>Closed</option>
                  <option>Open</option>
                </select>
              </td>
              <td className="border border-gray-300 p-1">
                <select
                  value={ts.branding}
                  onChange={(e) => updateTrainset(i, "branding", Number(e.target.value))}
                  className="w-full"
                >
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-gray-300 p-1">
                <input
                  type="number"
                  value={ts.mileage}
                  min={0}
                  max={20000}
                  onChange={(e) => updateTrainset(i, "mileage", Number(e.target.value))}
                  className="w-full"
                />
              </td>
              <td className="border border-gray-300 p-1">
                <select
                  value={ts.cleaning}
                  onChange={(e) => updateTrainset(i, "cleaning", e.target.value)}
                  className="w-full"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </td>
              <td className="border border-gray-300 p-1">
                <select
                  value={ts.bay}
                  onChange={(e) => updateTrainset(i, "bay", e.target.value)}
                  className="w-full"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={runSimulation}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
      >
        Run Simulation
      </button>

      <h2 className="text-xl font-semibold mb-2">Ranked Induction List</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Rank</th>
            <th className="border border-gray-300 p-2">Trainset ID</th>
            <th className="border border-gray-300 p-2">Score</th>
            <th className="border border-gray-300 p-2">Conflicts / Alerts</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, idx) => (
            <tr key={res.id} className="text-center">
              <td className="border border-gray-300 p-1">{idx + 1}</td>
              <td className="border border-gray-300 p-1">{res.id}</td>
              <td className="border border-gray-300 p-1 font-bold">{res.score.toFixed(1)}</td>
              <td className="border border-gray-300 p-1 text-red-600">
                {res.alerts.length > 0 ? res.alerts.join(", ") : "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
