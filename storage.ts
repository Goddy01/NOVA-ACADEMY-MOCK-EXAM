// Cloud-only storage using JSONBin.io - No localStorage!
// Free tier: 10,000 requests/month

const JSONBIN_API_KEY = '$2a$10$bubE9G3Jgcou13efLEEhwu0YPBmCxSolN27qde.Ae0AN7WriPx2Ty'; // Get free at https://jsonbin.io/

// IMPORTANT: This bin ID must be the SAME across all devices for cross-device sync to work!
// To set this up:
// 1. Create a bin manually at https://jsonbin.io/ (or let it auto-create on first save)
// 2. Copy the bin ID from the URL (e.g., if URL is https://jsonbin.io/app/bins/65abc123..., the ID is 65abc123...)
// 3. Replace 'YOUR_SHARED_BIN_ID' below with that ID
// 4. All devices will then share the same data!
const SHARED_BIN_ID = 'YOUR_SHARED_BIN_ID'; // Replace with your actual bin ID for cross-device sync

const API_URL = 'https://api.jsonbin.io/v3';

interface StorageData {
  results: any[];
  usedCodes: string[];
}

let cachedBinId: string | null = null;

// Initialize - get or create shared bin
const getBinId = async (): Promise<string> => {
  if (cachedBinId) return cachedBinId;
  
  // Use shared bin ID if configured (for cross-device sync)
  if (SHARED_BIN_ID && SHARED_BIN_ID !== 'YOUR_SHARED_BIN_ID') {
    // Verify bin exists by trying to read it
    try {
      const response = await fetch(`${API_URL}/b/${SHARED_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY },
      });
      if (response.ok) {
        cachedBinId = SHARED_BIN_ID;
        return SHARED_BIN_ID;
      }
    } catch (error) {
      console.warn('Shared bin not accessible, will create new one');
    }
  }
  
  // If no shared bin or it doesn't exist, create a new one
  // NOTE: This creates a NEW bin per device - you need to set SHARED_BIN_ID for cross-device sync!
  console.warn('⚠️ Creating new bin - cross-device sync will NOT work until SHARED_BIN_ID is set!');
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
  const newBinId = data.metadata?.id || data.id;
  console.log('📦 Created new bin ID:', newBinId);
  console.log('⚠️ Copy this ID and set it as SHARED_BIN_ID in storage.ts for cross-device sync!');
  cachedBinId = newBinId;
  return newBinId;
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
  try {
    // Load existing data from shared bin
    const cloudData = await loadFromCloud();
    const updatedResults = [...cloudData.results, result];
    
    // Update used codes list (ensure no duplicates)
    const usedCodesSet = new Set(cloudData.usedCodes || []);
    usedCodesSet.add(result.accessCode);
    const usedCodes = Array.from(usedCodesSet);
    
    // Save to cloud (shared bin)
    await saveToCloud(updatedResults, usedCodes);
    console.log('✅ Result saved successfully to shared cloud storage');
  } catch (error) {
    console.error('❌ Failed to save result:', error);
    throw error;
  }
};

// Get current bin ID (useful for setup)
export const getCurrentBinId = async (): Promise<string> => {
  return await getBinId();
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

