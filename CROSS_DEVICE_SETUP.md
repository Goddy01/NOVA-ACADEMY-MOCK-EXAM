# Cross-Device Sync Setup

To enable cross-device synchronization (access codes and results shared across all devices):

## Step 1: Run the app for the first time

1. Start your dev server: `npm run dev`
2. Open the app in your browser
3. Open browser console (F12 → Console tab)
4. Submit a test exam (or just let it create the bin)

## Step 2: Get your Bin ID

After the first save, check the browser console. You'll see:
```
📦 Created new bin ID: 65abc123def456...
⚠️ Copy this ID and set it as SHARED_BIN_ID in storage.ts for cross-device sync!
```

## Step 3: Set the shared Bin ID

1. Open `storage.ts`
2. Find this line: `const SHARED_BIN_ID = 'YOUR_SHARED_BIN_ID';`
3. Replace `'YOUR_SHARED_BIN_ID'` with your actual bin ID from Step 2
   ```typescript
   const SHARED_BIN_ID = '65abc123def456...'; // Your actual bin ID
   ```
4. Save the file

## Step 4: Deploy/Update

After setting the `SHARED_BIN_ID`, all devices will use the same bin:
- ✅ Access codes checked across all devices
- ✅ Results visible on all devices
- ✅ Admin dashboard shows all results

## Alternative: Get Bin ID from JSONBin.io website

1. Go to https://jsonbin.io/
2. Sign in (optional, but helps manage bins)
3. Click "Create Bin" or check existing bins
4. Copy the bin ID from the URL or bin details
5. Set it as `SHARED_BIN_ID` in `storage.ts`

## Troubleshooting

- **"Creating new bin" warning**: You haven't set `SHARED_BIN_ID` yet
- **Cross-device not working**: Make sure `SHARED_BIN_ID` is set and matches on all deployments
- **Bin ID format**: Should be a long alphanumeric string like `65abc123def456ghi789...`

## Important Notes

- ⚠️ Never commit your API key or bin ID to public repositories
- ✅ Use environment variables for production
- ✅ The bin ID must be EXACTLY the same across all devices/apps for sync to work

