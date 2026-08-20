# Deploying Monte Horeb + turning on the book store

Two independent things. **Part 1 gets the site live.** Part 2 turns on card payments.
You can do Part 1 today and Part 2 whenever the church is ready — the store browses
fine without Stripe; only the Checkout button is disabled.

Set aside about 45 minutes for Part 1 and 30 for Part 2.

---

# Part 1 — Get the site live on Vercel

## Step 1: Put the code on GitHub

```bash
cd monte-horeb
git init
git add .
git commit -m "Monte Horeb church website"
```

Create an empty repo at https://github.com/new (**Private** is fine), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/monte-horeb.git
git branch -M main
git push -u origin main
```

> `.gitignore` already excludes `.env.local`, so your keys don't go to GitHub.
> If you ever see `.env.local` in `git status`, stop and fix it before pushing.

## Step 2: Set up Supabase

1. Create a free project at https://supabase.com (choose a region near Los Angeles).
2. **SQL Editor → New query** → paste the entire contents of `supabase/schema.sql` → **Run**.
   You should see "Success. No rows returned." It is safe to run more than once.
3. **Storage → New bucket** → name `church-files` → tick **Public** → Create.
4. **Project Settings → API** — keep this tab open, you need three values next.

## Step 3: Import into Vercel

1. https://vercel.com → sign in with GitHub → **Add New → Project**.
2. Import your `monte-horeb` repo.
3. Vercel detects Next.js automatically — **don't change** the build settings.
4. Before clicking Deploy, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role key |
| `NEXT_PUBLIC_SITE_URL` | `https://sdcmontehoreb.com` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `robinsonramos96@gmail.com` |
| `NEXT_PUBLIC_SALES_TAX_RATE` | `0.0975` |

5. **Deploy.** First build takes 2–3 minutes. You'll get a `something.vercel.app` URL —
   open it and check the site loads.

> ⚠️ The `service_role` key bypasses all database security. It belongs only in Vercel's
> environment variables and your local `.env.local`. Never put it in client code, a
> `NEXT_PUBLIC_` variable, or a screenshot.

## Step 4: Create your admin login

1. Supabase → **Authentication → Users → Add user**.
2. Email `robinsonramos96@gmail.com`, set a password, tick **Auto Confirm User**.
3. Visit `your-site.vercel.app/admin/login` and sign in.

If you get "That account is not authorised", the email doesn't match
`NEXT_PUBLIC_ADMIN_EMAIL`. Admin access is checked in **two** places and both must
list the same address:

- `NEXT_PUBLIC_ADMIN_EMAIL` in Vercel (controls page access)
- the email inside `public.is_admin()` in `supabase/schema.sql` (controls data access)

To add a second admin, add them to *both*, then re-run `schema.sql`.

## Step 5: Point sdcmontehoreb.com at it

In Vercel: **Settings → Domains → Add** `sdcmontehoreb.com`. Vercel shows you the exact
records. Then in Hostinger: **Domains → DNS / Nameservers**, and add what Vercel showed —
normally:

| Type | Host | Points to |
|---|---|---|
| `A` | `@` | the IP Vercel displays (currently `76.76.21.21`) |
| `CNAME` | `www` | the target Vercel displays for your project |

**Choose the DNS-records method, not the nameserver method.** If you hand your
nameservers to Vercel, every other Hostinger record — email, subdomains — stops
resolving until you recreate it manually in Vercel.

Use the values Vercel shows *your* project rather than any copied from a guide.
DNS usually propagates in minutes; allow up to 24 hours.

## Step 6: Post-deploy checklist

- [ ] `sdcmontehoreb.com` redirects to `/en` or `/es` by browser language
- [ ] Language switcher works both ways
- [ ] `/admin` redirects to login when signed out
- [ ] Add a test song in the admin panel and confirm it appears on `/en/songs`
- [ ] Send a test message through `/en/contact` and confirm it lands in `/admin/messages`
- [ ] Replace the placeholder images in `public/images/` (see the README there)

**Every future deploy is just `git push`.** Vercel rebuilds automatically.

---

# Part 2 — Turn on card payments (Stripe)

The store is **pickup only**: customers pay online and collect at church. Stripe never
collects a shipping address, and no shipping is charged.

## Step 1: Create the Stripe account

https://dashboard.stripe.com/register — use the church's email. You can build and test
everything before submitting business details; only *live* payouts need those.

**Stay in Test mode** (the toggle in the Dashboard) until Step 6.

## Step 2: Copy your test keys

**Developers → API keys**:

