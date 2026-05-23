import asyncio
from playwright.async_loop import Error
from playwright.async_api import async_playwright
import pandas as pd

async def automate_suntransfers_search():
    async with async_playwright() as p:
        # Launch browser (headless=False lets you see the automation happen)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        print("Opening Suntransfers...")
        await page.goto("https://www.suntransfers.com/", wait_until="networkidle")
        
        # 1. Handle cookie banner if it appears (common on European booking sites)
        try:
            # Adjust the selector if the button text is different (e.g., "Accept All", "Agree")
            await page.click("button:has-text('Accept')", timeout=5000)
            print("Cookie banner accepted.")
        except Error:
            print("No cookie banner detected or auto-dismissed.")

        # 2. Input Arrival Airport
        print("Entering arrival airport...")
        airport_input = page.locator("input[placeholder*='Arrival airport']")
        await airport_input.click()
        await airport_input.fill("Malaga")
        # Wait for dropdown autocomplete options to appear and select the first one
        await page.wait_for_selector(".autocomplete-results, [role='listbox']")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")

        # 3. Input Destination ("Going to")
        print("Entering destination...")
        destination_input = page.locator("input[placeholder*='Going to']")
        await destination_input.click()
        await destination_input.fill("Marbella")
        # Wait for autocomplete dropdown and select
        await page.wait_for_selector(".autocomplete-results, [role='listbox']")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")

        # 4. Select Date & Time (Optional adjustment)
        # Note: Suntransfers auto-fills a default upcoming date. 
        # To change it, you typically click the wrapper and select a day from the matrix grid.
        print("Using default/selected flight arrival times...")

        # 5. Click Search Button
        print("Clicking Search...")
        # Locates the main search submission button
        search_button = page.locator("button:has-text('Search'), input[type='submit']")
        await search_button.click()
        
        # 6. Wait for the live Results Page to load
        print("Waiting for quote results...")
        await page.wait_for_url("**/search**", timeout=30000)
        await page.wait_for_load_state("networkidle")
        
        # 7. Scrape the Live Transfer Options and Prices
        print("Scraping quote choices...")
        vehicles = []
        
        # Locate the container elements holding vehicle tiers (adjust selectors based on results page DOM)
        transfer_options = await page.locator(".vehicle-card, .transfer-option, .result-item").all()
        
        for option in transfer_options:
            try:
                type_element = await option.locator(".vehicle-name, h3, .type").first.text_content()
                price_element = await option.locator(".price, .amount, .total-price").first.text_content()
                
                vehicles.append({
                    "Vehicle Type": type_element.strip(),
                    "Price": price_element.strip()
                })
            except Exception:
                continue
                
        # 8. Output and save the retrieved rates
        if vehicles:
            df = pd.DataFrame(vehicles)
            print("\n--- Available Live Transfer Quotes ---")
            print(df)
            df.to_csv("live_transfers_quotes.csv", index=False)
            print("\nSaved to 'live_transfers_quotes.csv'")
        else:
            print("Could not locate quote elements. You may need to inspect the live results page structure to update class selectors.")
            
        await browser.close()

# Run the automation script
asyncio.run(automate_suntransfers_search())
