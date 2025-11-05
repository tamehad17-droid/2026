#!/bin/bash

# This script deploys the send-verification-email function using Supabase Management API
# You need your Supabase Service Role Key

PROJECT_REF="jtxmijnxrgcwjvtdlgxy"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"  # Replace with your service role key

# The function code (escaped for JSON)
FUNCTION_CODE='import { serve } from "https://deno.land/std@0.192.0/http/server.ts";\n\nserve(async (req) => {\n  if (req.method === "OPTIONS") {\n    return new Response("ok", {\n      headers: {\n        "Access-Control-Allow-Origin": "*",\n        "Access-Control-Allow-Methods": "POST, OPTIONS",\n        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"\n      }\n    });\n  }\n  \n  try {\n    const { email, verificationCode, fullName } = await req.json();\n    if (!email || !verificationCode) {\n      return new Response(JSON.stringify({error: "Missing required fields"}), {\n        status: 400,\n        headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}\n      });\n    }\n    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");\n    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");\n    const resendResponse = await fetch("https://api.resend.com/emails", {\n      method: "POST",\n      headers: {"Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json"},\n      body: JSON.stringify({\n        from: "onboarding@resend.dev",\n        to: [email],\n        subject: "Email Verification - PromoHive",\n        html: "<div>Code: " + verificationCode + "</div>",\n        text: "Code: " + verificationCode\n      })\n    });\n    if (!resendResponse.ok) throw new Error("Resend error");\n    const resendData = await resendResponse.json();\n    return new Response(JSON.stringify({success: true, message: "Code sent", emailId: resendData.id}), {\n      status: 200,\n      headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}\n    });\n  } catch (error) {\n    return new Response(JSON.stringify({error: "Failed", details: error.message}), {\n      status: 500,\n      headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}\n    });\n  }\n});'

echo "Note: Supabase Management API for Edge Functions is not publicly available yet."
echo "Please deploy manually through the Supabase Dashboard."
echo ""
echo "Steps:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "2. Click 'Create a new function'"
echo "3. Name: send-verification-email"
echo "4. Paste the code from COPY_THIS_CODE.txt"
echo "5. Click Deploy"
