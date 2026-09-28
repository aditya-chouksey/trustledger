import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function TamperControlPanel({ activeAssetId, onStatusChange }) {
  const [tampered, setTampered] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState('');

  const targetId = activeAssetId || 'AG-WHEAT-1024';

  const handleTamper = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/demo/tamper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: targetId }) });
      const data = await res.json();
      setTampered(true); setMessage(data.message);
      if (onStatusChange) onStatusChange('TAMPERED');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/demo/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: targetId }) });
      const data = await res.json();
      setTampered(false); setMessage(data.message);
      if (onStatusChange) onStatusChange('VERIFIED');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-[#c8cdd6] dark:border-slate-800 bg-[#e8eaed] dark:bg-[#0d1424] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4d8e0] dark:border-slate-800 bg-[#dde0e5] dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-[11px] font-semibold text-[#5a6070] dark:text-slate-300 uppercase tracking-wider font-mono">
            Integrity Audit Console
          </span>
          <span className="font-mono text-[11px] text-stone-400 dark:text-slate-500">— {targetId}</span>
        </div>
        <a href={`/verify/${targetId}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-[#8a92a0] hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-medium">
          Test verify link <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="px-4 py-3.5 space-y-3">
        <p className="text-[11px] text-[#5a6070] dark:text-slate-500 leading-relaxed">
          Simulate an off-chain payload modification to demonstrate SHA-256 hash mismatch detection. The Fabric ledger proof stays immutable.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          {!tampered ? (
            <button onClick={handleTamper} disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/25 transition-colors cursor-pointer disabled:opacity-40">
              <AlertTriangle className="w-3.5 h-3.5" />
              {loading ? 'Simulating…' : 'Simulate Tamper  (1000 kg → 5000 kg)'}
            </button>
          ) : (
            <button onClick={handleRestore} disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25 transition-colors cursor-pointer disabled:opacity-40">
              <RotateCcw className="w-3.5 h-3.5" />
              {loading ? 'Restoring…' : 'Restore Original State (1000 kg)'}
            </button>
          )}

          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            tampered
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/25'
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/25'
          }`}>
            {tampered ? <><AlertTriangle className="w-3 h-3"/>TAMPERED</> : <><CheckCircle2 className="w-3 h-3"/>INTACT</>}
          </span>
        </div>

        {message && (
          <div className={`flex items-start gap-2.5 p-3 rounded-lg text-[11px] font-mono border ${
            tampered
              ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'
              : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
          }`}>
            <span className="mt-px shrink-0">
              {tampered ? <AlertTriangle className="w-3.5 h-3.5"/> : <CheckCircle2 className="w-3.5 h-3.5"/>}
            </span>
            <span className="leading-relaxed">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
