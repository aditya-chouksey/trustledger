// Vercel Serverless Function — wraps the Express app
// NOTE: Vercel is stateless. Each cold start re-seeds the 3 default assets.
// Data written during a request (new assets, telemetry) lives for the lifetime
// of that warm serverless instance but does NOT persist across deployments or
// cold starts. This is the expected behaviour for a demo/hackathon project.

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── SHA-256 helper ────────────────────────────────────────────────────────────
function calculateSHA256(data) {
  const sorted = {};
  for (const key of Object.keys(data).sort()) sorted[key] = data[key];
  return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

// ── In-memory stores (warm instance only) ────────────────────────────────────
let fabricLedger       = new Map();
let offChainDatabase   = new Map();
let iotDevicesDatabase = new Map();

// ── Seed default assets ───────────────────────────────────────────────────────
function seed() {
  // 1. Agriculture
  if (!offChainDatabase.has('AG-WHEAT-1024')) {
    const d = { assetId:'AG-WHEAT-1024', sector:'Agriculture', assetType:'Organic Wheat Batch', crop:'Durum Wheat', quantity:'1000 kg', origin:'Punjab Farm Cluster #4', certification:'ISO 22000 Organic Certified', qualityScore:'98.5/100', harvestDate:'2026-09-15' };
    const h = calculateSHA256(d);
    const t = 'TX-FABRIC-AG-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    fabricLedger.set('AG-WHEAT-1024', { assetId:'AG-WHEAT-1024', sector:'Agriculture', assetType:'Organic Wheat Batch', ledgerHash:h, fabricTxId:t, registeredAt:new Date(Date.now()-86400000*5).toISOString(), blockNumber:104289, channelName:'agriculture-channel', chaincode:'trustledger-cc' });
    offChainDatabase.set('AG-WHEAT-1024', { ...d, originalData:{...d}, lifecycle:[
      { step:'CREATED',          title:'Asset Created & Registered',      timestamp:'2026-09-21 09:30:00 UTC', actor:'Punjab Agri Co-op',       txRef:t            },
      { step:'QUALITY_VERIFIED', title:'Quality Assurance Passed',        timestamp:'2026-09-22 14:15:00 UTC', actor:'AgriCert Inspector #82',  txRef:'TX-QA-883921'},
      { step:'TRANSFERRED',      title:'Dispatched to Cold Storage',      timestamp:'2026-09-24 08:00:00 UTC', actor:'LogiTrans Corp',           txRef:'TX-LOG-992014'},
      { step:'PROCESSED',        title:'Received at Terminal Hub',        timestamp:'2026-09-25 18:45:00 UTC', actor:'Global Grains Ltd',        txRef:'TX-HUB-104928'},
    ], iotDeviceId:'ESP32-AG-001' });
    iotDevicesDatabase.set('ESP32-AG-001', { deviceId:'ESP32-AG-001', sector:'Agriculture', associatedAssetId:'AG-WHEAT-1024', deviceType:'SIMULATED IoT DEVICE', status:'ACTIVE', lastSeen:'2 minutes ago', telemetry:{ temperature:'24.6 °C', humidity:'61 %' }, telemetryIntegrity:'VERIFIED' });
  }

  // 2. Energy
  if (!offChainDatabase.has('EN-REC-2048')) {
    const d = { assetId:'EN-REC-2048', sector:'Energy', assetType:'Renewable Energy Certificate (REC)', generationSource:'Solar Farm Alpha (50 MW)', capacity:'500 MWh', verificationAuthority:'GreenGrid Standard', certId:'REC-2026-SOL-9902', issueDate:'2026-09-10' };
    const h = calculateSHA256(d);
    const t = 'TX-FABRIC-EN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    fabricLedger.set('EN-REC-2048', { assetId:'EN-REC-2048', sector:'Energy', assetType:'Renewable Energy Certificate (REC)', ledgerHash:h, fabricTxId:t, registeredAt:new Date(Date.now()-86400000*10).toISOString(), blockNumber:103980, channelName:'energy-channel', chaincode:'trustledger-cc' });
    offChainDatabase.set('EN-REC-2048', { ...d, originalData:{...d}, lifecycle:[
      { step:'CREATED',          title:'Solar Energy Generated & Certified', timestamp:'2026-09-16 00:00:00 UTC', actor:'Solar Gen Plant #1',       txRef:t             },
      { step:'QUALITY_VERIFIED', title:'Grid Audit & Meter Verification',    timestamp:'2026-09-17 11:20:00 UTC', actor:'National Grid Authority',  txRef:'TX-AUD-302910'},
      { step:'TRANSFERRED',      title:'Tokenized REC Transferred',          timestamp:'2026-09-19 16:40:00 UTC', actor:'EcoTrade Exchange',         txRef:'TX-TRD-449201'},
      { step:'PROCESSED',        title:'Retired for Carbon Offset',          timestamp:'2026-09-23 10:05:00 UTC', actor:'CleanCorp ESG Unit',        txRef:'TX-RET-881920'},
    ], iotDeviceId:'ESP32-EN-001' });
    iotDevicesDatabase.set('ESP32-EN-001', { deviceId:'ESP32-EN-001', sector:'Energy', associatedAssetId:'EN-REC-2048', deviceType:'SIMULATED IoT DEVICE', status:'ACTIVE', lastSeen:'1 minute ago', telemetry:{ energyGenerated:'500 MWh', voltage:'400.2 V', current:'125.4 A' }, telemetryIntegrity:'VERIFIED' });
  }

  // 3. Mobility
  if (!offChainDatabase.has('EV-BAT-7832')) {
    const d = { assetId:'EV-BAT-7832', sector:'Mobility', assetType:'EV Lithium Battery Pack', manufacturer:'VoltPower Mobility Systems', chemistry:'NMC 811 High-Density', capacity:'82 kWh', healthState:'99.2% SOH', manufactureDate:'2026-08-01' };
    const h = calculateSHA256(d);
    const t = 'TX-FABRIC-EV-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    fabricLedger.set('EV-BAT-7832', { assetId:'EV-BAT-7832', sector:'Mobility', assetType:'EV Lithium Battery Pack', ledgerHash:h, fabricTxId:t, registeredAt:new Date(Date.now()-86400000*15).toISOString(), blockNumber:102550, channelName:'mobility-channel', chaincode:'trustledger-cc' });
    offChainDatabase.set('EV-BAT-7832', { ...d, originalData:{...d}, lifecycle:[
      { step:'CREATED',          title:'Battery Pack Manufactured & Assembled', timestamp:'2026-08-01 10:00:00 UTC', actor:'VoltPower Gigafactory', txRef:t             },
      { step:'QUALITY_VERIFIED', title:'Thermal & Safety Stress Test Passed',   timestamp:'2026-08-05 15:30:00 UTC', actor:'EV Safety Bureau',      txRef:'TX-SAF-902182'},
      { step:'TRANSFERRED',      title:'Installed in Vehicle #VIN-99201',       timestamp:'2026-08-15 12:00:00 UTC', actor:'AutoMotors Assembly',   txRef:'TX-INS-551092'},
      { step:'PROCESSED',        title:'Scheduled Second-Life Recycling',       timestamp:'2026-09-20 09:10:00 UTC', actor:'Battery Recycle Hub',   txRef:'TX-REC-771829'},
    ], iotDeviceId:'ESP32-EV-001' });
    iotDevicesDatabase.set('ESP32-EV-001', { deviceId:'ESP32-EV-001', sector:'Mobility', associatedAssetId:'EV-BAT-7832', deviceType:'SIMULATED IoT DEVICE', status:'ACTIVE', lastSeen:'Just now', telemetry:{ batteryTemperature:'28.4 °C', voltage:'395.8 V', stateOfCharge:'99.2 %' }, telemetryIntegrity:'VERIFIED' });
  }
}

seed();

// ── Routes ────────────────────────────────────────────────────────────────────

// 1. Register asset
app.post('/api/assets/register', (req, res) => {
  const { assetId, sector, assetType, payload, iotDeviceId } = req.body;
  if (!assetId || !sector || !assetType || !payload)
    return res.status(400).json({ error: 'Missing required registration parameters' });

  const assetRecordData = { assetId, sector, assetType, ...payload };
  const ledgerHash  = calculateSHA256(assetRecordData);
  const fabricTxId  = 'TX-FABRIC-' + sector.substring(0,2).toUpperCase() + '-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const registeredAt = new Date().toISOString();
  const ts = registeredAt.replace('T',' ').substring(0,19) + ' UTC';

  fabricLedger.set(assetId, { assetId, sector, assetType, ledgerHash, fabricTxId, registeredAt, blockNumber: Math.floor(100000+Math.random()*50000), channelName:`${sector.toLowerCase()}-channel`, chaincode:'trustledger-cc' });

  const devId = iotDeviceId || `ESP32-${sector.substring(0,2).toUpperCase()}-001`;
  offChainDatabase.set(assetId, {
    ...assetRecordData, originalData:{...assetRecordData},
    lifecycle:[
      { step:'CREATED',          title:'Asset Created & Registered',    timestamp:ts,       actor:'Registered Entity',           txRef:fabricTxId },
      { step:'QUALITY_VERIFIED', title:'Initial Ledger Proof Anchored', timestamp:ts,       actor:'TrustLedger Fabric Peer',     txRef:'TX-PROOF-'+crypto.randomBytes(4).toString('hex').toUpperCase() },
      { step:'TRANSFERRED',      title:'Ready for Supply Chain Tracking',timestamp:'Pending', actor:'Logistics Partner',          txRef:'N/A' },
      { step:'PROCESSED',        title:'Final Processing / Settlement', timestamp:'Pending', actor:'End Destination',             txRef:'N/A' },
    ], iotDeviceId: devId
  });

  if (!iotDevicesDatabase.has(devId)) {
    iotDevicesDatabase.set(devId, { deviceId:devId, sector, associatedAssetId:assetId, deviceType:'SIMULATED IoT DEVICE', status:'ACTIVE', lastSeen:'Just now',
      telemetry: sector==='Agriculture' ? { temperature:'24.6 °C', humidity:'61 %' } : sector==='Energy' ? { energyGenerated:'500 MWh', voltage:'400.2 V', current:'125.4 A' } : { batteryTemperature:'28.4 °C', voltage:'395.8 V', stateOfCharge:'99.2 %' },
      telemetryIntegrity:'VERIFIED'
    });
  }

  return res.json({ success:true, message:'Asset successfully registered on Hyperledger Fabric ledger', assetId, fabricTxId, ledgerHash, verificationUrl:`/verify/${assetId}` });
});

// 2. List assets
app.get('/api/assets', (req, res) => {
  const assets = [];
  offChainDatabase.forEach((value, key) => {
    const fr = fabricLedger.get(key);
    assets.push({ assetId:key, sector:value.sector, assetType:value.assetType, txId:fr?fr.fabricTxId:'N/A', registeredAt:fr?fr.registeredAt:'N/A', iotDeviceId:value.iotDeviceId });
  });
  res.json({ assets });
});

// 3. List IoT devices
app.get('/api/iot/devices', (req, res) => {
  res.json({ devices: Array.from(iotDevicesDatabase.values()) });
});

// 4. Verify asset  — NOTE: /api/verify/device/:deviceId must be defined BEFORE /api/verify/:assetId
app.get('/api/verify/device/:deviceId', (req, res) => {
  const dev = iotDevicesDatabase.get(req.params.deviceId);
  if (!dev) return res.status(404).json({ status:'NOT_FOUND', message:`No registered device found with ID '${req.params.deviceId}'` });
  res.json({ status:'VERIFIED', deviceId:dev.deviceId, associatedAssetId:dev.associatedAssetId, deviceType:dev.deviceType, deviceStatus:dev.status, lastSeen:dev.lastSeen, latestTelemetryProof:dev.telemetryIntegrity, telemetry:dev.telemetry });
});

app.get('/api/verify/:assetId', (req, res) => {
  const { assetId } = req.params;
  const fr = fabricLedger.get(assetId);
  if (!fr) return res.json({ status:'NOT_FOUND', message:`No Hyperledger Fabric ledger record found for asset '${assetId}'.`, assetId });

  const currentOffChain = offChainDatabase.get(assetId);
  if (!currentOffChain) return res.json({ status:'NOT_FOUND', message:`Off-chain record missing for asset '${assetId}'.`, assetId });

  const { originalData, lifecycle, iotDeviceId, ...currentPayload } = currentOffChain;
  const recalculatedHash = calculateSHA256(currentPayload);
  const isHashMatch = recalculatedHash === fr.ledgerHash;

  let iotTelemetryData = null;
  if (iotDeviceId && iotDevicesDatabase.has(iotDeviceId)) {
    const dev = iotDevicesDatabase.get(iotDeviceId);
    iotTelemetryData = { deviceId:dev.deviceId, deviceType:dev.deviceType, status:dev.status, lastSeen:dev.lastSeen, telemetry:dev.telemetry, telemetryIntegrity:dev.telemetryIntegrity };
  }

  return res.json({
    status: isHashMatch ? 'VERIFIED' : 'TAMPERED',
    assetId: fr.assetId, sector: fr.sector, assetType: fr.assetType,
    fabricRecord: { fabricTxId:fr.fabricTxId, registeredAt:fr.registeredAt, blockNumber:fr.blockNumber, channelName:fr.channelName, chaincode:fr.chaincode, ledgerHash:fr.ledgerHash },
    verificationDetails: { ledgerRecordFound:true, hashIntegrityMatch:isHashMatch, recalculatedHash, ledgerHash:fr.ledgerHash, currentStatus:isHashMatch?'QUALITY_VERIFIED':'TAMPER_ALERT' },
    payloadData: currentPayload,
    lifecycle: currentOffChain.lifecycle || [],
    iotTelemetry: iotTelemetryData,
    uxExplanation: {
      message: "TrustLedger does not store your complete document on the blockchain. Instead, it stores a cryptographic proof that allows the current record to be checked against the original registered proof.",
      resultText: isHashMatch ? "Current record matches registered proof." : "Current record does not match registered proof. Integrity verification failed."
    }
  });
});

// 5. IoT Telemetry
app.post('/api/iot/telemetry', (req, res) => {
  const { deviceId, assetId, sector, telemetry } = req.body;
  const dev = iotDevicesDatabase.get(deviceId);
  if (!dev) return res.status(404).json({ error:`Validation Failed: SIMULATED IoT DEVICE '${deviceId}' does not exist.` });

  const targetAssetId = assetId || dev.associatedAssetId;
  const asset = offChainDatabase.get(targetAssetId);
  if (!asset) return res.status(404).json({ error:`Validation Failed: Linked asset '${targetAssetId}' does not exist.` });
  if (dev.associatedAssetId !== targetAssetId) return res.status(400).json({ error:`Validation Failed: Device '${deviceId}' is not bound to asset '${targetAssetId}'.` });
  if (!telemetry || typeof telemetry !== 'object') return res.status(400).json({ error:'Validation Failed: Telemetry must be an object of key-value readings.' });

  const timestamp = new Date().toISOString().replace('T',' ').substring(0,19) + ' UTC';
  const eventId   = 'EVT-IOT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const telemetryHash = calculateSHA256({ eventId, deviceId, associatedAssetId:targetAssetId, sector:dev.sector, timestamp, readings:telemetry });

  dev.telemetry = { ...dev.telemetry, ...telemetry };
  dev.lastSeen  = 'Just now';
  dev.telemetryIntegrity = 'VERIFIED';
  iotDevicesDatabase.set(deviceId, dev);

  if (asset.lifecycle) {
    const readings = Object.entries(telemetry).map(([k,v]) => `${k}: ${v}`).join(', ');
    asset.lifecycle.push({ step:'IOT_TELEMETRY', title:`IoT Telemetry Received (${readings})`, timestamp, actor:dev.deviceId, txRef:eventId, eventId, deviceId, telemetryHash, readings:telemetry });
    offChainDatabase.set(targetAssetId, asset);
  }

  return res.json({ success:true, statusText:'Telemetry Accepted ✓', message:'Telemetry Accepted ✓', telemetryHash, eventId, deviceId, associatedAssetId:targetAssetId, updatedTelemetry:dev.telemetry, telemetryIntegrity:'VERIFIED' });
});

// 6. AI parse
app.post('/api/ai/parse', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error:'Prompt is required' });
  const lower = prompt.toLowerCase();
  let sector = 'Agriculture', assetType = 'Organic Wheat Batch', quantity = '1000 kg';
  if (lower.includes('energy')||lower.includes('rec')||lower.includes('mwh')||lower.includes('solar')) { sector='Energy'; assetType='Renewable Energy Certificate (REC)'; }
  else if (lower.includes('battery')||lower.includes('ev')||lower.includes('kwh')||lower.includes('mobility')) { sector='Mobility'; assetType='EV Lithium Battery Pack'; }
  const qm = prompt.match(/(\d+\s*(kg|mwh|kwh|tons|units))/i);
  if (qm) quantity = qm[1];
  return res.json({ success:true, aiAnalysis:{ extractedSector:sector, extractedType:assetType, quantityExtracted:quantity, confidenceScore:0.96, structuredOutput:{ sector, assetType, quantity, summary:`AI parsed prompt into ${sector} asset record.` } } });
});

