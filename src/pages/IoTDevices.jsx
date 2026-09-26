import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Activity, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Sprout, 
  Zap, 
  Car, 
  ShieldCheck, 
  Hash, 
  Layers
} from 'lucide-react';

export default function IoTDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  // Dynamic live readings state for generator
  const [currentReadings, setCurrentReadings] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/iot/devices');
      const data = await res.json();
      const devList = data.devices || [];
      setDevices(devList);

      // Select first device by default if none selected
      if (!selectedDevice && devList.length > 0) {
        selectDeviceHandler(devList[0]);
      }
    } catch (err) {
      console.error('Error fetching IoT devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const selectDeviceHandler = (dev) => {
    setSelectedDevice(dev);
    setSubmissionFeedback(null);
    setCurrentReadings({ ...dev.telemetry });
  };

  // Generate realistic, varying sensor values
  const generateNewReading = () => {
    if (!selectedDevice) return;
    setSubmissionFeedback(null);

    const sec = selectedDevice.sector;
    if (sec === 'Agriculture') {
      const temp = (20 + Math.random() * 10).toFixed(1); // 20.0 to 30.0 °C
      const hum = Math.floor(50 + Math.random() * 25); // 50 to 75 %
      setCurrentReadings({
        temperature: `${temp} °C`,
        humidity: `${hum} %`
      });
    } else if (sec === 'Energy') {
      const gen = Math.floor(480 + Math.random() * 50); // 480 to 530 MWh
      const volt = (395 + Math.random() * 10).toFixed(1); // 395.0 to 405.0 V
      const curr = (120 + Math.random() * 15).toFixed(1); // 120.0 to 135.0 A
      setCurrentReadings({
        energyGenerated: `${gen} MWh`,
        voltage: `${volt} V`,
        current: `${curr} A`
      });
    } else {
      // Mobility
      const bTemp = (25 + Math.random() * 8).toFixed(1); // 25.0 to 33.0 °C
      const volt = (390 + Math.random() * 15).toFixed(1); // 390.0 to 405.0 V
      const soc = (95 + Math.random() * 4.9).toFixed(1); // 95.0 to 99.9 %
      setCurrentReadings({
        batteryTemperature: `${bTemp} °C`,
        voltage: `${volt} V`,
        stateOfCharge: `${soc} %`
      });
    }
  };

  // Submit telemetry through official IoT API flow
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
          assetId: selectedDevice.associatedAssetId,
          sector: selectedDevice.sector,
          telemetry: currentReadings
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionFeedback(data);
        await fetchDevices(); // Refresh device state
      } else {
        alert(data.error || 'Failed to submit telemetry');
      }
    } catch (err) {
      console.error('Error submitting telemetry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-950/40">
              TL
            </Link>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center gap-2">
                TRUSTLEDGER
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IoT Simulation Module
                </span>
              </div>
              <div className="text-xs text-slate-400">Simulated Hardware Telemetry Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Hero Header */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> Hardware Telemetry Bridge
            </div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              IoT Simulation Module
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Generate real-time sensor measurements from simulated IoT nodes and validate telemetry hashes directly on the TrustLedger network.
            </p>
          </div>
        </div>

        {/* 3 Devices Selector Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Active Simulated IoT Devices
          </h2>

          {loading ? (
            <div className="text-slate-400 text-sm text-center py-6">Loading IoT devices...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {devices.map((dev) => {
                const isSelected = selectedDevice?.deviceId === dev.deviceId;
                const isAgri = dev.sector === 'Agriculture';
                const isEnergy = dev.sector === 'Energy';

                return (
                  <div
                    key={dev.deviceId}
                    onClick={() => selectDeviceHandler(dev)}
                    className={`glass-card rounded-2xl p-6 border transition-all cursor-pointer space-y-4 relative overflow-hidden ${
                      isSelected
                        ? 'border-emerald-500 bg-slate-900/90 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    {/* Explicit Required Badge */}
                    <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                      SIMULATED IoT DEVICE
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="font-mono text-xl font-black text-slate-100">{dev.deviceId}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {isAgri && <Sprout className="w-3.5 h-3.5 text-emerald-400" />}
                          {isEnergy && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          {!isAgri && !isEnergy && <Car className="w-3.5 h-3.5 text-sky-400" />}
                          <span className="font-semibold text-slate-200">{dev.sector} Sector</span>
                        </div>
                      </div>

                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <div className="text-slate-500 font-medium">Bound Asset ID:</div>
                      <div className="font-mono font-bold text-emerald-400">{dev.associatedAssetId}</div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Status: <strong className="text-emerald-400">{dev.status}</strong></span>
                      <span className="text-[11px] font-mono">{dev.lastSeen}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Device Interactive Detail & Telemetry Simulator Panel */}
        {selectedDevice && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 bg-slate-900/90 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-block px-3 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider mb-2">
                  SIMULATED IoT DEVICE INTERACTION
                </div>
                <h3 className="text-2xl font-black font-mono text-slate-100 flex items-center gap-3">
                  {selectedDevice.deviceId}
                  <span className="text-xs font-sans font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    {selectedDevice.sector} Sector
                  </span>
                </h3>
              </div>

              <Link
                to={`/assets/${selectedDevice.associatedAssetId}`}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                View Bound Asset ({selectedDevice.associatedAssetId}) <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Current Live Sensor Readings Display */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Live Sensor Telemetry Measurements
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(currentReadings).map(([key, value]) => (
                  <div key={key} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <div className="text-slate-500 text-xs font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="font-mono text-2xl font-black text-slate-100">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={generateNewReading}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider border border-slate-700 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" /> Generate Sensor Reading
              </button>

              <button
                onClick={sendToTrustLedger}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Submitting to Ledger...' : 'Send to TrustLedger'}
              </button>
            </div>

            {/* Backend Response Submission Feedback Banner */}
            {submissionFeedback && (
              <div className="mt-4 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Telemetry Accepted ✓
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-900/60 text-slate-300">
                  <div>
                    <span className="text-slate-500 font-semibold">Event ID:</span>{' '}
                    <span className="font-bold text-slate-100">{submissionFeedback.eventId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Telemetry Hash (SHA-256):</span>{' '}
                    <span className="font-bold text-emerald-300 break-all">{submissionFeedback.telemetryHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Status:</span>{' '}
                    <span className="text-emerald-400 font-bold">Anchored to {submissionFeedback.associatedAssetId} Lifecycle History</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/verify/${submissionFeedback.associatedAssetId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-bold"
                  >
                    View in Public Verification Asset Lifecycle <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
