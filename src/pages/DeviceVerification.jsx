import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cpu, CheckCircle2, XCircle, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';

export default function DeviceVerification() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/verify/device/${deviceId}`)
      .then(res => {
        if (!res.ok) throw new Error('Device record not found');
        return res.json();
      })
      .then(data => {
        setDevice(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [deviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-emerald-400 font-medium">Verifying IoT Device Status...</div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto flex flex-col justify-center">
        <div className="glass-panel rounded-3xl p-6 text-center border border-red-500/30">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-100">Device Not Found</h2>
          <p className="text-slate-400 text-xs mt-1 mb-4">{error || `No registered device found with ID '${deviceId}'`}</p>
          <Link to="/" className="text-xs font-semibold text-emerald-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <Link to={`/verify/${device.associatedAssetId}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400">
        <ArrowLeft className="w-4 h-4" /> Back to Asset Verification ({device.associatedAssetId})
      </Link>

      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/40 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-slate-400">IoT Device Verification</div>
            <h1 className="text-2xl font-black text-slate-100 font-mono">{device.deviceId}</h1>
            <p className="text-xs text-slate-400">{device.deviceType}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-500 font-medium">Associated Asset</div>
            <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{device.associatedAssetId}</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-500 font-medium">Device Status</div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5 flex items-center gap-1">
              <Activity className="w-4 h-4" /> {device.deviceStatus}
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-500 font-medium">Last Telemetry Ping</div>
            <div className="font-semibold text-slate-200 mt-0.5">{device.lastSeen}</div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-500 font-medium">Telemetry Integrity Proof</div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {device.latestTelemetryProof} ✓
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Live Telemetry Readings</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(device.telemetry || {}).map(([k, v]) => (
              <div key={k} className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400 capitalize">{k}:</span>
                <span className="text-slate-100 font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-800">
          Device credentials and firmware cryptographic private keys remain isolated and secure.
        </div>
      </div>
    </div>
  );
}
