import { useMemo, useState } from 'react';
import api from './services/api';

export default function ViewEvidence() {
  const [evidenceRecords] = useState([
    { caseNumber: 'CASE-001', evidenceId: 'EV-001', fileName: 'photo.jpg', status: 'verified' },
    { caseNumber: 'CASE-001', evidenceId: 'EV-002', fileName: 'document.pdf', status: 'pending' },
    { caseNumber: 'CASE-002', evidenceId: 'EV-003', fileName: 'video.mp4', status: 'verified' },
    { caseNumber: 'CASE-002', evidenceId: 'EV-004', fileName: 'report.docx', status: 'verified' },
    { caseNumber: 'CASE-003', evidenceId: 'EV-005', fileName: 'audio.mp3', status: 'pending' },
  ]);

  const groupedEvidence = useMemo(() => {
    return evidenceRecords.reduce((acc, record) => {
      const { caseNumber } = record;
      if (!acc[caseNumber]) {
        acc[caseNumber] = [];
      }
      acc[caseNumber].push(record);
      return acc;
    }, {});
  }, [evidenceRecords]);

  const [expandedCases, setExpandedCases] = useState([]);
  const [downloading, setDownloading] = useState({});

  const toggleCase = (caseNumber) => {
    setExpandedCases(prev =>
      prev.includes(caseNumber)
        ? prev.filter(c => c !== caseNumber)
        : [...prev, caseNumber]
    );
  };

  async function downloadEvidence(file) {
    const id = file.evidenceId;
    try {
      setDownloading(prev => ({ ...prev, [id]: true }));
      const ev = await api.evidence.getById(id);
      const url = ev?.ipfsUrl;
      if (!url) throw new Error('No download URL available');

      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.fileName || `${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('[ViewEvidence] download failed', err);
      alert(err.message || 'Download failed');
    } finally {
      setDownloading(prev => ({ ...prev, [id]: false }));
    }
  }

  const statusStyle = (status) => {
    if (status === 'verified') return 'status-badge status-verified';
    if (status === 'pending') return 'status-badge status-pending';
    return 'status-badge status-failed';
  };

  return (
    <div className="p-gutter space-y-6">
      <div className="page-header">
        <div>
          <div className="page-title">Evidence Records</div>
          <div className="page-sub">// grouped by case number</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(groupedEvidence).map(([caseNumber, evidenceFiles]) => (
          <div
            key={caseNumber}
            className="card"
            style={{ marginBottom: 0 }}
          >
            <button
              onClick={() => toggleCase(caseNumber)}
              className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 transition-all hover:bg-white/20"
              style={{ border: 'none', background: 'transparent' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--accent)' }}>
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                <span className="font-semibold text-sm" style={{ color: '#0f3a38' }}>{caseNumber}</span>
                <span className="nav-badge">{evidenceFiles.length}</span>
              </div>
              <span
                className="transition-transform"
                style={{
                  fontSize: 12,
                  color: 'var(--text3)',
                  transform: expandedCases.includes(caseNumber) ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>

            {expandedCases.includes(caseNumber) && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)' }}>
                {evidenceFiles.map((file) => (
                  <div
                    key={file.evidenceId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-4 py-3 sm:px-6 transition-all hover:bg-white/20"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: '#0f3a38' }}>{file.fileName}</p>
                      <p className="text-xs font-mono truncate" style={{ color: '#006b5f', letterSpacing: '0.04em' }}>{file.evidenceId}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={statusStyle(file.status)}>
                        {file.status === 'verified' ? 'Verified' : file.status === 'pending' ? 'Pending' : file.status}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadEvidence(file); }}
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        aria-label={`Download ${file.fileName}`}
                      >
                        {downloading[file.evidenceId] ? (
                          <><span className="ev-spinner" style={{ width: 12, height: 12 }}></span> Downloading...</>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {Object.keys(groupedEvidence).length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 0 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, margin: '0 auto 12px' }}>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>
              No evidence records found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
