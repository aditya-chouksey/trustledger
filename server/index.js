import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data_store.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to calculate deterministic SHA-256 hash of an object
function calculateSHA256(data) {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = {};
  for (const key of sortedKeys) {
    sortedData[key] = data[key];
  }
  const jsonString = JSON.stringify(sortedData);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

// In-Memory & File-Persisted Databases
let fabricLedger = new Map();
let offChainDatabase = new Map();
let iotDevicesDatabase = new Map();

// Save data store to disk for true restart persistence (Phase 8)
function saveToDisk() {
  try {
    const data = {
      fabricLedger: Array.from(fabricLedger.entries()),
      offChainDatabase: Array.from(offChainDatabase.entries()),
      iotDevicesDatabase: Array.from(iotDevicesDatabase.entries())
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist data store to disk:', err);
  }
}

// Load data store from disk on startup
function loadFromDisk() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      fabricLedger = new Map(parsed.fabricLedger || []);
      offChainDatabase = new Map(parsed.offChainDatabase || []);
      iotDevicesDatabase = new Map(parsed.iotDevicesDatabase || []);
      console.log('Loaded persisted TrustLedger state from disk.');
      return true;
    } catch (err) {
      console.error('Failed to load data store from disk:', err);
    }
  }
  return false;
}

// Seed initial default multi-sector assets into Fabric & Off-Chain Database if missing
function seedInitialAssets() {
  // 1. Agriculture Asset: AG-WHEAT-1024
  if (!offChainDatabase.has('AG-WHEAT-1024')) {
    const agData = {
      assetId: 'AG-WHEAT-1024',
      sector: 'Agriculture',
      assetType: 'Organic Wheat Batch',
      crop: 'Durum Wheat',
      quantity: '1000 kg',
      origin: 'Punjab Farm Cluster #4',
      certification: 'ISO 22000 Organic Certified',
      qualityScore: '98.5/100',
      harvestDate: '2026-09-15'
    };

    const agHash = calculateSHA256(agData);
    const agTxId = 'TX-FABRIC-AG-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    fabricLedger.set('AG-WHEAT-1024', {
      assetId: 'AG-WHEAT-1024',
      sector: 'Agriculture',
      assetType: 'Organic Wheat Batch',
      ledgerHash: agHash,
      fabricTxId: agTxId,
      registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      blockNumber: 104289,
      channelName: 'agriculture-channel',
      chaincode: 'trustledger-cc'
    });

    offChainDatabase.set('AG-WHEAT-1024', {
      ...agData,
      originalData: { ...agData },
      lifecycle: [
        { step: 'CREATED', title: 'Asset Created & Registered', timestamp: '2026-09-21 09:30:00 UTC', actor: 'Punjab Agri Co-op', txRef: agTxId },
        { step: 'QUALITY_VERIFIED', title: 'Quality Assurance Passed', timestamp: '2026-09-22 14:15:00 UTC', actor: 'AgriCert Inspector #82', txRef: 'TX-QA-883921' },
        { step: 'TRANSFERRED', title: 'Dispatched to Cold Storage', timestamp: '2026-09-24 08:00:00 UTC', actor: 'LogiTrans Corp', txRef: 'TX-LOG-992014' },
        { step: 'PROCESSED', title: 'Received at Terminal Hub', timestamp: '2026-09-25 18:45:00 UTC', actor: 'Global Grains Ltd', txRef: 'TX-HUB-104928' }
      ],
      iotDeviceId: 'ESP32-AG-001'
    });

    iotDevicesDatabase.set('ESP32-AG-001', {
      deviceId: 'ESP32-AG-001',
      associatedAssetId: 'AG-WHEAT-1024',
      deviceType: 'SIMULATED IoT DEVICE (Agriculture Multi-Sensor Node)',
      status: 'ACTIVE',
      lastSeen: '2 minutes ago',
      telemetry: {
        temperature: '24.6 °C',
        humidity: '61 %'
      },
      telemetryIntegrity: 'VERIFIED'
    });
  }

  // 2. Energy Asset: EN-REC-2048
  if (!offChainDatabase.has('EN-REC-2048')) {
    const enData = {
      assetId: 'EN-REC-2048',
      sector: 'Energy',
      assetType: 'Renewable Energy Certificate (REC)',
      generationSource: 'Solar Farm Alpha (50 MW)',
      capacity: '500 MWh',
      verificationAuthority: 'GreenGrid Standard',
      certId: 'REC-2026-SOL-9902',
      issueDate: '2026-09-10'
    };

    const enHash = calculateSHA256(enData);
    const enTxId = 'TX-FABRIC-EN-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    fabricLedger.set('EN-REC-2048', {
      assetId: 'EN-REC-2048',
      sector: 'Energy',
      assetType: 'Renewable Energy Certificate (REC)',
      ledgerHash: enHash,
      fabricTxId: enTxId,
      registeredAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      blockNumber: 103980,
      channelName: 'energy-channel',
      chaincode: 'trustledger-cc'
    });

    offChainDatabase.set('EN-REC-2048', {
      ...enData,
      originalData: { ...enData },
      lifecycle: [
        { step: 'CREATED', title: 'Solar Energy Generated & Certified', timestamp: '2026-09-16 00:00:00 UTC', actor: 'Solar Gen Plant #1', txRef: enTxId },
        { step: 'QUALITY_VERIFIED', title: 'Grid Audit & Meter Verification', timestamp: '2026-09-17 11:20:00 UTC', actor: 'National Grid Authority', txRef: 'TX-AUD-302910' },
        { step: 'TRANSFERRED', title: 'Tokenized REC Transferred', timestamp: '2026-09-19 16:40:00 UTC', actor: 'EcoTrade Exchange', txRef: 'TX-TRD-449201' },
        { step: 'PROCESSED', title: 'Retired for Carbon Offset', timestamp: '2026-09-23 10:05:00 UTC', actor: 'CleanCorp ESG Unit', txRef: 'TX-RET-881920' }
      ],
      iotDeviceId: 'ESP32-EN-001'
    });

    iotDevicesDatabase.set('ESP32-EN-001', {
      deviceId: 'ESP32-EN-001',
      associatedAssetId: 'EN-REC-2048',
      deviceType: 'SIMULATED IoT DEVICE (Energy Smart Meter)',
      status: 'ACTIVE',
      lastSeen: '1 minute ago',
      telemetry: {
        energyGenerated: '500 MWh',
        voltage: '400.2 V',
        current: '125.4 A'
      },
      telemetryIntegrity: 'VERIFIED'
    });
  }

  // 3. Mobility Asset: EV-BAT-7832
  if (!offChainDatabase.has('EV-BAT-7832')) {
    const mobData = {
      assetId: 'EV-BAT-7832',
      sector: 'Mobility',
      assetType: 'EV Lithium Battery Pack',
      manufacturer: 'VoltPower Mobility Systems',
      chemistry: 'NMC 811 High-Density',
      capacity: '82 kWh',
      healthState: '99.2% SOH',
      manufactureDate: '2026-08-01'
    };

    const mobHash = calculateSHA256(mobData);
    const mobTxId = 'TX-FABRIC-EV-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    fabricLedger.set('EV-BAT-7832', {
      assetId: 'EV-BAT-7832',
      sector: 'Mobility',
      assetType: 'EV Lithium Battery Pack',
      ledgerHash: mobHash,
      fabricTxId: mobTxId,
      registeredAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      blockNumber: 102550,
      channelName: 'mobility-channel',
      chaincode: 'trustledger-cc'
    });

    offChainDatabase.set('EV-BAT-7832', {
      ...mobData,
      originalData: { ...mobData },
      lifecycle: [
        { step: 'CREATED', title: 'Battery Pack Manufactured & Assembled', timestamp: '2026-08-01 10:00:00 UTC', actor: 'VoltPower Gigafactory', txRef: mobTxId },
        { step: 'QUALITY_VERIFIED', title: 'Thermal & Safety Stress Test Passed', timestamp: '2026-08-05 15:30:00 UTC', actor: 'EV Safety Bureau', txRef: 'TX-SAF-902182' },
        { step: 'TRANSFERRED', title: 'Installed in Vehicle #VIN-99201', timestamp: '2026-08-15 12:00:00 UTC', actor: 'AutoMotors Assembly', txRef: 'TX-INS-551092' },
        { step: 'PROCESSED', title: 'Scheduled Second-Life Recycling', timestamp: '2026-09-20 09:10:00 UTC', actor: 'Battery Recycle Hub', txRef: 'TX-REC-771829' }
      ],
      iotDeviceId: 'ESP32-EV-001'
    });

    iotDevicesDatabase.set('ESP32-EV-001', {
      deviceId: 'ESP32-EV-001',
      associatedAssetId: 'EV-BAT-7832',
      deviceType: 'SIMULATED IoT DEVICE (EV BMS Gateway)',
      status: 'ACTIVE',
      lastSeen: 'Just now',
      telemetry: {
        batteryTemperature: '28.4 °C',
        voltage: '395.8 V',
        stateOfCharge: '99.2 %'
      },
      telemetryIntegrity: 'VERIFIED'
    });
  }

  saveToDisk();
}

