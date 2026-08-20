# What was broken, and what I changed

Every item below was verified against a real toolchain: `npm install`, `tsc --noEmit`,
`next lint`, a full `next build`, a running production server, and — for the SQL — an
actual PostgreSQL 16 instance.

---

## 1. The project could not install, build, or run

These were absolute blockers. Nothing else could be tested until they were fixed.

| # | Problem | Fix |
|---|---|---|
| 1 | **`package.json` listed `@radix-ui/react-badge`, which does not exist on npm.** `npm install` failed outright with a 404. | Removed. |
| 2 | **`next.config.ts` is not supported by Next.js 14.** Every `next build` and `next dev` died with *"Configuring Next.js via 'next.config.ts' is not supported"*. TypeScript config only arrived in Next 15. | Converted to `next.config.mjs`. |
| 3 | **No root `src/app/layout.tsx`.** The App Router cannot build without one, and nothing imported `globals.css`, so Tailwind never reached the page. | Added, with `<html>`/`<body>` and the global stylesheet. |
| 4 | **No `postcss.config.js`.** Tailwind and autoprefixer never ran, so every utility class was inert. | Added. |
| 5 | `tailwind.config.ts` required `tailwindcss-animate`, which was not a dependency. | Added it (plus `@tailwindcss/typography`, needed by the `prose` classes used on blog and product pages). |
| 6 | 16 files referenced in the upload never arrived, and several more were never in it. Missing modules included `@/content/en/pages` (imported by 18 files), all four admin form components, and both bookstore components. | Reconstructed — see §5. |

---

## 2. Security

| # | Problem | Fix |
|---|---|---|
| 7 | **Next.js 14.2.5 has a published middleware-authorisation-bypass advisory.** This app gates the entire admin panel in middleware, so it was directly in the blast radius. | Upgraded to **14.2.35**, the latest patched 14.2.x. No breaking changes. |
| 8 | **Any signed-in Supabase user could open `/admin`.** The middleware only checked *that* you were logged in, never *who* you were. Anyone who could create an account had the admin panel. | Middleware now also requires the email to match `NEXT_PUBLIC_ADMIN_EMAIL`. |
| 9 | **Anyone could rewrite any song.** `001_initial_schema.sql` shipped `CREATE POLICY "Public increment song views" ON songs FOR UPDATE USING (true) WITH CHECK (true)` so the page could bump `view_count` — but that grants UPDATE on *every column of every row*. A visitor could retitle or unpublish the whole song library. | Policy removed. View counting now goes through a `SECURITY DEFINER` function that can only touch `view_count`. **Verified:** as `anon`, `UPDATE songs SET title_en='HACKED'` now affects 0 rows. |
| 10 | **Open redirect on login.** `/admin/login?redirect=https://evil.example` would bounce an admin off-site after authenticating. | Only relative paths are accepted. |
| 11 | Contact form data was interpolated straight into notification HTML. | HTML-escaped. |

---

## 3. The database schema

The SQL was the worst-affected area. I ran every file against PostgreSQL 16 to confirm.

| # | Problem | Fix |
|---|---|---|
| 12 | **`COMPLETE_SCHEMA.sql` could not run.** It used `CREATE POLICY IF NOT EXISTS` (~40 times), which **PostgreSQL does not support**. It failed at Part 11 — *after* creating all the tables and enabling RLS, but *before* creating a single policy. The result is the nastiest possible outcome: RLS on with zero policies means **every public query returns nothing**, so the site would have looked completely empty with no error anywhere. | Rewritten as `supabase/schema.sql` using `DROP POLICY IF EXISTS` + `CREATE POLICY`. |
| 13 | **`002_blog_schema.sql` failed on line 19.** `blog_posts` declared a foreign key to `blog_categories` before that table was created. | Table order corrected. |
| 14 | **Two schemas described two different databases, and neither matched the app.** `COMPLETE_SCHEMA.sql` had `songs.category`/`artist_en`/`youtube_url`, `sermons.speaker_name`, `events.event_date`, `blog_posts.category`, a `video_progress` with no `lang` or `course_id`, and a `contact_submissions` with no `read` column. The application queries `songs.category_id`/`artist`/`youtube_url_en`, `sermons.speaker`, `events.start_at`, `blog_posts.category_id`, `video_progress.lang`, `contact_submissions.read` — i.e. the *other* lineage. Whichever file you ran, roughly half the site broke. | One authoritative `schema.sql` matching what the code actually queries. Old files moved to `supabase/legacy/` with a README explaining each. |
| 15 | **Admin policies read `auth.users` from inside the policy.** The `authenticated` role has no SELECT privilege there, so these raise *"permission denied for table users"*. | Replaced with a `public.is_admin()` helper reading the JWT email claim. Made `SECURITY DEFINER` — as a plain SQL function it gets inlined and then requires the *caller* to have access to the `auth` schema, which reintroduced the same class of failure. (I caught this because the anon-role test failed.) |
| 16 | `contact_submissions` had RLS enabled with an INSERT policy and no SELECT policy, so the admin inbox was permanently empty. | Admin SELECT policy added. |
| 17 | Re-running the seed data duplicated all 10 sermons every time (`ON CONFLICT DO NOTHING` does nothing without a constraint to conflict on). | Added a partial unique index on `youtube_url`. **Verified:** after 3 consecutive runs, still exactly 10 sermons. |

