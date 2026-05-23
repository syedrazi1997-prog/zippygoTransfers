import fs from 'fs';
import path from 'path';

// ... (keep your existing express setup and middleware configurations)

app.post('/api/search-transfers', (req, res) => {
    try {
        const { airport, destination, tripType } = req.body;
        const searchDest = destination.toLowerCase();

        // Standard global fallback rates if the destination isn't matched
        let baseShuttlePrice = 25.00; 
        let basePrivatePrice = 80.00; 

        // Read the local pricing file dynamically
        const filePath = path.resolve('./prices.json');
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            const priceMatrix = JSON.parse(rawData);

            // Scan through your keys to see if the user's destination matches
            const matchedKey = Object.keys(priceMatrix).find(key => searchDest.includes(key));
            if (matchedKey) {
                baseShuttlePrice = priceMatrix[matchedKey].shuttle;
                basePrivatePrice = priceMatrix[matchedKey].private;
            }
        }

        // Apply margins and trip type calculation parameters
        const marginMultiplier = 1 + GLOBAL_MARGIN;
        const tripMultiplier = tripType === 'return' ? 2 : 1;

        const finalShuttleGbp = (baseShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2);
        const finalPrivateGbp = (basePrivatePrice * marginMultiplier * tripMultiplier).toFixed(2);

        // ... (keep your existing combinedDeals array structure and res.json output response)