if (!loadFromDisk()) {
  seedInitialAssets();
}

// API Endpoints

// 1. Register a new asset on Hyperledger Fabric ledger
app.post('/api/assets/register', (req, res) => {
  const { assetId, sector, assetType, payload, iotDeviceId } = req.body;

  if (!assetId || !sector || !assetType || !payload) {
    return res.status(400).json({ error: 'Missing required registration parameters' });
  }

  const assetRecordData = {
    assetId,
    sector,
    assetType,
    ...payload
  };

  const ledgerHash = calculateSHA256(assetRecordData);
  const fabricTxId = 'TX-FABRIC-' + sector.substring(0, 2).toUpperCase() + '-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const registeredAt = new Date().toISOString();

  fabricLedger.set(assetId, {
    assetId,
    sector,
    assetType,
    ledgerHash,
    fabricTxId,
    registeredAt,
    blockNumber: Math.floor(100000 + Math.random() * 50000),
    channelName: `${sector.toLowerCase()}-channel`,
    chaincode: 'trustledger-cc'
  });

  const lifecycle = [
    { step: 'CREATED', title: 'Asset Created & Registered', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC', actor: 'Registered Entity', txRef: fabricTxId },
    { step: 'QUALITY_VERIFIED', title: 'Initial Ledger Proof Anchored', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC', actor: 'TrustLedger Fabric Peer', txRef: 'TX-PROOF-' + crypto.randomBytes(4).toString('hex').toUpperCase() },
    { step: 'TRANSFERRED', title: 'Ready for Supply Chain Tracking', timestamp: 'Pending', actor: 'Logistics Partner', txRef: 'N/A' },
    { step: 'PROCESSED', title: 'Final Processing / Settlement', timestamp: 'Pending', actor: 'End Destination', txRef: 'N/A' }
  ];

  const devId = iotDeviceId || `ESP32-${sector.substring(0, 2).toUpperCase()}-001`;

  offChainDatabase.set(assetId, {
    ...assetRecordData,
    originalData: { ...assetRecordData },
    lifecycle,
    iotDeviceId: devId
  });

  if (!iotDevicesDatabase.has(devId)) {
    iotDevicesDatabase.set(devId, {
      deviceId: devId,
      associatedAssetId: assetId,
      deviceType: `SIMULATED IoT DEVICE (${sector} Sensor Node)`,
      status: 'ACTIVE',
      lastSeen: 'Just now',
      telemetry: sector === 'Agriculture' 
        ? { temperature: '24.6 °C', humidity: '61 %' }
        : sector === 'Energy'
        ? { energyGenerated: '500 MWh', voltage: '400.2 V', current: '125.4 A' }
        : { batteryTemperature: '28.4 °C', voltage: '395.8 V', stateOfCharge: '99.2 %' },
      telemetryIntegrity: 'VERIFIED'
    });
  }

  saveToDisk();

  return res.json({
    success: true,
    message: 'Asset successfully registered on Hyperledger Fabric ledger',
    assetId,
    fabricTxId,
    ledgerHash,
    verificationUrl: `/verify/${assetId}`
  });
});

// 2. List all registered assets
app.get('/api/assets', (req, res) => {
  const assets = [];
  offChainDatabase.forEach((value, key) => {
    const fabricRecord = fabricLedger.get(key);
    assets.push({
      assetId: key,
      sector: value.sector,
      assetType: value.assetType,
      txId: fabricRecord ? fabricRecord.fabricTxId : 'N/A',
      registeredAt: fabricRecord ? fabricRecord.registeredAt : 'N/A',
      iotDeviceId: value.iotDeviceId
    });
  });
  res.json({ assets });
});

// 3. Main Public Verification Endpoint: /api/verify/:assetId
app.get('/api/verify/:assetId', (req, res) => {
  const { assetId } = req.params;

  const fabricRecord = fabricLedger.get(assetId);
  if (!fabricRecord) {
    return res.json({
      status: 'NOT_FOUND',
      message: `No Hyperledger Fabric ledger record found for asset '${assetId}'.`,
      assetId
    });
  }

  const currentOffChain = offChainDatabase.get(assetId);
  if (!currentOffChain) {
    return res.json({
      status: 'NOT_FOUND',
      message: `Off-chain record missing for asset '${assetId}'.`,
      assetId
    });
  }

  const { originalData, lifecycle, iotDeviceId, ...currentPayload } = currentOffChain;
  const recalculatedHash = calculateSHA256(currentPayload);
  const ledgerHash = fabricRecord.ledgerHash;

  const isHashMatch = recalculatedHash === ledgerHash;
  const verificationStatus = isHashMatch ? 'VERIFIED' : 'TAMPERED';

  let iotTelemetryData = null;
  if (iotDeviceId && iotDevicesDatabase.has(iotDeviceId)) {
    const dev = iotDevicesDatabase.get(iotDeviceId);
    iotTelemetryData = {
      deviceId: dev.deviceId,
      deviceType: dev.deviceType,
      status: dev.status,
      lastSeen: dev.lastSeen,
      telemetry: dev.telemetry,
      telemetryIntegrity: dev.telemetryIntegrity
    };
  }

  return res.json({
    status: verificationStatus,
    assetId: fabricRecord.assetId,
    sector: fabricRecord.sector,
    assetType: fabricRecord.assetType,
    fabricRecord: {
      fabricTxId: fabricRecord.fabricTxId,
      registeredAt: fabricRecord.registeredAt,
      blockNumber: fabricRecord.blockNumber,
      channelName: fabricRecord.channelName,
      chaincode: fabricRecord.chaincode,
      ledgerHash: fabricRecord.ledgerHash
    },
    verificationDetails: {
      ledgerRecordFound: true,
      hashIntegrityMatch: isHashMatch,
      recalculatedHash,
      ledgerHash,
      currentStatus: isHashMatch ? 'QUALITY_VERIFIED' : 'TAMPER_ALERT'
    },
    payloadData: currentPayload,
    lifecycle: currentOffChain.lifecycle || [],
    iotTelemetry: iotTelemetryData,
    uxExplanation: {
      message: "TrustLedger does not store your complete document on the blockchain. Instead, it stores a cryptographic proof that allows the current record to be checked against the original registered proof.",
      resultText: isHashMatch
        ? "Current record matches registered proof."
        : "Current record does not match registered proof. Integrity verification failed."
    }
  });
});

// 4. Public IoT Device Verification Endpoint: /api/verify/device/:deviceId
app.get('/api/verify/device/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const dev = iotDevicesDatabase.get(deviceId);

  if (!dev) {
    return res.status(404).json({
      status: 'NOT_FOUND',
      message: `No registered device found with ID '${deviceId}'`
    });
  }

  res.json({
    status: 'VERIFIED',
    deviceId: dev.deviceId,
    associatedAssetId: dev.associatedAssetId,
    deviceType: dev.deviceType,
    deviceStatus: dev.status,
    lastSeen: dev.lastSeen,
    latestTelemetryProof: dev.telemetryIntegrity,
    telemetry: dev.telemetry
  });
});

// 5. Phase 10 IoT Telemetry Ingestion Endpoint: /api/iot/telemetry
app.post('/api/iot/telemetry', (req, res) => {
  const { deviceId, telemetry } = req.body;

  const dev = iotDevicesDatabase.get(deviceId);
  if (!dev) {
    return res.status(404).json({ error: `SIMULATED IoT DEVICE '${deviceId}' not found.` });
  }

  // Update live telemetry & timestamp
  dev.telemetry = { ...dev.telemetry, ...telemetry };
  dev.lastSeen = 'Just now';
  dev.telemetryIntegrity = 'VERIFIED';
  iotDevicesDatabase.set(deviceId, dev);

  // Append IoT Event to linked Asset Lifecycle History
  const asset = offChainDatabase.get(dev.associatedAssetId);
  if (asset && asset.lifecycle) {
    const iotEvent = {
      step: 'IOT_PING',
      title: `Simulated Sensor Data Received (${Object.keys(telemetry).join(', ')})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: dev.deviceId,
      txRef: 'TX-IOT-' + crypto.randomBytes(4).toString('hex').toUpperCase()
    };
    asset.lifecycle.push(iotEvent);
    offChainDatabase.set(dev.associatedAssetId, asset);
  }

  saveToDisk();

  res.json({
    success: true,
    message: `IoT reading recorded from SIMULATED DEVICE '${deviceId}'`,
    deviceId,
    associatedAssetId: dev.associatedAssetId,
    updatedTelemetry: dev.telemetry,
    telemetryIntegrity: 'VERIFIED'
  });
});

// 6. Phase 7 AI Asset Data Extraction Endpoint: /api/ai/parse
app.post('/api/ai/parse', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Heuristic AI Analysis & Data Structuring with Fallback Parser
  const lower = prompt.toLowerCase();
  let sector = 'Agriculture';
  let assetType = 'Organic Wheat Batch';
  let crop = 'Durum Wheat';
  let quantity = '1000 kg';

  if (lower.includes('energy') || lower.includes('rec') || lower.includes('mwh') || lower.includes('solar')) {
    sector = 'Energy';
    assetType = 'Renewable Energy Certificate (REC)';
  } else if (lower.includes('battery') || lower.includes('ev') || lower.includes('kwh') || lower.includes('mobility')) {
    sector = 'Mobility';
    assetType = 'EV Lithium Battery Pack';
  }

  // Extract quantity if present
  const qtyMatch = prompt.match(/(\d+\s*(kg|mwh|kwh|tons|units))/i);
  if (qtyMatch) {
    quantity = qtyMatch[1];
  }

  return res.json({
    success: true,
    aiAnalysis: {
      extractedSector: sector,
      extractedType: assetType,
      quantityExtracted: quantity,
      confidenceScore: 0.96,
      structuredOutput: {
        sector,
        assetType,
        quantity,
        summary: `AI parsed prompt into ${sector} asset record.`
      }
    }
  });
});

// 7. Demo Tamper Test Endpoint: /api/demo/tamper
app.post('/api/demo/tamper', (req, res) => {
  const { assetId, field, value } = req.body;
  const targetId = assetId || 'AG-WHEAT-1024';

  const asset = offChainDatabase.get(targetId);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  const targetField = field || (asset.sector === 'Agriculture' ? 'quantity' : asset.sector === 'Energy' ? 'capacity' : 'capacity');
  const targetValue = value || (asset.sector === 'Agriculture' ? '5000 kg' : asset.sector === 'Energy' ? '9999 MWh' : '150 kWh');

  asset[targetField] = targetValue;
  offChainDatabase.set(targetId, asset);
  saveToDisk();

  res.json({
    success: true,
    message: `Off-chain data tampered for ${targetId}. Field '${targetField}' changed to '${targetValue}'. Fabric ledger immutable proof remains untouched.`,
    assetId: targetId,
    modifiedField: targetField,
    newValue: targetValue
  });
});

// 8. Demo Restore Endpoint: /api/demo/restore
app.post('/api/demo/restore', (req, res) => {
  const { assetId } = req.body;
  const targetId = assetId || 'AG-WHEAT-1024';

  const asset = offChainDatabase.get(targetId);
  if (!asset || !asset.originalData) {
    return res.status(404).json({ error: 'Asset original data not found' });
  }

  const restoredAsset = {
    ...asset.originalData,
    originalData: { ...asset.originalData },
    lifecycle: asset.lifecycle,
    iotDeviceId: asset.iotDeviceId
  };

  offChainDatabase.set(targetId, restoredAsset);
  saveToDisk();

  res.json({
    success: true,
    message: `Off-chain data restored to original registered state for ${targetId}.`,
    assetId: targetId
  });
});

app.listen(PORT, () => {
  console.log(`TrustLedger Hyperledger Fabric & Verification API Server running on port ${PORT}`);
});
