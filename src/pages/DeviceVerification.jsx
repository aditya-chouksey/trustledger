import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cpu, CheckCircle2, XCircle, ArrowLeft, Activity, Shield } from 'lucide-react';

export default function DeviceVerification() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch(`/api/verify/device/${deviceId}`)
      .then(res => {
        if (!res.ok) throw new Error('Device record not found');
        return res.json();
      })
      .then(d => { setDevice(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [deviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e1a] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-emerald-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          Verifying device…
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-[#070e1a] flex items-center justify-center p-6">
        <div className="bg-[#0d1424] rounded-2xl border border-red-500/30 p-10 text-center max-w-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-100 mb-1.5">Device Not Found</p>
          <p className="text-sm text-slate-400 mb-6">{error || `No device registered with ID '${deviceId}'`}</p>
          <Link to="/" className="text-sm font-medium text-emerald-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070e1a] bg-grid text-slate-100 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Back link */}
        <Link
          to={`/verify/${device.associatedAssetId}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-emerald-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Asset {device.associatedAssetId}
        </Link>

        {/* Header card */}
        <div className="bg-[#0d1424] rounded-xl border border-emerald-500/30 p-5 fade-up">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">IoT Device Verification</p>
              <h1 className="font-mono text-xl font-black text-slate-100 leading-tight">{device.deviceId}</h1>
              <p className="text-[11px] text-slate-400">{device.deviceType}</p>
            </div>
            <div className="ml-auto">
              <span className="badge-verified pop-in">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { label: 'Associated Asset',    val: device.associatedAssetId,  cls: 'font-mono font-bold text-emerald-400' },
              { label: 'Device Status',       val: device.deviceStatus,        cls: 'text-emerald-400 font-bold flex items-center gap-1', icon: <Activity className="w-3.5 h-3.5" /> },
              { label: 'Last Telemetry',      val: device.lastSeen,            cls: 'text-slate-300' },
              { label: 'Telemetry Integrity', val: `${device.latestTelemetryProof} ✓`, cls: 'text-emerald-400 font-bold' },
            ].map(({ label, val, cls, icon }) => (
              <div key={label} className="bg-slate-900/60 rounded-lg border border-slate-800 px-3 py-2.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-[12px] ${cls}`}>
                  {icon}{val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry readings */}
        <div className="bg-[#0d1424] rounded-xl border border-slate-800 overflow-hidden fade-up">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/40">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Telemetry Readings</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {Object.entries(device.telemetry || {}).map(([k, v]) => (
              <div key={k} className="bg-slate-900/60 rounded-lg border border-slate-800 px-3 py-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono font-bold text-slate-100 text-[12px]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 pb-4">
          Device credentials and firmware private keys remain isolated and are never transmitted.
        </p>
      </div>
    </div>
  );
}
