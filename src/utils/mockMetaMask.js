/**
 * Mock MetaMask provider for development/testing without real MetaMask extension
 * This simulates the MetaMask API for testing the wallet connection flow
 */

const mockProvider = {
  isMetaMask: true,
  isMockMetaMask: true, // Flag to identify this as a mock provider
  isConnected: () => true,
  selectedAddress: null,
  chainId: '0xaa36a7', // Sepolia testnet
  networkVersion: '11155111', // Sepolia chain ID in decimal
  
  // Store for mock accounts
  _mockAccounts: [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  ],
  _currentAccountIndex: 0,
  
  // Mock event listeners
  _listeners: {},
  
  on(event, listener) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  },
  
  removeListener(event, listener) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(l => l !== listener);
    }
  },
  
  _emit(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  },
  
  async request({ method, params = [] }) {
    console.log(`[MockMetaMask] request: ${method}`, params);
    
    switch (method) {
      case 'eth_requestAccounts': {
        // Simulate user confirming connection in MetaMask popup
        await new Promise(resolve => setTimeout(resolve, 500));
        const account = this._mockAccounts[this._currentAccountIndex];
        this.selectedAddress = account;
        this._emit('accountsChanged', [account]);
        console.log(`[MockMetaMask] ✅ Connected account: ${account}`);
        return [account];
      }
      
      case 'eth_accounts': {
        if (this.selectedAddress) {
          return [this.selectedAddress];
        }
        return [];
      }
      
      case 'eth_chainId': {
        return this.chainId;
      }
      
      case 'net_version': {
        return this.networkVersion;
      }
      
      case 'personal_sign': {
        // personal_sign params: [message, account]
        const [message, account] = params;
        console.log(`[MockMetaMask] Signing message for ${account}...`);
        
        // Simulate user confirming signature in MetaMask popup
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate a mock ECDSA signature (65 bytes = 130 hex chars)
        // Format: 0x + r (64 chars) + s (64 chars) + v (2 chars)
        try {
          // Create deterministic but varied mock signature based on message
          const hash = this._hashMessage(message);
          const r = this._hashMessage(message + 'r').padStart(64, '0');
          const s = this._hashMessage(message + 's').padStart(64, '0');
          const v = '1b'; // Recovery ID
          const mockSig = '0x' + r + s + v;
          console.log(`[MockMetaMask] ✅ Generated mock signature: ${mockSig.substring(0, 20)}...`);
          return mockSig;
        } catch (error) {
          console.error('[MockMetaMask] Signature generation failed:', error);
          throw new Error('Failed to sign message');
        }
      }
      
      case 'wallet_switchEthereumChain': {
        // params: [{ chainId: '0xaa36a7' }]
        const { chainId } = params[0] || {};
        console.log(`[MockMetaMask] Switching to chain: ${chainId}`);
        
        if (chainId === '0xaa36a7') {
          this.chainId = chainId;
          this.networkVersion = '11155111';
          this._emit('chainChanged', chainId);
          console.log(`[MockMetaMask] ✅ Switched to Sepolia`);
          return null;
        }
        
        throw new Error('Chain not supported');
      }
      
      case 'wallet_addEthereumChain': {
        console.log('[MockMetaMask] Adding chain...');
        return null;
      }

      case 'eth_sendTransaction': {
        const [tx] = params;
        console.log('[MockMetaMask] Sending transaction:', tx);
        await new Promise(resolve => setTimeout(resolve, 500));

        const hashBase = this._hashMessage(JSON.stringify(tx || {}));
        const txHash = `0x${hashBase.slice(0, 64)}`;
        console.log(`[MockMetaMask] ✅ Transaction confirmed: ${txHash}`);
        return txHash;
      }
      
      default:
        throw new Error(`Mock MetaMask does not support method: ${method}`);
    }
  },
  
  // Simple hash function for generating deterministic mock signatures
  _hashMessage(message) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  },
};

/**
 * Initialize mock MetaMask in development mode
 * This injects a mock provider into the global window object
 */
export function initializeMockMetaMask() {
  if (typeof window !== 'undefined') {
    // Only inject if real MetaMask is not already installed
    if (!window.ethereum) {
      console.log('[MockMetaMask] ✅ Injecting mock MetaMask provider for development');
      window.ethereum = mockProvider;
    } else {
      console.log('[MockMetaMask] Real MetaMask detected, skipping mock injection');
    }
  }
}

export default mockProvider;
