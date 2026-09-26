import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCodeBox from '../components/QRCodeBox';
import TamperControlPanel from '../components/TamperControlPanel';
import { ArrowLeft, Database, ShieldCheck, Cpu, Layers, ExternalLink } from 'lucide-react';

export default function AssetDetails() {
  const { assetId } = useParams();
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = () => {
    fetch(`/api/verify/${assetId}`)
      .then(res => res.json())
      .then(data => {
        setAssetData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-emerald-400 font-medium">Loading Asset Details...</div>
      </div>
    );
  }

  if (!assetData || assetData.status === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-lg mx-auto text-center">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          <h2 className="text-xl font-bold text-slate-200">Asset Not Found</h2>
          <p className="text-slate-400 text-xs mt-2 mb-6">Asset ID '{assetId}' is not registered on TrustLedger.</p>
          <Link to="/" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to TrustLedger Dashboard
        </Link>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Hyperledger Fabric Channel: {assetData.fabricRecord?.channelName || 'trustledger'}
        </div>
      </div>

      {/* Main Asset Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            Registered Asset Profile
          </div>
          <h1 className="text-3xl font-black text-slate-100 font-mono tracking-tight">{assetData.assetId}</h1>
          <p className="text-sm text-slate-400 mt-1">{assetData.assetType} — <span className="text-slate-200 font-semibold">{assetData.sector} Sector</span></p>
        </div>

        <Link
          to={`/verify/${assetData.assetId}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg"
        >
          <ExternalLink className="w-4 h-4" /> Open Public Verification Page
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Asset Info & Fabric Proof */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Database className="w-4 h-4" /> Hyperledger Fabric Ledger Record
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 font-medium">Transaction ID</div>
                <div className="font-mono text-slate-200 font-semibold truncate mt-0.5" title={assetData.fabricRecord?.fabricTxId}>
                  {assetData.fabricRecord?.fabricTxId}
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 font-medium">Block Number</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">#{assetData.fabricRecord?.blockNumber}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 col-span-2">
                <div className="text-slate-500 font-medium">Cryptographic Ledger SHA-256 Proof</div>
                <div className="font-mono text-[11px] text-emerald-300 break-all bg-slate-950 p-2 rounded border border-slate-800 mt-1">
                  {assetData.fabricRecord?.ledgerHash}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Tamper Tester */}
          <TamperControlPanel activeAssetId={assetData.assetId} onStatusChange={fetchDetails} />
        </div>

        {/* Right Column: Section 4 QR Box */}
        <div>
          <QRCodeBox 
            assetId={assetData.assetId} 
            verificationUrl={`/verify/${assetData.assetId}`} 
          />
        </div>

      </div>
    </div>
  );
}