// 7. Demo tamper
app.post('/api/demo/tamper', (req, res) => {
  const targetId = req.body.assetId || 'AG-WHEAT-1024';
  const asset = offChainDatabase.get(targetId);
  if (!asset) return res.status(404).json({ error:'Asset not found' });
  const field = req.body.field || (asset.sector==='Agriculture'?'quantity':'capacity');
  const value = req.body.value || (asset.sector==='Agriculture'?'5000 kg':asset.sector==='Energy'?'9999 MWh':'150 kWh');
  asset[field] = value;
  offChainDatabase.set(targetId, asset);
  res.json({ success:true, message:`Off-chain data tampered for ${targetId}. Field '${field}' changed to '${value}'. Fabric ledger immutable proof remains untouched.`, assetId:targetId, modifiedField:field, newValue:value });
});

// 8. Demo restore
app.post('/api/demo/restore', (req, res) => {
  const targetId = req.body.assetId || 'AG-WHEAT-1024';
  const asset = offChainDatabase.get(targetId);
  if (!asset||!asset.originalData) return res.status(404).json({ error:'Asset original data not found' });
  offChainDatabase.set(targetId, { ...asset.originalData, originalData:{...asset.originalData}, lifecycle:asset.lifecycle, iotDeviceId:asset.iotDeviceId });
  res.json({ success:true, message:`Off-chain data restored to original registered state for ${targetId}.`, assetId:targetId });
});

// ── Export for Vercel ─────────────────────────────────────────────────────────
export default app;
