#!/bin/bash

# ============================================================
# Deploy Edge Function with SMTP Support
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║   🚀 Deploying Edge Function - SMTP Support           ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not installed${NC}"
    echo ""
    echo "📝 Install Supabase CLI first:"
    echo ""
    echo "  macOS/Linux:"
    echo "    brew install supabase/tap/supabase"
    echo ""
    echo "  Or download from:"
    echo "    https://github.com/supabase/cli#install-the-cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if linked to project
echo "🔗 Checking project link..."
if ! supabase projects list 2>/dev/null | grep -q "jtxmijnxrgcwjvtdlgxy"; then
    echo -e "${YELLOW}⚠️  Not linked to project. Linking...${NC}"
    supabase link --project-ref jtxmijnxrgcwjvtdlgxy
fi

echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Set SMTP secrets
echo "🔐 Setting up SMTP secrets..."
echo ""

supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=promohive@globalpromonetwork.store
supabase secrets set SMTP_PASS="PromoHive@2025!"
supabase secrets set SMTP_FROM=promohive@globalpromonetwork.store

echo ""
echo -e "${GREEN}✅ SMTP secrets configured${NC}"
echo ""

# Deploy function
echo "📤 Deploying send-notification-email function..."
echo ""

cd "$(dirname "$0")"
supabase functions deploy send-notification-email

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║   ✅ Deployment Successful!                           ║"
    echo "║                                                        ║"
    echo "║   Edge Function deployed with SMTP support            ║"
    echo "║   Email will be sent from:                            ║"
    echo "║   promohive@globalpromonetwork.store                  ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "🧪 Test the email:"
    echo "   node scripts/test-email.js your@email.com"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "📝 Try manual deployment:"
    echo "   1. Open: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions"
    echo "   2. Create/update send-notification-email"
    echo "   3. Copy code from: supabase/functions/send-notification-email/index.ts"
    echo ""
    exit 1
fi
