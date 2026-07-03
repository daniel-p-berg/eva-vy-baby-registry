# Eva Vy Baby Shower Registry

A no-login gift registry built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Postgres. Guests reserve fixed-price gifts or contribute to group funds, then receive Venmo, PayPal, and Cash App instructions. The app never processes payments.

## Local setup

Requirements: Node.js 20+ and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase variables, the public page renders preview data, but checkout and admin data changes remain disabled.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).
3. Run [`supabase/seed.sql`](supabase/seed.sql) to add the nine starter registry items.
4. Copy the project URL, anon key, and service role key into `.env.local`.
5. Never place the service role key in a `NEXT_PUBLIC_` variable.

The migration creates the four requested tables, a sanitized availability view, RLS configuration, indexes, activity tracking, and two transactional RPC functions:

- `create_registry_claim` locks requested items before checking availability and inserting the claim.
- `admin_update_claim` uses the same locking and availability rules when an admin edits, cancels, or reactivates a claim.

Cancelled claims are excluded from all public availability totals.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key; included for project completeness but not used for private reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access |
| `ADMIN_SECRET` | Required secret segment in `/admin/[secret]` |
| `ADMIN_PASSWORD` | Second server-checked admin credential |
| `CONTACT_EMAIL` | Change-contact email, defaults to `831dberg@gmail.com` |
| `VENMO_HANDLE` | Handle or label shown with the Venmo QR |
| `PAYPAL_HANDLE` | Handle or label shown with the PayPal QR |
| `CASHAPP_HANDLE` | Handle or label shown with the Cash App QR |
| `PAYMENT_NOTE` | Suggested payment note |
| `NEXT_PUBLIC_USD_TO_VND_RATE` | Display fallback for client-side USD/VND previews |

Use long, unrelated random values for `ADMIN_SECRET` and `ADMIN_PASSWORD`. The admin URL is:

```text
/admin/<your ADMIN_SECRET>
```

The route secret and password are both checked on the server. A successful password check creates a signed, HTTP-only, same-site cookie lasting 12 hours.

## Product and QR images

Put product PNG files in:

```text
public/products/
```

Then enter paths such as `/products/pigeon-bottles.png` in the admin item editor. There is intentionally no upload feature.

Replace these included, visibly marked placeholder PNGs with the real payment QR codes:

```text
public/payment/venmo.png
public/payment/paypal.png
public/payment/cashapp.png
```

Keep the filenames unchanged. The app does not use Supabase Storage or Vercel Blob.

## Add and edit registry items

1. Visit `/admin/<ADMIN_SECRET>`.
2. Enter `ADMIN_PASSWORD`.
3. Open **Create a registry item** or expand an existing item.
4. For a fixed gift, complete USD price, VND price, and quantity.
5. For a fund, complete USD target and VND target.
6. Use **Sort order** to reorder items. Lower numbers appear first.
7. Clear **Active** to hide an item without deleting its history.

Payment handles are intentionally managed through deployment environment variables; static QR images are managed in `public/payment/`.

## Privacy model

### Public privacy

- Public rendering happens in server components.
- The browser never receives claim rows, guest names, emails, notes, statuses, admin notes, or activity events.
- Public availability contains only aggregate claimed quantities and funded totals.
- RLS is enabled on every table, with no anon/authenticated table policies.
- The sanitized view is read only by server code using the service role.
- Confirmation details require a server-signed receipt token; knowing a claim UUID is not enough.

### Admin privacy

- The secret route segment and password are checked server-side.
- `ADMIN_PASSWORD`, the service role key, and signing material are never included in client bundles.
- The admin session cookie is signed, HTTP-only, same-site, and secure in production.
- Admin notes and payment status are visible only after both admin checks pass.

No security system can make a URL secret once it is shared. Treat the admin URL as the first credential and the password as the second; rotate either environment value if it is exposed.

## Vercel deployment

1. Push this repository to GitHub and import it into Vercel.
2. Add every variable from `.env.example` in **Project Settings → Environment Variables**.
3. Use the default Next.js build command (`npm run build`).
4. Deploy.
5. Verify the public registry, one test claim, its confirmation QR codes, and the private admin dashboard.

Apply future SQL migration files to Supabase before deploying code that depends on them.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Deliberate non-features

There are no user accounts, payment processing, guest cancellations, image uploads, or object-storage integrations. Guests who need to change a reservation are directed to Daniel and Ngân by email.
