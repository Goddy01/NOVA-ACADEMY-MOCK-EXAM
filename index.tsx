
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safari detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Ensure DOM is ready before mounting
function mountApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      // Retry after a short delay if root element not found (for slow connections)
      setTimeout(mountApp, 100);
      return;
    }

    // Remove loading fallback if it exists
    const loadingFallback = rootElement.querySelector('.loading-fallback');
    if (loadingFallback) {
      loadingFallback.remove();
    }

    const root = ReactDOM.createRoot(rootElement);
    
    // Safari sometimes has issues with StrictMode, so we conditionally use it
    const AppComponent = <App />;
    
    if (isSafari) {
      // Safari: render without StrictMode for better compatibility
      root.render(AppComponent);
    } else {
      // Other browsers: use StrictMode
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  } catch (error) {
    console.error('Error mounting app:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; font-family: system-ui;">
          <h2 style="color: #dc2626;">Failed to Load Application</h2>
          <p style="color: #64748b; margin-top: 1rem;">Please try refreshing the page.</p>
          <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">Error: ${error.message || 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Mount when DOM is ready - handle both mobile and desktop
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  // DOM already ready
  mountApp();
}

// Fallback for very slow connections - try mounting after a delay
setTimeout(() => {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.children.length <= 1 && rootElement.innerHTML.includes('loading-fallback')) {
    mountApp();
  }
}, 1000);

// Auto-initialize for Safari compatibility
// Safari sometimes doesn't execute module scripts properly, so we ensure execution
if (typeof window !== 'undefined') {
  // Ensure mountApp runs even if there are timing issues
  window.addEventListener('load', () => {
    if (document.getElementById('root')?.querySelector('.loading-fallback')) {
      setTimeout(mountApp, 100);
    }
  });
}
