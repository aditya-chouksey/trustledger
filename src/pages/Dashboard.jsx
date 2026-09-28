import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TamperControlPanel from '../components/TamperControlPanel';
import {
  Plus, QrCode, Database, Sprout, Zap, Car,
  Layers, Search, Bot, Table as TableIcon, Grid as GridIcon, ArrowRight
} from 'lucide-react';

// ── gray light-mode tokens ──────────────────────────────
// page bg     : #f1f3f6
// card        : #e8eaed
// card inner  : #dde0e5
// border      : #c8cdd6
// border muted: #d4d8e0
// text        : #1a1d23
// text muted  : #5a6070
// text faint  : #8a92a0

const G = {
  page:   'bg-[#f1f3f6] dark:bg-[#070e1a]',
  card:   'bg-[#e8eaed] dark:bg-[#0d1424]',
  inner:  'bg-[#dde0e5] dark:bg-slate-900/60',
  border: 'border-[#c8cdd6] dark:border-slate-800',
  borderM:'border-[#d4d8e0] dark:border-slate-800',
  text:   'text-[#1a1d23] dark:text-slate-100',
  muted:  'text-[#5a6070] dark:text-slate-400',
  faint:  'text-[#8a92a0] dark:text-slate-500',
};

const SECTOR_META = {
  Agriculture: { icon: <Sprout className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-300 dark:border-emerald-500/20' },
  Energy:      { icon: <Zap    className="w-3.5 h-3.5" />, color: 'text-amber-600  dark:text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-300  dark:border-amber-500/20'  },
  Mobility:    { icon: <Car    className="w-3.5 h-3.5" />, color: 'text-sky-600    dark:text-sky-400',     bg: 'bg-sky-500/10',    border: 'border-sky-300    dark:border-sky-500/20'    },
};

function MetricCard({ label, value, valueClass = '', delay = '' }) {
  return (
    <div className={`${G.card} rounded-xl border ${G.border} px-5 py-4 fade-up stat-card ${delay}`}>
      <p className={`text-[11px] font-medium uppercase tracking-wider ${G.faint}`}>{label}</p>
      <p className={`font-mono text-2xl font-bold mt-1.5 ${G.text} ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [assets,  setAssets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSectorFilter, setActiveSectorFilter] = useState('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [viewMode,     setViewMode]     = useState('grid');

  const [showAiModal,    setShowAiModal]    = useState(false);
  const [aiPrompt,       setAiPrompt]       = useState('');
  const [aiParsing,      setAiParsing]      = useState(false);
  const [aiSuccessMsg,   setAiSuccessMsg]   = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSector,    setRegisterSector]    = useState('Agriculture');
  const [registerAssetId,   setRegisterAssetId]   = useState(`AG-WHEAT-${Math.floor(1000+Math.random()*9000)}`);
  const [registerAssetType, setRegisterAssetType] = useState('Organic Wheat Batch');
  const [registerField1,    setRegisterField1]    = useState('Durum Wheat');
  const [registerField2,    setRegisterField2]    = useState('1000 kg');
  const [registerIotId,     setRegisterIotId]     = useState(`ESP32-AG-${Math.floor(100+Math.random()*900)}`);
  const [registering,       setRegistering]       = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAssets(); }, []);

  const handleSectorChange = (sec) => {
    setRegisterSector(sec);
    if (sec === 'Agriculture') {
      setRegisterAssetId(`AG-WHEAT-${Math.floor(1000+Math.random()*9000)}`);
      setRegisterAssetType('Organic Wheat Batch');
      setRegisterField1('Durum Wheat'); setRegisterField2('1000 kg');
      setRegisterIotId(`ESP32-AG-${Math.floor(100+Math.random()*900)}`);
    } else if (sec === 'Energy') {
      setRegisterAssetId(`EN-REC-${Math.floor(1000+Math.random()*9000)}`);
      setRegisterAssetType('Renewable Energy Certificate');
      setRegisterField1('Solar Farm Beta'); setRegisterField2('500 MWh');
      setRegisterIotId(`ESP32-EN-${Math.floor(100+Math.random()*900)}`);
    } else {
      setRegisterAssetId(`EV-BAT-${Math.floor(1000+Math.random()*9000)}`);
      setRegisterAssetType('EV Lithium Battery Pack');
      setRegisterField1('VoltPower Gigafactory'); setRegisterField2('82 kWh');
      setRegisterIotId(`ESP32-EV-${Math.floor(100+Math.random()*900)}`);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); setRegistering(true);
    const payload = registerSector==='Agriculture'
      ? { crop:registerField1, quantity:registerField2, origin:'Punjab Farm Cluster', certification:'ISO 22000' }
      : registerSector==='Energy'
      ? { generationSource:registerField1, capacity:registerField2, certId:`REC-${Date.now()}`, verificationAuthority:'GreenGrid' }
      : { manufacturer:registerField1, capacity:registerField2, chemistry:'NMC 811', healthState:'100% SOH' };
    try {
      const res = await fetch('/api/assets/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ assetId:registerAssetId, sector:registerSector, assetType:registerAssetType, payload, iotDeviceId:registerIotId }),
      });
      const data = await res.json();
      if (data.success) { setShowRegisterModal(false); await fetchAssets(); }
    } catch (err) { console.error(err); }
    finally { setRegistering(false); }
  };

  const handleAiRegister = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiParsing(true); setAiSuccessMsg('');
    try {
      const aiRes  = await fetch('/api/ai/parse', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prompt:aiPrompt}) });
      const aiData = await aiRes.json();
      const output = aiData.aiAnalysis.structuredOutput;
      const sector = output.sector||'Agriculture';
      const prefix = sector==='Agriculture'?'AG-WHEAT':sector==='Energy'?'EN-REC':'EV-BAT';
      const newId  = `${prefix}-${Math.floor(1000+Math.random()*9000)}`;
      const payload= sector==='Agriculture'
        ?{crop:'AI Batch',quantity:output.quantity||'1000 kg',certification:'ISO 22000'}
        :sector==='Energy'
        ?{generationSource:'Solar Farm Alpha',capacity:output.quantity||'500 MWh',certId:`REC-${Date.now()}`}
        :{manufacturer:'VoltPower',capacity:output.quantity||'82 kWh',chemistry:'NMC 811'};
      const regRes = await fetch('/api/assets/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ assetId:newId, sector, assetType:output.assetType, payload, iotDeviceId:`ESP32-${sector.substring(0,2).toUpperCase()}-001` }),
      });
      const regData = await regRes.json();
      if (regData.success) { setAiSuccessMsg(`'${newId}' registered on Fabric.`); setAiPrompt(''); await fetchAssets(); }
    } catch (err) { console.error(err); }
    finally { setAiParsing(false); }
  };

  const filteredAssets = assets.filter(ast => {
    const matchesSector = activeSectorFilter==='All' || ast.sector===activeSectorFilter;
    const matchesSearch = ast.assetId.toLowerCase().includes(searchQuery.toLowerCase())
      || ast.assetType.toLowerCase().includes(searchQuery.toLowerCase())
      || ast.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const inputCls = `w-full px-3 py-2 rounded-lg ${G.inner} border ${G.border} ${G.text} placeholder:${G.faint} focus:outline-none focus:border-emerald-500 transition-colors text-[12px]`;

  return (
    <div className={`min-h-screen ${G.page} bg-grid pb-20 transition-colors duration-200`}>
      <Navbar onOpenRegister={() => setShowRegisterModal(true)} onOpenAiModal={() => setShowAiModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Registered Assets"  value={assets.length} delay="fade-up-delay-1" />
          <MetricCard label="Fabric Transactions" value="1,048"         delay="fade-up-delay-2" />
          <MetricCard label="Active IoT Devices"  value="3"             delay="fade-up-delay-3" />
          <MetricCard label="SHA-256 Integrity"   value="100%"          delay="fade-up-delay-4" valueClass="text-gradient-emerald" />
        </div>

        {/* Tamper console */}
        <TamperControlPanel activeAssetId="AG-WHEAT-1024" onStatusChange={fetchAssets} />

        {/* Asset Registry */}
        <div className={`${G.card} rounded-xl border ${G.border} overflow-hidden accent-top fade-up fade-up-delay-2`}>

          {/* Toolbar */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b ${G.borderM} ${G.inner}`}>
            <div>
              <h2 className={`text-sm font-semibold ${G.text} flex items-center gap-2`}>
                <Database className="w-4 h-4 text-emerald-500" /> Asset Registry
              </h2>
              <p className={`text-[11px] ${G.faint} mt-0.5`}>Cryptographic proofs backed by Hyperledger Fabric</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-52">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2 ${G.faint}`} />
                <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="Search by ID or sector…"
                  className={`w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg ${G.inner} border ${G.border} ${G.text} focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[#8a92a0]`}
                />
              </div>

              {/* Sector filter */}
              <div className={`flex items-center gap-0.5 ${G.inner} p-1 rounded-lg border ${G.border}`}>
                {['All','Agriculture','Energy','Mobility'].map(s => (
                  <button key={s} onClick={() => setActiveSectorFilter(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activeSectorFilter===s
                        ? `${G.card} ${G.text} shadow-sm border ${G.border}`
                        : `${G.muted} hover:${G.text}`
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className={`flex items-center gap-0.5 ${G.inner} p-1 rounded-lg border ${G.border}`}>
                {[['grid', <GridIcon className="w-3.5 h-3.5"/>],['table',<TableIcon className="w-3.5 h-3.5"/>]].map(([m,icon]) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`p-1.5 rounded-md transition-all ${viewMode===m ? `${G.card} ${G.text} shadow-sm` : `${G.faint} hover:${G.text}`}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {loading ? (
              <div className="text-center py-12">
                <div className={`inline-block w-5 h-5 border-2 border-[#c8cdd6] dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-3`} />
                <div className={`text-[12px] ${G.faint} font-mono`}>Loading ledger data…</div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className={`h-28 rounded-xl ${G.inner} dark:bg-slate-800/60 shimmer`} />)}
                </div>
              </div>
            ) : filteredAssets.length===0 ? (
              <div className={`text-center py-12 text-[12px] ${G.faint}`}>No assets match your filter.</div>
            ) : viewMode==='table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className={`border-b ${G.borderM}`}>
                      {['Asset ID','Sector','Type','Fabric TX','IoT Device',''].map(h => (
                        <th key={h} className={`py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider ${G.faint}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-[#d4d8e0] dark:divide-slate-800/60`}>
                    {filteredAssets.map(ast => {
                      const m = SECTOR_META[ast.sector]||SECTOR_META.Agriculture;
                      return (
                        <tr key={ast.assetId} className={`hover:${G.inner} transition-colors`}>
                          <td className={`py-3 px-3 font-mono font-bold ${G.text} text-[12px]`}>{ast.assetId}</td>
                          <td className="py-3 px-3"><span className={`inline-flex items-center gap-1 text-[11px] font-medium ${m.color}`}>{m.icon}{ast.sector}</span></td>
                          <td className={`py-3 px-3 ${G.muted} text-[11px]`}>{ast.assetType}</td>
                          <td className={`py-3 px-3 font-mono text-[10px] ${G.faint} truncate max-w-[160px]`}>{ast.txId}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{ast.iotDeviceId}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link to={`/assets/${ast.assetId}`}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${G.inner} hover:bg-[#d0d4db] dark:hover:bg-slate-700 ${G.text} border ${G.border} transition-colors`}>
                                Details
                              </Link>
                              <Link to={`/verify/${ast.assetId}`} target="_blank"
                                className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors">
                                <QrCode className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((ast,i) => {
                  const m = SECTOR_META[ast.sector]||SECTOR_META.Agriculture;
                  return (
                    <div key={ast.assetId}
                      className={`rounded-xl border ${G.border} ${G.inner} p-4 flex flex-col gap-3 card-hover fade-up fade-up-delay-${Math.min(i+1,4)}`}>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md border ${m.bg} ${m.color} ${m.border}`}>
                          {m.icon}{ast.sector}
                        </span>
                        <span className={`font-mono text-[10px] text-emerald-600 dark:text-emerald-400 ${G.card} px-2 py-0.5 rounded border ${G.border}`}>
                          {ast.iotDeviceId}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-mono text-lg font-bold ${G.text} tracking-tight leading-tight`}>{ast.assetId}</h3>
                        <p className={`text-[11px] ${G.faint} mt-0.5`}>{ast.assetType}</p>
                      </div>
                      <div className={`${G.card} rounded-lg border ${G.border} px-3 py-2`}>
                        <p className={`text-[10px] ${G.faint} mb-0.5`}>Fabric TX</p>
                        <p className={`font-mono text-[11px] ${G.muted} truncate`}>{ast.txId}</p>
                      </div>
                      <div className={`flex items-center gap-2 pt-1 border-t ${G.borderM}`}>
                        <Link to={`/assets/${ast.assetId}`}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[12px] font-medium ${G.card} hover:bg-[#d0d4db] dark:hover:bg-slate-700 ${G.text} border ${G.border} transition-colors`}>
                          Details & QR <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link to={`/verify/${ast.assetId}`} target="_blank"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 transition-colors">
                          <QrCode className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Architecture flow */}
        <div className={`${G.card} rounded-xl border ${G.border} px-5 py-4`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${G.faint} flex items-center gap-1.5 mb-3`}>
            <Layers className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Trust Architecture
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {['Physical Asset','QR / IoT Device','TrustLedger','AI + Policy','SHA-256','Fabric Ledger','Verification'].map((step,i) => (
              <React.Fragment key={step}>
                <span className={`px-2.5 py-1 rounded-md ${G.inner} border ${G.border} ${G.muted}`}>{step}</span>
                {i<6 && <span className="text-[#b0b8c8] dark:text-slate-700">→</span>}
              </React.Fragment>
            ))}
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-bold">Verify Page</span>
          </div>
        </div>

      </main>

      {/* ── AI Modal ── */}
      {showAiModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${G.card} w-full max-w-lg rounded-2xl border ${G.border} shadow-2xl overflow-hidden fade-up`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${G.borderM} ${G.inner}`}>
              <h3 className={`text-sm font-semibold ${G.text} flex items-center gap-2`}>
                <Bot className="w-4 h-4 text-violet-500" /> AI Asset Registration
              </h3>
              <button onClick={() => setShowAiModal(false)} className={`${G.faint} hover:${G.text} text-lg leading-none cursor-pointer`}>×</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <p className={`text-[12px] ${G.muted} leading-relaxed`}>
                Describe the asset in plain language — e.g. <em className={G.text}>"Register 1500 kg Organic Basmati Wheat from Punjab with ISO 22000"</em>
              </p>
              <form onSubmit={handleAiRegister} className="space-y-3">
                <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
                  placeholder="Enter asset description…" rows={4} required
                  className={`w-full px-3 py-2.5 text-[12px] rounded-xl ${G.inner} border ${G.border} ${G.text} focus:outline-none focus:border-emerald-500 resize-none transition-colors placeholder:text-[#8a92a0] dark:placeholder:text-slate-500`}
                />
                {aiSuccessMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-300 dark:border-emerald-500/25 text-[12px] text-emerald-700 dark:text-emerald-300 font-mono">
                    ✓ {aiSuccessMsg}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAiModal(false)}
                    className={`px-4 py-2 rounded-lg text-[12px] font-medium ${G.inner} ${G.muted} border ${G.border} hover:bg-[#d0d4db] dark:hover:bg-slate-700 transition-colors cursor-pointer`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={aiParsing||!aiPrompt.trim()}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm">
                    {aiParsing ? 'Analyzing…' : 'Analyze & Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Modal ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${G.card} w-full max-w-md rounded-2xl border ${G.border} shadow-2xl overflow-hidden fade-up`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${G.borderM} ${G.inner}`}>
              <h3 className={`text-sm font-semibold ${G.text} flex items-center gap-2`}>
                <Plus className="w-4 h-4 text-emerald-600" /> Register Asset
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className={`${G.faint} hover:${G.text} text-lg leading-none cursor-pointer`}>×</button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="px-5 py-4 space-y-4 text-[12px]">
              <div>
                <label className={`block text-[11px] font-medium ${G.muted} mb-1.5`}>Sector</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Agriculture','Energy','Mobility'].map(s => {
                    const m = SECTOR_META[s];
                    return (
                      <button key={s} type="button" onClick={() => handleSectorChange(s)}
                        className={`py-2 rounded-lg font-semibold border transition-all ${
                          registerSector===s ? `${m.bg} ${m.color} ${m.border}` : `${G.inner} ${G.muted} border ${G.border}`
                        }`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              {[
                { label:'Asset ID',   val:registerAssetId,   set:setRegisterAssetId,   mono:true },
                { label:'Asset Type', val:registerAssetType, set:setRegisterAssetType },
              ].map(({ label,val,set,mono }) => (
                <div key={label}>
                  <label className={`block text-[11px] font-medium ${G.muted} mb-1.5`}>{label}</label>
                  <input type="text" value={val} onChange={e=>set(e.target.value)} required
                    className={`${inputCls} ${mono?'font-mono':''}`} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:registerSector==='Agriculture'?'Crop':registerSector==='Energy'?'Gen Source':'Manufacturer', val:registerField1, set:setRegisterField1 },
                  { label:registerSector==='Agriculture'?'Quantity':'Capacity', val:registerField2, set:setRegisterField2 },
                ].map(({ label,val,set }) => (
                  <div key={label}>
                    <label className={`block text-[11px] font-medium ${G.muted} mb-1.5`}>{label}</label>
                    <input type="text" value={val} onChange={e=>set(e.target.value)} required className={inputCls} />
                  </div>
                ))}
              </div>
              <div>
                <label className={`block text-[11px] font-medium ${G.muted} mb-1.5`}>IoT Device Binding</label>
                <input type="text" value={registerIotId} onChange={e=>setRegisterIotId(e.target.value)}
                  className={`${inputCls} font-mono`} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowRegisterModal(false)}
                  className={`flex-1 py-2.5 rounded-lg font-medium ${G.inner} ${G.muted} border ${G.border} hover:bg-[#d0d4db] dark:hover:bg-slate-700 transition-colors cursor-pointer`}>
                  Cancel
                </button>
                <button type="submit" disabled={registering}
                  className="flex-1 py-2.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm">
                  {registering ? 'Registering…' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
