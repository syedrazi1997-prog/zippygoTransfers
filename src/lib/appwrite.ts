// 1. Import 'functions' from your appwrite config file alongside databases
import { databases, functions } from "../lib/appwrite"; 

// 2. Inside handlePay, replace the fetch code block (lines 114-130) with:
const response = await functions.createExecution(
  import.meta.env.VITE_APPWRITE_FUNCTION_ID,
  JSON.stringify({
    action: "create_order",
    amount: totalUSD,
    currency: "USD",
    bookingId,
    bookingRef,
  })
);

// 3. Since the SDK parses the response model automatically:
if (response.status !== 'completed') {
  setError("Failed to initiate payment. Please try again.");
  setLoading(false);
  return;
}

const orderData = JSON.parse(response.responseBody || "{}");
