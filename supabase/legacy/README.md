# Legacy SQL (superseded — do not run)

These are the original migration files, kept for reference only.
**Use `../schema.sql` instead.** It is the single, verified, re-runnable schema.

Why these were replaced:

| File | Problem |
|---|---|
| `001_initial_schema.sql` | Runs, but `songs` RLS included a public `FOR UPDATE USING (true)` policy that let any visitor rewrite any song row. `contact_submissions` had RLS on with no SELECT policy, so the admin inbox was always empty. |
| `002_blog_schema.sql` | **Fails immediately.** `blog_posts` declares a foreign key to `blog_categories` before that table is created. |
| `003_…` / `004_…` | Admin policies read `auth.users` from inside a policy expression; the `authenticated` role has no SELECT on that table, so these raise "permission denied for table users". |
| `005_rename_to_bookstore.sql` | Fine, but folded into the seed data of `schema.sql`. |
| `COMPLETE_SCHEMA.sql` | **Fails at Part 11.** Uses `CREATE POLICY IF NOT EXISTS`, which PostgreSQL does not support. Tables were created and then every policy failed, leaving RLS enabled with zero policies — the public site would read as completely empty. It also described different columns than the app queries (e.g. `songs.category` vs `songs.category_id`, `sermons.speaker_name` vs `sermons.speaker`, `events.event_date` vs `events.start_at`). |
