import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initializeMockMetaMask } from './utils/mockMetaMask.js';

// Initialize mock MetaMask provider for development (if real MetaMask not installed)
initializeMockMetaMask();

createRoot(document.getElementById('root')).render(<App />);