**Verified end-to-end** against live PostgreSQL — the resulting access matrix:

| Actor | Songs visible | Contact messages | Can edit content |
|---|---|---|---|
| Anonymous visitor | published only | none | no |
| Signed-in non-admin | published only | none | no |
| Admin | all, incl. drafts | all | yes |

---

## 4. Application bugs

| # | Problem | Fix |
|---|---|---|
| 18 | **`es.blog`, `es.bookstore`, `es.live` and `es.staff` did not exist.** That copy lived in separate modules that were never attached to the `es` object, so `lang === 'es' ? es.blog : en.blog` evaluated to `undefined` and the next line, `t.meta_title`, threw. **Every Spanish blog, bookstore, live and staff page crashed** — on a site whose primary congregation is Spanish-speaking. | Both language objects now fold in their section files. **Verified:** all four Spanish pages render their real copy. |
| 19 | **`@/types` did not export `BlogPost`, `BlogCategory`, `GalleryPhoto`, `LiveStream`, `StaffMember`, `MerchProduct` or `CartItem`**, though 12 files imported them from there. `MerchProduct` and `CartItem` did not exist at all. | Added `types/merch.ts` and made `types/index.ts` a barrel. |
| 20 | **`<Presentation />` was used in the song page but never imported** — a hard build error. | Imported. |
| 21 | **Server components passed event handlers to the client**, which fails the build: an `onClick` on the product gallery thumbnails and an `onError` on the About page photos. | Gallery extracted into a real client component with working thumbnail switching; the dead `onError` removed. |
| 22 | **`BlogComments` called `useState(fn, [postId])`.** `useState` takes no dependency array — the fetch ran *during render*, ignored its dependencies, never re-ran, and double-fired in StrictMode. | Rewritten as `useEffect` with cleanup. |
| 23 | **The cart could never load.** The cart page read `localStorage.getItem('sessionId')` while the rest of the app wrote `monte_session_id`. | One shared `getSessionId()` helper in `src/lib/session.ts`. |
| 24 | Cart page read `localStorage` during render → server/client hydration mismatch. | Moved into an effect. |
| 25 | Decrementing a cart item to zero deleted the database row but left it on screen with quantity 0. | Removes the line properly. |
| 26 | **The staff publish toggle silently did nothing.** `TogglePublishButton` always wrote `is_published`, but `staff_directory` uses `is_public`. The UI flipped, the database did not. | Added a `column` prop; also surfaces write errors instead of swallowing them. |
| 27 | **Both analytics view-count totals were always 0.** They used `.select('view_count', { head: true })`, and `head: true` returns no rows — then summed the empty result. | Removed `head: true`. |
| 28 | **The contact form threw on a missing Resend key.** `new Resend(undefined)` throws at module load, taking down the route — so a mail misconfiguration lost the message entirely. | Saving to the database and sending mail are now separate: the submission is persisted first, and email failure is logged, not fatal. |
| 29 | `reply_to` was written as `replyTo` — wrong for the installed Resend v3. | Corrected (confirmed against the actual type definitions). |
| 30 | **View counters were racy and silently failing.** Both blog and song pages did read-modify-write with an un-awaited `.then(() => {})`, losing concurrent views — and RLS blocked the write anyway. | Atomic `increment_song_view()` / `increment_blog_view()` RPCs. |
| 31 | Related-posts query ran `.eq('category_id', null)` for uncategorised posts. | Skipped when there is no category. |
| 32 | `react-pdf` imports browser-only globals at module scope and would break server rendering. | Loaded through a client wrapper with `ssr: false`. |
| 33 | `price_usd.toFixed()` assumed a JS number; PostgREST can return `NUMERIC` as a string. | Coerced with `Number()`. |
| 34 | `next/image` `remotePatterns` used `scontent.**.fbcdn.net`; `**` is only valid at the *start* of a hostname. | Corrected to `**.fbcdn.net`. |
| 35 | `min-w-[touch]` was not a valid class (the token is `min-w-touch`), so the language switcher had no minimum tap target. | Fixed. |
| 36 | Mobile nav links had both `block` and `flex`. | Resolved to `flex`. |
| 37 | **The login page rendered inside the authenticated admin sidebar.** | Moved the dashboard into an `(dashboard)` route group; URLs unchanged. |
| 38 | `useSearchParams()` without a Suspense boundary — a build failure once the page prerendered. | Split into a `LoginForm` inside `<Suspense>`. |

