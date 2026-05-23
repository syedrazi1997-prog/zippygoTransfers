import asyncio
from flask import Flask, jsonify
from playwright.async_api import async_playwright
import os

app = Flask(__name__)

async def run_scraper():
    async with async_playwright() as p:
        # CRITICAL: Must be headless=True for Render cloud servers
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to Suntransfers...")
        await page.goto("https://www.suntransfers.com/", wait_until="networkidle")
        
        # ... (Your booking form filling logic goes here) ...
        
        # Example dummy data structure to return over the web
        results = [
            {"Vehicle Type": "Private Transfer", "Price": "7.31€"},
            {"Vehicle Type": "Minivan", "Price": "10.42€"}
        ]
        
        await browser.close()
        return results

@app.route('/scrape', methods=['GET'])
def trigger_scrape():
    # Runs the async Playwright function inside the synchronous Flask route
    data = asyncio.run(run_scraper())
    return jsonify({"status": "success", "data": data})

if __name__ == '__main__':
    # Render assigns a dynamic port, we must bind to it
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
