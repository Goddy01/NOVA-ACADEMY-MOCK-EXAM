// Cloud-only storage using JSONBin.io - No localStorage!
// Free tier: 10,000 requests/month

const JSONBIN_API_KEY = '$2a$10$bubE9G3Jgcou13efLEEhwu0YPBmCxSolN27qde.Ae0AN7WriPx2Ty'; // Get free at https://jsonbin.io/

// IMPORTANT: This bin ID must be the SAME across all devices for cross-device sync to work!
// Set this to your actual bin ID from JSONBin.io
// To get it: Check browser console after first save, or create one at https://jsonbin.io/
const SHARED_BIN_ID = '6959453bae596e708fc282a4'; // Your shared bin ID for cross-device sync

const API_URL = 'https://api.jsonbin.io/v3';

interface StorageData {
  results: any[];
  usedCodes: string[];
}

let cachedBinId: string | null = null;

// Initialize - ALWAYS use SHARED_BIN_ID if set
const getBinId = async (): Promise<string> => {
  // Use cached bin ID if available
  if (cachedBinId) {
    return cachedBinId;
  }
  
  // CRITICAL: ALWAYS use SHARED_BIN_ID if it's configured
  // This ensures cross-device sync works - all devices use the same bin
  // NEVER create new bins when SHARED_BIN_ID is set!
  if (SHARED_BIN_ID && SHARED_BIN_ID.length > 10) {
    cachedBinId = SHARED_BIN_ID;
    console.log('✅ Using FIXED shared bin ID:', SHARED_BIN_ID.substring(0, 12) + '... (cross-device sync enabled)');
    return SHARED_BIN_ID;
  }
  
  // FALLBACK: Only create new bin if SHARED_BIN_ID is NOT configured
  // This should NOT happen if SHARED_BIN_ID is set correctly
  console.error('❌ ERROR: SHARED_BIN_ID not configured! Creating new bin - this will NOT sync across devices!');
  console.error('❌ Fix: Set SHARED_BIN_ID in storage.ts to enable cross-device sync');
  
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
  console.error('📦 Created NEW bin ID:', newBinId);
  console.error('⚠️ Set this as SHARED_BIN_ID in storage.ts for cross-device sync!');
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
    
    // If bin doesn't exist (404), return empty data - this is fine for first use
    if (response.status === 404) {
      console.log('📦 Bin does not exist yet, returning empty data');
      return { results: [], usedCodes: [] };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load from cloud: ${response.status}`);
    }
    
    const data = await response.json();
    return data.record || { results: [], usedCodes: [] };
  } catch (error: any) {
    // If it's a 404, return empty data instead of throwing
    if (error?.message?.includes('404') || error?.message?.includes('not exist')) {
      return { results: [], usedCodes: [] };
    }
    console.error('Failed to load from cloud:', error);
    throw error;
  }
};

// Save data to cloud only
export const saveToCloud = async (results: any[], usedCodes: string[]): Promise<void> => {
  const binId = await getBinId();
  if (!binId) throw new Error('No bin ID');
  
  const data = { results, usedCodes };
  
  // Try PUT (this works for both creating and updating in JSONBin.io v3)
  const response = await fetch(`${API_URL}/b/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    if (response.status === 404) {
      // Bin doesn't exist - JSONBin.io v3 requires bin to exist first
      console.error('❌ Bin does not exist! Create it at https://jsonbin.io/ first, or the bin ID might be incorrect.');
      throw new Error(`Bin ${binId.substring(0, 8)}... does not exist. Please create it at https://jsonbin.io/ or verify the bin ID is correct.`);
    }
    throw new Error(`Failed to save to cloud: ${response.status} - ${errorText}`);
  }
  
  console.log('✅ Saved to bin:', binId.substring(0, 8) + '...');
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

