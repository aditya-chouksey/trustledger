import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AssetDetails from './pages/AssetDetails';
import PublicVerification from './pages/PublicVerification';
import DeviceVerification from './pages/DeviceVerification';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets/:assetId" element={<AssetDetails />} />
        <Route path="/verify/:assetId" element={<PublicVerification />} />
        <Route path="/verify/device/:deviceId" element={<DeviceVerification />} />
      </Routes>
    </Router>
  );
}
