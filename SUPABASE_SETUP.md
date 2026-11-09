# Connect this Vite app to Supabase

## Local development

Create `.env.local` in the repository root (do not commit it):

```dotenv
VITE_SUPABASE_URL=https://fbhhamxwtvvfohgitkjj.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

The `sb_publishable_...` key is intended for browser clients. Never use a Supabase `sb_secret_...` or `service_role` key in this frontend. Row Level Security must be enabled and correctly configured for every exposed table.

Restart the Vite dev server after changing environment variables. For deployment, configure the same two variables in the hosting provider's environment settings and rebuild the app.

## Supabase project setup

1. In Supabase Authentication settings, enable the desired sign-in method (email/password for the current UI).
2. Add the local and production app URLs to the allowed redirect URLs; set the production Site URL.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
4. Then run [`supabase/migrations/202611090001_profile_on_signup.sql`](./supabase/migrations/202611090001_profile_on_signup.sql), which creates each user's own profile when they register.
5. Test signup, email confirmation, sign-in, password reset and sign-out. Verify that two users cannot read or modify each other's rows.

Legacy progress import is intentionally opt-in. Call `migrateLegacyProgressAfterConsent()` only after telling the signed-in person that browser-local progress will be imported into their account; it will not overwrite progress already on the account.

The app only has a working Supabase connection when both Vite variables are present. No credentials should be committed to this repository.
