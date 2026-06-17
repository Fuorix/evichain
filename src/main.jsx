import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Only inject mock MetaMask in development (never in production builds)
if (import.meta.env.DEV) {
  import('./utils/mockMetaMask.js').then(({ initializeMockMetaMask }) => {
    initializeMockMetaMask();
  });
}

createRoot(document.getElementById('root')).render(<App />);
