import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function TamperControlPanel({ activeAssetId, onStatusChange }) {
  const [tampered, setTampered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const targetId = activeAssetId || 'AG-WHEAT-1024';

  const handleTamper = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: targetId })
      });
      const data = await res.json();
      setTampered(true);
      setMessage(data.message);
      if (onStatusChange) onStatusChange('TAMPERED');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: targetId })
      });
      const data = await res.json();
      setTampered(false);
      setMessage(data.message);
      if (onStatusChange) onStatusChange('VERIFIED');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-slate-900/90 shadow-2xl my-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
            Demo Tamper Testing Console — Asset <span className="text-emerald-400">{targetId}</span>
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          QR code remains constant while DLT detects off-chain data tampering.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!tampered ? (
          <button
            onClick={handleTamper}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" /> Simulate Off-Chain Data Tamper (1000 kg → 5000 kg)
          </button>
        ) : (
          <button
            onClick={handleRestore}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Restore Original Data (1000 kg)
          </button>
        )}

        <a
          href={`/verify/${targetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Test QR Verification Page
        </a>
      </div>

      {message && (
        <div className={`mt-3 p-3 rounded-xl text-xs font-mono border ${tampered ? 'bg-amber-950/40 text-amber-300 border-amber-800/50' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'}`}>
          <div className="font-bold mb-1">
            {tampered ? 'TAMPER SIMULATION ACTIVE:' : 'DATA RESTORED:'}
          </div>
          {message}
        </div>
      )}
    </div>
  );
}
