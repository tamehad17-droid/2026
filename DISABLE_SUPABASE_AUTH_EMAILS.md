# 🔧 Disable Supabase Auth Email Confirmations

## Problem:
Emails are being sent from `Supabase Auth <noreply@mail.app.supabase.io>` instead of custom SMTP

## Solution:

### Step 1: Disable Email Confirmations in Supabase

1. **Go to Supabase Auth Settings:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/auth/url-configuration
   ```

2. **Scroll to "Email Auth"** section

3. **DISABLE the following settings:**
   - ❌ **Enable email confirmations** → Turn OFF
   - ❌ **Enable email change confirmations** → Turn OFF (optional)
   - ❌ **Enable signup** → Keep ON (but confirmations OFF)

4. **Save changes**

---

### Step 2: Update Auth Template (Optional)

If you want to completely disable Supabase sending ANY emails:

1. **Go to Email Templates:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/auth/templates
   ```

2. **For each template (Confirm signup, etc.):**
   - Clear the template content
   - Or disable the template

---

### Step 3: Configure Custom SMTP in Supabase (Best Practice)

Even better - configure Supabase to use YOUR SMTP:

1. **Go to:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/auth
   ```

2. **Scroll to "SMTP Settings"**

3. **Enable Custom SMTP** and enter:
   ```
   SMTP Host: smtp.hostinger.com
   SMTP Port: 465
   SMTP User: promohive@globalpromonetwork.store
   SMTP Pass: PromoHive@2025!
   SMTP Sender Name: PromoHive
   SMTP Sender Email: promohive@globalpromonetwork.store
   ```

4. **This way ALL emails (including auth) will come from your email!**

---

## Alternative: Auto-Confirm All Users

If you want users to be auto-confirmed without email verification:

### Add to your database migration:

```sql
-- Create a trigger to auto-confirm users
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto-confirm email
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();
```

---

## Testing:

### After disabling confirmations:

1. Register a new user
2. Check inbox - should NOT receive Supabase confirmation email
3. User should be able to login immediately
4. When admin approves → Welcome email sent from YOUR SMTP

---

## Summary of Email Flow:

### BEFORE (Current):
```
Register → Supabase sends confirmation email (noreply@mail.app.supabase.io)
         → User confirms
         → Admin approves
         → Welcome email from custom SMTP (if configured)
```

### AFTER (Fixed):
```
Register → NO email from Supabase
         → User waits for admin
         → Admin approves
         → Welcome email from promohive@globalpromonetwork.store ✅
```

---

## Status:

- ✅ Code updated (emailRedirectTo added)
- ⚠️ Supabase settings need manual configuration
- ⚠️ SMTP secrets need to be added
- ⚠️ Edge function needs deployment

**Estimated Time:** 5-10 minutes manual configuration

---

**Last Updated:** 2025-10-30
