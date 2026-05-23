import express from 'express';
const app = express();
// ADMIN ENDPOINT: Update or add a new destination price row
app.post('/api/admin/update-price', (req, res) => {
    try {
        const { password, destination, shuttle, private: privatePrice } = req.body;

        // Simple security check (Change 'zippygo2026' to any password you want)
        if (password !== 'zippygo2026') {
            return res.status(403).json({ success: false, message: "Unauthorized access key." });
        }

        const filePath = path.resolve('./prices.json');
        let priceMatrix = {};

        // Read current prices if file exists
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            priceMatrix = JSON.parse(rawData);
        }

        // Add or update the destination (saved in lowercase for easy matching)
        priceMatrix[destination.toLowerCase().trim()] = {
            shuttle: parseFloat(shuttle),
            private: parseFloat(privatePrice)
        };

        // Write the updated matrix back to your prices.json file
        fs.writeFileSync(filePath, JSON.stringify(priceMatrix, null, 2));

        res.json({ success: true, message: `Successfully updated rates for ${destination}!` });
    } catch (error) {
        console.error("Admin update failed:", error);
        res.status(500).json({ success: false, message: "Server failed to update database." });
    }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