| Stripe value | Environment variable |
|---|---|
| Publishable key (`pk_test_…`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_test_…`) | `STRIPE_SECRET_KEY` |

Add both in **Vercel → Settings → Environment Variables**.

## Step 3: Run the store migration

If you created your database from `schema.sql` *after* this feature was added, skip
this — you already have it.

Otherwise: Supabase → **SQL Editor** → paste `supabase/migrations/006_stripe_checkout.sql`
→ **Run**. It makes shipping fields optional (pickup orders have no address), adds the
duplicate-payment guard table, and removes the old policy that let anyone read every
order. Safe to re-run.

## Step 4: Create the webhook

This is the step people skip, and without it **orders never get marked paid**.

1. Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://sdcmontehoreb.com/api/stripe/webhook`
3. Select events — just these three:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Add endpoint, then **Reveal** the **Signing secret** (`whsec_…`).
5. Add it in Vercel as `STRIPE_WEBHOOK_SECRET`.

> The webhook rejects any request whose signature doesn't match this secret — that's what
> stops someone forging a "payment succeeded" message. A wrong value means every real
> payment is rejected too, so double-check you copied the endpoint's secret and not an API key.

**Redeploy** after adding environment variables — Vercel only picks them up on a new build
(**Deployments → ⋯ → Redeploy**).

## Editable page content

If you created your database from `schema.sql` *after* this feature was added, skip this —
you already have it.

Otherwise: Supabase → **SQL Editor** → paste `supabase/migrations/007_page_content.sql` →
**Run**. Safe to re-run. This adds the `page_content` table that backs **Admin → Page
Content**, letting you edit the Home/Visit/About/Ministries/Give/Contact copy from the
admin panel with no code deploy. Until this migration runs (or if the table is ever empty),
those pages just keep showing the text compiled into `src/content/{en,es}/pages.ts` — nothing
breaks either way.

## Step 5: Place a test order

1. Add a product in `/admin/bookstore` with stock of at least 1.
2. On the public store, add it to the cart and click **Checkout**.
3. Pay with Stripe's test card:
   - Number `4242 4242 4242 4242`
   - Any future expiry, any CVC, any ZIP
4. You should land on the confirmation page with an order number.

Then confirm the whole chain worked:

- [ ] `/admin/orders` shows the order as **paid / awaiting pickup**
- [ ] Stock dropped by the quantity ordered
- [ ] The cart is now empty
- [ ] Stripe → Webhooks → your endpoint shows a `200` response
- [ ] Confirmation emails arrived (only if `RESEND_API_KEY` is set)

Other useful test cards: `4000 0000 0000 9995` declines, `4000 0025 0000 3155` forces
a 3D-Secure prompt.

If the order stays *pending*: the payment worked but the webhook didn't. Open the
webhook in Stripe and read the response — it tells you exactly what failed.

## Step 6: Go live

1. Complete Stripe's business/bank onboarding.
2. Flip the Dashboard to **Live mode**.
3. Copy the **live** keys (`sk_live_…`, `pk_live_…`) into Vercel.
4. Create the webhook **again** in Live mode — live and test have *separate* endpoints
   and *separate* signing secrets. Update `STRIPE_WEBHOOK_SECRET` with the live one.
5. Redeploy.
6. Buy something real and cheap with an actual card, confirm it appears in
   `/admin/orders`, then refund it from the Stripe Dashboard.

---

## Day-to-day: fulfilling an order

1. `/admin/orders` lists everything, newest first, with the buyer's name, email and phone.
2. Set the books aside; the customer collects at any service and gives their order number.
3. Click **Collected** to mark it done.

Refunds are done from the Stripe Dashboard (the ↗ icon on each order links straight to
the payment). Refunding in Stripe does **not** put stock back — adjust that in
`/admin/bookstore` yourself.

---

## Money details worth knowing

- **Stripe's fee** is roughly 2.9% + 30¢ per successful card charge. On a $15 book that's
  about 74¢. Nothing is charged for failed payments or for the account itself.
- **Sales tax** is a flat rate from `NEXT_PUBLIC_SALES_TAX_RATE`, shown to the buyer as its
  own line. The cart and the Stripe charge read the same variable, so the displayed total
  always matches the amount charged.
  *Caveat:* because it's a line item rather than a Stripe tax object, Stripe reports it as
  revenue, not as collected tax. Fine for a small storefront, but if the church starts
  filing sales tax on this, switch to [Stripe Tax](https://docs.stripe.com/tax) (a paid
  add-on) — that's a change to `src/app/api/checkout/route.ts` only.
- **Prices always come from the database.** The browser tells the server *which cart*, never
  *what it costs*, so a customer can't edit the price before paying.
- **Stock is checked before payment** and decremented after, atomically. Two people buying
  the last copy at the same moment can't both succeed.

---

## Testing Stripe locally (optional)

```bash
npm install -g @stripe/cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

`stripe listen` prints a `whsec_…` — put that in `.env.local` as `STRIPE_WEBHOOK_SECRET`
(it differs from the deployed one). Then `npm run dev` and check out normally.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Online payment is not configured yet" | `STRIPE_SECRET_KEY` missing, or you added env vars without redeploying. |
| Checkout works, order stuck *pending* | Webhook not created, wrong URL, or wrong `STRIPE_WEBHOOK_SECRET`. Check Stripe → Webhooks for the failing response. |
| Webhook shows `400 Invalid signature` | `STRIPE_WEBHOOK_SECRET` doesn't match that endpoint. Test and Live have different secrets. |
| Webhook shows `503 Not configured` | `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` missing on the deployment. |
| "Not enough stock" | Real — stock in `/admin/bookstore` is lower than the quantity ordered. |
| Site shows no songs/sermons at all | `schema.sql` didn't finish. Re-run it and watch for errors. |
| "That account is not authorised" | Login email ≠ `NEXT_PUBLIC_ADMIN_EMAIL`. |
