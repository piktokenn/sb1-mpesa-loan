// Edge function for handling M-Pesa Daraja API requests
// This would be deployed to Supabase Edge Functions

const CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") || "";
const CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") || "";
const BUSINESS_SHORT_CODE = Deno.env.get("MPESA_BUSINESS_SHORT_CODE") || "";
const PASSKEY = Deno.env.get("MPESA_PASSKEY") || "";
const ENV = Deno.env.get("ENVIRONMENT") || "sandbox";

// Determine API base URL based on environment
const BASE_URL = ENV === "production" 
  ? "https://api.safaricom.co.ke" 
  : "https://sandbox.safaricom.co.ke";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Generate auth token for M-Pesa API
async function generateAuthToken() {
  try {
    const credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    
    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error generating auth token:", error);
    throw new Error("Failed to generate auth token");
  }
}

// Generate timestamp in YYYYMMDDHHmmss format
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate password for STK Push
function generatePassword(timestamp: string) {
  const str = `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`;
  return btoa(str);
}

// STK Push request
async function stkPush(phoneNumber: string, amount: number, reference: string, description: string) {
  try {
    const token = await generateAuthToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    
    // Format phone number (remove leading 0 or +254)
    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    const requestBody = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: String(amount),
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa/callback`,
      AccountReference: reference,
      TransactionDesc: description,
    };
    
    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    return await response.json();
  } catch (error) {
    console.error("STK Push error:", error);
    throw new Error("Failed to initiate payment");
  }
}

// Query STK Push status
async function queryStkStatus(checkoutRequestID: string) {
  try {
    const token = await generateAuthToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    
    const requestBody = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };
    
    const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Query STK status error:", error);
    throw new Error("Failed to query payment status");
  }
}

// Serve the Edge Function
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();
  
  try {
    // STK Push endpoint
    if (path === "stk" && req.method === "POST") {
      const { phoneNumber, amount, reference, description } = await req.json();
      
      if (!phoneNumber || !amount) {
        return new Response(
          JSON.stringify({ success: false, message: "Phone number and amount are required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      
      const response = await stkPush(
        phoneNumber, 
        amount, 
        reference || "Payment", 
        description || "Payment"
      );
      
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Query STK status endpoint
    if (path === "status" && req.method === "POST") {
      const { checkoutRequestID } = await req.json();
      
      if (!checkoutRequestID) {
        return new Response(
          JSON.stringify({ success: false, message: "Checkout request ID is required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      
      const response = await queryStkStatus(checkoutRequestID);
      
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Callback URL for M-Pesa to send results
    if (path === "callback" && req.method === "POST") {
      const data = await req.json();
      console.log("M-Pesa callback data:", data);
      
      // In a production app, you would store this in a database
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Default response for unknown endpoints
    return new Response(
      JSON.stringify({ success: false, message: "Endpoint not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in M-Pesa Edge Function:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error", error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});