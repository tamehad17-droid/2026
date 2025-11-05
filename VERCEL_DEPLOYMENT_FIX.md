# Vercel Deployment Fix Checklist

## 1. Required Environment Variables

Add these variables in your Vercel project settings (Settings > Environment Variables):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://jtxmijnxrgcwjvtdlgxy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8

# AdGem Configuration
VITE_ADGEM_APP_ID=31409
VITE_ADGEM_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMGZlODg1NDM5ODM1ODM4OThjM2RmNDVmOGFlNDYxN2QwYTJhNThjNjVjNWQ2ODUyMzg3Njc1Yzk0OGNiNGQyYmYzZDNkNzYxZmI1ZjZlYzEiLCJpYXQiOjE3NjIwMzIwMDcuMzA0MjY5LCJuYmYiOjE3NjIwMzIwMDcuMzA0MjcyLCJleHAiOjE3OTM1NjgwMDcuMzAwMDQ5LCJzdWIiOiIyOTE0OSIsInNjb3BlcyI6W119.Y7pFsSe4BVVtpBzaLG66N-S0dKKcGBqPWup70whf2aeLtt1Sa2C1m-OBsOU-w9YOQdo4fFE83PEpJMb1euy5E5Ut0nr1JXReW8ejVSSvCfW6Hp9VzRfoM8zvUcE0ns6GEKXWvQ6Kox8m5QXQff-92oHKeM_k-4U1emMDA9JHjSmwOC67bWUmKfTO6OQdo2M6FKM3YujbZNDoVpll5CanFIwR2u4BfZpPCB2nOgECvD7tDdnRFk_kdtPhcYCqB3xbLAcEBh3nqKiKMNq1pJA0KNopsHfiw6JXnq70glqi0wlaFDa0YjXNcGjrtjSaGxlHqgLOzHSoGhcpBe2h-r2tNKPHBjd0Xp_fD88oNy1BJxO_GP7Gw3pHEZ4-l9fbByPrIBL9dkSy9UNiB45VXeIZZ_H9dlEkMxTNtChtVRJq3k3W15WRBQpqUwEF3Qy1wCCNY-Vq4Wu3OEum-E3WiTrHeP_1Dtog1CQySFoxm_XywiQ62HPgOSeFWTykxKfkeIifwpAxtTU0IfOv4pJ8Y7qpoHOdSTUprj2_4qEHSqFGTBi0boF4Q0RluJEVFBN-QuE2FwKY3bjGkMiI1_LT8UxObbXd9RAfJnvNWhTboC6yd0nHbWK0d3qlvmtmKdcBnonYI8QEDPXKa54ULJksXTbMt6BxKqekV96cq05Oe1sibU4
VITE_ADGEM_POSTBACK_KEY=bb6h7hh67id3809bi7blmekd

# Adsterra Configuration
VITE_ADSTERRA_PUBLISHER_ID=tW5T34Uzh3UEw
VITE_ADSTERRA_API_KEY=589dcbfb591de266fb90284eccb0725d
VITE_ADSTERRA_PLACEMENT_ID=27869281
VITE_ADSTERRA_DIRECT_URL=https://www.effectivegatecpm.com/ybajxvj6e9?key=105f8b3462908e23fb163a15bb1c7aa4

# SMTP Configuration
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=admin@globalpromonetwork.online
VITE_SMTP_PASS=Ibrahem$811997
VITE_SMTP_FROM=admin@globalpromonetwork.online

# Domain Configuration
VITE_DOMAIN=globalpromonetwork.online
```

## 2. Fix Steps

1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable above one by one
5. Once all variables are added, go to Deployments
6. Select the latest deployment
7. Click "Redeploy" to apply the new environment variables

## 3. Verify Supabase Connection

1. Open Supabase Dashboard
2. Go to Project Settings > API
3. Make sure the project URL matches VITE_SUPABASE_URL
4. Verify that anon/public key matches VITE_SUPABASE_ANON_KEY
5. Check that RLS policies are correctly configured:
   ```sql
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
   ```

## 4. Common Issues & Fixes

### 401 Unauthorized Errors
- Verify Supabase keys are correct
- Check CORS settings in Supabase
- Ensure auth cookies are being set correctly
- Verify the domain is whitelisted in Supabase

### Manifest.json 404/401 Errors
- Create/verify public/manifest.json exists
- Ensure build includes manifest.json
- Add proper CORS headers in vercel.json

### Auth Redirect Issues
- Set proper redirect URLs in Supabase auth settings
- Add your domain to allowed redirect URLs
- Check browser console for CORS errors

## 5. After Deployment

1. Test login/signup flow
2. Verify AdGem integration
3. Check Adsterra ads display
4. Confirm email sending works
5. Test offer completion flow

Note: Remember to clear browser cache and cookies after deploying changes.