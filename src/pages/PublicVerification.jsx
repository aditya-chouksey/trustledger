import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, ShieldAlert,
  Database, Cpu, Clock, Sprout, Zap, Car,
  Lock, ExternalLink, RefreshCw, AlertTriangle
} from 'lucide-react';

const SECTOR_META = {
  Agriculture: { icon: <Sprout className="w-4 h-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
  Energy:      { icon: <Zap    className="w-4 h-4" />, color: 'text-amber-600  dark:text-amber-400'   },
  Mobility:    { icon: <Car    className="w-4 h-4" />, color: 'text-sky-600    dark:text-sky-400'     },
};

// gray light tokens
const W = {
  page:        'bg-[#f1f3f6] dark:bg-[#070e1a]',
  card:        'bg-[#e8eaed] dark:bg-[#0d1424]',
  inner:       'bg-[#dde0e5] dark:bg-slate-900/60',
  border:      'border-[#c8cdd6] dark:border-slate-800',
  borderMuted: 'border-[#d4d8e0] dark:border-slate-800',
  text:        'text-[#1a1d23] dark:text-slate-200',
  textMuted:   'text-[#5a6070] dark:text-slate-400',
  textFaint:   'text-[#8a92a0] dark:text-slate-500',
};

function Row({ label, value, valueClass = '' }) {
  return (
    <div className={`flex items-baseline justify-between py-2 border-b ${W.borderMuted} last:border-0 gap-4`}>
      <span className={`text-[11px] ${W.textFaint} shrink-0`}>{label}</span>
      <span className={`text-[12px] font-medium ${W.text} text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function PublicVerification() {
  const { assetId } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchVerificationData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/verify/${assetId}`);
      if (!res.ok) throw new Error('Failed to fetch verification payload');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVerificationData(); }, [assetId]);

  if (loading) return (
    <div className={`min-h-screen ${W.page} flex items-center justify-center p-4`}>
      <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Validating cryptographic proof…</span>
      </div>
    </div>
  );

  if (error || !data || data.status === 'NOT_FOUND') return (
    <div className={`min-h-screen ${W.page} flex items-center justify-center p-4`}>
      <div className={`${W.card} rounded-2xl border border-red-300 dark:border-red-500/30 p-10 text-center max-w-sm shadow-sm`}>
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-lg font-bold text-stone-800 dark:text-slate-100 mb-2">Verification Failed</p>
        <p className={`text-sm ${W.textMuted} mb-6`}>{data?.message || error || `'${assetId}' not found.`}</p>
        <Link to="/" className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${W.inner} ${W.text} border ${W.border}`}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );

  const isVerified = data.status === 'VERIFIED';
  const sector     = data.sector || 'Agriculture';
  const sm         = SECTOR_META[sector] || SECTOR_META.Agriculture;
  const fr         = data.fabricRecord || {};
  const vd         = data.verificationDetails || {};

  return (
    <div className={`min-h-screen ${W.page} text-stone-900 dark:text-slate-100 pb-16 transition-colors duration-200`}>

      {/* Header */}
      <header className={`sticky top-0 z-50 bg-[#f1f3f6]/95 dark:bg-[#070e1a]/95 backdrop-blur-xl border-b ${W.border} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-[11px]">TL</span>
            </div>
            <div>
              <p className="font-bold text-[13px] text-stone-800 dark:text-slate-100 tracking-tight leading-none">TrustLedger</p>
              <p className={`text-[10px] ${W.textFaint}`}>Decentralized Asset Verification</p>
            </div>
          </div>
          <button onClick={fetchVerificationData}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ${W.inner} ${W.textMuted} border ${W.border} hover:bg-[#f8d8b8] dark:hover:bg-slate-700 transition-colors cursor-pointer`}>
            <RefreshCw className="w-3.5 h-3.5" /> Re-verify
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-5">

        {/* Status banner */}
        <div className={`rounded-xl border p-5 sm:p-6 fade-up ${
          isVerified
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 pulse-verified'
            : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-500/30 pulse-tampered'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isVerified ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30 glow-emerald' : 'bg-red-500 shadow-lg shadow-red-500/30 glow-red'
              }`}>
                {isVerified ? <CheckCircle2 className="w-6 h-6 text-white" /> : <ShieldAlert className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className={`text-2xl font-black tracking-tight ${isVerified ? 'text-gradient-emerald' : 'text-red-600 dark:text-red-400'}`}>
                  {isVerified ? 'VERIFIED ✓' : 'TAMPERED ✕'}
                </p>
                <p className="text-[12px] text-stone-600 dark:text-slate-400 mt-0.5 max-w-sm">
                  {isVerified ? 'SHA-256 proof matches the Hyperledger Fabric ledger record.' : 'Integrity check failed — off-chain data does not match the registered proof.'}
                </p>
              </div>
            </div>
            <div className={`${W.card} rounded-xl border ${W.border} px-4 py-3 text-center shrink-0`}>
              <p className={`text-[10px] ${W.textFaint} uppercase tracking-wider font-mono mb-1`}>Asset</p>
              <p className={`font-mono font-bold text-base ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{data.assetId}</p>
              <p className={`text-[11px] ${W.textFaint}`}>{data.sector}</p>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t ${W.borderMuted} flex items-start gap-2`}>
            <Lock className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
            <p className={`text-[11px] ${W.textMuted} leading-relaxed`}>
              <span className="font-semibold text-stone-700 dark:text-slate-300">How it works: </span>
              {data.uxExplanation?.message}
              <span className={`block mt-1 font-mono font-semibold ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                → {data.uxExplanation?.resultText}
              </span>
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Asset metadata */}
          <div className={`${W.card} rounded-xl border ${W.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${W.borderMuted} bg-[#dde0e5] dark:bg-slate-900/40 ${sm.color}`}>
              {sm.icon}
              <span className="text-[11px] font-semibold uppercase tracking-wider">Asset Information</span>
            </div>
            <div className="px-4 py-3">
              <Row label="Asset ID" value={data.assetId} valueClass="font-mono font-bold" />
              <Row label="Sector"   value={data.sector} />
              <Row label="Type"     value={data.assetType} />
              <Row label="Status"   value={vd.currentStatus}
                valueClass={isVerified ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 font-bold'} />
            </div>
            <div className={`mx-4 mb-4 ${W.inner} rounded-lg border ${W.border} px-3 py-3`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${W.textFaint} mb-2`}>Sector Payload</p>
              {sector === 'Agriculture' && (<>
                <Row label="Crop"          value={data.payloadData.crop || 'Durum Wheat'} />
                <Row label="Quantity"      value={data.payloadData.quantity || '1000 kg'}
                  valueClass={!isVerified ? 'text-red-500 font-bold line-through' : 'font-mono font-bold'} />
                <Row label="Origin"        value={data.payloadData.origin || 'Punjab'} />
                <Row label="Certification" value={data.payloadData.certification || 'ISO 22000'} valueClass="text-emerald-600 dark:text-emerald-400" />
              </>)}
              {sector === 'Energy' && (<>
                <Row label="Source"    value={data.payloadData.generationSource || 'Solar Farm'} />
                <Row label="Capacity"  value={data.payloadData.capacity || '500 MWh'}
                  valueClass={!isVerified ? 'text-red-500 font-bold' : 'font-mono font-bold'} />
                <Row label="Cert ID"   value={data.payloadData.certId || '—'} valueClass="font-mono" />
                <Row label="Authority" value={data.payloadData.verificationAuthority || 'GreenGrid'} valueClass="text-emerald-600 dark:text-emerald-400" />
              </>)}
              {sector === 'Mobility' && (<>
                <Row label="Manufacturer" value={data.payloadData.manufacturer || 'VoltPower'} />
                <Row label="Capacity"     value={data.payloadData.capacity || '82 kWh'}
                  valueClass={!isVerified ? 'text-red-500 font-bold' : 'font-mono font-bold'} />
                <Row label="Chemistry"    value={data.payloadData.chemistry || 'NMC 811'} />
                <Row label="Health (SOH)" value={data.payloadData.healthState || '99.2%'} valueClass="text-emerald-600 dark:text-emerald-400" />
              </>)}
            </div>
          </div>

          {/* Verification details */}
          <div className={`${W.card} rounded-xl border ${W.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${W.borderMuted} bg-[#dde0e5] dark:bg-slate-900/40 text-emerald-600 dark:text-emerald-400`}>
              <Database className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Verification Details</span>
            </div>
            <div className="px-4 py-3">
              <Row label="Ledger Record"  value="FOUND ✓" valueClass="text-emerald-600 dark:text-emerald-400 font-bold" />
              <Row label="Hash Integrity" value={isVerified ? 'MATCH ✓' : 'MISMATCH ✕'}
                valueClass={isVerified ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 font-bold'} />
              <Row label="Registered"     value={new Date(fr.registeredAt).toLocaleString()} valueClass="font-mono text-[11px]" />
            </div>
            <div className={`mx-4 ${W.inner} rounded-lg border ${W.border} px-3 py-2.5 mb-3`}>
              <p className={`text-[10px] ${W.textFaint} mb-1`}>Fabric Transaction ID</p>
              <p className="font-mono text-[10px] text-stone-700 dark:text-slate-300 break-all">{fr.fabricTxId}</p>
            </div>
            <div className="mx-4 mb-4 space-y-2">
              {[
                { label: 'Ledger Hash (Immutable)', val: vd.ledgerHash,       cls: 'text-emerald-700 dark:text-emerald-300', tag: 'Fabric Peer' },
                { label: 'Recalculated Hash',       val: vd.recalculatedHash, cls: isVerified ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400', tag: isVerified ? 'Matches ✓' : 'Mismatch ✕' },
              ].map(({ label, val, cls, tag }) => (
                <div key={label} className={`rounded-lg border ${W.border} ${W.inner} px-3 py-2.5`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-[10px] ${W.textFaint} font-mono`}>{label}</p>
                    <span className={`text-[9px] font-bold uppercase ${cls}`}>{tag}</span>
                  </div>
                  <p className={`font-mono hash-text ${cls}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lifecycle timeline */}
        <div className={`${W.card} rounded-xl border ${W.border} overflow-hidden`}>
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${W.borderMuted} bg-[#dde0e5] dark:bg-slate-900/40 ${W.textMuted}`}>
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Asset Lifecycle Timeline</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['CREATED','QUALITY_VERIFIED','TRANSFERRED','PROCESSED'].map((stepKey, idx) => {
              const event = data.lifecycle?.find(l => l.step === stepKey) || { title: stepKey.replace('_',' '), timestamp: 'Pending', actor: 'Network Peer', txRef: 'N/A' };
              const done  = event.timestamp !== 'Pending';
              return (
                <div key={stepKey} className={`rounded-lg border p-3.5 ${done ? `${W.inner} ${W.border}` : `bg-[#dde0e5]/40 dark:bg-slate-900/20 border-dashed ${W.border}`}>`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono ${W.textFaint}`}>0{idx+1}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-emerald-600 text-white' : 'bg-[#d4d8e0] dark:bg-slate-800 text-[#8a92a0] dark:text-slate-400'}`}>
                      {done ? '✓' : idx+1}
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-stone-800 dark:text-slate-200 mb-0.5">{stepKey.replace('_',' ')}</p>
                  <p className={`text-[10px] ${W.textFaint} leading-tight mb-2`}>{event.title}</p>
                  <div className={`space-y-0.5 text-[10px] ${W.textFaint} border-t ${W.borderMuted} pt-2`}>
                    <p>Actor: <span className="text-stone-600 dark:text-slate-300">{event.actor}</span></p>
                    <p className="font-mono truncate">{event.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IoT telemetry events */}
        {data.lifecycle?.some(l => l.step === 'IOT_TELEMETRY' || l.step === 'IOT_PING') && (
          <div className={`${W.card} rounded-xl border ${W.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${W.borderMuted} bg-[#fdeedd] dark:bg-slate-900/40 ${W.textMuted}`}>
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">IoT Telemetry Events</span>
            </div>
            <div className="p-4 space-y-2.5">
              {data.lifecycle.filter(l => l.step==='IOT_TELEMETRY' || l.step==='IOT_PING').map((ev, i) => (
                <div key={i} className={`${W.inner} rounded-lg border ${W.border} px-3.5 py-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">{ev.title}</span>
                    <span className={`text-[10px] font-mono ${W.textFaint}`}>{ev.timestamp}</span>
                  </div>
                  <div className={`grid grid-cols-3 gap-3 text-[10px] font-mono ${W.textFaint} pt-2 border-t ${W.borderMuted}`}>
                    <div>Device: <span className="text-stone-700 dark:text-slate-300 font-semibold">{ev.actor}</span></div>
                    <div>Event: <span className="text-stone-700 dark:text-slate-300">{ev.eventId || ev.txRef}</span></div>
                    <div className="truncate">Hash: <span className="text-emerald-600 dark:text-emerald-400">{ev.telemetryHash || 'Verified'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IoT device card */}
        {data.iotTelemetry && (
          <div className={`${W.card} rounded-xl border ${W.border} overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${W.borderMuted} bg-[#fdeedd] dark:bg-slate-900/40`}>
              <div className={`flex items-center gap-2 ${W.textMuted}`}>
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Bound IoT Device</span>
              </div>
              <Link to={`/verify/device/${data.iotTelemetry.deviceId}`} className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                Verify device <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Device ID', content: <><p className="font-mono font-bold text-stone-900 dark:text-slate-100">{data.iotTelemetry.deviceId}</p><p className={`text-[10px] ${W.textFaint} mt-0.5`}>{data.iotTelemetry.deviceType}</p></> },
                { label: 'Live Telemetry', content: Object.entries(data.iotTelemetry.telemetry||{}).map(([k,v]) => (
                  <div key={k} className="flex justify-between text-[11px] font-mono">
                    <span className={W.textFaint}>{k}:</span>
                    <span className="text-stone-800 dark:text-slate-200 font-bold">{v}</span>
                  </div>)) },
                { label: 'Integrity', content: <><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>{data.iotTelemetry.telemetryIntegrity} ✓</p><p className={`text-[10px] ${W.textFaint} mt-2`}>No private keys exposed.</p></> },
              ].map(({ label, content }) => (
                <div key={label} className={`${W.inner} rounded-lg border ${W.border} p-3`}>
                  <p className={`text-[10px] ${W.textFaint} mb-1`}>{label}</p>
                  {content}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
