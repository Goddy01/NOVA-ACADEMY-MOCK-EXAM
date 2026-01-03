// Simple cloud storage using JSONBin.io - No Firebase setup needed!
// Free tier: 10,000 requests/month

const JSONBIN_API_KEY = '$2a$10$bubE9G3Jgcou13efLEEhwu0YPBmCxSolN27qde.Ae0AN7WriPx2Ty'; // Get free at https://jsonbin.io/
const BIN_ID = 'YOUR_BIN_ID'; // Will be created automatically on first save

// Get your free API key: https://jsonbin.io/api-key/create
// No registration required for free tier!

const API_URL = 'https://api.jsonbin.io/v3';

interface StorageData {
  results: any[];
  usedCodes: string[];
}

let cachedBinId: string | null = null;

// Initialize - get or create bin
const getBinId = async (): Promise<string> => {
  if (cachedBinId) return cachedBinId;
  
  // Try to get from localStorage first
  const storedBinId = localStorage.getItem('jsonbin_id');
  if (storedBinId) {
    cachedBinId = storedBinId;
    return storedBinId;
  }
  
  // Create new bin
  const response = await fetch(`${API_URL}/b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify({ results: [], usedCodes: [] }),
  });
  
  const data = await response.json();
  cachedBinId = data.metadata?.id || data.id;
  if (cachedBinId) {
    localStorage.setItem('jsonbin_id', cachedBinId);
  }
  return cachedBinId || '';
};

// Load data from cloud
export const loadFromCloud = async (): Promise<StorageData> => {
  try {
    const binId = await getBinId();
    if (!binId) return { results: [], usedCodes: [] };
    
    const response = await fetch(`${API_URL}/b/${binId}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to load from cloud');
    }
    
    const data = await response.json();
    return data.record || { results: [], usedCodes: [] };
  } catch (error) {
    console.warn('Cloud load failed, using localStorage:', error);
    // Fallback to localStorage
    const results = JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
    const usedCodes = results.map((r: any) => r.accessCode);
    return { results, usedCodes };
  }
};

// Save data to cloud
export const saveToCloud = async (results: any[], usedCodes: string[]): Promise<void> => {
  try {
    const binId = await getBinId();
    if (!binId) throw new Error('No bin ID');
    
    const data = { results, usedCodes };
    
    const response = await fetch(`${API_URL}/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save to cloud');
    }
  } catch (error) {
    console.warn('Cloud save failed, saved to localStorage only:', error);
    // Still save to localStorage as backup
    localStorage.setItem('nova_academy_results', JSON.stringify(results));
  }
};

// Check if access code is used (checks both cloud and local)
export const isAccessCodeUsed = async (accessCode: string): Promise<boolean> => {
  // Check localStorage first (fast)
  const localResults = JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
  if (localResults.some((r: any) => r.accessCode === accessCode)) {
    return true;
  }
  
  // Check cloud (for cross-device sync)
  try {
    const cloudData = await loadFromCloud();
    return cloudData.usedCodes.includes(accessCode) || 
           cloudData.results.some((r: any) => r.accessCode === accessCode);
  } catch (error) {
    // If cloud check fails, return localStorage result
    return false;
  }
};

// Save result (to both cloud and local)
export const saveResult = async (result: any): Promise<void> => {
  // Save to localStorage immediately
  const existing = JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
  const updated = [...existing, result];
  localStorage.setItem('nova_academy_results', JSON.stringify(updated));
  
  // Sync to cloud
  const usedCodes = updated.map((r: any) => r.accessCode);
  await saveToCloud(updated, usedCodes);
};

// Get all results (from cloud)
export const getAllResults = async (): Promise<any[]> => {
  try {
    const cloudData = await loadFromCloud();
    return cloudData.results || [];
  } catch (error) {
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('nova_academy_results') || '[]');
  }
};

