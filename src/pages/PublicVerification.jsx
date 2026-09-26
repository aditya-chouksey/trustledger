import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Clock, 
  Check, 
  FileCheck, 
  Layers, 
  Zap, 
  Sprout, 
  Car, 
  Lock, 
  Hash, 
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function PublicVerification() {
  const { assetId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/verify/${assetId}`);
      if (!res.ok) throw new Error('Failed to fetch verification payload');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-emerald-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Validating Cryptographic Proof on Hyperledger Fabric...</span>
        </div>
      </div>
    );
  }

  if (error || !data || data.status === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-2xl mx-auto flex flex-col justify-center">
        <div className="glass-panel rounded-3xl p-8 border border-red-500/30 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Asset Verification Failed</h1>
          <p className="text-slate-400 text-sm mb-6">
            {data?.message || error || `Asset ID '${assetId}' could not be verified on the TrustLedger network.`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 transition-colors"
          >
            Return to TrustLedger Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = data.status === 'VERIFIED';
  const sector = data.sector || 'Agriculture';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-emerald-500 selection:text-slate-950">
      {/* Public Page Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-950/40 text-lg">
              TL
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center gap-2">
                TRUSTLEDGER
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DLT Proof
                </span>
              </div>
              <div className="text-xs text-slate-400">Decentralized Asset Verification</div>
            </div>
          </div>

          <button
            onClick={fetchVerificationData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Re-verify against Fabric Ledger"
          >
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Re-verify</span>
          </button>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* Verification Status Banner */}
        <div className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
          isVerified 
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900/90' 
            : 'border-red-500/50 bg-gradient-to-b from-red-950/30 to-slate-900/90'
        }`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 ${
                isVerified ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-red-500 text-slate-950 shadow-red-500/20'
              }`}>
                {isVerified ? <CheckCircle2 className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              </div>

              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
                  Verification Status
                </div>
                <div className={`text-3xl font-black tracking-tight ${isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isVerified ? 'VERIFIED ✓' : 'TAMPERED ✕'}
                </div>
                <div className="text-sm text-slate-300 mt-1 font-medium">
                  {isVerified 
                    ? 'Cryptographic SHA-256 proof matches the Hyperledger Fabric ledger record.' 
                    : 'Integrity verification failed. Recorded proof does not match the current data.'}
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Asset Reference</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{data.assetId}</div>
              <div className="text-xs text-slate-400 mt-0.5">{data.sector} Sector</div>
            </div>
          </div>

          {/* Core UX Explanation Message (Section 17 Requirement) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2 text-slate-200 font-medium">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-100">TrustLedger Architecture Note:</span> {data.uxExplanation.message}
              </div>
            </div>
            <div className={`font-mono text-xs pt-2 border-t border-slate-800/60 font-semibold flex items-center gap-1.5 ${isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
              {isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              Result: {data.uxExplanation.resultText}
            </div>
          </div>
        </div>

        {/* Public Asset Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Asset Safe Metadata Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              {sector === 'Agriculture' && <Sprout className="w-4 h-4" />}
              {sector === 'Energy' && <Zap className="w-4 h-4" />}
              {sector === 'Mobility' && <Car className="w-4 h-4" />}
              Asset Information
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500 font-medium">Asset ID</div>
                <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">{data.assetId}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Sector</div>
                <div className="font-semibold text-slate-200 mt-0.5">{data.sector}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Asset Type</div>
                <div className="font-semibold text-slate-200 mt-0.5">{data.assetType}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Current Status</div>
                <div className="inline-flex items-center gap-1 font-bold text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data.verificationDetails.currentStatus}
                </div>
              </div>
            </div>

            {/* Dynamic Multi-Sector Payload View */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                Sector-Specific Data Payload
              </div>

              {sector === 'Agriculture' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Crop / Variety:</span>
                    <span className="font-medium text-slate-200">{data.payloadData.crop || 'Durum Wheat'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Quantity Batch:</span>
                    <span className={`font-mono font-bold ${!isVerified ? 'text-red-400 underline' : 'text-slate-200'}`}>
                      {data.payloadData.quantity || '1000 kg'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Origin Location:</span>
                    <span className="font-medium text-slate-200">{data.payloadData.origin || 'Punjab Farm'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Certification:</span>
                    <span className="font-medium text-emerald-400">{data.payloadData.certification || 'ISO 22000'}</span>
                  </div>
                </>
              )}

              {sector === 'Energy' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Generation Source:</span>
                    <span className="font-medium text-slate-200">{data.payloadData.generationSource || 'Solar Farm Alpha'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Capacity:</span>
                    <span className={`font-mono font-bold ${!isVerified ? 'text-red-400 underline' : 'text-slate-200'}`}>
                      {data.payloadData.capacity || '500 MWh'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="font-mono text-slate-200">{data.payloadData.certId || 'REC-2026-SOL'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Verification Authority:</span>
                    <span className="font-medium text-emerald-400">{data.payloadData.verificationAuthority || 'GreenGrid'}</span>
                  </div>
                </>
              )}

              {sector === 'Mobility' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="font-medium text-slate-200">{data.payloadData.manufacturer || 'VoltPower'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Battery Capacity:</span>
                    <span className={`font-mono font-bold ${!isVerified ? 'text-red-400 underline' : 'text-slate-200'}`}>
                      {data.payloadData.capacity || '82 kWh'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Chemistry:</span>
                    <span className="font-medium text-slate-200">{data.payloadData.chemistry || 'NMC 811'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Health State (SOH):</span>
                    <span className="font-medium text-emerald-400">{data.payloadData.healthState || '99.2%'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ledger Proof Verification Details Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <Database className="w-4 h-4" /> Verification Details
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Ledger Record:</span>
                <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                  FOUND ✓
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Hash Integrity:</span>
                <span className={`font-bold inline-flex items-center gap-1 ${isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isVerified ? 'MATCH ✓' : 'MISMATCH ✕'}
                </span>
              </div>

              <div className="py-1.5 border-b border-slate-800/60">
                <div className="text-slate-400 font-medium mb-1">Hyperledger Fabric Transaction:</div>
                <div className="font-mono text-slate-200 text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800 break-all">
                  {data.fabricRecord.fabricTxId}
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Registered Timestamp:</span>
                <span className="font-mono text-slate-300">
                  {new Date(data.fabricRecord.registeredAt).toLocaleString()}
                </span>
              </div>

              {/* Cryptographic SHA-256 Hashes Display */}
              <div className="pt-2 space-y-2">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Ledger Immutable SHA-256 Proof:</span>
                    <span className="text-emerald-400 text-[10px] font-bold">Fabric Peer</span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-300 bg-slate-900 p-2 rounded-lg border border-slate-800 break-all mt-1">
                    {data.verificationDetails.ledgerHash}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Recalculated Off-Chain SHA-256 Hash:</span>
                    <span className={isVerified ? 'text-emerald-400 text-[10px]' : 'text-red-400 text-[10px]'}>
                      {isVerified ? 'Matches Proof' : 'Does Not Match!'}
                    </span>
                  </div>
                  <div className={`font-mono text-[10px] p-2 rounded-lg border break-all mt-1 ${
                    isVerified 
                      ? 'bg-slate-900 text-emerald-300 border-slate-800' 
                      : 'bg-red-950/40 text-red-300 border-red-800/50'
                  }`}>
                    {data.verificationDetails.recalculatedHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Visual Stepper Timeline (Section 7 Requirement) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Asset Lifecycle Timeline
          </div>

          <div className="relative pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
              {['CREATED', 'QUALITY_VERIFIED', 'TRANSFERRED', 'PROCESSED'].map((stepKey, idx) => {
                const event = data.lifecycle?.find(l => l.step === stepKey) || {
                  title: stepKey.replace('_', ' '),
                  timestamp: 'Pending',
                  actor: 'Network Peer',
                  txRef: 'N/A'
                };
                const isCompleted = event.timestamp !== 'Pending';

                return (
                  <div key={stepKey} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                        Step 0{idx + 1}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                    </div>

                    <div className="font-semibold text-slate-100 text-xs">
                      {stepKey.replace('_', ' ')}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {event.title}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
                      <div>Actor: <span className="text-slate-300">{event.actor}</span></div>
                      <div>Time: <span className="text-slate-300 font-mono">{event.timestamp}</span></div>
                      <div className="truncate">Ref: <span className="text-slate-400 font-mono">{event.txRef}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* IoT Integration Card (Section 8 Requirement) */}
        {data.iotTelemetry && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <Cpu className="w-4 h-4" /> Bound IoT Device & Sensor Telemetry
              </div>
              <Link
                to={`/verify/device/${data.iotTelemetry.deviceId}`}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Verify Device directly <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-500 font-medium">IoT Device Identifier</div>
                <div className="font-mono font-bold text-slate-100 text-sm">{data.iotTelemetry.deviceId}</div>
                <div className="text-slate-400 text-[11px]">{data.iotTelemetry.deviceType}</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Latest Live Telemetry</div>
                {Object.entries(data.iotTelemetry.telemetry || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-slate-300 font-mono">
                    <span className="capitalize">{key}:</span>
                    <span className="font-bold text-slate-100">{val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Telemetry Integrity</div>
                <div className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {data.iotTelemetry.telemetryIntegrity} ✓
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  No device credentials or private keys exposed.
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