---

## 5. Rebuilt from scratch

Missing from the upload, or never present, and reconstructed to match how the existing code calls them:

- **Content:** `en/pages.ts`, `en/blog.ts`, `en/bookstore.ts`, `en/additional-pages.ts` (full English copy mirroring the Spanish key-for-key), plus `content/ministries.ts`.
- **Admin components:** `DeleteSongButton`, `SongForm` (with Supabase Storage upload), `CategoryManager` (inline rename + reorder), `BlogForm`, `LoginForm`, `MarkReadButton`, `AlbumPhotoManager`.
- **Store components:** `MerchGrid`, `AddToCartForm`, `ProductGallery`.
- **Public pages:** `contact`, `events`, `ministries`, `community`, `gallery`, `gallery/[slug]`.
- **Admin pages:** blog list, bookstore (list/new/edit), messages, and full CRUD for courses (incl. per-course lessons), sermons, events, staff, gallery albums + photos, live streams.
- **Config:** root layout, `postcss.config.js`, `.eslintrc.json`, `.gitignore`, `.env.example`.
- **Images:** placeholders for every path the code references, so nothing 404s. `public/images/README.md` lists what to replace.

---

## 6. Efficiency and cleanup

- **Removed 12 unused dependencies** — all 10 Radix packages plus `react-youtube`, `react-calendar`, `next-themes`, `sonner`, `date-fns`, `clsx`, `tailwind-merge`, `class-variance-authority`. Nothing imported any of them (the README claimed shadcn/ui, but the UI is hand-rolled Tailwind classes in `globals.css`). That is ~100 fewer packages to install and audit.
- **Added a schema-driven `ResourceForm`.** The 14 new admin create/edit screens share one form component driven by a field descriptor, instead of ~200 lines of duplicated markup each.
- **Sidebar nav corrected.** It previously linked to four routes that did not exist while omitting eight that did; now grouped, and every entry resolves.
- **Indexes** added for the query patterns the app actually uses (published + date ordering, slug lookups, cart by session, progress by session/video/lang).
- A `UNIQUE (session_id, product_id)` constraint on cart lines lets "add to cart" top up an existing line rather than creating duplicate rows.

---

## 7. Known limitations (deliberate, not bugs)

- **Checkout is not wired to a payment provider.** The cart previously showed a Checkout button that did nothing at all. It is now visibly disabled with a note directing customers to contact the church, so no one thinks they have placed an order. `merch_orders` / `stripe_payment_intent_id` exist for whenever you add Stripe.
- **Sales tax is a flat 9.75%** and shipping a flat $5.99, both hardcoded in the cart. Fine as placeholders; real rates need a tax service.
- **Blog content is rendered as raw HTML** (`dangerouslySetInnerHTML`). Acceptable while only the admin can post, but do not open authoring up without sanitising.
- **Images are placeholders.** Replace them in `public/images/`.
- **`analytics_events` / `analytics_daily` are never written to.** The Advanced Analytics page will read zeros until something populates them.

---

# Addendum — Stripe checkout (added after the initial repair)

Fulfilment model: **pickup at church only**, flat configurable sales tax.

## What was added

