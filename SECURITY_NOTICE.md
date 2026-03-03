# ⚠️ SECURITY NOTICE - ACTION REQUIRED

## Exposed Credentials in Git History

### What Happened
Supabase credentials were hardcoded in the codebase and committed to git:
- File: `src/integrations/supabase/client.ts`  
- File: `.env.production`
- Commits: Multiple (throughout git history)

### What Was Exposed
```
VITE_SUPABASE_URL="https://baigglncdwirfwlxagcl.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_PROJECT_ID="baigglncdwirfwlxagcl"
```

### ✅ What Has Been Fixed
1. ✅ Removed hardcoded credentials from code
2. ✅ Moved to environment variables
3. ✅ Deleted `.env.production` from repository
4. ✅ Updated `.gitignore` to prevent future leaks
5. ✅ Created proper `.env.example` template

### ⚠️ CRITICAL ACTION REQUIRED

**YOU MUST ROTATE YOUR SUPABASE KEYS IMMEDIATELY**

Even though the files have been removed, they remain in git history. Anyone with access to the repository can see them.

### How to Rotate Keys

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `baigglncdwirfwlxagcl`

2. **Rotate the anon/public key**
   - Go to Settings → API
   - Click "Rotate anon key" or "Generate new key"
   - Copy the new key

3. **Update your environment variables**
   ```bash
   # In your .env.local file
   VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key-here"
   ```

4. **Update production environment**
   - In your hosting platform (Vercel, Netlify, etc.)
   - Update the `VITE_SUPABASE_PUBLISHABLE_KEY` secret
   - Redeploy the application

5. **Update CI/CD secrets**
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Update `VITE_SUPABASE_PUBLISHABLE_KEY`

### Why This Matters

The exposed key is the **anon/public key** which has limited permissions (defined by RLS policies). However:

- ❌ Anyone could make API calls to your database
- ❌ Could potentially abuse rate limits
- ❌ Could attempt to find security holes in RLS policies
- ❌ Could rack up costs on your Supabase account

### What's Safe vs What's Not

#### ✅ Still Safe (No need to change)
- Your Supabase **service role key** (not exposed)
- Your database password (not exposed)
- User passwords (hashed in database)

#### ⚠️ Needs Rotation
- The anon/public key (exposed in git history)

### Verification Checklist

After rotating keys:

- [ ] New key in `.env.local`
- [ ] New key in production environment
- [ ] New key in GitHub Secrets
- [ ] App builds successfully with new key
- [ ] App can connect to Supabase
- [ ] Old key no longer works (verify in Supabase dashboard)

### Best Practices Going Forward

1. **Never commit secrets** - Use environment variables always
2. **Use .gitignore** - Keep .env files out of git
3. **Rotate keys regularly** - Every 90 days minimum
4. **Monitor access logs** - Check Supabase dashboard for suspicious activity
5. **Use git-secrets** - Tool to prevent committing secrets

### Git History Cleaning (Optional)

If you want to remove the secrets from git history entirely:

⚠️ **WARNING: This rewrites git history and can cause issues for collaborators**

```bash
# Use BFG Repo-Cleaner to remove secrets from history
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

# Back up your repo first!
cp -r . ../theliloapp-backup

# Remove secrets from history
bfg --replace-text passwords.txt  # Create a file with secrets to remove
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (⚠️ be careful!)
git push --force
```

**Note:** Force pushing affects all collaborators. Coordinate with your team first.

### Questions?

If you have questions about this security notice:
- Check: [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- Review: [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Status:** ⚠️ ACTION REQUIRED  
**Priority:** CRITICAL  
**Date:** March 3, 2026
