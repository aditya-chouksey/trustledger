import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  QrCode, 
  Database, 
  Sprout, 
  Zap, 
  Car, 
  ExternalLink, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import QRCodeBox from '../components/QRCodeBox';
import TamperControlPanel from '../components/TamperControlPanel';

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForQR, setSelectedAssetForQR] = useState(null);
  
  // Registration Form State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSector, setRegisterSector] = useState('Agriculture');
  const [registerAssetId, setRegisterAssetId] = useState(`AG-WHEAT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [registerAssetType, setRegisterAssetType] = useState('Organic Wheat Batch');
  const [registerField1, setRegisterField1] = useState('Durum Wheat');
  const [registerField2, setRegisterField2] = useState('1000 kg');
  const [registerIotId, setRegisterIotId] = useState(`ESP32-AG-${Math.floor(100 + Math.random() * 900)}`);
  const [registering, setRegistering] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSectorChange = (sec) => {
    setRegisterSector(sec);
    if (sec === 'Agriculture') {
      setRegisterAssetId(`AG-WHEAT-${Math.floor(1000 + Math.random() * 9000)}`);
      setRegisterAssetType('Organic Wheat Batch');
      setRegisterField1('Durum Wheat');
      setRegisterField2('1000 kg');
      setRegisterIotId(`ESP32-AG-${Math.floor(100 + Math.random() * 900)}`);
    } else if (sec === 'Energy') {
      setRegisterAssetId(`EN-REC-${Math.floor(1000 + Math.random() * 9000)}`);
      setRegisterAssetType('Renewable Energy Certificate');
      setRegisterField1('Solar Farm Beta');
      setRegisterField2('500 MWh');
      setRegisterIotId(`ESP32-EN-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setRegisterAssetId(`EV-BAT-${Math.floor(1000 + Math.random() * 9000)}`);
      setRegisterAssetType('EV Lithium Battery Pack');
      setRegisterField1('VoltPower Gigafactory');
      setRegisterField2('82 kWh');
      setRegisterIotId(`ESP32-EV-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);

    const payload = registerSector === 'Agriculture' 
      ? { crop: registerField1, quantity: registerField2, origin: 'Punjab Farm Cluster', certification: 'ISO 22000' }
      : registerSector === 'Energy'
      ? { generationSource: registerField1, capacity: registerField2, certId: `REC-${Date.now()}`, verificationAuthority: 'GreenGrid' }
      : { manufacturer: registerField1, capacity: registerField2, chemistry: 'NMC 811', healthState: '100% SOH' };

    try {
      const res = await fetch('/api/assets/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: registerAssetId,
          sector: registerSector,
          assetType: registerAssetType,
          payload,
          iotDeviceId: registerIotId
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRegisterModal(false);
        await fetchAssets();
        setSelectedAssetForQR(registerAssetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-950/40">
              TL
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center gap-2">
                TRUSTLEDGER
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hyperledger Fabric
                </span>
              </div>
              <div className="text-xs text-slate-400">QR-Based Decentralized Verification Add-On</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/iot"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 transition-all"
            >
              <Cpu className="w-4 h-4 text-emerald-400" /> IoT Devices
            </Link>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Asset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Hero Concept Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> TrustLedger Physical-to-Digital Bridge
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Cryptographic QR Verification Layer
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every registered asset receives a unique QR code containing only a secure verification URL. Scanning connects physical items directly to their immutable SHA-256 proof stored on Hyperledger Fabric.
            </p>
          </div>

          {/* Section 18 Architectural Flow Visualizer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> End-to-End Trust Verification Architecture
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-[11px] font-mono">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-slate-200">PHYSICAL ASSET</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-emerald-400">QR / IoT DEVICE</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-slate-200">TRUSTLEDGER</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-slate-200">AI + POLICY</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-emerald-400">SHA-256</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-slate-200">FABRIC LEDGER</div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-slate-200">VERIFICATION</div>
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/40 font-extrabold text-emerald-400">QR VERIFY PAGE</div>
            </div>
          </div>
        </div>

        {/* Global Demo Tamper Tester Panel */}
        <TamperControlPanel activeAssetId="AG-WHEAT-1024" onStatusChange={fetchAssets} />

        {/* Multi-Sector Asset Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" /> Multi-Sector Registered Assets
            </h2>
            <div className="text-xs text-slate-400">
              Showing <span className="text-slate-200 font-bold">{assets.length}</span> assets registered on Fabric
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm py-8 text-center">Loading assets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assets.map((ast) => {
                const isAgri = ast.sector === 'Agriculture';
                const isEnergy = ast.sector === 'Energy';

                return (
                  <div key={ast.assetId} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                          {isAgri && <span className="text-emerald-400 flex items-center gap-1"><Sprout className="w-3.5 h-3.5" /> Agriculture</span>}
                          {isEnergy && <span className="text-amber-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Energy</span>}
                          {!isAgri && !isEnergy && <span className="text-sky-400 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Mobility</span>}
                        </div>

                        <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 py-0.5 px-2 rounded border border-slate-800">
                          {ast.iotDeviceId || 'IoT Bound'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-mono text-xl font-extrabold text-slate-100">{ast.assetId}</h3>
                        <p className="text-xs text-slate-400">{ast.assetType}</p>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                        <div className="text-slate-500">Fabric Transaction:</div>
                        <div className="text-slate-300 font-semibold truncate" title={ast.txId}>{ast.txId}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <Link
                        to={`/assets/${ast.assetId}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl border border-slate-700 transition-colors"
                      >
                        Asset Details & QR
                      </Link>

                      <Link
                        to={`/verify/${ast.assetId}`}
                        target="_blank"
                        className="inline-flex items-center justify-center p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-colors"
                        title="Open Public QR Verification Page"
                      >
                        <QrCode className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-800 space-y-5 bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Register Asset on Hyperledger Fabric
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium mb-1 block">Select Sector</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Agriculture', 'Energy', 'Mobility'].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleSectorChange(sec)}
                      className={`py-2 rounded-xl font-bold transition-all border ${
                        registerSector === sec 
                          ? 'bg-emerald-600 text-slate-950 border-emerald-500' 
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium mb-1 block">Asset ID</label>
                <input
                  type="text"
                  value={registerAssetId}
                  onChange={(e) => setRegisterAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium mb-1 block">Asset Type Description</label>
                <input
                  type="text"
                  value={registerAssetType}
                  onChange={(e) => setRegisterAssetType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    {registerSector === 'Agriculture' ? 'Crop' : registerSector === 'Energy' ? 'Gen Source' : 'Manufacturer'}
                  </label>
                  <input
                    type="text"
                    value={registerField1}
                    onChange={(e) => setRegisterField1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    {registerSector === 'Agriculture' ? 'Quantity' : registerSector === 'Energy' ? 'Capacity' : 'Battery Capacity'}
                  </label>
                  <input
                    type="text"
                    value={registerField2}
                    onChange={(e) => setRegisterField2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium mb-1 block">IoT Device ID Binding</label>
                <input
                  type="text"
                  value={registerIotId}
                  onChange={(e) => setRegisterIotId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-2.5 rounded-xl font-bold transition-all"
                >
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
