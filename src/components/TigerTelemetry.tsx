"use client";

import React, { useState, useEffect } from "react";
import { Activity, Database, HeartPulse, Terminal } from "lucide-react";

interface TigerTelemetryProps {
  carbonIntensity: number;
}

export default function TigerTelemetry({ carbonIntensity }: TigerTelemetryProps) {
  const [pue, setPue] = useState(1.48);
  const [gpuTemp, setGpuTemp] = useState(72);
  const [developerHeartRate, setDeveloperHeartRate] = useState(74);
  const [focusIndex, setFocusIndex] = useState(91);
  const [showSqlModal, setShowSqlModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Clamped realistic continuous metrics
      setPue((prev) => {
        const next = prev + (Math.random() * 0.02 - 0.01);
        return Math.min(1.60, Math.max(1.30, parseFloat(next.toFixed(2))));
      });
      setGpuTemp((prev) => {
        const next = prev + (Math.random() * 2 - 1);
        return Math.min(78, Math.max(68, Math.round(next)));
      });
      setDeveloperHeartRate((prev) => {
        const next = prev + (Math.random() * 2 - 1);
        return Math.min(84, Math.max(66, Math.round(next)));
      });
      setFocusIndex((prev) => {
        const next = prev + (Math.random() * 2 - 1);
        return Math.min(98, Math.max(82, Math.round(next)));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-box rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-cyber-700 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-lunar-gold"/>
          <h2 className="text-base font-bold text-white tracking-wide">
            TIGER DATA HYPERTABLE & PRESAGE BIO-SENSING
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-lunar-gold/10 text-lunar-gold border border-lunar-gold/30">
            1Hz Streaming TimescaleDB
          </span>
        </div>

        <button
          onClick={() => setShowSqlModal(!showSqlModal)}
          className="flex items-center gap-1.5 px-3 py-1 bg-cyber-900 hover:bg-cyber-800 border border-cyber-700 rounded text-xs text-lunar-cyan"
        >
          <Database className="w-3.5 h-3.5"/>
          <span>INSPECT SQL SCHEMA</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
          <div className="text-xs text-gray-400">Virginia Grid Carbon</div>
          <div className={`text-lg font-bold mt-1 font-mono ${carbonIntensity > 400 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
            {carbonIntensity} gCO₂/kWh
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Threshold: 380 gCO₂</div>
        </div>

        <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
          <div className="text-xs text-gray-400">Terrestrial PUE</div>
          <div className="text-lg font-bold mt-1 font-mono text-white">
            {pue.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Lunar Target: 0.00 PUE</div>
        </div>

        <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
          <div className="text-xs text-gray-400">H100 Core Thermals</div>
          <div className="text-lg font-bold mt-1 font-mono text-amber-400">
            {gpuTemp} °C
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Radiative limit: 85°C | Min: 68°C</div>
        </div>

        <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <HeartPulse className="w-3 h-3 text-pink-400"/>
            <span>Presage Sensing</span>
          </div>
          <div className="text-lg font-bold mt-1 font-mono text-pink-400">
            {developerHeartRate} BPM
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Focus: {focusIndex}% (Optimal Flow)</div>
        </div>
      </div>

      {showSqlModal && (
        <div className="p-3 bg-cyber-950 border border-cyber-700 rounded text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-lunar-cyan"/>
              schema_tigerdata.sql (Continuous Aggregate Query)
            </span>
            <button
              onClick={() => setShowSqlModal(false)}
              className="text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <pre className="text-gray-300 font-mono text-[11px] overflow-x-auto p-2 bg-cyber-900 rounded">
{`-- Tiger Data Timescale Continuous Rollup
SELECT 
    time_bucket('1 minute', time) AS metric_window,
    datacenter_id,
    AVG(carbon_intensity) AS avg_carbon,
    AVG(pue) AS avg_pue,
    SUM(avoided_carbon_grams) AS total_carbon_mitigated
FROM selene_grid_telemetry
WHERE time > NOW() - INTERVAL '1 hour'
GROUP BY metric_window, datacenter_id
ORDER BY metric_window DESC;`}
          </pre>
        </div>
      )}
    </div>
  );
}
