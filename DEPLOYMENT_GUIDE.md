# PromoHive Deployment Guide

## 🚀 Production Deployment Instructions

### 1. Environment Variables Setup

Add these environment variables to your Netlify deployment:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://jtxmijnxrgcwjvtdlgxy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8

# AdSterra Configuration
VITE_ADSTERRA_PUBLISHER_ID=YOUR_ADSTERRA_PUBLISHER_ID
VITE_ADSTERRA_API_KEY=YOUR_ADSTERRA_API_KEY
VITE_ADSTERRA_PLACEMENT_ID=YOUR_ADSTERRA_PLACEMENT_ID
VITE_ADSTERRA_DIRECT_URL=YOUR_ADSTERRA_DIRECT_URL

# AdGem Configuration
VITE_ADGEM_APP_ID=31409
VITE_ADGEM_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMGZlODg1NDM5ODM1ODM4OThjM2RmNDVmOGFlNDYxN2QwYTJhNThjNjVjNWQ2ODUyMzg3Njc1Yzk0OGNiNGQyYmYzZDNkNzYxZmI1ZjZlYzEiLCJpYXQiOjE3NjIwMzIwMDcuMzA0MjY5LCJuYmYiOjE3NjIwMzIwMDcuMzA0MjcyLCJleHAiOjE3OTM1NjgwMDcuMzAwMDQ5LCJzdWIiOiIyOTE0OSIsInNjb3BlcyI6W119.Y7pFsSe4BVVtpBzaLG66N-S0dKKcGBqPWup70whf2aeLtt1Sa2C1m-OBsOU-w9YOQdo4fFE83PEpJMb1euy5E5Ut0nr1JXReW8ejVSSvCfW6Hp9VzRfoM8zvUcE0ns6GEKXWvQ6Kox8m5QXQff-92oHKeM_k-4U1emMDA9JHjSmwOC67bWUmKfTO6OQdo2M6FKM3YujbZNDoVpll5CanFIwR2u4BfZpPCB2nOgECvD7tDdnRFk_kdtPhcYCqB3xbLAcEBh3nqKiKMNq1pJA0KNopsHfiw6JXnq70glqi0wlaFDa0YjXNcGjrtjSaGxlHqgLOzHSoGhcpBe2h-r2tNKPHBjd0Xp_fD88oNy1BJxO_GP7Gw3pHEZ4-l9fbByPrIBL9dkSy9UNiB45VXeIZZ_H9dlEkMxTNtChtVRJq3k3W15WRBQpqUwEF3Qy1wCCNY-Vq4Wu3OEum-E3WiTrHeP_1Dtog1CQySFoxm_XywiQ62HPgOSeFWTykxKfkeIifwpAxtTU0IfOv4pJ8Y7qpoHOdSTUprj2_4qEHSqFGTBi0boF4Q0RluJEVFBN-QuE2FwKY3bjGkMiI1_LT8UxObbXd9RAfJnvNWhTboC6yd0nHbWK0d3qlvmtmKdcBnonYI8QEDPXKa54ULJksXTbMt6BxKqekV96cq05Oe1sibU4
VITE_ADGEM_POSTBACK_KEY=bb6h7hh67id3809bi7blmekd

# Optional: Additional API Keys
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret-here
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=465
VITE_SMTP_USER=your-smtp-user-here
VITE_SMTP_PASS=your-smtp-password-here
VITE_SMTP_FROM=your-smtp-from-here
```

### 2. Database Migration

Run the following SQL migrations in your Supabase dashboard:

1. **Ad Revenues Table**: `supabase/migrations/20241101_create_ad_revenues_table.sql`
2. **Wallet Functions**: `supabase/migrations/20241102_create_wallet_functions.sql`

### 3. AdGem Integration Setup

#### Postback Configuration:
- **Postback URL**: `https://globalpromonetwork.online/bb6h7hh67id3809bi7blmekd`
- **Property ID**: 31409
- **Integration Type**: Server Postback

#### Available Macros:
The postback endpoint supports all AdGem macros including:
- `{player_id}` - User ID
- `{offer_id}` - Offer identifier
- `{offer_name}` - Offer name
- `{amount}` - Payout amount
- `{transaction_id}` - Transaction ID
- `{country}` - User country
- And many more...

### 4. AdSterra Integration Setup

#### Configuration:
- **Publisher ID**: YOUR_ADSTERRA_PUBLISHER_ID
- **API Key**: YOUR_ADSTERRA_API_KEY
- **Placement ID**: YOUR_ADSTERRA_PLACEMENT_ID
- **Direct URL**: YOUR_ADSTERRA_DIRECT_URL

### 5. Revenue Sharing System

The system automatically calculates user earnings based on their level:

- **Level 0**: 10% of ad revenue
- **Level 1**: 35% of ad revenue
- **Level 2**: 55% of ad revenue
- **Level 3**: 78% of ad revenue

### 6. Netlify Deployment

#### Build Settings:
- **Build Command**: `pnpm build`
- **Publish Directory**: `build`
- **Functions Directory**: `netlify/functions`

#### Domain Configuration:
- **Primary Domain**: globalpromonetwork.online
- **SSL**: Enabled automatically

### 7. Testing the Integration

#### AdGem Postback Test:
```bash
curl -X POST "https://globalpromonetwork.online/bb6h7hh67id3809bi7blmekd" \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": "user-uuid-here",
    "offer_id": "12345",
    "offer_name": "Test Offer",
    "amount": "1.00",
    "transaction_id": "test-123"
  }'
```

#### Expected Response:
```json
{
  "success": true,
  "message": "Conversion processed successfully",
  "user_id": "user-uuid",
  "username": "testuser",
  "earnings": 0.10,
  "transaction_id": "test-123",
  "timestamp": "2024-11-02T00:00:00.000Z"
}
```

### 8. Monitoring and Logs

#### Netlify Functions Logs:
- Go to Netlify Dashboard > Functions > adgem-postback
- Monitor real-time logs for postback processing

#### Supabase Logs:
- Monitor database operations in Supabase Dashboard
- Check `ad_revenues` table for new entries
- Verify wallet updates in `wallets` table

### 9. Security Features

- ✅ Postback key verification
- ✅ User validation
- ✅ SQL injection protection (Supabase RLS)
- ✅ CORS headers configured
- ✅ Environment variable isolation
- ✅ Error handling and logging

### 10. Performance Optimization

- ✅ Async ad loading
- ✅ Lazy loading with Intersection Observer
- ✅ CDN optimization via Netlify
- ✅ Database indexing for fast queries
- ✅ Caching headers for static assets

## 🔧 Troubleshooting

### Common Issues:

1. **Postback not working**:
   - Check environment variables are set correctly
   - Verify Supabase connection
   - Check Netlify function logs

2. **Ads not loading**:
   - Verify AdSterra/AdGem credentials
   - Check browser console for errors
   - Ensure scripts are loading correctly

3. **Database errors**:
   - Run migrations in correct order
   - Check RLS policies are enabled
   - Verify user permissions

### Support:
For technical support, check the application logs and database entries. All operations are logged for debugging purposes.

## 📱 Mobile Optimization

The application is fully responsive and optimized for:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile browsers
- ✅ Touch interactions
- ✅ Responsive ad placements

## 🎯 Success Metrics

Monitor these KPIs:
- User registration rate
- Ad engagement rate
- Revenue per user
- Conversion tracking
- Wallet balance accuracy
