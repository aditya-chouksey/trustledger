import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

export default function QRCodeBox({ assetId, verificationUrl }) {
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const fullVerificationUrl = verificationUrl
    ? (verificationUrl.startsWith('http') ? verificationUrl : `${window.location.origin}${verificationUrl}`)
    : `${window.location.origin}/verify/${assetId}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `TrustLedger-QR-${assetId}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullVerificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#c8cdd6] dark:border-slate-800 bg-[#e8eaed] dark:bg-[#0d1424] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#d4d8e0] dark:border-slate-800 bg-[#dde0e5] dark:bg-slate-900/50">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[11px] font-semibold text-[#5a6070] dark:text-slate-400 uppercase tracking-wider">Verify this Asset</span>
      </div>

      <div className="flex flex-col items-center gap-4 px-5 py-5">
        {/* QR */}
        <div ref={qrRef} className="p-3 bg-white rounded-xl shadow-sm border border-[#c8cdd6] dark:border-slate-700 inline-block">
          <QRCodeCanvas value={fullVerificationUrl} size={160} level="H" includeMargin={false} fgColor="#1c1917" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-[12px] text-stone-500 dark:text-slate-400">Scan to open the verification record</p>
          <div className="inline-block font-mono text-[11px] bg-[#dde0e5] dark:bg-slate-900 text-[#5a6070] dark:text-slate-400 px-2.5 py-1 rounded-lg border border-[#c8cdd6] dark:border-slate-800">
            {assetId}
          </div>
        </div>

        <div className="w-full space-y-2">
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition-all cursor-pointer shadow-sm shadow-emerald-600/20">
            <Download className="w-3.5 h-3.5" /> Download QR
          </button>
          <button onClick={handleCopyUrl}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium bg-[#dde0e5] hover:bg-[#d0d4db] dark:bg-slate-900 dark:hover:bg-slate-800 text-[#5a6070] dark:text-slate-300 border border-[#c8cdd6] dark:border-slate-800 transition-colors cursor-pointer">
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600"/>Copied!</> : <><Copy className="w-3.5 h-3.5"/>Copy Link</>}
          </button>
          <a href={`/verify/${assetId}`} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1 text-[11px] text-[#8a92a0] dark:text-slate-400 hover:text-[#5a6070] dark:hover:text-slate-200 transition-colors py-1">
            Open verification page <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[#d4d8e0] dark:border-slate-800 bg-[#dde0e5] dark:bg-slate-900/40 text-[10px] text-[#8a92a0] dark:text-slate-500 text-center leading-relaxed">
        QR contains only the verification URL — no private data encoded.
      </div>
    </div>
  );
}
