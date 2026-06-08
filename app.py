import asyncio
import os

from flask import Flask, jsonify
from playwright.async_api import async_playwright

app = Flask(**name**)

# =========================================

# PLAYWRIGHT SCRAPER

# =========================================

async def run_scraper():

```
browser = None

try:

    async with async_playwright() as p:

        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )

        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )

        page = await context.new_page()

        print("Navigating to Suntransfers...")

        await page.goto(
            "https://www.suntransfers.com/",
            wait_until="domcontentloaded",
            timeout=60000
        )

        # =========================================
        # YOUR BOOKING FORM LOGIC HERE
        # =========================================

        results = [
            {
                "Vehicle Type": "Private Transfer",
                "Price": "7.31€"
            },
            {
                "Vehicle Type": "Minivan",
                "Price": "10.42€"
            }
        ]

        await browser.close()

        return results

except Exception as e:

    print("SCRAPER ERROR:", str(e))

    if browser:
        await browser.close()

    return {
        "error": str(e)
    }
```

# =========================================

# API ROUTE

# =========================================

@app.route('/scrape', methods=['GET'])
def trigger_scrape():

```
try:

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    data = loop.run_until_complete(run_scraper())

    return jsonify({
        "status": "success",
        "data": data
    })

except Exception as e:

    return jsonify({
        "status": "error",
        "message": str(e)
    }), 500
```

# =========================================

# HEALTH CHECK

# =========================================

@app.route('/')
def home():
return "SunTransfers Scraper Running"

# =========================================

# START SERVER

# =========================================

if **name** == '**main**':

```
port = int(os.environ.get("PORT", 5000))

app.run(
    host='0.0.0.0',
    port=port
)
```
