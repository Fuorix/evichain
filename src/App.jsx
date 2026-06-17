import { useEffect } from 'react';
import { mountLegacyApp } from './legacyApp';

function App() {
  useEffect(() => {
    mountLegacyApp();
  }, []);

  return (
    <>
      <div className="auth-gate" id="auth-gate"></div>

      <div
        className="app-shell min-h-screen overflow-x-hidden bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container"
        id="app-shell"
      >
        <aside
          className="app-sidebar hidden lg:flex flex-col fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-white/5 z-50"
          id="sidebar"
        ></aside>

        <div className="app-main flex min-h-screen w-full min-w-0 flex-col lg:ml-72 lg:w-[calc(100%-18rem)]">
          <header
            className="app-topbar sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-gutter backdrop-blur-md"
            id="topbar"
          ></header>

          <main className="app-content flex-1 min-w-0" id="main-content">
            <div id="page-dashboard" className="page"></div>
            <div id="page-upload" className="page"></div>
            <div id="page-records" className="page"></div>
            <div id="page-verify" className="page"></div>
            <div id="page-chain" className="page"></div>
            <div id="page-search-cid" className="page"></div>
            <div id="page-view-evidence" className="page"></div>
            <div id="page-settings" className="page"></div>
          </main>
        </div>
      </div>

      <div className="toast" id="toast">
        <span className="toast-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </span>
        <div>
          <div className="toast-title">Evidence submitted</div>
          <div className="toast-sub">Blockchain confirmation received</div>
        </div>
      </div>
    </>
  );
}

export default App;
