# Supabase setup for member authentication

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor. The script creates the profile, progress, learning-history, inventory, and wallet tables with row-level security policies.
2. In Supabase Authentication settings, enable email/password sign-up, set the site URL, and allow the local/deployed redirect URLs. Keep email confirmation enabled for production. The user must verify email before password sign-in if confirmation is required by the project settings.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` plus the browser-safe anon/publishable key. Never use a service-role key in Vite/browser variables.
4. Install dependencies with `npm install` and run `npm run dev`.

## What this change currently persists
The existing app's `eem-completed` and `eem-progress` localStorage values are restored per Supabase user and synchronized to `student_progress`. If legacy values exist and that user has no cloud progress row, the UI asks before importing; the original local values are retained as a backup and also recorded in `legacy_snapshot`.

The existing app currently does not expose a complete account/PIN/character/item or exam-answer persistence API. The schema provides owner-isolated tables for those future integrations, but those features are not claimed as migrated or tested. Coin updates intentionally have no browser write policy; award/spend operations need a trusted server-side function.

## Security and verification
RLS policies use `auth.uid()` for every user-owned row. Do not treat client-side route gating as the security boundary; database RLS is. Before production, test sign-up/email confirmation, duplicate email handling, sign-in/out, password reset and update, refresh/session persistence, migration consent, cloud progress restore, and cross-user isolation in two separate accounts. Run the Vite production build and test in a configured Supabase project before calling this production-ready.
