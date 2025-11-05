#!/bin/bash

# PromoHive Quick Setup Script
# This script guides you through setting up the complete system

echo "╔════════════════════════════════════════════════╗"
echo "║   🚀 PromoHive Complete Setup                  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Setup Checklist:${NC}"
echo "   1. Apply database migrations"
echo "   2. Configure SMTP secrets"
echo "   3. Deploy Edge Functions"
echo "   4. Test the system"
echo ""

# Step 1: Database Migrations
echo "═══════════════════════════════════════════════════"
echo -e "${YELLOW}Step 1: Database Migrations${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Open your browser and navigate to:"
echo -e "${GREEN}https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql${NC}"
echo ""
echo "Then execute these two migration files:"
echo ""
echo "1️⃣  supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql"
echo "   - Fixes email confirmation"
echo "   - Creates wallet system"
echo "   - Updates approve_user function"
echo ""
echo "2️⃣  supabase/migrations/20241031_complete_admin_system.sql"
echo "   - Creates admin_settings table"
echo "   - Creates spin_prizes table"
echo "   - Creates referrals system"
echo "   - Creates level_upgrades table"
echo "   - All functions and triggers"
echo ""
read -p "Press ENTER when migrations are applied..."
echo -e "${GREEN}✅ Step 1 Complete!${NC}"
echo ""

# Step 2: SMTP Secrets
echo "═══════════════════════════════════════════════════"
echo -e "${YELLOW}Step 2: Configure SMTP Secrets${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Run these commands in your terminal:"
echo ""
echo -e "${GREEN}supabase secrets set SMTP_HOST=smtp.hostinger.com${NC}"
echo -e "${GREEN}supabase secrets set SMTP_PORT=465${NC}"
echo -e "${GREEN}supabase secrets set SMTP_USER=promohive@globalpromonetwork.store${NC}"
echo -e "${GREEN}supabase secrets set SMTP_PASS='PromoHive@2025!'${NC}"
echo -e "${GREEN}supabase secrets set SMTP_FROM=promohive@globalpromonetwork.store${NC}"
echo ""
read -p "Press ENTER when secrets are configured..."
echo -e "${GREEN}✅ Step 2 Complete!${NC}"
echo ""

# Step 3: Deploy Edge Functions
echo "═══════════════════════════════════════════════════"
echo -e "${YELLOW}Step 3: Deploy Edge Functions${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Run this command:"
echo ""
echo -e "${GREEN}supabase functions deploy send-notification-email${NC}"
echo ""
read -p "Press ENTER when function is deployed..."
echo -e "${GREEN}✅ Step 3 Complete!${NC}"
echo ""

# Step 4: Verification
echo "═══════════════════════════════════════════════════"
echo -e "${YELLOW}Step 4: Test the System${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Test checklist:"
echo "  □ Register a new test user"
echo "  □ Login as admin"
echo "  □ Approve the test user"
echo "  □ Check email inbox for welcome email"
echo "  □ Login as test user"
echo "  □ Try daily spin wheel"
echo "  □ Check admin settings page"
echo "  □ View AdGem tasks tab"
echo ""

# Final Summary
echo "╔════════════════════════════════════════════════╗"
echo "║   ✨ Setup Complete!                           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Your PromoHive system is ready!${NC}"
echo ""
echo "📚 Documentation:"
echo "   - FINAL_DEPLOYMENT_INSTRUCTIONS.md"
echo "   - IMPLEMENTATION_GUIDE_COMPLETE_SYSTEM.md"
echo ""
echo "🌐 Access Points:"
echo "   - Frontend: https://your-app.netlify.app"
echo "   - Admin: /admin-dashboard"
echo "   - Settings: /admin-settings"
echo ""
echo -e "${GREEN}Happy earning! 🚀${NC}"
echo ""
