// Cloud-only storage using JSONBin.io - No localStorage!
// Free tier: 10,000 requests/month

const JSONBIN_API_KEY = '$2a$10$bubE9G3Jgcou13efLEEhwu0YPBmCxSolN27qde.Ae0AN7WriPx2Ty'; // Get free at https://jsonbin.io/
const BIN_ID_KEY = 'jsonbin_bin_id'; // Store bin ID in sessionStorage only

const API_URL = 'https://api.jsonbin.io/v3';

interface StorageData {
  results: any[];
  usedCodes: string[];
}

let cachedBinId: string | null = null;

// Initialize - get or create bin
const getBinId = async (): Promise<string> => {
  if (cachedBinId) return cachedBinId;
  
  // Try to get from sessionStorage (temporary, session-only)
  const storedBinId = sessionStorage.getItem(BIN_ID_KEY);
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
  
  if (!response.ok) {
    throw new Error('Failed to create bin');
  }
  
  const data = await response.json();
  cachedBinId = data.metadata?.id || data.id;
  if (cachedBinId) {
    sessionStorage.setItem(BIN_ID_KEY, cachedBinId);
  }
  return cachedBinId || '';
};

// Load data from cloud only
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
    console.error('Failed to load from cloud:', error);
    throw error; // Don't fallback, just throw
  }
};

// Save data to cloud only
export const saveToCloud = async (results: any[], usedCodes: string[]): Promise<void> => {
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
};

// Check if access code is used (cloud only)
export const isAccessCodeUsed = async (accessCode: string): Promise<boolean> => {
  try {
    const cloudData = await loadFromCloud();
    return cloudData.usedCodes.includes(accessCode) || 
           cloudData.results.some((r: any) => r.accessCode === accessCode);
  } catch (error) {
    console.error('Failed to check access code:', error);
    // On error, return false (allow code to be used) - better UX than blocking
    return false;
  }
};

// Save result (cloud only)
export const saveResult = async (result: any): Promise<void> => {
  // Load existing data
  const cloudData = await loadFromCloud();
  const updatedResults = [...cloudData.results, result];
  const usedCodes = [...new Set([...cloudData.usedCodes, result.accessCode])];
  
  // Save to cloud
  await saveToCloud(updatedResults, usedCodes);
};

// Get all results (from cloud only)
export const getAllResults = async (): Promise<any[]> => {
  try {
    const cloudData = await loadFromCloud();
    return cloudData.results || [];
  } catch (error) {
    console.error('Failed to get results from cloud:', error);
    return []; // Return empty array on error
  }
};

