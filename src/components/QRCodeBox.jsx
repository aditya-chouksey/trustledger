import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ShieldCheck, ExternalLink, QrCode } from 'lucide-react';

export default function QRCodeBox({ assetId, verificationUrl }) {
  const qrRef = useRef(null);

  // Construct full absolute URL for QR code encoding
  const fullVerificationUrl = verificationUrl
    ? (verificationUrl.startsWith('http') ? verificationUrl : `${window.location.origin}${verificationUrl}`)
    : `${window.location.origin}/verify/${assetId}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Convert canvas to data URL and download
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrustLedger-QR-${assetId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 shadow-xl max-w-sm mx-auto text-center relative overflow-hidden">
      {/* Top accent badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
        <ShieldCheck className="w-3.5 h-3.5" /> VERIFY THIS ASSET
      </div>

      {/* QR Code Container */}
      <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-inner inline-block my-2 border border-slate-200">
        <QRCodeCanvas
          value={fullVerificationUrl}
          size={180}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="text-slate-300 text-sm mt-3 font-medium">
        Scan to view the TrustLedger verification record.
      </p>

      <div className="mt-2 text-xs font-mono text-emerald-400 bg-slate-900/80 py-1.5 px-3 rounded-lg border border-slate-800 inline-block">
        Asset ID: <span className="font-bold text-slate-100">{assetId}</span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          onClick={handleDownload}
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download / Print QR
        </button>

        <a
          href={`/verify/${assetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors py-1.5"
        >
          Open Verification Link Directly <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 leading-tight">
        Contains only secure verification URL. Asset data is validated cryptographically on Hyperledger Fabric.
      </div>
    </div>
  );
}
