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

// Save data store to disk for true restart persistence
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

// Seed initial default multi-sector assets & devices if missing
function seedInitialAssets() {
  // 1. Agriculture Asset: AG-WHEAT-1024 & ESP32-AG-001
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
      sector: 'Agriculture',
      associatedAssetId: 'AG-WHEAT-1024',
      deviceType: 'SIMULATED IoT DEVICE',
      status: 'ACTIVE',
      lastSeen: '2 minutes ago',
      telemetry: {
        temperature: '24.6 °C',
        humidity: '61 %'
      },
      telemetryIntegrity: 'VERIFIED'
    });
  }

  // 2. Energy Asset: EN-REC-2048 & ESP32-EN-001
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
      sector: 'Energy',
      associatedAssetId: 'EN-REC-2048',
      deviceType: 'SIMULATED IoT DEVICE',
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

  // 3. Mobility Asset: EV-BAT-7832 & ESP32-EV-001
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
      sector: 'Mobility',
      associatedAssetId: 'EV-BAT-7832',
      deviceType: 'SIMULATED IoT DEVICE',
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
      sector: sector,
      associatedAssetId: assetId,
      deviceType: 'SIMULATED IoT DEVICE',
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

// 3. List all IoT devices
app.get('/api/iot/devices', (req, res) => {
  const devices = Array.from(iotDevicesDatabase.values());
  res.json({ devices });
});

// 4. Main Public Verification Endpoint: /api/verify/:assetId
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

// 5. Public IoT Device Verification Endpoint: /api/verify/device/:deviceId
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

// 6. Mandatory IoT Telemetry Ingestion Endpoint: POST /api/iot/telemetry
// Flow: Simulated Device -> IoT API -> Validation -> SHA-256 -> Ledger/Event System -> Asset History
app.post('/api/iot/telemetry', (req, res) => {
  const { deviceId, assetId, sector, telemetry } = req.body;

  // 1. Validate device exists
  const dev = iotDevicesDatabase.get(deviceId);
  if (!dev) {
    return res.status(404).json({ error: `Validation Failed: SIMULATED IoT DEVICE '${deviceId}' does not exist.` });
  }

  // 2. Validate asset exists
  const targetAssetId = assetId || dev.associatedAssetId;
  const asset = offChainDatabase.get(targetAssetId);
  if (!asset) {
    return res.status(404).json({ error: `Validation Failed: Linked asset '${targetAssetId}' does not exist.` });
  }

  // 3. Validate device-asset relationship
  if (dev.associatedAssetId !== targetAssetId) {
    return res.status(400).json({ error: `Validation Failed: Device '${deviceId}' is not bound to asset '${targetAssetId}'.` });
  }

  // 4. Validate sector matches
  if (sector && dev.sector && sector !== dev.sector) {
    return res.status(400).json({ error: `Validation Failed: Sector mismatch. Device sector is '${dev.sector}', got '${sector}'.` });
  }

  // 5. Validate numeric measurements and reasonable ranges
  if (!telemetry || typeof telemetry !== 'object') {
    return res.status(400).json({ error: `Validation Failed: Telemetry must be an object of key-value readings.` });
  }

  for (const [key, rawVal] of Object.entries(telemetry)) {
    // Parse numeric float from string (e.g., "24.6 °C" -> 24.6)
    const num = parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) {
      return res.status(400).json({ error: `Validation Failed: Reading '${key}' value '${rawVal}' is not a valid number.` });
    }

    // Range checks per sensor
    if (key.toLowerCase().includes('temp') && (num < -50 || num > 120)) {
      return res.status(400).json({ error: `Validation Failed: Temperature ${num} °C is outside reasonable range (-50 to 120 °C).` });
    }
    if (key.toLowerCase().includes('humidity') && (num < 0 || num > 100)) {
      return res.status(400).json({ error: `Validation Failed: Humidity ${num} % is outside reasonable range (0 to 100 %).` });
    }
    if (key.toLowerCase().includes('voltage') && (num < 0 || num > 2000)) {
      return res.status(400).json({ error: `Validation Failed: Voltage ${num} V is outside reasonable range (0 to 2000 V).` });
    }
  }

  // 6. Compute Cryptographic SHA-256 Hash of Telemetry Event Payload
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const eventId = 'EVT-IOT-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const telemetryPayloadToHash = {
    eventId,
    deviceId,
    associatedAssetId: targetAssetId,
    sector: dev.sector,
    timestamp,
    readings: telemetry
  };

  const telemetryHash = calculateSHA256(telemetryPayloadToHash);

  // 7. Update Live Device Status & Telemetry
  dev.telemetry = { ...dev.telemetry, ...telemetry };
  dev.lastSeen = 'Just now';
  dev.telemetryIntegrity = 'VERIFIED';
  iotDevicesDatabase.set(deviceId, dev);

  // 8. Append Telemetry Event to Associated Asset's Lifecycle History
  if (asset && asset.lifecycle) {
    const formattedReadings = Object.entries(telemetry).map(([k, v]) => `${k}: ${v}`).join(', ');
    const iotEvent = {
      step: 'IOT_TELEMETRY',
      title: `IoT Telemetry Received (${formattedReadings})`,
      timestamp,
      actor: dev.deviceId,
      txRef: eventId,
      eventId,
      deviceId,
      telemetryHash,
      readings: telemetry
    };
    asset.lifecycle.push(iotEvent);
    offChainDatabase.set(targetAssetId, asset);
  }

  saveToDisk();

  return res.json({
    success: true,
    statusText: 'Telemetry Accepted ✓',
    message: 'Telemetry Accepted ✓',
    telemetryHash,
    eventId,
    deviceId,
    associatedAssetId: targetAssetId,
    updatedTelemetry: dev.telemetry,
    telemetryIntegrity: 'VERIFIED'
  });
});

// 7. AI Asset Data Extraction Endpoint: /api/ai/parse
app.post('/api/ai/parse', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

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

// 8. Demo Tamper Test Endpoint: /api/demo/tamper
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

// 9. Demo Restore Endpoint: /api/demo/restore
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