| Area | Detail |
|---|---|
| `POST /api/checkout` | Builds a Stripe Checkout Session. Loads the cart **server-side** and recomputes every price from the database — the browser sends only a cart session id, never an amount. Validates stock before taking money, and writes a `pending` order first so a delayed webhook can never lose a payment. |
| `POST /api/stripe/webhook` | Verifies the Stripe signature against the **raw** request body, then marks the order paid, decrements stock atomically, clears the cart and emails both parties. |
| Success page | `/[lang]/bookstore/success` confirms the order and gives pickup instructions, in both languages. |
| `/admin/orders` | Order list with customer contact details, payment status, a "Collected" action and a deep link to the payment in Stripe. |
| `supabase/migrations/006_stripe_checkout.sql` | Schema changes, re-runnable. Also folded into `schema.sql` for fresh installs. |

## Correctness and security decisions

- **Prices are never trusted from the client.** The request carries a cart id only.
- **Exactly-once fulfilment.** Stripe retries for up to three days and can deliver an
  event twice. The handler claims `event.id` in a `processed_stripe_events` table
  first — the primary key does the locking — and the paid-status update is additionally
  guarded by `.eq('payment_status','pending')`. A duplicate delivery cannot double-decrement stock.
- **Failures release the claim** so Stripe's retry can genuinely retry.
- **Atomic stock decrement** via a `SECURITY DEFINER` function with `GREATEST(0, …)`, so
  concurrent purchases cannot oversell or drive stock negative. It is *not* granted to
  `anon`/`authenticated` — only the webhook's service-role key may change stock.
- **Orders are invisible to the anon key.** The original schema had
  `read_own_merch_orders ... USING (true)`, which exposed every customer's name, email and
  phone to anyone with the public key. Dropped. The public INSERT policy on orders was
  dropped too — orders are now written server-side, so a public policy only enabled forgery.
- **Cart and Stripe totals cannot drift.** Both read `SALES_TAX_RATE` from `src/lib/commerce.ts`.
- Node runtime pinned on both routes (the Stripe SDK cannot run on the edge), and the
  Stripe API version is pinned so a Stripe-side upgrade can't silently change payloads.

## How it was verified

- **Signature handling, 5/5 unit tests** against the real Stripe SDK: valid accepted;
  wrong secret rejected; **tampered body rejected**; stale timestamp (replay) rejected;
  missing header rejected.
- **Live HTTP**, Stripe configured: unsigned → `400 Missing signature`,
  forged → `400 Invalid signature`. A forged webhook cannot mark an order paid.
- **Live HTTP**, Stripe absent: checkout and webhook return a clean `503`, never a crash.
- **PostgreSQL 16**, both paths — fresh `schema.sql` and an existing database upgraded via
  `006` — converge to the same shape, and both files are re-runnable.
- **Database-enforced security, both paths:** pickup order inserts without an address;
  anon reads 0 orders and 0 order items; anon INSERT is refused by RLS; anon cannot call
  the stock function; stock floors at 0; a duplicate `event.id` is rejected by the primary key.
- Full `tsc`, `next lint` and production build clean — 69 routes.

## Still open

- **Refunds are Stripe-side only.** Refunding does not restore stock; adjust it in
  `/admin/bookstore`.
- **Tax is a line item, not a Stripe tax object**, so Stripe reports it as revenue.
  Fine at this scale; switch to Stripe Tax if the church starts filing on these sales.
- **No order-history page for customers.** They get an email and an order number.

---

# Addendum 2 — two bugs found by screenshotting every page

Rendering all 56 pages from the production build surfaced two defects that
`tsc`, `next lint` and `next build` all pass cleanly:

| # | Problem | Fix |
|---|---|---|
| 39 | **The lesson player page returned HTTP 500 in production.** `/[lang]/new-believers/[courseId]/[videoId]` passed the whole `newBelievers` copy object to `VideoPlayerClient`, a client component. That object contains two functions (`videos_count`, `progress_label`), and React cannot serialise functions across the server/client boundary — so the page threw *"Functions cannot be passed directly to Client Components"* on every request. It builds fine because the failure only happens when the page actually renders. | Pass only the two strings the component declares: `t={{ mark_watched, watched_badge }}`. Audited every other server→client `t={t}` handoff — `newBelievers` and `footer` are the only namespaces containing functions, and `footer` is used solely by a server component, so this was the single instance. |
| 40 | **Footer phone and email were nearly invisible.** Those two links had no explicit colour class, so they inherited the global `a { @apply text-primary-700 }` rule — `#1D4ED8` on the `#1E3A8A` navy footer, far below any readable contrast. The same applied to the language link in the bottom bar. Present on **every page of the site**. | Explicit `text-primary-200` / `text-primary-300`, matching the surrounding footer links. |

Both were caught only by looking at rendered output, which is the argument for
doing this before deploying rather than after.
