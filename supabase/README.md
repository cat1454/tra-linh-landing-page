# Supabase setup

1. Create a Supabase project and apply the timestamped migrations in order with
   `supabase db push` (or through the SQL editor for a first local prototype).
2. Add the first allowlisted address with the commented bootstrap statement at
   the bottom of the seed migration. Use a lowercase email address.
3. Configure the values documented in `.env.example` locally and in Vercel.
   `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SALT` are server-only secrets.
4. Add `http://localhost:3000/admin/auth/callback` and the production equivalent
   to Supabase Auth redirect URLs.

The migrations are forward-only once shared. For rollback or repair, create a
new timestamped migration; never edit a migration that has already run. The
public site does not require Supabase and falls back to curated local content.
The `media` bucket is private: public visitors can request short-lived signed
URLs only for assets whose `media_assets` record is already `published`.
