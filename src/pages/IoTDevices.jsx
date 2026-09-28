import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Send, RefreshCw, CheckCircle2,
  ExternalLink, Sprout, Zap, Car
} from 'lucide-react';
import Navbar from '../components/Navbar';

const SECTOR_META = {
  Agriculture: { icon: <Sprout className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  Energy:      { icon: <Zap    className="w-3.5 h-3.5" />, color: 'text-amber-600  dark:text-amber-400',   border: 'border-amber-500'   },
  Mobility:    { icon: <Car    className="w-3.5 h-3.5" />, color: 'text-sky-600    dark:text-sky-400',     border: 'border-sky-500'     },
};

export default function IoTDevices() {
  const [devices, setDevices]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [currentReadings, setCurrentReadings] = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/iot/devices');
      const data = await res.json();
      const devList = data.devices || [];
      setDevices(devList);
      if (!selectedDevice && devList.length > 0) selectDeviceHandler(devList[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const selectDeviceHandler = (dev) => {
    setSelectedDevice(dev);
    setSubmissionFeedback(null);
    setCurrentReadings({ ...dev.telemetry });
  };

  const generateNewReading = () => {
    if (!selectedDevice) return;
    setSubmissionFeedback(null);
    const sec = selectedDevice.sector;
    if (sec === 'Agriculture') {
      setCurrentReadings({
        temperature: `${(20 + Math.random() * 10).toFixed(1)} °C`,
        humidity:    `${Math.floor(50 + Math.random() * 25)} %`,
      });
    } else if (sec === 'Energy') {
      setCurrentReadings({
        energyGenerated: `${Math.floor(480 + Math.random() * 50)} MWh`,
        voltage:         `${(395 + Math.random() * 10).toFixed(1)} V`,
        current:         `${(120 + Math.random() * 15).toFixed(1)} A`,
      });
    } else {
      setCurrentReadings({
        batteryTemperature: `${(25 + Math.random() * 8).toFixed(1)} °C`,
        voltage:            `${(390 + Math.random() * 15).toFixed(1)} V`,
        stateOfCharge:      `${(95 + Math.random() * 4.9).toFixed(1)} %`,
      });
    }
  };

  const sendToTrustLedger = async () => {
    if (!selectedDevice) return;
    setSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const res = await fetch('/api/iot/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.deviceId,
          assetId:  selectedDevice.associatedAssetId,
          sector:   selectedDevice.sector,
          telemetry: currentReadings,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionFeedback(data);
        await fetchDevices();
      } else {
        alert(data.error || 'Failed to submit telemetry');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1a] bg-grid text-slate-100 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Page header */}
        <div className="fade-up">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3 h-3" /> Hardware Telemetry Bridge
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gradient-brand">IoT Simulation Module</h1>
          <p className="text-[13px] text-slate-400 mt-1 max-w-xl">
            Generate sensor readings from simulated IoT nodes and submit telemetry hashes to the TrustLedger network.
          </p>
        </div>

        {/* Device selector */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Registered Devices</h2>
          {loading ? (
            <div className="text-slate-400 text-sm py-8 text-center">
              <div className="w-5 h-5 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              Loading devices…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.map((dev, i) => {
                const isSelected = selectedDevice?.deviceId === dev.deviceId;
                const sm = SECTOR_META[dev.sector] || SECTOR_META.Agriculture;
                return (
                  <div
                    key={dev.deviceId}
                    onClick={() => selectDeviceHandler(dev)}
                    className={`rounded-xl border cursor-pointer p-4 space-y-3 transition-all card-hover fade-up fade-up-delay-${Math.min(i+1,5)} ${
                      isSelected
                        ? `bg-slate-800/80 ${sm.border} ring-1 ring-current/20 shadow-lg glow-emerald-sm`
                        : 'bg-[#0d1424] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* SIMULATED badge */}
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono">
                      SIMULATED
                    </span>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-lg font-black text-slate-100 leading-tight">{dev.deviceId}</p>
                        <p className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${sm.color}`}>
                          {sm.icon} {dev.sector}
                        </p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-ring mt-1 shrink-0" />
                    </div>

                    <div className="bg-slate-900/60 rounded-lg border border-slate-800 px-2.5 py-2">
                      <p className="text-[10px] text-slate-500 mb-0.5">Bound Asset</p>
                      <p className="font-mono text-[11px] text-emerald-400 font-bold">{dev.associatedAssetId}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Status: <strong className="text-emerald-400">{dev.status}</strong></span>
                      <span className="font-mono">{dev.lastSeen}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected device panel */}
        {selectedDevice && (() => {
          const sm = SECTOR_META[selectedDevice.sector] || SECTOR_META.Agriculture;
          return (
            <div className="bg-[#0d1424] rounded-xl border border-slate-800 overflow-hidden fade-up">
              {/* Panel header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/40">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono mb-1.5">
                    SIMULATED DEVICE INTERACTION
                  </span>
                  <div className="flex items-center gap-3">
                    <h3 className="font-mono text-xl font-black text-slate-100">{selectedDevice.deviceId}</h3>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${sm.color}`}>
                      {sm.icon} {selectedDevice.sector}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/assets/${selectedDevice.associatedAssetId}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors shrink-0"
                >
                  {selectedDevice.associatedAssetId} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 space-y-5">
                {/* Live readings */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Live Sensor Readings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(currentReadings).map(([key, val]) => (
                      <div key={key} className="bg-slate-900 rounded-lg border border-slate-800 px-4 py-3">
                        <p className="text-[11px] text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-mono text-xl font-black text-slate-100">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={generateNewReading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Generate Reading
                  </button>
                  <button
                    onClick={sendToTrustLedger}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting…' : 'Send to TrustLedger'}
                  </button>
                </div>

                {/* Submission feedback */}
                {submissionFeedback && (
                  <div className="bg-emerald-950/30 rounded-lg border border-emerald-500/25 p-4 space-y-3 scale-in glow-emerald-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Telemetry Accepted ✓
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-3 border-t border-emerald-900/50">
                      <div>
                        <span className="text-slate-500">Event ID </span>
                        <span className="font-bold text-slate-100">{submissionFeedback.eventId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Integrity </span>
                        <span className="text-emerald-400 font-bold">{submissionFeedback.telemetryIntegrity} ✓</span>
                      </div>
                      <div className="sm:col-span-2 break-all">
                        <span className="text-slate-500">SHA-256 Hash </span>
                        <span className="text-emerald-300">{submissionFeedback.telemetryHash}</span>
                      </div>
                    </div>
                    <Link
                      to={`/verify/${submissionFeedback.associatedAssetId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium"
                    >
                      View lifecycle on verify page <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}
