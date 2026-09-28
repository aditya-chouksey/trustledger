import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCodeBox from '../components/QRCodeBox';
import TamperControlPanel from '../components/TamperControlPanel';
import { ArrowLeft, Database, ExternalLink, Hash, Cpu } from 'lucide-react';

function InfoTile({ label, value, mono = false, className = '' }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5">
      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[12px] text-slate-800 dark:text-slate-200 leading-snug ${mono ? 'font-mono' : 'font-semibold'} ${className}`}>{value}</p>
    </div>
  );
}

export default function AssetDetails() {
  const { assetId } = useParams();
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = () => {
    fetch(`/api/verify/${assetId}`)
      .then(r => r.json())
      .then(d => { setAssetData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDetails(); }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e1a] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-emerald-400 text-sm">
          <div className="w-4 h-4 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          Loading asset record…
        </div>
      </div>
    );
  }

  if (!assetData || assetData.status === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-[#070e1a] flex items-center justify-center p-6">
        <div className="bg-[#0d1424] rounded-2xl border border-slate-800 p-10 text-center max-w-sm">
          <p className="text-lg font-bold text-slate-100 mb-2">Asset Not Found</p>
          <p className="text-sm text-slate-400 mb-6">'{assetId}' is not registered on TrustLedger.</p>
          <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const fr = assetData.fabricRecord || {};

  return (
    <div className="min-h-screen bg-[#070e1a] bg-grid text-slate-100 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-emerald-400 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {fr.channelName || 'trustledger-channel'}
          </span>
        </div>

        {/* Hero */}
        <div className="bg-[#0d1424] rounded-xl border border-slate-800 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 accent-top fade-up">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Asset Profile
            </span>
            <h1 className="font-mono text-3xl font-black mt-2 tracking-tight text-gradient-brand">{assetData.assetId}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {assetData.assetType} — <span className="text-slate-300 font-medium">{assetData.sector}</span>
            </p>
          </div>
          <Link
            to={`/verify/${assetData.assetId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Public Verify
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Left — Fabric record + Tamper panel */}
          <div className="md:col-span-2 space-y-5">

            {/* Fabric record card */}
            <div className="bg-[#0d1424] rounded-xl border border-slate-800 overflow-hidden accent-top fade-up fade-up-delay-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hyperledger Fabric Record</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <InfoTile label="Transaction ID"  value={fr.fabricTxId}   mono />
                <InfoTile label="Block Number"    value={`#${fr.blockNumber}`} mono className="text-emerald-400 font-bold" />
                <InfoTile label="Registered At"   value={fr.registeredAt ? new Date(fr.registeredAt).toLocaleString() : '—'} />
                <InfoTile label="Chaincode"       value={fr.chaincode || 'trustledger-cc'} mono />
              </div>
              {/* Hash display */}
              <div className="mx-4 mb-4 bg-slate-900 rounded-lg border border-slate-800 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">SHA-256 Ledger Proof</span>
                </div>
                <p className="font-mono text-[10px] text-emerald-300 hash-text bg-slate-950 p-2 rounded border border-slate-800">
                  {fr.ledgerHash}
                </p>
              </div>
            </div>

            <TamperControlPanel activeAssetId={assetData.assetId} onStatusChange={fetchDetails} />
          </div>

          {/* Right — QR */}
          <div>
            <QRCodeBox assetId={assetData.assetId} verificationUrl={`/verify/${assetData.assetId}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
